---
layout: post
id: keeping-170-libraries-up-to-date
title: Keeping 170 libraries up to date on a large scale Android App
date: 2020-10-28 04:39:00
authors: [lucas-nelaupe]
categories: [Engineering]
tags: [Mobile, Android, Engineering]
comments: true
cover_photo: /img/keeping-170-libraries-up-to-date/cover.jpg
excerpt: "TODO"
---

To scale up to the needs of our customers, we've adopted ways to efficiently deliver our services through our everyday superapp - whether it's through continuous process improvements or coding best practices. For one, [libraries](https://en.wikipedia.org/wiki/Library_(computing)) have made it possible for us to increase our development velocity. In the Passenger App Android team, we have a mix of libraries - from libraries that we've built in-house to open source ones.

Every week we are releasing a new version of our Passenger App. Each update contains on average between 5 to 10 library updates. In this article, we will explain how we keep all libraries used by our app up to date, and the different actions we take to avoid defect leaks into production.

## How many libraries are we using ?

Before we  add a new library to a project, it  goes through a rigorous assessment process covering many parts, such as security issue detection, usability tests measuring the impact on the app size and app startup time. This process ensures that only libraries up to our standards are added.

In total, there are more than **170 libraries** powering the SuperApp, including 55 AndroidX artifacts and 22 libraries used for the sole purpose of writing automation testing (Unit Testing or UI Testing).

## Who is responsible for updating

While we do have an internal process on how to update the libraries, it doesn’t mention who and how often it should be done. In fact, it’s everyone's responsibility to make sure our libraries are up to date. Each team should be aware of the libraries they are using and whenever a new version is released.

However, this is not really the case. We have a few developers taking ownership of the libraries as a whole and trying to maintain it. With more than 170 external libraries, we surveyed the Android developer community on how they manage libraries in the company. The result that can be summarized as follow:

<div class="post-image-section"><figure>
  <img src="/img/keeping-170-libraries-up-to-date/infography.png" alt="TODO">
</figure></div>

While most developers are aware of updates, they do not update a library because the risk of defects leaking into production is too high.

## Risk Management
The risk is to have a defect leaking into production. It can cause regressions on existing features or introduce new crashes in the app. In a worst case scenario, if this is not caught before publishing, it can force us to make a hotfix and a certain number of users will be impacted.

The risk needs to be assessed between the number of usages of a certain library and the size of the changes. It can be summarised in the following chart.

Before updating (bump) a library, we evaluate 2 metrics:
- the usage of this library in the codebase
- the number of changes introduced in the library between the current version and the targeted version.

<div class="post-image-section"><figure>
  <img src="/img/keeping-170-libraries-up-to-date/radar.png" alt="TODO">
</figure></div>

This arbitrary scale helps in deciding if we will require additional signoff from the QA team. If the estimation places the item on the bottom-left corner, the update will be less risky while if it’s on the top-right corner, it means we should follow extra verification to reduce the risk.

**A good practice to reduce the risks of updating a library is to update it frequently, decreasing the diffs hence reducing the scope of impact.**

## Reducing the Risk

The first thing we are doing to reduce the risk is to update our libraries on a weekly basis. As described above, small changes are always less risky than large changes even if the usage of this partial library is wide. By following incremental updates, we avoid accumulating potential issues over a longer period of time.

For example, the Android Jetpack and Firebase libraries follow a 2-week release train. So every 2 weeks, we check for new updates, read the changelogs, and proceed with the update.

In case of a defect detected, we can easily revert the change until we figure out a proper solution or raise the issue to the library owner.

**Automation**

To reduce risk on any merge request (not limited to library update), we have spent a tremendous amount of effort on automating tests. For each new feature we have a set of test cases written in Gherkin syntax.

Automation is implemented as UI tests and run on CI for every merge request. If those tests fail, we won’t be able to merge any changes.

To further elaborate, let’s take this example: Team A developed a lot of features and now has a total of 1000 test cases. During regression testing before each release, only a subset of those are executed manually based on the impacted area. With automation in place, Team A now has 60% of those tests executed as part of continuous integration. So after all the tests successfully passed, we are already 60% confident that no defect is detected. This tremendously increases our confidence while reducing manual testing.

**QA signoff**

When the update is in the risk threshold area and the automation tests are insufficient, the developer works with QA engineers on analyzing impacted areas. They would then execute test cases related to the impacted area.

For example, if we are updating Facebook library, the impacted area would be “Login with Facebook” functionality. QA engineers will then run test cases related to social login.

A single or multiple team can be involved. In some cases, QA signoff can be required by all the teams if they are all affected by the update.

This process requires a lot of effort from different teams and can affect the current roadmap. To avoid falling into this category, we refine the impacted area analysis to be as specific as possible.

## Update before it becomes mandatory

Regularly, Google updates Google Play requirements to make sure that apps published are fully compatible with the latest Android version.

For example, starting 1st November 2020 all apps must target API 29. This change causes [behaviour changes](https://developer.android.com/about/versions/10/behavior-changes-10) for some API. New behaviour has to be supported and verified for our code, but also for all the libraries we are using. Libraries bundled inside our app are also affected if they are using Android API. However, the support for newer API is done by each library maintainer. By keeping our libraries up-to-date, we make sure that we have compatibility with the latest Android API.

## Key takeaway

- Keep updating your libraries. If they are following a release plan, try to match it to not accumulate too many changes. At Grab, each week for every new release, we are shipping a new version including between 5 to 10 libraries bump.

- For each update, identify the potential risks on your app and find the correct balance between risk and effort required to mitigate this. Don’t overestimate the risk, especially if the changes are minimal and only include some minor bug fixing. Some library updates don't even change any single line of code and are only documentation updates.

- Invest in robust automation testing to create a high confidence level when making changes including potentially large changes like a huge library bump.

---

<small class="credits">Authored by Lucas Nelaupe on behalf of the Grab Android Development team. Special thanks to Tridip Thrizu for the design and Karen Kue for the proofreading of this article.</small>

---