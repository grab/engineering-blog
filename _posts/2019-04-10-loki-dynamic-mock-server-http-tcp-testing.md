---
layout: post
id: loki-dynamic-mock-server-http-tcp-testing
title: Loki, a Dynamic Mock Server for HTTP/TCP Testing
date: 2019-04-10 02:41:42
authors: [thuy-nguyent, mayank-gupta, vishal-prakash, vineet-nair]
categories: [Engineering]
tags: [Back End, Service, Mobile, Testing]
comments: true
cover_photo: /img/loki-dynamic-mock-server-http-tcp-testing/cover.png
excerpt: "Read our blog to know how Loki, a dynamic mock server, makes local box testing of mobile apps easy, repeatable, and exhaustive. It supports both HTTP and TCP protocols and can provide dynamic runtime responses."
---

Background
==========

In a previous article we introduced [Mockers - an innovative tool for local box testing at Grab](https://engineering.grab.com/mockers). Mockers used a [Shift Left testing strategy](https://en.wikipedia.org/wiki/Shift_left_testing), making testing more effective and cheaper for development teams. Mockers’ popularity and success motivated us to create Loki - a one-stop dynamic mock server for local box testing of mobile apps.

There are some unique challenges in mobile apps testing at Grab. End-to-end testing of an app is difficult due to high dependency on backend services and other apps. Staging environment, which hosts a plethora of backend services, is tough to manage and maintain. Issues such as staging downtime, configuration mismatches, and data corruption can affect staging adding to the testing woes. Moreover, our apps are fairly complex, utilizing multiple transport protocols such as HTTP, HTTPS, TCP for various business flows.

The business flows are also complex, requiring exhaustive set up such as credit card payments set up, location spoofing, etc resulting in high maintenance costs for automated testing. Loki simulates these flows and developers can easily test use cases that take longer to set up in a real backend staging.

Loki is our attempt to address challenges in mobile app testing by turning every developer local box into a full fledged pseudo backend environment where all mobile workflows can be tested without any external dependencies. It mocks backend services on developer local boxes, decoupling the mobile apps from real backend services, which provides several advantages such as:

**No need to deploy frequently to staging**

Testing is blocked if the app receives a bad response from staging. In these cases, code changes have to be deployed on staging to fix issues before resuming tests. In contrast, using Loki lets developers continue testing without any immediate need to deploy code changes to staging.

**Allows parallel frontend and backend development**

Loki acts as a mock backend service when the real backend is still evolving. It lets the frontend development run in parallel with backend development.

**Overcome time limitations**

In a one week regression-and-release scenario, testing time is limited. However, the application UI rendering and functionality still needs reasonable testing. Loki lets developers concentrate on testing in the available time instead of fixing dependencies on backend services.

Loki - Grab's solution to simplify mobile apps testing
======================================================

At Grab, we have multiple mobile apps that are dependent on each other. For example, our Passenger and Driver apps are two sides of a coin; the driver gets a job card only when a passenger requests a booking. These apps are developed by different teams, each with its own release cycle. This can make it tricky to confidently and repeatedly test the whole business flow across apps. Apps also depend on multiple backend services to execute a booking or food order and communicate over different protocols.

Here’s a look at how our mobile apps interact with backend services over different protocols:

<div class="post-image-section">
  <img alt="Mobile app interaction with backend services" src="/img/loki-dynamic-mock-server-http-tcp-testing/image6.png">
</div>


Loki is a dynamic mock server, written in Golang, running in a Docker container on the local box or in CI. It is easy to set up and run through standard Docker commands. In the context of mobile app testing, it plays the role of backend services, so you no longer need to set up an extensive staging environment.

The Loki architecture looks like this:

<div class="post-image-section">
  <img alt="Loki architecture" src="/img/loki-dynamic-mock-server-http-tcp-testing/image3.png">
</div>


The technical challenges we had to overcome
===========================================

We wanted a comprehensive mocking solution so that teams don’t need to integrate multiple tools to achieve independent testing. It turned out that mocking TCP was most challenging because:

*   It is a long running client-server connection, and it doesn’t follow an HTTP-like request/response pattern.
*   Messages can be sent to the app without an incoming request as well, hence we had to expose a way via Loki to set a mock expectation which can send messages to the app without any request triggering it.
*   As TCP is a long running connection, we needed a way to delimit incoming requests so we know when we can truncate and deserialize the incoming request into JSON.

We engineered the Loki backend to support both HTTP and TCP protocols on different ports. Yet, the mock expectations are set up using RESTful APIs over HTTP for both protocols. A single point of entry for setting expectations made it more intuitive for our developers.

An in-memory cron implementation pushes scheduled messages to the app over a TCP connection. This enabled testing of complex use cases such as drivers getting new job cards, driver and passenger chat workflows, etc. The delimiter for TCP protocol is configurable at start up, so each team can decide when to truncate the request.

To enable Loki on our CI, we had to reduce its memory footprint. Hence, we built Loki with pluggable storages. MySQL is used when running on local and on CI we switch seamlessly to in-memory cache or Redis.

For testing apps locally, developers must validate complex use cases such as:

*   Payment related flows, which require the response to include the same payment ID as sent in the request. This is a case of simple mapping of request fields in the response JSON.

*   Flows requiring runtime logic execution. For example, a job card sent to a driver must have a valid timestamp, requiring runtime computation on Loki.

To support these cases and many more, we added JavaScript injection capability to Loki. So, when we set an expectation for an HTTP request/response pair or for TCP events, we can specify JavaScript for computing the dynamic response. This is executed in a sandbox by an in-house JS execution library.

Grab follows a transactional workflow for bookings. Over the life of a ride, bookings go through different statuses. So, Loki had to address multiple HTTP requests to the same endpoint returning different responses. This feature is required for successfully mocking a whole ride end-to-end.

Loki uses  an HTTP API `“httpTimesAndOrder”` for this feature. For example, using `“httpTimesAndOrder”`, you can configure the same status endpoint (`/ride/status`) to return different ride statuses such as `“PICKING”` for the first five requests, `“IN_RIDE”` for the next three requests, and so on.

Now, let’s look at how to use Loki to mock HTTP requests and TCP events.

Mocking HTTP requests
=====================

To mock HTTP requests, developers first point their app to send requests to the Loki mock server. Then, they set up expectations for all requests sent to the Loki mock server.

<div class="post-image-section">
  <img alt="Loki mock server" src="/img/loki-dynamic-mock-server-http-tcp-testing/image4.png">
</div>

For example, the Passenger app calls an HTTP dependency `GET /closeby/drivers/` to get nearby drivers. To mock it with Loki, you set an expected response on the Loki mock server. When the `GET /closeby/drivers/` request is actually made from the Passenger app, Loki returns the set response.

This snippet shows how to set an expected response for the `GET /closeby/drivers/request`:

```
Loki API: POST `/api/v1/expectations`

Request Body :

{
  "uriToMock": "/closeby/drivers",
  "method": "GET",
  "response": {
    "drivers": [
      1001,
      1002,
      1010
    ]
  }
}
```

Workflow for setting expectations and receiving responses
---------------------------------------------------------

<div class="post-image-section">
  <img alt="Workflow for setting expectations and receiving responses" src="/img/loki-dynamic-mock-server-http-tcp-testing/image5.png">
</div>


Mocking TCP events
==================

Developers point their app to Loki over a TCP connection and set up the TCP expectations. Loki then generates scheduled events such as sending push messages (job cards, notifications, etc) to the apps pointing at Loki.

For example, if the Driver app, after it starts, wants to get a job card, you can set an expectation in Loki to push a job card over the TCP connection to the Driver app after a scheduled time interval.

This snippet shows how to set the TCP expectation and schedule a push message:

```
Loki API: POST `/api/v1/tcp/expectations/pushmessage`

Request Body :

{
  "name": "samplePushMsg",
  "msgSequence": [
    {
      "messages": {
        "body": {
          "jobCardID": 1001
        }
      }
    },
    {
      "messages": {
        "body": {
          "jobCardID": 1002
        }
      }
    }
  ],
  "schedule": "@every 1m"
}
```

Workflow for scheduling a push message over TCP
-----------------------------------------------

![](images/image1.png)
<div class="post-image-section">
  <img alt="Workflow for scheduling a push message over TCP" src="/img/loki-dynamic-mock-server-http-tcp-testing/image1.png">
</div>

Some example use cases
======================

Now that you know about Loki, let’s look at some example use cases.

Generating a custom response at runtime
---------------------------------------

Our first example is customizing a runtime response for both HTTP and TCP requests. This is helpful when developers need dynamic responses to requests. For example, you can add parameters from the request URL or request body to the runtime response.

It’s simple to implement this with a JavaScript function. Assume you want to embed a message parameter in the request URL to the response. To do this, you first use a POST method to set up the expectation (in JSON format) for the request on Loki:

```
Loki API: POST `/api/v1/feature/expectations`

Request Body :

{
  "expectations": [{
    "name": "Sample call",
    "desc": "v1/test/{name}",
    "tags": "v1/test/{name}",
    "resource": "/v1/test?name=user1",
    "verb": "POST",
    "response": {
      "body": "{ \"msg\": \"Hi \"}",
      "status": 200
    },
    "clientOptions": {
"javascript": "function main(req, resp) { var url = req.RequestURI; var captured = /name=([^&]+)/.exec(url)[1]; resp.msg =  captured ? resp.msg + captured : resp.msg + 'myDefaultValue'; return resp }"
    },
    "isActive": 1
  }]
}
```

When Loki receives the request, the JavaScript function used in the `clientOptionskey`, adds `name` to the response at runtime. For example, this is the request’s fixed response:

```
{
    "msg": "Hi "
}
```

But, after using the JavaScript function to add the URL parameter, the dynamic response is:

```
{
    "msg": "Hi user1"
}
```

Similarly, you can use JavaScript to add other dynamic responses such as modifying the response’s JSON array, adding parameters to push messages, etc.

Defining a response sequence for mocked API endpoints
-----------------------------------------------------

Here’s another interesting example - defining the response sequence for API endpoints.

A response sequence is useful when you need different responses from the same API endpoint. For example, a status endpoint should return different ride statuses such as ‘allocating’, ‘allocated’, ‘picking’, etc. depending on the stage of a ride.

To do this, developers set up their HTTP expectations on Loki. Then, they easily define the response sequence for an API endpoint using a Loki POST method.

In this example:

*   `times` - specifies the number of times the same response is returned.
*   `after` - specifies one or more expectations that must match before a specified expectation is matched.

Here, the expectations are matched in this sequence when a request is made to an endpoint - `Allocating` > `Allocated` > `Pickuser` > `Completed`. Further, `Completed` is set to two times, so Loki returns this response two times.

```
Loki API: POST `/api/v1/feature/sequence`

Request Body :
  "httpTimesAndOrder": [
      {
          "name": "Allocating",
          "times": 1
      },
      {
          "name": "Allocated",
          "times": 1,
          "after": ["Allocating"]
      },
      {
          "name": "Pickuser",
          "times": 1,
          "after": ["Allocated"]
      },
      {
          "name": "Completed",
          "times": 2,
          "after": ["Pickuser"]
      }
  ]
}
```

In conclusion
=============

Since Loki’s inception, we have set up a full range CI with proper end-to-end app UI tests and, to a great extent, decoupled our app releases from the staging backend. This improved delivery cycles, and we did faster bug catching and more exhaustive testing. Moreover, both developers and QAs can easily play with apps to perform exploratory testing as well as manual functional validations. Teams are also using Loki to run automated scripts (Espresso and XCUItests) for validating the mobile app pages.

Loki’s adoption is growing steadily at Grab. With our frequent release of new mobile app features, Loki helps teams meet our high quality bar and achieve huge productivity gains.

If you have any feedback or questions on Loki, please leave a comment.
