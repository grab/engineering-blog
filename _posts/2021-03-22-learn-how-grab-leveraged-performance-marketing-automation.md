---
layout: post
id: 2021-03-22-learn-how-grab-leveraged-performance-marketing-automation
title: How Grab Leveraged Performance Marketing Automation to Improve Conversion Rates by 30%
date: 2021-03-22 00:13:30
authors: [sc-ng, herman-khoo, audrey-jee]
categories: [Engineering]
tags: [Automation, Engineering, Marketing]
comments: true
cover_photo: /img/learn-how-grab-leveraged-performance-marketing-automation/cover.jpg
excerpt: "Read to find out how Grab's Performance Marketing team leveraged on automation to improve conversion rates."
---

Grab, Southeast Asia's leading superapp, is a hyperlocal three-sided marketplace that operates across hundreds of cities in Southeast Asia. Grab started out as a taxi hailing company back in 2012 and in less than a decade, the business has evolved tremendously and now offers a diverse range of services for consumers’ everyday needs.

To fuel our business growth in newer service offerings such as GrabFood, GrabMart and GrabExpress, user acquisition efforts play a pivotal role in ensuring we create a sustainable Grab ecosystem that balances the marketplace dynamics between our consumers, driver partners and merchant partners.

Part of our user growth strategy is centred around our efforts in running direct-response app campaigns to increase trials on our superapp offerings. Executing these campaigns brings about a set of unique challenges against the diverse cultural backdrop present in Southeast Asia, challenging the team to stay hyperlocal in our strategies while driving user volumes at scale. To address these unique challenges, Grab's performance marketing team is constantly seeking ways to leverage automation and innovate on our operations, improving our marketing efficiency and effectiveness.

## Managing Grab’s Ever-expanding Business, Geographical Coverage and New User Acquisition

Grab’s ever-expanding services, extensive geographical coverage and hyperlocal strategies result in an extremely dynamic, yet complex ad account structure. This also means that whenever there is a new business vertical launch or hyperlocal campaign, the team would spend valuable hours rolling out a large volume of new ads across our accounts in the region.

<div class="post-image-section"><figure>
  <img src="/img/learn-how-grab-leveraged-performance-marketing-automation/image1.jpg" alt="Sample Google Ads account structure"> <figcaption align="middle"><i>A sample of our Google Ads account structure.</i></figcaption>
</figure></div>

The granular structure of our Google Ads account provided us with flexibility to execute hyperlocal strategies, but this also resulted in thousands of ad groups that had to be individually maintained.

In 2019, Grab’s growth was simply outpacing our team’s resources and we finally hit a bottleneck. This challenged the team to take a step back and make the decision to pursue a fully automated solution built on the following principles for long term sustainability:

* __Building ad-tech solutions in-house instead of acquiring off-the-shelf solutions__

    Grab’s unique business model calls for several tailor-made features, none of which the existing ad tech solutions were able to provide.

* __Shifting our mindset to focus on the infinite game__

    In order to sustain the exponential volume in the ads we run, we had to seek the path of automation.

For our very first automation project, we decided to look into automating creative refresh and upload for our Google Ads account. With thousands of ad groups running multiple creatives each, this had become a growing problem for the team. Overtime, manually monitoring these creatives and refreshing them on a regular basis had become impossible.

## The Automation Fundamentals

Grab’s superapp nature means that any automation solution fundamentally needs to be robust:

* __Performance-driven__ - to maintain and improve conversion efficiency over time
* __Flexibility__ -  to fit needs across business verticals and hyperlocal execution
* __Inclusivity__ - to account for future service launches and marketing tech (e.g. product feeds and more)
* __Scalability__ - to account for future geography/campaign coverage

With these in mind, we incorporated them in our requirements for the custom creative automation tool we planned to build.

* __Performance-driven__ - while many advertising platforms, such as Google’s App Campaigns, have built-in algorithms to prevent low-performing creatives from being served, the fundamental bottleneck lies in the speed in which these low-performing creatives can be replaced with new assets to improve performance. Thus, solving this bottleneck would become the primary goal of our tool.

* __Flexibility__ - to accommodate our broad range of services, geographies and marketing objectives, a mapping logic would be required to make sure the right creatives are added into the right campaigns.

    To solve this, we relied on a standardised creative naming convention, using key attributes in the file name to map an asset to a specific campaign and ad group based on:

    - Market
    - City
    - Service type
    - Language
    - Creative theme
    - Asset type
    - Campaign optimisation goal


* __Inclusivity__ - to address coverage of future service offerings and interoperability with existing ad-tech vendors, we designed and built our tool conforming to many industry API and platform standards.

* __Scalability__ - to ensure full coverage of future geographies/campaigns, the in-house solution’s frontend and backend had to be robust enough to handle volume. Working hand in glove with Google, the solution was built by leveraging multiple APIs including Google Ads and Youtube to host and replace low-performing assets across our ad groups. The solution was then deployed on AWS’ serverless compute engine.

## Enter CARA

CARA is an automation tool that scans for any low-performing creatives and replaces them with new assets from our creative library:

<div class="post-image-section"><figure>
  <img src="/img/learn-how-grab-leveraged-performance-marketing-automation/image2.jpg" alt="CARA Workflow"><figcaption align="middle"><i>A sneak peek of how CARA works</i></figcaption>
</figure></div>

In a controlled experimental launch, we saw nearly __2,000__ underperforming assets automatically replaced across more than __8,000__ active ad groups, translating to an __18-30%__ increase in clickthrough and conversion rates.

<div class="post-image-section"><figure>
  <img src="/img/learn-how-grab-leveraged-performance-marketing-automation/image3.jpg" alt="Subset of results from CARA experimental launch"><figcaption align="middle"><i>A subset of results from CARA's experimental launch</i></figcaption>
</figure></div>

Through automation, Grab’s performance marketing team has been able to significantly improve clickthrough and conversion rates while saving valuable man-hours. We have also established a scalable foundation for future growth. The best part? We are just getting started.

----
<small class="credits">Authored on behalf of the performance marketing team @ Grab. Special thanks to the CRM data analytics team, particularly Milhad Miah and Vaibhav Vij for making this a reality.</small>

----
## Join Us

Grab is more than just the leading ride-hailing and food delivery platform in Southeast Asia. We use data and technology to improve everything from transportation to payments and financial services for a region of more than 650 million people. We aspire to unlock the true potential of Southeast Asia and are on the lookout for like-minded individuals to join us on this ride.

If you share our vision of driving South East Asia forward, apply to join our team today!
