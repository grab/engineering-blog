---
layout: post
id: 2024-11-22-how-we-reduced-grabx-sdk-initialisation-time
title: 'How we reduced initialisation time of Product Configuration Management SDK'
date: 2024-11-22 00:00:01
authors: [ram-pradhan, inderpreet-singh, yonghao-hu, padarn-wilson]
categories: [Engineering]
tags: [Engineering, Optimisation, Service]
comments: true
cover_photo: /img/how-we-reduced-grabx-sdk-initialisation-time/cover.png
excerpt: "Discover how we revolutionised our product configuration management SDK, reducing initialisation time by up to 90%. Learn about the challenges we faced with cold starts and the phased approach we took to optimise the SDK's performance."
---

## Introduction

GrabX serves as Grab's central platform for product configuration management. GrabX client services read product configurations through an SDK. This SDK reads the configurations in a way that's eventually consistent, meaning it takes about a minute for any configuration updates to reach the client SDKs.

However, some GrabX SDK clients, particularly those that need to read larger configuration data (\~400 MB), reported that the SDK takes an extended amount of time to initialise, approximately four minutes. This blog post details how we analysed and addressed this issue.

## SDK Observations

GrabX clients have observed that the GrabX SDK requires several minutes to initialise. This results in what is known as 'cold starts', where the SDK takes an extended time to begin supporting the reading of configurations at startup. This challenge highlights the importance of efficient SDK start-up management, especially when a service handling a high volume of incoming traffic initiates new SDK instances to manage the load better. However, due to the extended SDK initialisation time, these instances continue to experience stress, potentially leading to service throttling.

## SDK Initialisation Workflow

The SDK initialisation flow described below is based on the improvements we proposed to the SDK design in [our previous post](reduced-memory-cpu-usage-grabx-sdk/). In that post, we suggested enhancing the SDK design by:  

A. Implementing service-based data partitioning and storage in the AWS S3 bucket
B. Allowing service-based subscription of data for the SDK

The following diagram provides a high-level overview of the initialisation process of the GrabX SDK, which can be divided into the following sequential steps:

1. Set options that drive the behaviour of the SDK.
2. Initialise dependent module clients.
3. Initialise the GrabX client. (Highlighted as A in the diagram below)  
4. Download data for the SDK's subscribed list of services from the AWS S3 bucket and store this data on the SDK instance disk. (Highlighted as B in the diagram below)  
5. Download common data needed by the SDK from the AWS S3 bucket and store this data on the SDK instance disk. This data is referred to as 'common' because it is required by all different client services.  (Highlighted as C in the diagram below)  
6. Download data for the SDK's subscribed list of services from the AWS S3 bucket and load this data into the SDK instance memory.  (Highlighted as D in the diagram below)  
7. Download common data needed by the SDK from the AWS S3 bucket and load this data into the SDK instance memory. (Highlighted as E in the diagram below)  
8. Initialise dependent modules for resolving the configuration value.  (Highlighted as F in the diagram below)

<div class="post-image-section"><figure>
  <img src="/img/how-we-reduced-grabx-sdk-initialisation-time/image1.png" alt="" style="width:50%">
  </figure>
</div>

## Proposed Solution  

In order to address the issue of extended SDK initialisation time, we have decided to enhance the SDK initialisation design in multiple phases. Each phase focused on improving a specific part of the workflow.

### Improvement Phase 1

As discussed in the previous section, the GrabX SDK needs to load two separate sets of data: the subscribed services data and the common data. These two data sets are currently downloaded from the AWS S3 bucket and sequentially loaded into disk and memory.

In the first phase of our improvement plan, we decided to change the sequential data load to a concurrent data load for these two data sets, as illustrated in the following diagram. This alteration in the SDK initialisation workflow reduced the initialisation time by approximately 80%.

<div class="post-image-section"><figure>
  <img src="/img/how-we-reduced-grabx-sdk-initialisation-time/image2.png" alt="" style="width:80%">
  </figure>
</div>

### Improvement Phase 2

Building on the progress made in Phase 1, we next turned our attention to the issue of large configuration file sizes. As mentioned in the introduction, the extended SDK initialisation time was particularly noticeable for client services that needed to load larger amounts of data.

In this phase, we decided to implement an SDK design change that allows the SDK to **concurrently** download data from the AWS S3 bucket and load it into memory for all these large configurations within a subscribed service, as illustrated in the following diagram. This modification to the SDK initialisation workflow further reduced the initialisation time by approximately **6%**.

<div class="post-image-section"><figure>
  <img src="/img/how-we-reduced-grabx-sdk-initialisation-time/image4.png" alt="" style="width:80%">
  </figure>
</div>

### Improvement Phase 3

Upon examining the SDK's behaviour, we observed that the SDK is both persisting configuration data downloaded from the AWS S3 bucket to disk and loading the data into memory. We understand that the data is loaded into memory to reduce the latency of configuration reads. The data is stored on disk to support a fallback mechanism, which is activated in a very specific use case: when the client SDK instance restarts and there is a connectivity issue with AWS S3 for downloading configuration files. In this scenario, the SDK will read the configuration data stored on disk. However, this data could be outdated as it is not freshly downloaded from the AWS S3 bucket, and most client services require the most recent data.

Therefore, we realised that the fallback mechanism, for which data is persisted on disk, actually conflicts with the desired SDK behaviour for most client services. As a result, we decided to eliminate the SDK initialisation step that downloads configuration data from AWS S3 and persists it on disk. If the SDK initialisation fails to connect to the AWS S3 bucket and download data, client services can then take the necessary action, such as retrying initialisation. This modification further reduced the initialisation time by approximately 50% compared to the improvement achieved in Phase 2.

<div class="post-image-section"><figure>
  <img src="/img/how-we-reduced-grabx-sdk-initialisation-time/image3.png" alt="" style="width:80%">
  </figure>
</div>

## Conclusion

We benchmarked the proposed solution with a variety of services, each having different configuration data sizes. Our findings suggest that the proposed solution has the potential to reduce initialisation time by up to **90%**.

The following chart illustrates the phase-wise reduction in initialisation time achieved through the improvements made to the GrabX SDK.

<div class="post-image-section"><figure>
  <img src="/img/how-we-reduced-grabx-sdk-initialisation-time/image5.png" alt="" style="width:70%">
  </figure>
</div>

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!