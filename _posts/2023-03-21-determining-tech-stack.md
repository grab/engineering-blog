---
layout: post
id: 2023-03-21-determining-tech-stack
title: Determine the best technology stack for your web-based projects
date: 2023-03-21 01:23:05
authors: [george-matthew, sandy-ys]
categories: [Engineering, Design]
tags: [Engineering, Technology stack, Exploration]
comments: true
cover_photo: /img/determining-tech-stack/cover.jpg
excerpt: "As companies grow in today's technology landscape, it often leads to a diverse set of technology stacks being used in different teams, which can lead to bigger problems in the future. Find out how the OVO team compared and analysed different technologies to find the one that best met their needs."
---

In the current technology landscape, startups are developing rapidly. This usually leads to an increase in the number of engineers in teams, with the goal of increasing the speed of product development and delivery frequency. However, this growth often leads to a diverse selection of technology stacks being used by different teams within the same organisation.

Having different technology stacks within a team could lead to a bigger problem in the future, especially if documentation is not well-maintained. The best course of action is to pick just one technology stack for your projects, but it begs the question, **"How do I choose the best technology stack for my projects?"**. 

We share our process and analysis to determine the best technology stack that complies with precise standards. By the end of the article, you may also learn to choose the best technology stack for your needs.

## Background

In recent years, we have seen massive growth in modern web technologies, such as React, Angular, Vue, Svelte, Django, TypeScript, and many more. Each technology has its benefits. However, having so many choices can be confusing when you must determine which technologies are best for your projects. To narrow down the choices, a few aspects, such as scalability, stability, and usage in the market, must be considered.

That's the problem that we used to face. Most of our legacy services were not standardised and were written in different languages like PHP, React, and Vue. Also, the documentation for these legacy services is not well-structured or regularly updated.

<div class="post-image-section"><figure>
  <img src="/img/determining-tech-stack/image1.png" alt="" style="width:60%"><figcaption align="middle">Current technology stack usage in OVO</figcaption>
  </figure>
</div>


We realised that we had **two** main problems:

*   **Various technology stacks** (PHP, Vue, React, Nuxt, and Go) maintained simultaneously, with incomplete documentation, may consume a lot of time to understand the code, especially for engineers unfamiliar with the frameworks or even a new hire.
*   **Context switching** when reviewing code makes it hard to review other teammates' merge requests on complex projects and quickly offer better code suggestions.

To prevent these problems from recurring, teams must use **one primary technology stack**.

After detailed comparisons, we narrowed our choices to **two** options – React and Vue – because we have developed projects in both technologies and already have the user interface (UI) library in each technology stack.

<div class="post-image-section"><figure>
  <img src="/img/determining-tech-stack/image4.png" alt="" style="width:60%"><figcaption align="middle">Taken from <a href="https://www.ulam.io/blog/react-vs-vue-framework-comparison">ulam.io</a></figcaption>
  </figure>
</div>

Next, we conducted a more detailed research and exploration for each technology. The main goals were to find the unique features, scalability, ease of migration, and compatibility for the UI library for React and Vue. To test the compatibility of each UI library, we also used a sample UI on one of our upcoming projects and sliced it.

Here’s a quick summary of our exploration:

<table border="1">
<tr>
  <th style="padding: 20px">Metrics</th>
  <th style="padding: 20px">Vue</th>
  <th style="padding: 20px">React</th>
</tr>
<tr>
  <td style="padding: 20px">UI Library Compatibility</td>
  <td style="padding: 20px">Doesn’t require much component development</td>
  <td style="padding: 20px">Doesn’t require much component development</td>
</tr>
<tr>
  <td style="padding: 20px">Scalability</td>
  <td style="padding: 20px">Easier to upgrade, slower in releasing major updates, clear migration guide</td>
  <td style="padding: 20px">Quicker release of major versions, supports gradual updates</td>
</tr>
<tr>
  <td style="padding: 20px">Others</td>
  <td style="padding: 20px">Composition API, strong community (<a href="https://vue-community.org/">Vue Community</a>)</td>
  <td style="padding: 20px">Latest version (v18) of React gradual updates, doesn’t support IE</td>
</tr>
</table>

<br>
From this table, we found that the differences between these frameworks are miniscule, making it tough for us to determine which to use. Ultimately, we decided to step back and see the **Big Why**. 

## Solution

The Big Why here was “Why do we need to standardise our technology stack?”. We wanted to ease the onboarding process for new hires and reduce the complexity, like context switching, during code reviews, which ultimately saves time.

As Kleppmann (2017) states, *“The majority of the cost of software is in its ongoing maintenance”*. In this case, the biggest cost was time. Increasing the ease of maintenance would reduce the cost, so we decided to use maintainability as our north star metric.

Kleppmann (2017) also highlighted **three design principles** in any software system:

*   *Operability*: Make it easy to keep the system running.
*   *Simplicity*: Easy for new engineers to understand the system by minimising complexity.
*   *Evolvability*: Make it easy for engineers to make changes to the system in the future.

Keeping these design principles in mind, we defined **three metrics** that our selected tech stack must achieve:

* *Scalability*
  * Keeping software and platforms up to date
  * Anticipating possible future problems
* *Stability of the library and documentation*
  * Establishing good practices and tools for development
* *Usage in the market*
  * The popularity of the library or framework and variety of coding best practices

<br>
  <table border="1">
  <tr>
    <th style="padding: 20px">Metrics</th>
    <th style="padding: 20px">Vue</th>
    <th style="padding: 20px">React</th>
  </tr>
  <tr>
    <td style="padding: 10px">Scalability</td>
    <td style="padding: 10px"><strong>Framework</strong><br><br><strong>Operability</strong><br>Easier to update because there aren’t many approaches to writing Vue.<br><br><strong>Evolvability</strong><br>Since Vue is a framework, it needs fewer steps to upgrade.</td>
    <td style="padding: 10px"><strong>Library</strong><br>Supports gradual updates but there will be many different approaches when upgrading React on our services.</td>
  </tr>
  <tr>
    <td style="padding: 10px">Stability of the library and documentation</td>
    <td style="padding: 10px">Has standardised documentation</td>
    <td style="padding: 10px">Has many versions of documentation</td>
  </tr>
  <tr>
    <td style="padding: 10px">Usage on Market</td>
    <td style="padding: 10px">Smaller market share.<br><br><strong>Simplicity</strong><br>We can reduce complexity for new hires, as the Vue standard in OVO remains consistent with standards in other companies.</td>
    <td style="padding: 10px">Larger <a href="https://www.statista.com/statistics/1124699/worldwide-developer-survey-most-used-frameworks-web/">market share</a>.<br><br>    Many React variants are currently in the market, so different companies may have different folder structures/conventions.</td>
  </tr>
  </table>

<div class="post-image-section"><figure>
  <img src="/img/determining-tech-stack/image3.png" alt="" style="width:80%"><figcaption align="middle">Screenshot taken from <a href="https://www.statista.com/">https://www.statista.com/</a> on 2022-10-13</figcaption>
  </figure>
</div>


After conducting a detailed comparison between Vue and React, we decided to use Vue as our primary tech stack as it best aligns with Kleppmann’s three design principles and our north star metric of maintainability. Even though we noticed a few disadvantages to using Vue, such as smaller market share, we found that Vue is still the better option as it complies with all our metrics.

Moving forward, we will only use one tech stack across our projects but we decided not to migrate technology for existing projects. This allows us to continue **exploring** and **learning** about other technologies’ developments. One of the things we need to do is ensure that our current projects are kept up-to-date.

### Implementation

After deciding on the primary technology stack, we had to do the following:

*   Define a boilerplate for future Vue projects, which will include items like a **general library or dependencies**, **implementation for unit testing**, and **folder structure**, to align with our north star metric.
*   Update our existing **UI library** with new components and the latest Vue version.
*   Perform periodic upgrades to existing React services and create a standardised code structure with proper documentation.

With these practices in place, we can ensure that future projects will be standardised, making them easier for engineers to maintain.

### Impact

There are a few key benefits of standardising our technology stack.

*   **Scalability and maintainability**: It’s much easier to scale and maintain projects using the same technology stack. For example, when implementing security patches on all projects due to certain vulnerabilities in the system or libraries, we will need one patch for each technology. With only one stack, we only need to implement one patch across all projects, saving a lot of time.
*   **Faster onboarding process**: The onboarding process is simplified for new hires because we have standardisation between all services, which will minimise the amount of context switching and lower the learning curve.
*   **Faster deliveries**: When it’s easier to implement a change, there’s a compounding impact where the delivery process is shortened and release to production is quicker. Ultimately, faster deliveries of a new product or feature will help increase revenue.

## Learnings/Conclusion

<div class="post-image-section"><figure>
  <img src="/img/determining-tech-stack/image2.jpg" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

For every big decision, it is important to take a step back and understand the Big Why or the main motivation behind it, in order to remain objective. That’s why after we identified maintainability as our north star metric, it was easier to narrow down the choices and make detailed comparisons.

The north star metric, or deciding factor, might differ vastly, but it depends on the problems you are trying to solve.

## References

* Kleppmann, M. (2017). Designing Data-Intensive Applications. Beijing: O'Reilly. ISBN: 978-1-4493-7332-0
* [Most used web frameworks 2022 - Statista](https://www.statista.com/statistics/1124699/worldwide-developer-survey-most-used-frameworks-web/)

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
