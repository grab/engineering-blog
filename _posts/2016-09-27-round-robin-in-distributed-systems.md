---
layout: post
id: round-robin-in-distributed-systems
title: Round-robin in Distributed Systems
date: 2016-09-27 13:43:40
authors: [gao-chao]
categories: [Engineering]
tags: [Back End, Data, Distributed Systems, ELB, Golang]
comments: true
excerpt: "While working on Grab's Common Data Service (CDS), there was the need to implement client side load balancing between CDS clients and servers. However, I kept encountering persistent connection issues with Elastic Load Balance (ELB)."
---

While working on Grab's Common Data Service (CDS), there was a need to implement client side load balancing between CDS clients and servers. However, I kept encountering persistent connection issues with AWS Elastic Load Balancers (ELB). Hence, I decided to focus my attention on using DNS discovery, as ELB's performance is not optimal and the unpredictable scaling events could further affect the stability of our systems. At the same time, I didn't want to have to manage the details of DNS TTL, different protocols, etc. Thus, the search for a reliable DNS library began.

Eventually, I found this package after some research: <https://github.com/benschw/srv-lb>. It looked pretty neat and provides round-robin routing for IP addresses behind a DNS domain, which is exactly what I wanted.

During my tests of the round-robin function, it turned out the round-robin didn't work... We have 7 servers behind our [etcd](https://github.com/coreos/etcd) domain but when I tried with the package, it gave me the following sequence of IP addresses:

> 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 7 -> 1 -> 1...

It turns out that there was a bug in that library, which I've fixed by submitting a [pull request](https://github.com/benschw/srv-lb/pull/3).

We do implement some round-robin logic in our code too, which can be tricky to get right at times. Read on for a summary of our learnings from the different ways of doing round-robin.

### Round-robin with Mutex

This is the simplest approach you can use to implement round-robin logic.

Basically, all you need is an array and a counter in your programme and the use of a lock to protect usage. Here's some example code in Golang to illustrate the idea:

~~~golang
package main

import "sync"

// RoundRobin ...
type RoundRobin struct {
    sync.Mutex

    current int
    pool    []int
}

// NewRoundRobin ...
func NewRoundRobin() *RoundRobin {
    return &RoundRobin{
        current: 0,
        pool:    []int{1, 2, 3, 4, 5},
    }
}

// Get ...
func (r *RoundRobin) Get() int {
    r.Lock()
    defer r.Unlock()

    if r.current >= len(r.pool) {
        r.current = r.current % len(r.pool)
    }

    result := r.pool[r.current]
    r.current++
    return result
}
~~~

Looks pretty simple? That's because only one action was defined for this `struct` – there is nothing complicated to worry about. However, if you want to add `Set` / `Update` methods to this `struct`, be sure to pay more attention to the usage of locks.

### Round-robin with Your Favourite Channel

Another approach of implementing a round-robin pool is to use goroutines and channels. The programme is a little bit more complex:

~~~golang
package main

import "time"

const timeout = 100 * time.Millisecond

// RoundRobin ...
type RoundRobin struct {
    current int
    pool    []int

    requestQ chan chan int
}

// NewRoundRobin ...
func NewRoundRobin() *RoundRobin {
    r := &RoundRobin{
        current:  0,
        pool:     []int{1, 2, 3, 4, 5},
        requestQ: make(chan chan int),
    }
    go r.balancer()
    return r
}

// Get ...
func (r *RoundRobin) Get() int {
    output := make(chan int, 1)
    select {
    case r.requestQ <- output:
        return <-output
    case <-time.After(timeout):
        // Timeout
        return -1
    }
}

// balancer ...
func (r *RoundRobin) balancer() {
    for {
        select {
        case output := <-r.requestQ:
            if r.current >= len(r.pool) {
                r.current = 0
            }
            output <- r.pool[r.current]
            r.current++
        // other cases can be added here
        // e.g. case change := <-r.watch:
        }
    }
}
~~~

The benefits of this approach:

- More granular control over operation timeouts. In the mutex approach, there isn't a way for you to cancel an operation if it takes too long to complete.
- `balancer` is the one centralised place that controls all your actions. If you add more operations to this struct, just add more cases there and you do not need to worry about the granularity of your locks.

The drawbacks of this approach:

- Code is more complicated.
- Each op takes more time to complete, in the order of nanoseconds, because there are channel creations with each time.

### Summary

Based on your requirements, pick the preferred method of implementing a simple logic like round-robin.

I would pick the mutex implementation for resource fetching and goroutine implementation for work load balancing. Leave a comment if you wish to discuss. I would love to hear your views!

**References:**

- <https://talks.golang.org/2010/io/balance.go>
- <https://github.com/mindreframer/golang-stuff/blob/master/github.com/youtube/vitess/go/pools/roundrobin.go>
