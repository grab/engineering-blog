---
layout: post
id: 2023-05-16-iOS-CI-infrastructure-with-observability-tools
title: How we improved our iOS CI infrastructure with observability tools
date: 2023-05-16 04:39:00
authors: [bunty-madan,krist-foo,denis-sakhapov]
categories: [Engineering]
tags: [iOS, Mobile, Engineering, UITesting]
comments: true
cover_photo: /img/iOS-CI-infrastructure-with-observability-tools/cover.png
excerpt: "After upgrading to Xcode 13.1, we noticed a few issues such as instability of the CI tests and high CPU utilisation. Read to find out how the Test Automation - Mobile team investigated these issues and resolved them by integrating observability tools into our iOS CI development process."
---
<small>_Note: Timestamps used in this article are in UTC+8 Singapore time, unless stated otherwise._</small>

## Background

When we upgraded to Xcode 13.1 in April 2022, we noticed a few issues such as instability of the CI tests and other problems related to the switch to Xcode 13.1. 

After taking a step back, we investigated this issue by integrating some observability tools into our iOS CI development process. This gave us a comprehensive perspective of the entire process, from the beginning to the end of the UITest job. In this article, we share the improvements we made, the insights we gathered, and the impact of these improvements on the overall process and resource utilisation.

## Solution

In the following sections, we elaborate the various steps we took to investigate the issues, like unstable CI tests and high CPU utilisation, and the improvements we made to make our iOS CI infrastructure more reliable.

### Analyse Xcode 13.1 CPU utilisation

As an iOS developer, we are certain that you have also experienced Spotlight process-related CPU usage problems with Xcode 13.1, which have since been resolved in Xcode 13.2. After investigating, we found that the CPU usage issues were one of the root causes of UITest’s instability and it was something we needed to fix urgently. We decided not to wait for Apple’s update as it would cost us more time to perform another round of migration.

Before we started UITest, we moved the spotlight.app into a new folder. When the test was complete, we restored the application to its original location. This significantly decreased CPU utilisation by more than 50%.

This table helps you better visualise how the different versions of Xcode affected CPU utilisation.

<div class="post-image-section"><figure>
  <img src="img/iOS-CI-infrastructure-with-observability-tools/image6.png" alt="" style="width:70%"><figcaption align="middle">Xcode 12.1</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="img/iOS-CI-infrastructure-with-observability-tools/image6.png" alt="" style="width:70%"><figcaption align="middle">XXcode 13.1 Before Fix</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="img/iOS-CI-infrastructure-with-observability-tools/image2.png" alt="" style="width:70%"><figcaption align="middle">Xcode 13.1 After Fix</figcaption>
  </figure>
</div>

### Remove iOS Safari's dependency during deep link testing

As a superapp, there are countless scenarios that need to be thoroughly tested at Grab before the feature is released in production. One of these tests is deep link testing.

More than 10% of the total number of tests are deep link tests. Typically, it is advised to mock the dependencies throughout the test to ensure that it runs quickly and reliably. However, this creates another reliance on iOS Safari.

As a result, we created a mock browser in UITest. We used the URL to the mock browser as the launch argument, and the same URL is then called back. This method results in a 20% reduction in CI time and more stable tests.

<div class="post-image-section"><figure>
  <img src="img/iOS-CI-infrastructure-with-observability-tools/image4.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
  </figure>
</div>

### Boot the iOS simulator with permission

It is always a good idea to reset the simulator before running UITest so that there are no residual presets or simulated data from a different test. Additionally, using any of the simulator's services (location, ATT, contacts, etc.) will prompt the simulator to request permission, which slows down execution. We used UIInterruptionHandler (a handler block for managing alerts and other dialogues) to manage asynchronous UI interruptions during the test.

We wanted to reduce the time taken for test execution, which we knew includes many permissions. Therefore, in order to speed up execution, we boot the simulator with permissions. This removes the need for permissions during UITest, which speeds up performance by 5%.  
<div class="post-image-section"><figure>
  <img src="img/iOS-CI-infrastructure-with-observability-tools/image7.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
  </figure>
</div>

### Monitor HTTP traffic during the UITest


When writing tests, it is important to mock all resources as this enables us to focus on the code that’s being tested and not how external dependencies interact or respond. However, with a large team working concurrently, it can be challenging to ensure that nothing is actually downloaded from the internet.

Developers often make changes to code, and UITests are essential for ensuring that these modifications do not adversely affect existing functionality. It is advised to mock all dependencies while writing tests to simulate all possible behavior. We discovered that a significant number of resources were being downloaded each time we ran the tests, which was highly inefficient.

In large teams working simultaneously, preventing downloads from the internet can be quite challenging. To tackle this issue, we devised a custom tool that tracks all URLs accessed throughout the UITest. This enabled us to identify resources being downloaded from the internet during the testing process.

By using our custom tool to analyse network traffic, we were able to ensure that no resources were being downloaded during testing. Instead, we relied on mocked dependencies, resulting in reduced testing times and improved stability.

### GitLab load runner analysis

At Grab, we have many teams of developers who maintain the app, make code changes, and raise merge requests (MRs) on a daily basis. To make sure that new changes don't conflict with existing code, these MRs are integrated with CI.

Additionally, to manage the number of MRs, we maintain a list of clusters that run test runners concurrently for better resource utilisation and performance. We frequently run these tests to determine how many parallel processors are required for stable results.

####Return HTTP responses to the local mock server


We have a tool that we use to mock API requests, which we improved to also support HTML responses. This increases the scope of testing and ensures the HTML response sequences work properly.

### Use explicit waiting commands

When running multiple tests, timing issues are inevitable and they cause tests to occasionally pass and fail. To mitigate this, most of the developers prefer to add a sleep command so there is time for the element to render properly before we verify it – but this slows down execution. In order to improve CI execution, we introduced a link that allows us to track sleep function usage and suggest developers use ``waitForExistence`` wrappers in UI tests.

### Track each failure state

With large codebases, it is quite common to see flakiness in UITests, where tests occasionally succeed and fail without any code changes. This means that test results can be inconsistent and in some cases, faulty. Faulty testing can be frustrating, and quite expensive. This is because engineers need to re-trigger entire builds, which ends up consuming more time.

Initially, we used an internal tool that required all tests to pass on the first run, before merging was allowed. However, we realised that this significantly increased engineers’ manual retry time, hence, we modified the rules to allow merging as long as a subsequent retry passes the tests. This minor change improved our engineers’ CI overall experience and did not result in more flaky tests.

<div class="post-image-section"><figure>
  <img src="img/iOS-CI-infrastructure-with-observability-tools/image5.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
  </figure>
</div>

## Learnings/Conclusion

Our journey to improve iOS CI infrastructure is still ongoing, but from this experience, we learnt several things:

*   Focus on the feature being tested by ensuring all external responses are mocked.
*   A certain degree of test flakiness is expected, but you should monitor past trends. If flakiness increases, there’s probably a deeper lying issue within your code.
*   Regularly monitor resource utilisation and performance – detecting a sudden spike early could save you a lot of time and money.
