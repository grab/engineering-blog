---
layout: post
id: marionette-enabling-e2e-user-scenario-simulation
title: Marionette - Enabling E2E User-scenario Simulation
date: 2019-12-23 21:00:00
authors: [anish-jha, biju-jacob, phuc-lam-nguyen, vineet-nair, yiwei-yeo]
categories: [Engineering]
tags: [Back End, Testing, Microservice]
comments: true
cover_photo: /img/marionette-enabling-e2e-user-scenario-simulation/cover.png
excerpt: "Do you know how we get early feedback on any breaking changes? Read through our blog to find out how Marionette, an in-house simulation platform, detects breaking changes in booking workflows. It even generates resources for running simulations and facilitates the testing of microservices powering our driver and passenger apps."
---

## Introduction

A plethora of interconnected microservices is what powers the Grab’s app. The microservices work behind the scenes to delight millions of our consumers in Southeast Asia. It is a no-brainer that we emphasise on strong testing tools, so our app performs flawlessly to continuously meet our consumers' needs.

## Background

We have a microservices-based architecture, in which microservices are interconnected to numerous other microservices. Each passing day sees teams within Grab updating their microservices, which in turn enhances the overall app. If any of the microservices fail after changes are rolled out, it may lead to the whole app getting into an unstable state or worse. This is a major risk and that’s why we stress on conducting “end-to-end (E2E) testing” as an integral part of our software test life-cycle.

E2E tests are done for all crucial workflows in the app, but not for every detail. For that we have conventional tests such as unit tests, component tests, functional tests, etc. Consider E2E testing as the final approval in the quality assurance of the app.

Writing E2E tests in the microservices world is not a trivial task. We are not testing just a single monolithic application. To test a workflow on the app from a user’s perspective, we need to traverse multiple microservices, which communicate through different protocols such as HTTP/HTTPS and TCP. E2E testing gets even more challenging with the continuous addition of microservices. Over the years, we have grown tremendously with hundreds of microservices working in the background to power our app.

Some major challenges in writing E2E tests for the microservices-based apps are:

* **Availability**

    Getting all microservices together for E2E testing is tough. Each development team works independently and is responsible only for its microservices. Teams use different programming languages, data stores, etc for each microservice. It’s hard to construct all pieces in a common test environment as a complete app for E2E testing each time.

* **Data or resource set up**

  E2E testing requires comprehensive data set up. Otherwise, testing results are affected because of data constraints, and not due to any recent changes to underlying microservices. For example, we need to create real-life equivalent driver accounts, passenger accounts, etc and to have those, there are a few dependencies on other internal systems which manage user accounts. Further, data and booking generation should be robust enough to replicate real-world scenarios as far as possible.

* **Access and authentication**

  Usually, the test cases require sequential execution in E2E testing. In a microservices architecture, it is difficult to test a workflow which requires access and permissions to several resources or data that should remain available throughout the test execution.

* **Resource and time intensive**

  It is expensive and time consuming to run E2E tests; significant time is involved in deploying new changes, configuring all the necessary test data, etc.

Though there are several challenges, we had to find a way to overcome them and test workflows from the beginning to the end in our app.

## Our Approach to Overcome Challenges

We knew what our challenges were and what we wanted to achieve from E2E testing, so we started thinking about how to develop a platform for E2E tests. To begin with, we determined that the scope of E2E testing that we’re going to primarily focus on is Grab’s transport domain — the microservices powering the driver and passenger apps.

One approach is to *"simulate"* user scenarios through a single platform before any new versions of these microservices are released. Ideally, the platform should also have the capabilities to set up the data required for these simulations. For example, ride booking requires data set up such as driver accounts, passenger accounts, location coordinates, geofencing, etc.

We wanted to create a single platform that multiple teams could use to set up their test data and run E2E user-scenario simulations easily. We put ourselves to work on that idea, which resulted in the creation of an internal platform called “Marionette”. It simulates actions performed by Grab’s passenger and driver apps as they are expected to behave in the real world. The objective is to ensure that all standard user workflows are tested before deploying new app versions.

## Introducing Marionette


Marionette enables Grabbers (developers and QAs) to run E2E user-scenario simulations without depending on the actual passenger and driver apps. Grabbers can set up data as well as configure data such as drivers, passengers, taxi types, etc to mimic the real-world behaviour.

Let’s look at the overall architecture to understand Marionette better:

<div class="post-image-section">
  <img alt="Overall Architecture" src="/img/marionette-enabling-e2e-user-scenario-simulation/architecture.png">
</div>
<p></p>

Grabbers can interact with Marionette through three channels: UI, SDK, and through RESTful API endpoints in their test scripts. All requests are routed through a load balancer to the Marionette platform. The Marionette platform in turn talks to the required microservices to create test data and to run the simulations.

## The Benefits

With Marionette, Grabbers now have the ability to:

*   Simulate the whole booking flow including consumer and driver behaviour as well as transition through the booking life cycle including pick-up, drop-off, cancellation, etc. For example, developers can make passenger booking from the UI and configure pick-up points, drop-off points, taxi types, and other parameters easily. They can define passenger behaviour such as “make bookings after a specified time interval”, “cancel each booking”, etc. They can also set driver locations, define driver behaviour such as “always accept booking manually”, “decline received bookings”, etc.
*   Simulate bookings in all cities where Grab operates. Further, developers can run simulations for multiple Grab taxi types such as JustGrab, GrabShare, etc.
*   Visualise passengers, drivers, and ride transitions on the UI, which lets them easily test their workflows.
*   Save efforts and time spent on installing third-party android or iOS emulators, troubleshooting or debugging `.apk` installation files, etc before testing workflows.
*   Conduct E2E testing without real mobile devices and installed apps.
*   Run automatic simulations, in which a particular set of scenarios are run continuously, thus helping developers with exploratory testing.

## How We Isolated Simulations Among Users

It is important to have independent simulations for each user. Otherwise, simulations don’t yield correct results. This was one of the challenges we faced when we first started running simulations on Marionette.

To resolve this issue, we came up with the idea of “cohorts”. A cohort is a logical group of passengers and drivers who are located in a particular city. Each simulation on Marionette is run using a “cohort” containing the number of drivers and passengers required for that simulation. When a passenger/driver needs to interact with other passengers/drivers (such as for ride bookings), Marionette ensures that the interaction is constrained to resources within the cohort. This ensures that drivers and passengers are not shared in different test cases/simulations, resulting in more consistent test runs.

## How to Interact with Marionette

Let’s take a look at how to interact with Marionette starting with its user interface first.

### User Interface

The Marionette UI is designed to provide the same level of granularity as available on the real passenger and driver apps.

Generally, the UI is used in the following scenarios:

*   To test common user scenarios/workflows after deploying a change on staging.
*   To test the end-to-end booking flow right from the point where a passenger makes a booking till drop-off at the destination.
*   To simulate functionality of other teams within Grab - the passenger app developers can simulate the driver app for their testing and vice versa. Usually, teams work independently and the ability to simulate the dependent app for testing allows developers to work independently.
*   To perform E2E testing (such as by QA teams) without writing any test scripts.

The Marionette UI also allows Grabbers to create and set up data. All that needs to be done is to specify the necessary resources such as number of drivers, number of passengers, city to run the simulation, etc. Running E2E simulations involves just the click of a button after data set up. Reports generated at the end of running simulations provide a graphical visualisation of the results. Visual reports save developers’ time, which otherwise is spent on browsing through logs to ascertain errors.

### SDK

Marionette also provides an SDK, written in the Go programming language.

It lets developers:

*   Create resources such as passengers, drivers, and cohorts for simulating booking flows.
*   Create booking simulations in both staging and production.
*   Set bookings to specific states as needed for simulation through customisable driver and passenger behaviour.
*   Make HTTP requests and receive responses that matter in tests.
*   Run load tests by scaling up booking requests to match the required workload (QPS).

Let’s look at a high-level booking test case example to understand the simulation workflow.

Assume we want to run an E2E booking test with this driver behaviour type — “accepts passenger bookings and transits between booking states according to defined behaviour parameters”. This is just one of the driver behaviour types in Marionette; other behaviour types are also supported. Similarly, passengers also have behaviour types.

To write the E2E test for this example case, we first define the driver behaviour in a function like this:

<div class="post-image-section">
  <img alt="Overall Architecture" src="/img/marionette-enabling-e2e-user-scenario-simulation/code1.png">
</div>
<p></p>

Then, we handle the booking request for the driver like this:

<div class="post-image-section">
  <img alt="Overall Architecture" src="/img/marionette-enabling-e2e-user-scenario-simulation/code2.png">
</div>
<p></p>

The SDK client makes the handling of passengers, drivers, and bookings very easy as developers don’t need to worry about hitting multiple services and multiple APIs to set up their required driver and passenger actions. Instead, teams can focus on testing their use cases.

To ensure that passengers and drivers are isolated in our test, we need to group them together in a cohort before running the E2E test.

<div class="post-image-section">
  <img alt="Overall Architecture" src="/img/marionette-enabling-e2e-user-scenario-simulation/code3.png">
</div>
<p></p>

In summary, we have defined the driver's behaviour, created the booking request, created the SDK client and associated the driver and passenger to a cohort. Now, we just have to trigger the E2E test from our IDE. It’s just that simple and easy!

Previously, developers had to write boilerplate code to make HTTP requests and parse returned HTTP responses. With the Marionette SDK in place, developers don't have to write any boilerplate code saving significant time and effort in E2E testing.

### RESTful APIs in Test Scripts

Marionette provides several RESTful API endpoints that cover different simulation areas such as resource or data creation APIs, driver APIs, passenger APIs, etc. APIs are particularly suitable for scripted testing. Developers can directly call these APIs in their test scripts to facilitate their own tests such as load tests, integration tests, E2E tests, etc.

Developers use these APIs with their preferred programming languages to run simulations. They don’t need to worry about any underlying complexities when using the APIs. For example, developers in Grab have created custom libraries using Marionette APIs in Python, Java, and Bash to run simulations.

## What’s Next

Currently, we cover E2E tests for our transport domain (microservices for the passenger and driver apps) through Marionette. The next phase is to expand into a full-fledged platform that can test microservices in other Grab domains such as Food, Payments, and so on. Going forward, we are also looking to further simplify the writing of E2E tests and running them as a part of the CD pipeline for seamless testing before deployment.

## In Conclusion

We had an idea of creating a simulation platform that can run and facilitate E2E testing of microservices. With Marionette, we have achieved this objective. Marionette has helped us understand how end users use our apps, allowing us to make improvements to our services. Further, Marionette ensures there are no breaking changes and provides additional visibility into potential bugs that might be introduced as a result of any changes to microservices.

If you have any comments or questions about Marionette, please leave a comment below.
