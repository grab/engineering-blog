---
layout: post
id: deep-dive-into-database-timeouts-in-rails
title: Deep Dive into Database Timeouts in Rails
date: 2018-01-18 16:48:40
authors: [jia-hao-goh]
categories: [Engineering]
tags: [Back End, Database, Distributed Systems, Ruby, Ruby on Rails]
comments: true
cover_photo: /img/banner.png
excerpt: "Disaster strikes when you do not configure timeout values properly. In this post, we dive into the details of how timeouts work with Ruby on Rails and Databases."
---

A couple of weeks ago, we had a production outage for one of our internal Ruby on Rails application servers. One of the databases that the application connects to had a failover event. It was expected that the server should continue functioning for endpoints which do not depend on this database, but it was observed that our server slowed down to a crawl, and was unable to function properly even after the failover completed, until we manually restarted the servers.

## Background

[ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html) is the canonical ORM for Rails to access a database. Different requests are handled on different threads, so a connection pool is necessary to maintain a limited set of connections to the database and also to skip the additional latency of establishing a TCP connection.

> A connection pool synchronizes thread access to a limited number of database connections. The basic idea is that each thread checks out a database connection from the pool, uses that connection, and checks the connection back in.

> It will also handle cases in which there are more threads than connections: if all connections have been checked out, and a thread tries to checkout a connection anyway, then ConnectionPool will wait until some other thread has checked in a connection.

Source: The [`ActiveRecord::Connection Pool`](http://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html) .

### Options for the Connection Pool

In Rails, database configurations are set in the `config/database.yml` file. These options are either native to the `ActiveRecord::ConnectionPool` module, or passed to the underlying adapter, depending on whether MySQL or PostgreSQL is used.

ActiveRecord uses connection adapters to make database calls. For MySQL, it uses the [mysql2](https://github.com/brianmario/mysql2) library, which depends on the [`libmysqlclient`](https://dev.mysql.com/doc/refman/5.7/en/c-api-implementations.html) C library. The following options affect the behaviour of the library:

| Option             | Description                                                                                                                                                                                                                                                                                            | Source                                                                                                                                                                                        | Default                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pool`             | This specifies the maximum number of connections to the database that ActiveRecord will maintain per server.                                                                                                                                                                                           | Native to the [ActiveRecord ConnectionPool](http://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html)                                                           | 5 [Source](http://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html#class-ActiveRecord::ConnectionAdapters::ConnectionPool-label-Options)               |
| `checkout_timeout` | When making a ActiveRecord call, ActiveRecord tries to checkout a database connection from the pool. If the pool is at maximum capacity, ActiveRecord will wait for this timeout to elapse before raising an `ActiveRecord::ConnectionTimeoutError` exception.                                         | Native to the [ActiveRecord ConnectionPool](http://api.rubyonrails.org/classes/ActiveRecord/ConnectionAdapters/ConnectionPool.html)                                                           | 5 seconds [Source](https://github.com/rails/rails/blob/e5dc756bf9424086c403d1025971c3e704e1dcfa/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L328). |
| `connect_timeout`  | If there are no available connections to the database in the connection pool, a new connection will have to be established. `connect_timeout`, specifies the timeout to establish a new connection to the database before failing.                                                                     | Native to the [mysql2](https://github.com/brianmario/mysql2) library, passed to `libmysqlclient` as [`MYSQL_OPT_CONNECT_TIMEOUT`](https://dev.mysql.com/doc/refman/5.7/en/mysql-options.html) | 120 seconds [Source](https://github.com/brianmario/mysql2/blob/a1c198ee4c8d4d32dfa79f207ec7d0524c5f7bcc/lib/mysql2/client.rb#L31).                                                    |
| `read_timeout`     | Read timeout is used by the `libmysqlclient` library to identify whether the MySQL client is still alive and sending data. As we know that TCP sends data in chunks, the client waits for this timeout when reading from the socket, before deeming that there is an error and closing the connection. | Native to the [mysql2](https://github.com/brianmario/mysql2) library, passed to `libmysqlclient` as [`MYSQL_OPT_READ_TIMEOUT`](https://dev.mysql.com/doc/refman/5.7/en/mysql-options.html)    | 3 × 10 minutes [Source](https://dev.mysql.com/doc/refman/5.7/en/mysql-options.html)                                                                                                   |

### Connection Pooling Algorithm

The following pseudocode is the algorithm for how ActiveRecord retrieves connections from the pool to perform database queries.

~~~ python
if there are existing connections to the database available:
	return one of the existing connections

if the pool is at capacity:
	wait on the queue, raise exception if `checkout_timeout` has elapsed
  return one of the now available connections

# pool is not at capacity
try to create a new connection, raise exception if `connect_timeout` has elapsed

# connection to database established
return new connection
~~~

This is loosely translated from the [source code](https://github.com/rails/rails/blob/5.1.3/activerecord/lib/active_record/connection_adapters/abstract/connection_pool.rb#L725-L749).

## Replicating and Debugging

Let’s try to replicate the problem in a small Rails application. We will create a new Rails application, connect it to a database, run it in a Docker container and finally run some experiments to replicate the problem. In production, we use [Puma](https://github.com/puma/puma) to run our Rails server and connect to a few MySQL databases managed by [Amazon Relational Database Service (RDS)](https://aws.amazon.com/rds/), so we will try to follow that on our local setup.

### Step 1: Create a new Rails Application

First, we will scaffold a fresh Rails application and connect it to two databases that we will call as `db_main` and `db_other`:

~~~ bash
# the flags removes unwanted boilerplate code
rails new rails-mysql-timeouts --database=mysql --api -M -C -S -J -T
~~~

For simplicity, we will set the `thread_count` of our Puma server to `2`, in `config/puma.rb`.

~~~ ruby
threads_count = 2
~~~

Using `rails generate scaffold`, we set up a `Driver` model to talk to our main database, and a `Passenger` model to talk to another database we want to test the failure on. This can be done by adding the following line to our `Passengers` model.

~~~ ruby
class Passenger < ApplicationRecord
  # connect to #{Rails.env}_other database specified in the database.yml
  establish_connection "#{Rails.env}_other".to_sym
end
~~~

We now have the following HTTP routes:

~~~
# connects to db_main
GET /drivers/1

# connects to db_other
GET /passengers/1
~~~

Now we will run our Rails server with the following environment variables

~~~ bash
export RAILS_ENV=production
export RAILS_LOG_TO_STDOUT=1

rails server
~~~

By using a docker container to run the Rails application, we can isolate the process namespace and focus directly on our application. We run `ps` and observe the two threads we have configured puma — `puma 001` and `puma 002`.

~~~ bash
$ ps -T -e
  PID  SPID TTY          TIME CMD
    1     1 ?        00:00:00 sleep
   30    30 pts/1    00:00:00 bash
   63    63 pts/0    00:00:00 bash
   97    97 pts/1    00:00:03 ruby
   97    99 pts/1    00:00:00 ruby-timer-thr
   97   105 pts/1    00:00:00 tmp_restart.rb*
   97   106 pts/1    00:00:00 puma 001
   97   107 pts/1    00:00:00 puma 002
   97   108 pts/1    00:00:00 reactor.rb:152
   97   109 pts/1    00:00:00 thread_pool.rb*
   97   110 pts/1    00:00:00 thread_pool.rb*
   97   111 pts/1    00:00:00 server.rb:327
  112   112 pts/0    00:00:00 ps
~~~

Note that PID 1 is `sleep` because in [`docker-compose.yml`](https://github.com/jiahaog/rails-mysql-timeouts/blob/master/docker-compose.yml), we specified that the container should start with `cmd: sleep infinity` so that we can attach to the running container at any time, not unlike a `ssh` to a machine.

### Step 2: Verify Our Application

We make the following requests to ensure that our server is working correctly:

~~~ bash
$ curl localhost:3000/drivers
[{"id":1,"name":"test driver","created_at":"2017-11-05T11:59:15.000Z","updated_at":"2017-11-05T11:59:15.000Z"}]

$ curl localhost:3000/passengers
[{"id":1,"name":"test","created_at":"2017-01-01T00:00:00.000Z","updated_at":"2017-01-07T00:00:00.000Z"}]
~~~

Great! We are now able to see the records generated in the database by the above curl requests.

The entire source code for this application can be found [here](https://github.com/jiahaog/rails-mysql-timeouts).

### Step 3: Simulating the Production Issue

We will now try to simulate the production issue by using a proxy to monitor all our TCP connections from our Rails application to our database. Finally, we will run some experiments by sending requests that hit the backend database and analyse the behaviour of both `connect_timeout` and `read_timeout` settings.

First, we use [Toxiproxy](https://github.com/Shopify/toxiproxy) as a transport layer proxy to `db_other` which allows us to manipulate the pipe between the client and the upstream database. The following command stops all data from getting the proxy, and closes the connection after timeout.

~~~ bash
toxiproxy-cli toxic add db_other_proxy --toxicName timeout --type timeout --attribute=timeout=100000
~~~

Now we test if things are still working for endpoints that access the unaffected database.

~~~ bash
$ curl localhost:3000/drivers
[{"id":1,"name":"test driver","created_at":"2017-11-05T11:59:15.000Z","updated_at":"2017-11-05T11:59:15.000Z"}]
~~~

This is expected, as the `db_main` is still running. Let’s trigger a request to `db_other`.

~~~ bash
$ curl localhost:3000/passengers
~~~

We notice that the command does not exit and our terminal blocks while waiting for the command to terminate.

Let’s trigger another call to `db_main`.

~~~ bash
$ curl localhost:3000/drivers
[{"id":1,"name":"test driver","created_at":"2017-11-05T11:59:15.000Z","updated_at":"2017-11-05T11:59:15.000Z"}]
~~~

Seems like it still works! Now let’s make another request to the `db_other` to lock up the two threads our server is configured to use.

~~~ bash
$ curl localhost:3000/passengers
~~~

And make another request to `db_main`.

~~~ bash
$ curl localhost:3000/drivers
~~~

Notice that the call to `/drivers` is stuck and does not complete now. Because we have set the thread count to `2`, and have two `/passengers` request in flight, both threads are stuck waiting for the database and we do not have any more threads available to handle the new request, and hence the stalled `/drivers` request.

This is exactly what happened during our production outage, except on a much larger scale.

### Experiments

Let’s perform some experiments to better understand how `connect_timeout` and `read_timeout` work. We will set the timeouts to the following:

~~~ yaml
+ connect_timeout: 10
+ read_timeout: 5
~~~

In the following section we will perform two experiments.

#### Experiment 1: Application has no Existing Connections before Database Failure

1. Stop data transmission to `db_other`
2. Start Rails
3. `GET /passengers`

We first block data to `db_other` , so that on the first ActiveRecord call to retrieve some data from the database, there are no available connections in the connection pool and it needs to establish a fresh connection to the database when it receives the first `GET /passengers` request.

#### Experiment 2: Application has Existing Connections before Database Failure

2. Start Rails
3. `GET /passengers`
4. Stop data transmission to `db_other`
5. `GET /passengers`

Rails is started and we make a call to `GET /passengers`. A connection to the database is established to retrieve the data, and checked back into the pool as an available connection after the request.

Now, when the proxy stops sending data to `db_other`, ActiveRecord does not know that the database is unavailable and believes that the previously checked in connection is available for use with the second `GET /passengers`.

We can use the [`ss`](http://man7.org/linux/man-pages/man8/ss.8.html) command to observe the TCP connections. When Rails has just been started, there are no existing TCP connections .

~~~ bash
# shows TCP connections with the PID
$ ss -tnp
~~~

After a `GET /passengers` completes, a TCP connection can be seen in the `ESTAB` state.

~~~ bash
$ ss -tnp
State      Recv-Q Send-Q       Local Address:Port         Peer Address:Port
ESTAB      0      0               172.18.0.4:54304          172.18.0.3:3306   users:(("ruby",pid=11683,fd=13))
~~~

Now we stop the database, and make another call to `GET /passengers`. We run `ss` when the request is in flight, and observe another TCP connection for the request to the port Rails listens on, port `3000`.

~~~ bash
$ ss -tnp
State      Recv-Q Send-Q       Local Address:Port         Peer Address:Port
ESTAB      0      0               172.18.0.4:54304          172.18.0.3:3306   users:(("ruby",pid=11683,fd=13))
ESTAB      0      0               172.18.0.4:3000           172.18.0.1:60878  users:(("ruby",pid=11683,fd=12))
~~~

After `read_timeout` has elapsed, we see that a new connection is established to the database, and the first one has transitioned to a `FIN-WAIT` state. This new TCP connection is in the `ESTAB` state (line 3), because we have only stopped the database on the application layer, but the sockets to the container still accept the TCP handshake on the transport layer.

~~~ bash
$ ss -tnp
FIN-WAIT-2 0      0               172.18.0.4:54304          172.18.0.3:3306
ESTAB      0      0               172.18.0.4:54308          172.18.0.3:3306   users:(("ruby",pid=11683,fd=13))
ESTAB      0      0               172.18.0.4:3000           172.18.0.1:60878  users:(("ruby",pid=11683,fd=12))
~~~

After `connect_timeout` has elapsed, the request terminates with a 500 error, and we observe that all the connections are in the `FIN-WAIT` state.

~~~ bash
$ ss -tnp
State      Recv-Q Send-Q       Local Address:Port         Peer Address:Port
FIN-WAIT-2 0      0               172.18.0.4:54310          172.18.0.3:3306
FIN-WAIT-2 0      0               172.18.0.4:54304          172.18.0.3:3306
FIN-WAIT-2 0      0               172.18.0.4:54308          172.18.0.3:3306
~~~

The experimental data can be found [below](#experimental-data).

#### Findings

It’s worth noting that when setting `connect_timeout` and `read_timeout` in the `database.yml`, there is a difference between empty values and the case where the key is missing entirely in the file. If the values are empty, scenario 1 will fail to terminate after 5 minutes, but if the keys are absent, scenario 1 will fail after 120 seconds, which is the default for `connect_timeout`.

##### Experiment 1 Findings

The request waits for `connect_timeout` to connect to the database, where the default value (when not specified) is indeed 120 seconds.

As expected, connecting to the database with no existing connections is independent of the `read_timeout`.

##### Experiment 2 Findings

The request waits for `read_timeout` + `connect_timeout` before failing. This is because the connection pool waits for `read_timeout` on the existing connection before terminating it, and then waits for `connect_timeout` as it tries to establish a new connection to `db_other`.

## Analysis

With these findings, we can try to understand how the lack of these timeouts affected our Rails server in production during and after the database failover.

### Establishing Terms

Our application server constantly receives requests, out of which a certain percentage of requests will trigger the code to connect to the affected database, we call it _x_-type requests. For the other requests that do not trigger a database connection, we call it the _x’_-type requests.

### Analysis

With the background knowledge gathered in our experiments, let’s try to analyse all the steps that happened during our production outage.

1. Rails is started from a clean state, with no connections setup to the database initially
2. Rails handles the first few _x_ request types, opens a connection to the database
3. Subsequent requests of _x_ type can reuse the same connections from the connection pool
4. At a certain time, due to a fault with AWS, a failover of the database is triggered
5. At the same time requests of _x_ type comes in — and ActiveRecord reuses the same database connection from the pool, but there is no response. It then waits for `read_timeout`, causing the thread to be stuck waiting for the default timeout
6. Even though Rails can process requests of _x’_ type normally, more and more requests of _x_ type come in and causes more and more threads to be stuck waiting
7. Eventually, all the available threads to handle requests are stuck waiting on the TCP connection to the failed database, and Rails can no longer respond to new requests
8. After the default `read_timeout` has elapsed (3 × 10 minutes), some threads will be released to handle new requests
9. Subsequent requests of _x_ type will cause a new connection to be opened to the database
   * If the failover is complete and the DNS records for the new instance has been updated, the new connections will be established
   * If the failover is not complete or the DNS records were not updated, the TCP connections will still try to connect to the old IP address with the failed database instance. The connections will wait for the `connect_timeout` (default 120 seconds) to elapse before failing
10. Finally, once all the threads are stuck, our Rails application stops responding to all requests until it was restarted manually

#### Solution

To fix the problem, we have to prevent our database connections from being stuck in trying to read from a unresponsive socket, and trying to connect to a closed socket.

This can be done by simply setting the `read_timeout` so that when the database fails, existing connections hence threads will be released. The `connect_timeout` also has to be set so that when the existing connections are released, new connections and threads handling the requests will not be stuck trying to connect to the same unavailable database.

We set the following values in our staging environment and manually triggered a database failover via the AWS console, and observed that requests of _x’_ type are no longer stalled during the failover.

The following is a snippet for our current `database.yml` configuration before the outage, and the changes to resolve the problem.

~~~ yaml
# Config for the non-primary `db_other` database
production_other:
  adapter: mysql2
  encoding: utf8
  reconnect: false
  database: …
  pool: …
  reaping_frequency: 120
  username: …
  password: …
  host: …
~~~

~~~ yaml
# New changes
+ connect_timeout: 5
+ read_timeout: 5
~~~

## Conclusion

In this post, we have gone over how timeouts are handled by the ActiveRecord ORM with our MySQL database and how failing to configure them brought down some of our production systems.

Timeouts are very important configurations when setting up distributed systems and they are easily overlooked in the initial deployments of such applications.

These principles are not just limited to Rails or MySQL, and the experiments and their findings can be easily extended to other technologies as well. Needless to say, these timeout settings are extremely important for the resiliency of applications in the world of micro services.

## References

* [ankane/the-ultimate-guide-to-ruby-timeouts](https://github.com/ankane/the-ultimate-guide-to-ruby-timeouts)
* [ankane/production_rails](https://github.com/ankane/production_rails)
* [MySQL Reference Manual](https://dev.mysql.com/doc/refman/5.7/en/mysql-options.html)
* [MySQL Source Code Mirror](https://github.com/zach14c/mysql/blob/mysql-5.7/include/mysql_com.h#L298)
* [TCP Connection States](https://blog.confirm.ch/tcp-connection-states/)

Big thanks to [Joel Low](https://github.com/lowjoel) for helping out with this investigation and clarifying ambiguities in Rails and MySQL, and my manager Amit Saini for his helpful review of this post!

Source code for the test rails application can be found [here](https://github.com/jiahaog/rails-mysql-timeouts).
