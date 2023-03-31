---
layout: post
id: 2023-03-31-evolution-of-quality
title: Evolution of quality at Grab
date: 2023-03-31 01:23:05
authors: [abby-alcantara, xuanthu-doan, renu-yadav]
categories: [Engineering, Design]
tags: [Engineering, Technology stack, Exploration]
comments: true
cover_photo: /img/evolution-of-quality/cover.png
excerpt: "Testing is typically done after development is complete, which often results in bugs being discovered late in the process. Read to find out how Grab has improved its quality to scale and support the superapp experience. This evolution also brings a cultural shift for quality mindset in teams, enabling us to deliver faster with a better experience for our users."
---

To achieve our vision of becoming the leading superapp in Southeast Asia, we constantly need to balance development velocity with maintaining the high quality of the Grab app. Like most tech companies, we started out with the traditional software development lifecycle (SDLC) but as our app evolved, we soon noticed several challenges like high feature bugs and production issues.  

In this article, we dive deeper into our quality improvement journey that officially began in 2019, the challenges we faced along the way, and where we stand as of 2022.

## Background  

<div class="post-image-section"><figure>
  <img src="/img/evolution-of-quality/image4.png" alt="" style="width:80%"><figcaption align="middle">Figure 1 - Software development life cycle (SDLC) sample</figcaption>
  </figure>
</div>

When Grab first started in 2012, we were using the Agile SDLC (Figure 1) across all teams and features. This meant that every new feature went through the entire process and was **only released** to app distribution platforms (PlayStore or AppStore) **after** the quality assurance (QA) team manually tested and signed off on it.

Over time, we discovered that feature testing took longer, with more bugs being reported and impact areas that needed to be tested. This was the same for regression testing as QA engineers had to manually test each feature in the app before a release. Despite the best efforts of our QA teams, there were still many major and critical production issues reported on our app – the highest numbers were in 2019 (Figure 2).

<div class="post-image-section"><figure>
  <img src="/img/evolution-of-quality/image1.png" alt="" style="width:80%"><figcaption align="middle">Figure 2 - Critical open production issue (OPI) trend</figcaption>
  </figure>
</div>

This surge in production issues and feature bugs was directly impacting our users’ experience on our app. To directly address the high production issues and slow testing process, we changed our testing strategy and adopted shift-left testing.

## Solution

[Shift-left testing](https://www.testim.io/blog/shift-left-testing-guide/) is an approach that brings testing forward to the early phases of software development. This means testing can start as early as the planning and design phases.

<div class="post-image-section"><figure>
  <img src="/img/evolution-of-quality/image2.png" alt="" style="width:80%"><figcaption align="middle">Figure 3 - Shift-left testing</figcaption>
  </figure>
</div>

By adopting shift-left testing, engineering teams at Grab are able to proactively prevent possible defect leakage in the early stages of testing, directly addressing our users' concerns without delaying delivery times.

With shift-left testing, we made three significant changes to our SDLC:

*   **Software engineers conduct acceptance testing**
*   **Incorporate Definition of Ready (DoR) and Definition of Done (DoD)**
*   **Balanced testing strategy**

Let’s dive deeper into how we implemented each change, the challenges, and learnings we gained along the way.

### Software engineers conduct acceptance testing

[Acceptance testing](https://www.geeksforgeeks.org/acceptance-testing-software-testing/) determines whether a feature satisfies the defined acceptance criteria, which helps the team evaluate if the feature fulfills our consumers’ needs. Typically, acceptance testing is done after development. But our QA engineers still discovered many bugs and the cost of fixing bugs at this stage is more expensive and time-consuming. We also realised that the most common root causes of bugs were associated with insufficient requirements, vague details, or missing test cases.

With shift-left testing, QA engineers start writing test cases before development starts and these acceptance tests will be executed by the software engineers during development. Writing acceptance tests early helps identify potential gaps in the requirements before development begins. It also prevents possible bugs and streamlines the testing process as engineers can find and fix bugs even before the testing phase. This is because they can execute the test cases directly during the development stage.

On top of that, QA and Product managers also made **Given/When/Then (GWT)** the standard for acceptance criteria and test cases, making them easier for all stakeholders to understand.

<br>
<table border=1>
  <tr>
  <th style="padding: 20px">Step by Step style</th>
  <th style="padding: 20px">GWT format</th>
  </tr>
  <tr>
    <td style="padding: 20px"><ol><li>Open the Grab app</li><li>Navigate to home feed</li><li>Tap on merchant entry point card</li><li>Check that merchant landing page is shown</li></ol></td>
    <td style="padding: 20px">Given user opens the app <br>And user navigates to the home feed<br>When the user taps on the merchant entry point card<br>Then the user should see the merchant’s landing page</td>
  </tr>
</table>
<br>
By enabling software engineers to conduct acceptance testing, we minimised back-and-forth discussions within the team regarding bug fixes and also, influenced a significant shift in perspective – quality is everyone’s responsibility.

Another key aspect of shift-left testing is for teams to agree on a standard of quality in earlier stages of the SDLC. To do that, we started incorporating Definition of Ready (DoR) and Definition of Done (DoD) in our tasks.

### Incorporate Definition of Ready (DoR) and Definition of Done (DoD)

As mentioned, quality checks can be done before development even begins and can start as early as backlog grooming and sprint planning. The team needs to agree on a standard for work products such as requirements, design, engineering solutions, and test cases. Having this alignment helps reduce the possibility of unclear requirements or misunderstandings that may lead to re-work or a low-quality feature.

To enforce consistent quality of work products, everyone in the team should have access to these products and should follow DoRs and DoDs as standards in completing their tasks.

*   **DoR**: Explicit criteria that an epic, user story, or task must meet before it can be accepted into an upcoming sprint. 
*   **DoD**: List of criteria to fulfill before we can mark the epic, user story, or task complete, or the entry or exit criteria for each story state transitions. 

Including DoRs and DoDs have proven to improve delivery pace and quality. One of the first teams to adopt this observed significant improvements in their delivery speed and app quality – consistently delivering over 90% of task commitments, minimising technical debt, and reducing manual testing times.

Unfortunately, having these two changes alone were not sufficient – testing was still manually intensive and time consuming. To ease the load on our QA engineers, we needed to develop a balanced testing strategy.  

### Balanced testing strategy

<div class="post-image-section"><figure>
  <img src="/img/evolution-of-quality/image3.png" alt="" style="width:80%"><figcaption align="middle">Figure 4 - Test automation strategy</figcaption>
  </figure>
</div>

Our initial automation strategy only included unit testing, but we have since enhanced our testing strategy to be more balanced.

*   Unit testing
*   UI component testing
*   Backend integration testing
*   End-to-End (E2E) testing

Simply having good coverage in one layer does not guarantee good quality of an app or new feature. It is important for teams to test vigorously with different types of testing to ensure that we cover all possible scenarios before a release.

As you already know, unit tests are written and executed by software engineers during the development phases. Let’s look at what the remaining three layers mean.

#### UI component testing

This type of testing focuses on individual components within the application and is useful for testing specific use cases of a service or feature. To reduce manual effort from QA engineers, teams started exploring automation and introduced a mobile testing framework for [component testing](https://applitools.com/learn/concepts/component-testing/).

This UI component testing framework used mocked API responses to test screens and interactions on the elements. These UI component tests were automatically executed whenever the pipeline was run, which helped to reduce manual regression efforts. With shift-left testing, we also revised the DoD for new features to include at least 70% coverage of UI component tests.

#### Backend integration testing

Backend integration testing is especially important if your application regularly interacts with backend services, much like the Grab app. This means we need to ensure the quality and stability of these backend services. Since Grab started its journey toward becoming a superapp, more teams started performing backend integration tests like API integration tests.

Our backend integration tests also covered positive and negative test cases to determine the happy and unhappy paths. At the moment, majority of Grab teams have complete test coverage for happy path use cases and are continuously improving coverage for other use cases.

#### End-to-End (E2E) testing

E2E tests are important because they simulate the entire user experience from start to end, ensuring that the system works as expected. We started exploring E2E testing frameworks, from as early as 2015, to automate tests for critical services like logging in and booking a ride.

But as Grab introduced more services, off-the-shelf solutions were no longer a viable option, as we noticed issues like automation limitations and increased test flakiness. We needed a framework that is compatible with existing processes, stable enough to reduce flakiness, scalable, and easy to learn.

With this criteria in mind, our QA engineering teams built an internal E2E framework that could make API calls, test different account-based scenarios, and provide many other features. Multiple pilot teams have started implementing tests with the E2E framework, which has helped to reduce regression efforts. We are continuously improving the framework by adding new capabilities to cover more test scenarios.

Now that we’ve covered all the changes we implemented with shift-left testing, let’s take a look at how this changed our SDLC.

## Impact

<div class="post-image-section"><figure>
  <img src="/img/evolution-of-quality/image6.png" alt="" style="width:80%"><figcaption align="middle">Figure 5 - Updated SDLC process</figcaption>
  </figure>
</div>

Since the implementation of shift-left testing, we have improved our app quality without compromising our project delivery pace. Compared to 2019, we observed the following improvements within the Grab superapp in 2022:

*   Production issues with “Major and Critical” severity bugs found in production were **reduced by 60%**
*   Bugs found in development phase with “Major and Critical” severity were **reduced by 40%**

## What’s next?
Through this journey, we recognise that there’s no such thing as a bug-free app – no matter how much we test, production issues still happen occasionally. To minimise the occurrence of bugs, we’re regularly conducting root cause analyses and writing postmortem reports for production incidents. These allow us to retrospect with other teams and come up with corrective actions and prevention plans. Through these continuous learnings and improvements, we can continue to shape the future of the Grab superapp.

<small class="credits">Special thanks to Sori Han for designing the images in this article.</small>

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
