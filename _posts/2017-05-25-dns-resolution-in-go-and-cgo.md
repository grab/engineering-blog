---
layout: post
id: dns-resolution-in-go-and-cgo
title: DNS Resolution in Go and Cgo
date: 2017-05-24 18:43:40
authors: [ryan-law]
tags: [Golang, Networking]
comments: true
excerpt: "This article is part two of a two-part series. In this article, we will talk about RFC 6724 (3484), how DNS resolution works in Go and Cgo, and finally explaining why disabling IPv6 also disables the sorting of IP Addresses."
---

*This article is part two of a two-part series ([part one](/troubleshooting-unusual-aws-elb-5xx-error)). In this article, we will talk about RFC 6724 (3484), how DNS resolution works in Go and Cgo, and finally explaining why disabling IPv6 also disables the sorting of IP Addresses.*

As a quick recap of our journey so far, we walked you through our investigative process of a load balancing issue on our AWS Elastic Load Balancer (ELB) nodes and how we temporarily fixed it by using Cgo and disabling IPv6. In this part of the series, we will be diving deeper into RFC 6724 (3484), exploring DNS Resolution in Go and Cgo, explaining why disabling IPv6 "fixes" the IP addresses sorting and how the permanent fix requires modifying the Go source code. If you already understand RFC 6274 (3484), please feel free to jump to the section titled "Further Investigation" and if you are short on time, the "Summary" is also provided at the end of the article.

### Background

#### RFC 6724 (3484)

RFC 6724 and its earlier revision -- RFC 3484, defines how connections between two systems over the internet should be established when there is more than one possible IP address on the source and destination systems. And because of the way the internet works, if you connect to a website by entering a domain name instead of a IP address, it is almost guaranteed that you will execute an implementation of the RFC. When you enter a domain name in your browser, behind the scenes, your browser will send a DNS A (for IPv4) or AAAA (for IPv6) query to a DNS server to get a list of IP addresses that it should connect to. Because nowadays, almost all websites have two or more servers behind them, it's very likely for you to get at least two IP addresses back from the DNS. The question is then, what happens when you get two IP addresses? Which one should you choose? This is exactly the question that the RFC is attempting to address. (For more detailed information, please refer to the [RFC](https://www.ietf.org/rfc/rfc6724.txt) itself. The sorting rules for the source and destination address are located on page 9 and 13 respectively)

#### Go and Cgo

During the early days of Go, Cgo was introduced as a way for Go programs to embed C code inside of Go. Cgo allows Go to tap into the vast amount of C libraries, an ability that is especially useful in situations where you want to execute some low level operation that you know works really well in C and is non-trivial to rewrite in Go. However, with Go maturing, the Go maintainers have decided to move away from C implementations to native Go implementations. When Go executes C code, it will actually run the C code on an OS thread instead of goroutines that are orders of magnitude cheaper.

### Further Investigation

Now that we have fixed the problem on our production systems by forcing the use of the Cgo DNS resolver and disabling IPv6, we are able to comfortably explore the problem and figure out why the unintuitive solution of using Cgo and disabling IPv6 works. Seeing how the Go source code in general has decent documentation, we decide to investigate that first. From the section titled "Name Resolution" of the [documentation of the net package](https://golang.org/pkg/net/), we can see that by default, Go uses the Go DNS Resolver. In cases where it is not supported, it falls back to Cgo or some other implementation that is the default on the OS. In our case, our production servers run on Ubuntu so the default DNS resolver is the native Go DNS Resolver and if we were to enable Cgo, we will be either using the `getaddrinfo` or `getnameinfo` functions in glibc.

Being armed with that knowledge, we write up a small Go program that calls the `net.LookupHost` function and a simple C program that calls `getaddrinfo` to make sure that our understanding is accurate and to test out the behaviour of both these programs in different situations.

~~~go

package main

import (
        "log"
        "net"
        "net/http"
)

const (
        astrolabe = "astrolabe.ap-southeast-1.elb.amazonaws.com"
)

func lookup() {
        log.Println(net.LookupHost(astrolabe))
}
~~~

~~~c
# Modified from http://www.binarytides.com/hostname-to-ip-address-c-sockets-linux/

#include<stdio.h> //printf
#include<string.h> //memset
#include<stdlib.h> //for exit(0);
#include<sys/socket.h>
#include<errno.h> //For errno - the error number
#include<netdb.h> //hostent
#include<arpa/inet.h>

int hostname_to_ip(char *  , char *);

int main(int argc , char *argv[])
{
    char *hostname = "astrolabe.ap-southeast-1.elb.amazonaws.com";
    char ip[100];

    hostname_to_ip(hostname , ip);

    printf("astrolabe elb resolved to %s", ip);

    printf("\n");
}

/*
    Get ip from domain name
*/
int hostname_to_ip(char *hostname , char *ip)
{
    int sockfd;
    struct addrinfo hints, *servinfo, *p;
    struct sockaddr_in *h;
    int rv;
    memset(&hints, 0, sizeof hints);
    hints.ai_family = AF_UNSPEC; // use AF_INET6 to force IPv6
    hints.ai_socktype = SOCK_STREAM;

    if ((rv = getaddrinfo( hostname , "http" , &hints , &servinfo)) != 0)
    {
        fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
        return 1;
    }

    // loop through all the results and connect to the first we can
    for (p = servinfo; p != NULL; p = p->ai_next)
    {
        h = (struct sockaddr_in *) p->ai_addr;

        strcat(ip, " ");
        strcat(ip , inet_ntoa( h->sin_addr ) );
        strcat(ip, " ");
    }

    freeaddrinfo(servinfo); // all done with this structure
    return 0;
}
~~~

First of all, to see the default state of the source system, we run the `ip address show` command to show the list of network interfaces available on the source system.

~~~sh
root@ip-172-21-2-90:~# ip address show
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 02:b4:d4:24:bb:ad brd ff:ff:ff:ff:ff:ff
    inet 172.21.2.90/24 brd 172.21.2.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::b4:d4ff:fe24:bbad/64 scope link
       valid_lft forever preferred_lft forever
~~~

And because we are only interested in the outgoing network interface, we will be using the command `ip address show dev eth0` from this point onwards.

~~~sh
root@ip-172-21-2-90:~# ip address show dev eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 02:b4:d4:24:bb:ad brd ff:ff:ff:ff:ff:ff
    inet 172.21.2.90/24 brd 172.21.2.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::b4:d4ff:fe24:bbad/64 scope link
       valid_lft forever preferred_lft forever
~~~

Now to run the Go, Cgo and C DNS resolvers.

~~~sh
root@ip-172-21-2-90:~# go run gocode/dnslookup.go
2017/01/18 02:07:31 [172.21.2.108 172.21.2.144 172.21.1.152 172.21.1.97] <nil>


root@ip-172-21-2-90:~# GODEBUG=netdns=Cgo+2 go run gocode/dnslookup.go
go package net: using Cgo DNS resolver
go package net: hostLookupOrder(astrolabe.ap-southeast-1.elb.amazonaws.com) = Cgo
2017/01/18 02:08:08 [172.21.2.108 172.21.2.144 172.21.1.97 172.21.1.152] <nil>

root@ip-172-21-2-90:~# ./ccode/dnslookup.out
astrolabe elb resolved to 172.21.2.108  172.21.2.144  172.21.1.97  172.21.1.152
~~~

As you can see, they all have the exact same sorting order with 172.21.2.108 being the first and 172.21.1.152 being the last, which is exactly as defined in Rule 9 of the RFC's destination address sorting algorithm -- addresses are sorted based on the longest matching prefix first.

~~~sh
Source
172.21.2.90:  10101100.00010101.00000010.01011010


Destination
172.21.2.108: 10101100.00010101.00000010.01101100
172.21.2.144: 10101100.00010101.00000010.10010000
172.21.1.97:  10101100.00010101.00000001.01100001
172.21.1.152: 10101100.00010101.00000001.10011000
~~~

To make it clearer, we have converted the IP addresses to their binary form for easier comparison. We can see that 172.21.2.108 has the longest matching prefix with our source interface of 172.21.2.90 and because the IP addresses in the 172.21.1.* subnet has the same matching prefix length, they can actually show up in a different order in which either 172.21.1.97 or 172.21.1.152 comes first.
Now let's see what happens when we disable IPv6. This can be done with the following commands:

~~~sh
# We can either disable IPv6 completely
sh -c 'echo 1 > /proc/sys/net/ipv6/conf/eth0/disable_ipv6'

# or we can just remove IPv6 from the outgoing interfaces
ip -6 addr del fe80::b4:d4ff:fe24:bbad/64 dev eth0
~~~

After disabling IPv6, we run the `ip address show dev eth0` command again to verify that the IPv6 address is no longer attached to the source interface.

~~~sh
root@ip-172-21-2-90:~# ip address show dev eth0
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 9001 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 02:b4:d4:24:bb:ad brd ff:ff:ff:ff:ff:ff
    inet 172.21.2.90/24 brd 172.21.2.255 scope global eth0
       valid_lft forever preferred_lft forever
~~~

Now we run the programs again to see what has changed. For the sake of clarity, we are showing 2 runs of each of the programs.

~~~sh
root@ip-172-21-2-90:~# go run gocode/dnslookup.go
2017/01/18 02:14:39 [172.21.2.108 172.21.2.144 172.21.1.97 172.21.1.152] <nil>
root@ip-172-21-2-90:~# go run gocode/dnslookup.go
2017/01/18 02:14:40 [172.21.2.108 172.21.2.144 172.21.1.97 172.21.1.152] <nil>


root@ip-172-21-2-90:~# GODEBUG=netdns=Cgo+2 go run gocode/dnslookup.go
go package net: using Cgo DNS resolver
go package net: hostLookupOrder(astrolabe.ap-southeast-1.elb.amazonaws.com) = Cgo
2017/01/18 02:15:41 [172.21.1.97 172.21.1.152 172.21.2.108 172.21.2.144] <nil>
root@ip-172-21-2-90:~# GODEBUG=netdns=Cgo+2 go run gocode/dnslookup.go
go package net: using Cgo DNS resolver
go package net: hostLookupOrder(astrolabe.elb.amazonaws.com) = Cgo
2017/01/18 02:15:43 [172.21.2.144 172.21.1.97 172.21.1.152 172.21.2.108] <nil>

root@ip-172-21-2-90:~# ./ccode/dnslookup.out
astrolabe elb resolved to 172.21.1.152  172.21.2.108  172.21.2.144  172.21.1.97
root@ip-172-21-2-90:~# ./ccode/dnslookup.out
astrolabe elb resolved to 172.21.1.97  172.21.1.152  172.21.2.108  172.21.2.144
~~~

And from the results, you can see that it has no impact on the native Go DNS resolver but both the Cgo and C DNS resolvers are starting to return the IP addresses in a random order, as expected from our learnings in [part one](/troubleshooting-unusual-aws-elb-5xx-error).

#### Ok, disabling IPv6 and using Cgo/C works, now what?

Now that we have established that disabling IPv6 does indeed solve the problem for us in Cgo and C (both use the same underlying `getaddrinfo` function in glibc), it is time for us to explore the Go source code to see if there is anything that stands out in its implementation of a DNS resolver.

Being Go programmers, we can quickly navigate around the Go source code to reach the native Go DNS resolver ([net/addrselect.go](https://github.com/golang/go/blob/db07c9ecb617117a86364e9e03acd6f7937e1732/src/net/addrselect.go)) and from the source code, we can see that it only implements part of the rules in the RFC. It does not provide a way to override the rules and, most importantly, it does not do any form of source address selection but instead relies on processing the Rule 9 sorting based on a couple of selected and reserved CIDR blocks ([Reserved CIDR Blocks](https://github.com/golang/go/blob/db07c9ecb617117a86364e9e03acd6f7937e1732/src/net/addrselect.go#L411)).

Knowing what we have done so far, we had strong reasons to believe that it is the lack of source address selection that is causing the Go DNS resolver to behave differently from the DNS resolver in glibc.

### Source Address Selection

Referring back to the RFC, the part on source address selection states that the source address selection should be configurable by the system administrators. A quick google search shows us that for Ubuntu systems, the file is `/etc/gai.conf`. To isolate the changes that we are making, we re-enable IPV6 before proceeding further. First, we try to move IPv4 addresses to the top of the list. We suspect that for some weird reason, the IPv6 source address is somehow being used to make the outgoing connection, otherwise why would disabling IPv6 do anything at all? Surprisingly, all of our different attempts at modifying `/etc/gai.conf` do not do anything (Well, one of the attempts does, by adding a `172.21.2.90/26` prefix. It works because the common prefix for the addresses in the 172.21.2.* subnet would now be the same). Welp, we are now back at square one.

After hours and hours of research by talking to people with networking experience and going through pages and pages of Google search results that touch on this topic (Microsoft's blog posts on Vista, Debian mailing list, etc.), we finally come across a series of article on Linux Hacks ([Part 1](http://linux-hacks.blogspot.com/2008/04/default-address-selection-part-1.html), [Part 2](http://linux-hacks.blogspot.com/2008/07/default-address-selection-part-2.html)). Guess what? The article actually tells us that source address selection is not configured through `/etc/gai.conf` but is done through the kernel instead! **Aha!**

Off we go, once again making a bunch of different configuration changes to the network interface that bring us nowhere. Also, because the Go DNS resolver does not actually do any sort of source address selection, spending more time on this avenue does not really help us in finding the problem.

### The Source Code We Go

If you have ever gotten stuck on trying to figure out how something works and all the googling is not giving you the right answers, you know that going through the source code is the next thing to try. It is almost never the first thing that any programmer wants to do though. Navigating someone else's code is hard and it's even harder when it's not a language you're very familiar with. Ultimately, we decide to bite the bullet and dive deep into the code in glibc to see how source address selection is done specifically and get an understanding of how it affects the sorting of the IP addresses.

Funnily enough, even finding the source code of glibc is not as straightforward as we expect. Nowadays, when you want to find a piece of code, you will probably just google it and find it on github. This isn't the case for glibc as the main source code is hosted at [sourceware](https://sourceware.org/git/?p=glibc.git) and is unfortunately not easy to navigate. Luckily, we found a mirror on [Github](https://github.molgen.mpg.de/git-mirror/glibc/blob/glibc-2.19/sysdeps/posix/getaddrinfo.c#L2310) that provided us with a familiar interface. Again, finding the source code for `getaddrinfo` itself also isn't easy. At first, we end up in the [inet directory](https://github.molgen.mpg.de/git-mirror/glibc/tree/master/inet) and we get completely confused as all the files only have macro definitions and no code at all. Only after some googling and stumbling around, we find that the source code for `getaddrinfo` is at [sysdeps/posix](https://github.molgen.mpg.de/git-mirror/glibc/blob/glibc-2.19/sysdeps/posix/getaddrinfo.c#L2310).

Being mostly Go or Ruby programmers, it takes a little bit of time to understand how the C-based code works. After getting a basic understanding, we decide to whip out good old gdb to start debugging the code step by step. Eventually, we find the issue. The way the prefix attributes of the source addresses are set disables the sorting of the IP addresses, since they are the only values that are different when we enable/disable IPv6. With some more research, we identify a file named `check_pf.c` where the source address selection is actually being done. In the end, we narrow it down to a block of code in [check_pf.c](https://github.molgen.mpg.de/git-mirror/glibc/blob/master/sysdeps/unix/sysv/linux/check_pf.c#L266) that is the root cause of this whole thing. The block of code basically states that if there are no IPv6 source addresses on the outgoing interface, it will just return that there are no possible source addresses at all that in turn causes Rule 9 sorting of the RFC to be completely bypassed and give us back the default DNS ordering (round robin in most scenarios).

Finally understanding how it works in glibc, we modify the Go source code and to add in the same behaviour. With the same weird logic in `check_pf.c`, the Go DNS resolver now works the same as the glibc DNS resolver. However, we're not interested in maintaining a separate fork of Go and instead opened a ticket with the Go maintainers. Within a very short timeframe, the Go maintainers decided to skip RFC 6274 completely for IPv4 addresses and merge this patch into the current upstream with release in Go 1.9. Eventually, the fix is also backported to Go 1.8.1 a release on April 7, 2017. The image below shows the effects of this change on one of our systems running on Go 1.8.1

<div class="post-image-section">
  <img alt="ELB Requests per AZ" src="/img/dns-resolution-in-go-and-cgo/elb-requests-per-az.png">
</div>

### Summary

To summarize, in the first part of the series, we walked through our process investigating why we were receiving ELB HTTP 5xx alerts on Astrolabe (our driver location processing service) and how we fixed it by forcing Go to use the Cgo DNS resolver while IPv6 was disabled. In the second part of the series, we dived deeper into the problem to figure out why our solution in part 1 worked. In the end, it turns out that it was because of some undocumented behaviour in glibc that allowed the internet to continue working as it did.

A couple of takeaways that we had from this investigation:

1. It is never easy to reimplement something that is already working, as in the case of Go's reimplementation of glibc's `getaddrinfo`. Because of a couple of lines of undocumented code in glibc, the Go maintainers did not manage to replicate glibc exactly and that caused strange and hard to understand problems.
2. Software is something that we can always reason with. With enough time, you will almost always be able to find the root cause and fix it.

That's it, we hope that you enjoyed reading our journey as much as we enjoyed going through it!

*Note: All the sensitive information in this article has been modified and does not reflect the true state of our systems.*
