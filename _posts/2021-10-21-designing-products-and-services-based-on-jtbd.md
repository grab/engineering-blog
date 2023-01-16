---
layout: post
id: 2021-10-21-designing-products-and-services-based-on-jtbd
title: Designing products and services based on Jobs to be Done
date: 2021-10-21 01:20:00
authors: [tim-lange, soon-hau-chua, sherizan-sheikh]
categories: [Design]
tags: [Design, Product, Database, User Research]
comments: true
cover_photo: /img/designing-products-and-services-based-on-jtbd/cover.png
excerpt: "In this post, we explain how the Jobs to be Done (JTBD) framework helps uncover the JTBD for consumers, as well as how we uncovered the core needs of GrabFood consumers and aligned the product with these needs."
---

## Introduction

In 2016, Clayton Christensen, a Harvard Business School professor, wrote a book called [Competing Against Luck](https://www.amazon.com/Competing-Against-Luck-Innovation-Customer/dp/0062435612). In his book, he talked about the kind of jobs that exist in our everyday life and how we can uncover hidden jobs through the act of non-consumption. Non-consumption is the inability for a consumer to fulfil an important Job to be Done (JTBD).

JTBD is a framework; it is a different way of looking at consumer goals and is based on the notion that people buy products and services to get a job done. In this article, we will walk through what the JTBD framework is, look at an example of a popular JTBD, and look at how we use the JTBD framework in one of Grab's services.

## JTBD framework

In his book, Clayton Christensen gives the example of the milkshake, as a JTBD example. In the mid-90s, a fast food chain was trying to understand how to improve the milkshakes they were selling and how they could sell more milkshakes. To sell more, they needed to improve the product. To understand the job of the milkshake, they interviewed their customers. They asked their customers why they were buying the milkshakes, and what progress the milkshake would help them make.

### Job 1: To fill their stomachs

One of the key insights was the first job, the customers wanted something that could fill their stomachs during their early morning commute to the office. Usually, these car drives would take one to two hours, so they needed something to keep them awake and to keep themselves full.

In this scenario, the competition could be a banana, but think about the properties of a banana. A banana could fill your stomach but your hands get dirty and sticky after peeling it. Bananas cannot do a good job here. Another competitor could be a Snickers bar, but it is rather unhealthy, and depending on how many bites you take, you could finish it in one minute.

By understanding the job the milkshake was performing, the restaurant now had a specific way of improving the product. The milkshake could be made milkier so it takes time to drink through a straw. The customer can then enjoy the milkshake throughout the journey; the milkshake is optimised for the job.

<div class="post-image-section"><figure>
  <img src="/img/designing-products-and-services-based-on-jtbd/milkshake.png" alt="Search data flow" style="width:60%"> <figcaption align="middle"><i>Milkshake</i></figcaption>
  </figure>
</div>

### Job 2: To make children happy

As part of the study, they also interviewed parents who came to buy milkshakes in the afternoon, around 3:00 PM. They found out that the parents were buying the milkshakes to make their children happy.

By knowing this, they were able to optimise the job by offering a smaller version of the milkshake which came in different flavours like strawberry and chocolate. From this milkshake example, we learn that *multiple jobs can exist for one product*. From that, we can make changes to a product to meet those different jobs.

## JTBD at GrabFood

A team at GrabFood wanted to prioritise which features or products to build, and performed a prioritisation exercise. However, there was a lack of fundamental understanding of why our consumers were using GrabFood or any other food delivery services. To gain deeper insights on this, we conducted a JTBD study.

We applied the JTBD framework in our research investigation. We used the force diagram framework to find out what job a consumer wanted to achieve and the corresponding push and pull factors driving the consumer's decision. A job here is defined as the progress that the consumer is trying to make in a particular context.

<div class="post-image-section"><figure>
  <img src="/img/designing-products-and-services-based-on-jtbd/force-diagram.png" alt="Search data flow" style="width:80%"> <figcaption align="middle"><i>Force diagram</i></figcaption>
  </figure>
</div>

There were four key points in the force diagram:

- What jobs are people using GrabFood for?
- What did people use prior to GrabFood to get the jobs done?
- What pushed them to seek a new solution? What is attractive about this new solution?
- What are the things that will make them go back to the old product? What are the anxieties of the new product?

By applying this framework, we progressively asked these questions in our interview sessions:

- *Can you remind us of the last time you used GrabFood?* — This was to uncover the situation or the circumstances.
- *Why did you order this food?* — This was to get down to the core of the need.
- *Can you tell us, before GrabFood, what did you use to get the same job done?*

From the interview sessions, we were able to uncover a number of JTBDs, one example was working parents buying food for their families. Before GrabFood, most of them were buying from food vendors directly, but that is a time consuming activity and it adds additional friction to an already busy day. This led them in search of a new solution and GrabFood provided that solution.

Let’s look at this JTBD in more depth. One anxiety that parents had when ordering GrabFood was the sheer number of choices they had to make in order to check out their order:

<div class="post-image-section"><figure>
  <img src="/img/designing-products-and-services-based-on-jtbd/force-diagram-example-1.png" alt="Search data flow" style="width:80%"> <figcaption align="middle"><i>Force diagram - inertia, anxiety</i></figcaption>
  </figure>
</div>

There was already a solution for this problem: bundles! Food bundles is a well-known concept from the food and beverage industry; items that complement each other are bundled together for a more efficient checkout experience.

<div class="post-image-section"><figure>
  <img src="/img/designing-products-and-services-based-on-jtbd/force-diagram-example-2.png" alt="Search data flow" style="width:80%"> <figcaption align="middle"><i>Force diagram - pull, push</i></figcaption>
  </figure>
</div>

However, not all GrabFood merchants created bundles to solve this problem for their consumers. This was an untapped opportunity for the merchants to solve a critical problem for their consumers. Eureka! We knew that we needed to help merchants create bundles in an efficient way to solve for the consumer’s JTBD.

We decided to add a functionality to the GrabMerchant app that allowed merchants to create bundles. We built an algorithm that matched complementary items and automatically suggested these bundles to merchants. The merchant only had to tap a button to create a bundle instantly.

<div class="post-image-section"><figure>
  <img src="/img/designing-products-and-services-based-on-jtbd/bundle.png" alt="Search data flow" style="width:80%"> <figcaption align="middle"><i>Bundle</i></figcaption>
  </figure>
</div>

The feature was released and thousands of restaurants started adding bundles to their menu. Our JTBD analysis proved to be correct: food and beverage entrepreneurs were now equipped with an essential tool to drive growth and we removed an obstacle for parents to choose GrabFood to solve for their JTBD.

## Conclusion

At Grab, we understand the importance of research. We educate designers and other non-researcher employees to conduct research studies. We also encourage the sharing of research findings, and we ensure that research insights are consumable. By using the JTBD framework and asking questions specifically to understand the job of our consumers and partners, we are able to gain fundamental understanding of why our consumers are using our products and services. This helps us improve our products and services, and optimise it for the jobs that need to be done throughout Southeast Asia.

This article was written based on an episode of the Grab Design Podcast - a conversation with Grab Lead Researcher Soon Hau Chua. Want to listen to the Grab Design Podcast? Join the team, we're [hiring](https://grab.careers/)!

---

<small class="credits">Special thanks to *Amira Khazali* and *Irene* from Tech Learning.</small>

---

## Join us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
