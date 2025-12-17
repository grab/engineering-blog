---
layout: post
id: 2025-12-19-cdp-scenarios
title: 'How Grab is accelerating growth with real-time personalization using Customer Data Platform scenarios'
date: 2025-12-22 00:23:00
authors: [saubhagya-awaneesh, shanmugam-shanthi, shubham-badkur, tom-lam, srivatsa-srivatsa]
categories: [Engineering]
tags: [Database, FLinkSQL]
comments: true
cover_photo: /img/cdp-scenario/banner-1.png
excerpt: "Grab’s Customer Data Platform (CDP) introduces Scenarios, enabling real-time personalization at scale. By leveraging event triggers, geo-fencing, historical data, and predictive models, Grab delivers dynamic user experiences like mall offers, traveler recommendations, and ad retargeting. Proven results include more than a 3% uplift in conversions, driving growth across Southeast Asia."
---

## Introduction

Delivering personalized user experiences in real-time is central to Grab’s strategy, but achieving this at scale poses significant engineering challenges. Grab’s Customer Data Platform (CDP) and Growth team has successfully delivered several real-time campaigns, driving significant business impact through enhanced personalization. These initiatives include high-impact use cases like immediate mall offers, timely traveler recommendations, precise ad retargeting, and proactive interventions during key user journey moments. At the core of these successes is Grab’s CDP, which rapidly deploys advanced real-time personalization via a powerful new capability called "Scenarios."

## About Grab’s CDP

Grab’s CDP is a centralized, reliable repository for user attributes, designed for freshness, governance, and reusability. Built on [Grab's Signal Marketplace](https://engineering.grab.com/signals-market-place) framework, the CDP streamlines data management through automation and integration, supporting seamless interactions with internal services and toolings that power marketing, experimentation, ads, Machine Learning (ML) features, and external platforms, including Facebook, Google Ads, and TikTok.

The platform currently manages over 1,000 batch user attributes for Passengers, Drivers, and Merchants, powering diverse use cases from targeted marketing campaigns to operational decision-making across Grab’s entire ecosystem.

## The need for real-time personalization

In our current CDP setup, user segments are primarily created for targeting using batch attributes that update once daily. While these batch updates provide valuable historical insights, they are not suitable for Scenarios requiring real-time responsiveness. This delay prevents timely engagement with users, particularly when immediate actions can significantly enhance user experiences and conversion rates.

For example, when travelers land at an airport, they immediately benefit from timely suggestions for rides, dining options, or local attractions. Traditional batch processing cannot deliver the agility and responsiveness required for these dynamic Scenarios.

Historically, real-time personalization at Grab relied heavily on engineering resources, which resulted in limited scalability and agility. Marketers and product teams often found themselves blocked by engineering bandwidth constraints, restricting experimentation and innovation.

## Problem statement

The limitations of Grab’s existing personalization frameworks include:

* **Batch attribute delays**: Daily updates are insufficient for scenarios requiring immediate user responses.

* **Limited dynamic enrichment**: Difficulties in dynamically integrating real-time events with historical user data, weakens personalization effectiveness.

* **High engineering overhead**: Custom solutions require extensive resources, limiting agility and innovation.

To overcome these challenges and support Grab’s vision for comprehensive personalization – including proactive recommendations and assistance – CDP needed robust real-time capabilities.

## CDP Scenarios: Real-time personalization made simple

The **Scenario** feature revolutionizes real-time targeting within the CDP by utilizing user-initiated events, geo-fencing, historical profile data, and on-the-fly predictions. This empowers the business to deliver easy, quick, and flexible personalization without the need for complex engineering efforts.

Scenarios enable innovative use cases such as these:

* **Mall personalization**: Real-time personalized offers upon arrival.
* **Traveler assistance**: Immediate recommendations at airports or hotels.
* **Ad retargeting**: Enhanced real-time ad targeting.
* **Conversion optimization**: Timely intervention during user drop-off points.

Imagine predicting a user's intent to drop off at a mall using both real-time and historical context. For instance, when a user books a ride to a mall, factors such as destination, time, cuisine preferences, and past behavior (e.g., affluence level) can help predict whether the user’s purpose is retail therapy, grocery shopping, or dining out. This prediction accounts for elements like time of day, day of the week, and mall location. Grab's engineering teams can leverage this predicted intent (signal) to offer personalized actions, such as GrabPay discounts for shopping or exclusive dining offers for dinner.

<div class="post-image-section"><figure>
  <img src="/img/cdp-scenario/figure-1.png" alt="" style="width:80%"><figcaption align="middle">Figure 1. Scenario in CDP.</figcaption>
  </figure>
</div>

### Key features

* **Event-driven personalization**: Real-time Scenarios triggered by Scribe events (Grab’s comprehensive event collection and tracking platform) combined with geo-fencing.  
* **Historical context integration**: Optionally enrich Scenarios using historical CDP data.  
* **Predictive modeling**: Deploy pre-trained models for instant user behavior predictions.  
* **Self-serve GUI**: Enable marketers to create complex event sequences and validate Scenarios with synthetic data processed through Flink pipelines.  
* **Headless APIs**: Allow programmatic access and management of Scenarios.

<div class="post-image-section"><figure>
  <img src="/img/cdp-scenario/figure-2.jpg" alt="" style="width:80%"><figcaption align="middle">Figure 2. Attributes for a Scenario in CDP.</figcaption>
  </figure>
</div>

### Self-serve Scenario creation

We designed an intuitive self-serve UI, embedded within the Grab app, empowering marketers to quickly define and deploy Scenarios. Users can specify event triggers, configure geo-fencing, incorporate historical user attributes, and select predictive models. Marketers can also validate Scenarios using synthetic data before deployment, ensuring accurate and realistic outcomes.  

<div class="post-image-section"><figure>
  <img src="/img/cdp-scenario/figure-3.gif" alt="" style="width:80%"><figcaption align="middle">Figure 3. CDP Scenario Setup via Web Portal.</figcaption>
  </figure>
</div>

How it works:

1. **Select event triggers**: Choose predefined events or define custom intra-session sequences via the GUI.  
2. **Configure geo-fencing**: Define Scenario activation locations, like airports or malls.  
3. **Include historical attributes (optional)**: Utilize batch attributes from the CDP to enrich Scenarios.  
4. **Select predictive models (optional)**: Train custom classifiers or pick from pre-trained Catwalk models.  
5. **Define data sink**: Choose between Amphawa (DDB), Kafka, or both; potentially extendable to external destinations (e.g., Appsflyer).  
6. Once configured, metadata synchronizes automatically with our streaming service, and Scenarios become available for real-time consumption within an hour.

## Proven impact: Real-world success


CDP Scenarios are already delivering measurable business results, with over 12 live production implementations. For instance, in a case study addressing Grab Unlimited subscription signup abandonment, we leveraged CDP Scenarios to increase signups by engaging users in real time within 15 minutes of them leaving the signup process.

<div class="post-image-section"><figure>
  <img src="/img/cdp-scenario/figure-4.png" alt="" style="width:80%"><figcaption align="middle">Figure 4. Grab Unlimited sign-up journey.</figcaption>
  </figure>
</div>

To enhance conversion rates, personalized real-time nudges were deployed through Scenarios. For example, users who started the signup process but failed to complete it within 15 minutes received a follow-up notification, prompting them to finalize their registration.

<div class="post-image-section"><figure>
  <img src="/img/cdp-scenario/figure-5.png" alt="" style="width:80%"><figcaption align="middle">Figure 5. Scenario flow for Grab Unlimited registration.</figcaption>
  </figure>
</div>

This scenario alone achieved more than a 3% uplift in subscriber conversions vs non-real-time acquisition campaigns, demonstrating Scenarios' potential to significantly boost business outcomes.

## Technical architecture: Low latency, high reliability

<div class="post-image-section"><figure>
  <img src="/img/cdp-scenario/figure-6.jpg" alt="" style="width:80%"><figcaption align="middle">Figure 6. High-level Scenario flow. Scenarios are designed for low latency (under 15 seconds) and high reliability.</figcaption>
  </figure>
</div>

1. **Event registration**: Popular UI events from Scribe are whitelisted and immediately available; custom events are onboarded via the CDP web portal.  
2. **Scenario creation**: Users configure Scenarios through a user-friendly GUI, defining events, historical contexts, and predictive models.  
3. **Real-time Flink processing**: Incoming events trigger Scenarios, evaluating user historical data via StarRocks and performing real-time predictions using pre-trained models.  
4. **Real-time data sync**: Outcomes are synced back to Kafka or Amphawa (Grab's internal feature store built on AWS DynamoDB), enriching data for use by subsequent services.  
5. **Consumption by downstream services**: Kafka streams or CDP's Profile SDK facilitates immediate, personalized user experiences.

## Advancing the future of real-time personalization

As we continue to innovate, we are focused on enhancing the capabilities of CDP Scenarios to support more complex and scalable personalization use cases. Here are some key areas of improvement we are exploring:

* **Optimized Scenario sharding for scalable processing**: To accommodate the growing number of use cases, we plan to scale and orchestrate our Flink pipeline fleet in a headless manner. This approach will improve system stability and enable seamless management of complex Scenarios across the pipeline.

* **Enhanced signal distribution across multiple destinations**: Currently, Scenario outputs are limited to a single topic or sink. To address the increasing diversity of use cases, we aim to expand signal distribution, allowing downstream consumers to access Scenario outcomes through multiple scalable and reliable channels.

* **Advanced scheduling and delayed triggering**: While real-time computation of Scenario signals is effective, certain use cases require delayed activation for maximum impact. We are exploring ways to compute signals instantly but trigger actions at scheduled times, such as sending a push notification for booking a return Grab ride based on the average wait time at the drop-off location.

## Conclusion: Revolutionizing real-time personalization

The launch of CDP Scenarios represents a significant milestone for Grab, paving the way for scalable, efficient, and user-friendly real-time personalization. Initial successes have demonstrated its immense potential, delivering notable improvements in user engagement and conversion rates. Looking ahead, we are committed to continuously advancing Scenarios by expanding its features, integrations, and applications to further elevate user experiences across the Grab ecosystem.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!

