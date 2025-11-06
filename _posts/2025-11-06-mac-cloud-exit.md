---
layout: post
id: 2025-11-06-mac-cloud-exit.md
title: "Grab's Mac Cloud Exit supercharges macOS CI/CD"
date: 2025-11-06 00:00:05
authors: [madushan-gamage, jacob-xu, tunyi-oh]
categories: [Engineering]
tags: [engineering, performance]
comments: true
cover_photo: /img/mac-cloud-exit/cover.png
excerpt: "Discover how our transition from cloud-based Mac hardware infrastructure to a colocation cluster within Southeast Asia has revolutionized our macOS CI/CD, enhancing performance and reducing costs."
---

## Introduction

In our mission to optimize continuous integration and delivery (CI/CD), we have taken a bold step by relocating our infrastructure from a cloud vendor in the US to a colocation cluster within Southeast Asia, closer to our Git server infrastructure. This change has dramatically improved the performance of our macOS builds, primarily by reducing the network traffic delays associated with distant data centers. By bringing our infrastructure closer to home, we have not only accelerated CI/CD job completion times but also massively slashed operational costs. 

Join us as we delve into the Mac Cloud Exit journey and the significant improvements it has brought to our workflows.

Our macOS CI/CD infrastructure has evolved from 1 Physical Mac Pro running in our office to a cluster of 250 Mac minis fully occupied during peak hours of the day. There were multiple stages in the journey to transition to the current state. The following diagram shows the focus area for this blog post. 

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image1.png" alt="" style="width:90%"><figcaption align="middle">Figure 1: Infrastructure transition path</figcaption>
  </figure>
</div>


### Before and after: Visualizing the evolution

We began our journey with a much simpler setup.

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image2.png" alt="" style="width:40%"><figcaption align="middle">Figure 2: Photo of the setup when we started</figcaption>
  </figure>
</div>

Today, that infrastructure has scaled significantly to meet the growing demands of Grab 

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image3.png" alt="" style="width:50%"><figcaption align="middle">Figure 3: Mac mini cluster today</figcaption>
  </figure>
</div>

## Economy at scale: The rent vs. own equation

At the beginning, it was a no-brainer to rent when our demand for macOS hardware increased from 1 MacPro to 20 times that size. However, when that grew to over 200 machines, the total cost became significant, prompting us to consider:

1. What is the desired reliability for this cluster?   
2. What would be the total cost of ownership for us to build this cluster ourselves compared to cloud-based options?   
3. What kind of operational leverage would it bring us by controlling end-to-end stack by ourselves? 

### What is Grab’s scale 

At Grab, our iOS build needs have scaled quite significantly, so we went from running some builds on a single Mac Pro to running them on an army of 250+ Mac minis. And so did the cost.

#### Active jobs trend 

The total number of jobs trend is one of the data points to understand the demand situation. The following chart is a snapshot from our demand curve in 2022. Peak demand often started to exceed the available supply, creating queues for the jobs.

We estimated we would need 200+ machines to comfortably supply for the peak demand and projected a demand for 400+ machines in 2025. 

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image4.png" alt="" style="width:70%"><figcaption align="middle">Figure 4: Active macOS CI/CD jobs</figcaption>
  </figure>
</div>

### What is our workload 

We have several iOS apps that share a common macOS compute cluster for their CI/CD workloads.   
This includes, but is not limited to:

* [Grab: Taxi Ride, Food Delivery](https://apps.apple.com/sg/app/grabmerchant/id1282271764) (Largest iOS code base with approximately 2.5M+ total lines of code)  
* [Grab Driver: App for Partners](https://apps.apple.com/sg/app/grabmerchant/id1282271764) (Second largest iOS code base with approximately 0.7M+ total lines of code)   
* [KartaLink](https://apps.apple.com/sg/app/kartalink/id6450411148)   
* [GrabMerchant](https://apps.apple.com/sg/app/grabmerchant/id1282271764)   
* [KartaView](https://apps.apple.com/sg/app/kartaview/id1089548849)   
* [OVO](https://apps.apple.com/us/app/ovo/id1142114207)  
* [Move It: Fast Moto Taxi Ride](https://apps.apple.com/ph/app/move-it-fast-moto-taxi-ride/id1481198245)  
* [Move It Driver App](https://apps.apple.com/ph/app/move-it-driver-app/id6446633186)  

The workload primarily involves:

* Building apps   
* Execution of tests 

## The Evaluation: Cloud vs colocation vs on-prem

We did a comprehensive comparison and total cost of ownership (TCO) estimation to compare many different options, including cloud vendors and colocation in different places. 

### Cost of macOS compute 

The expense of macOS compute is notably higher, particularly in continuous integration (CI) setups, posing challenges for optimal configuration. Several factors contribute to these increased costs:

* Apple's restrictive EULA mandates a minimum lease period of 24 hours for macOS instances, which alters the utilization equation.  
* Economies of scale are not favorable for available macOS hardware configurations compared to alternatives. Optimized server hardware designed for racking offers various configurations that reduce operational costs, unlike macOS options such as Mac Mini and Mac Pro.

For instance, although not a direct comparison, the [pricing for GitHub Actions build minutes](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions#per-minute-rates-for-standard-runners) shows macOS is ten times more costly than Linux. This reflects the pricing GitHub can offer after [implementing racking optimizations.](https://www.youtube.com/watch?v=I2J2MzKjcqY) 

Initially, we conducted rough estimations to assess the total cost of ownership differences between cloud, colocation, and on-premises setups. Even with conservative estimates for manpower and engineering costs, colocation or on-premises setups proved more cost-effective at our scale. This cost disparity became even more pronounced when focusing on cloud vendors providing macOS compute physically located in Southeast Asia.

We opted to conduct an in-depth evaluation of the following options:

* Establishing a macOS cluster at our headquarters in Singapore, which was swiftly dismissed due to scalability and cost concerns making it an unsuitable long-term solution.  
* Colocating in a Southeast Asian country where we have operational presence.

### Choice of location 

As a Southeast Asian company, we maintain offices in each country where we operate, some of which boast advanced data center infrastructures. We focused our location choices on Singapore and Malaysia, assessing them based on several criteria, including:

* The maturity of existing data center infrastructure.  
* The proximity of the data centers to our offices, ensuring staff availability for infrastructure setup.  
* The cost and reliability of power.  
* The proximity to our Git servers and the expense of establishing direct network connections.

Eventually we concluded to go ahead with a decision to colocate in a data center in Malaysia [which is one of the emerging data center powerhouses in the region](https://www.edgeconnex.com/news/edge-blog/southeast-asias-data-center-powerhouse-malaysia/) with relatively low energy cost compared to Singapore. 

### Choice of Mac hardware 

Our choice of hardware model for our build and test workload was guided by a cost-benefit analysis. We decided to use bare-metal setups without virtualization, simplifying migration processes, which may be revisited in the future. We ensured we neither over-specified nor under-specified the bare-metal hardware. We had a clear understanding of the resource consumption of our most demanding workload on a few reference models, as illustrated in the following graphs.

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image5.png" alt="" style="width:80%"><figcaption align="middle">Figure 5: User and System CPU usage during build operation of our largest iOS mobile codebase </figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image6.png" alt="" style="width:80%"><figcaption align="middle">Figure 6: Memory Usage during build operation of our largest iOS mobile codebase </figcaption>
  </figure>
</div>

### Virtualization vs bare-metal

Virtualization offers significant advantages in managing and provisioning clusters, including the flexibility to create ephemeral builds. However, our experience with macOS virtualization has been mixed. While off-the-shelf virtualization solutions provide maintenance benefits, they often come at the cost of performance or stability.

Key points:

* **Improved Utilization**: Virtualization can improve resource utilization by consolidating multiple workloads on fewer physical servers, thereby reducing the overall cost.  
* **Performance Penalty**: However, the performance penalty associated with virtualization can sometimes negate these cost benefits. This is particularly true for macOS virtualization, where we have observed trade-offs in performance or stability.  
* **Evolution of Virtualization**: The virtualization space has been evolving and making good progress. We may re-evaluate these solutions in the future as they continue to mature and potentially address current performance and stability issues.

Our conclusion was to stick to bare-metal for the time-being as the benefits didn’t justify the downside and cost.

## Execution 

### Progressive Migration 

Any disruption to the macOS CI/CD cluster would be hugely disruptive to the company given our scale highlighted above. So, we enabled new cluster partially for part of the workload for a reasonably long period of time and monitored and compared: 

* Job failure rate   
* Jobs performance   
* Reliability   

Once we were confident, we made the full switch and terminated vendor contracts at due. 

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image7.png" alt="" style="width:90%"><figcaption align="middle">Figure 7: Total active jobs trend</figcaption>
  </figure>
</div>

## Result  

The migration yielded better results overall than our initial conservative estimates. 

* Cost savings: Estimated over 2.4 million USD over three years
* Performance improvement: Between 20-40% depending on the use case
* Stability: No compromise 

A strategic investment in our mission to drive Southeast Asia forward by onshoring critical Mac infrastructure into the region. 

### Cost 

We anticipate a three-year replacement cycle for our hardware. While some equipment may be utilized beyond this period, it provides a reasonable lifespan for cost estimation purposes.

The lifecycle of networking equipment involves both physical reliability, following the bathtub curve, and technological obsolescence, often necessitating replacement every 3 to 5 years. Mac minis could become outdated after approximately three years, making the opportunity cost of extended use potentially higher than the net replacement cost after benefits.

Importantly, the experience gained during this cycle could significantly reduce the engineering costs associated with future replacements.

Overall, we project total cost of ownership savings of approximately 2.4 million USD over a three-year period compared to our last cloud-based setup rented from a vendor.

### Performance

We measured the performance gains in two of ou largest iOS apps at Grab: 

* [Grab: Taxi Ride, Food Delivery](https://apps.apple.com/sg/app/grab-taxi-ride-food-delivery/id647268330)  
* [Grab Driver: App for Partners](https://apps.apple.com/sg/app/grab-driver-app-for-partners/id1257641454) 

#### Overall gains

The following table summarizes the total time measured before and after the migration for total CI pipeline time and building the app codebase. Measurements are presented in 3 percentiles (p50, p75, p95)

| App/Metric |  | Time (Minutes) |  |  |
| ----- | :---- | ----- | ----: | ----: |
|  |  | **p50** | **p75** | **p95** |
| CI Pipeline Time Trend for Grab: Taxi Ride, Food Delivery | Before | 43 | 54 | 67 |
|  | After | 33 | 42 | 49 |
|  | **Gain** | **23.26%** | **22.22%** | **26.87%** |
| App build time Trend for Grab: Taxi Ride, Food Delivery | Before | 10.7 | 13.2 | 17.6 |
|  | After | 6.45 | 9 | 10.8 |
|  | **Gain** | **39.72%** | **31.82%** | **38.64%** |
| Pipeline time trend for Grab Driver: App for Partners| Before | 47 | 50 | 52 |
|  | After | 26 | 31 | 32 |
|  | **Gain** | **44.68%** | **38.00%** | **38.46%** |
| App build time trend for Grab Driver: App for Partners| Before | 10 | 13 | 14 |
|  | After | 6 | 8 | 8.5 |
|  | **Gain** | **40.00%** | **38.46%** | **39.29%** |

#### A different perspective: Trends 

The following trend illustrations show how the performance of various tasks has improved while we progressively migrated to the new colocation setup.  

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image8.png" alt="" style="width:90%"><figcaption align="middle">Figure 8: 14 day aggregate percentiles of p50, p75 and p95 for total CI pipeline times for the Taxi Ride, Food Delivery codebase</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image9.png" alt="" style="width:90%"><figcaption align="middle">Figure 9: Pipeline time pulse for the Taxi Ride, Food Delivery codebase</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/mac-cloud-exit/image10.png" alt="" style="width:90%"><figcaption align="middle">Figure 10: 14 day aggregate percentiles of p50, p75 and p95 for total CI pipeline times for the App for Partners codebase</figcaption>
  </figure>
</div>

### Stability 

We measured overall job failure rates between both clusters for extended periods as a guardrail metric and ensured the stability of the new cluster before shutting down the old one. 

## Colocation setup and rack configuration

The following table provides an overview of the layout of our new Mac mini cluster. 

| Component | Description | Redundancy  |
| :---- | :---- | :---- |
| Rack | We have got four 42RU (600x1200x42RU) racks housing 200+ Mac minis, plus some spare racks to house upcoming scheduled capacity upgrades.  | Racks have shared resources which have their own redundancy. Generally rack separation does provide some level of redundancy for total compute.  |
| Power | 2 power sources power the cluster. Each rack is powered by these 2 power sources.  It is 1U, 2-post rack mount.  | Losing 1 power source will reduce 50% of capacity.  |
| Mac Mini | We rack 2 Mac minis in a row on a mounting tray, typically racking 70 minis in one rack in total. Except for the first rack which requires extra rack units (RUs) for core switches and firewalls.  |  |
| KVM | KVM switches with adaptor for keyboard and mouse emulation when required. | N/A |
| Networking Setup | Networking consists of Core Switches, Access Switches, Firewalls, Internet and Direct Connect Links.  | Mostly active/active redundancy. |

## Provisioning and configuration 

### Zero-touch provisioning 

Zero-touch provisioning is a streamlined method for setting up and configuring devices with minimal manual intervention. This section outlines the process and benefits of zero-touch provisioning using Jamf for Mac minis.  

We have a setup that enables these machines to start accepting jobs once they are racked up and connected (Power and network cables). Here is how it works: 

#### MDM configuration and Automated Device Enrollment (ADE) 

ADE, previously known as Device Enrollment Program (DEP), is an Apple service that facilitates automatic enrollment. When a new Mac Mini is acquired and registered in the organization's ADE account, it is primed for automatic enrollment. Administrators create a PreStage enrollment configuration within Jamf Pro, encompassing account settings (e.g., creating a local admin account, hiding it in Users & Groups, skipping account creation for the user), configuration profiles (defining device settings, security policies, and restrictions), and enrollment packages (including necessary software and scripts).

#### Device setup: Activation and redirection 

Upon powering on and connecting to the internet, the Mac Mini communicates with Apple's activation servers. The activation servers identify the device as part of the organization's ADE and redirect it to the Jamf MDM server, ensuring automatic enrollment without user input.

#### Enrollment and configuration 

The Mac Mini enrolls into the Jamf MDM system automatically. Jamf applies predefined configuration profiles to set up the device's settings, installs required applications based on configured policies, and enforces security policies such as encryption and authentication settings to ensure compliance.

#### Key benefits of zero-touch provisioning

* **Efficiency**: Devices are ready to use right out of the box, reducing the time and effort required by IT staff.  
* **Consistency**: Ensures that all devices are configured uniformly according to organizational policies.  
* **Security**: Enforces security policies from the moment the device is first powered on, reducing vulnerabilities.  
* **Scalability**: Easily manage and configure a large number of devices without manual intervention.

## Learnings and insights

### Supply chain is as fast as the last essential component you need 

The efficiency of a supply chain hinges on the delivery of its final essential component. Despite being a fundamental principle, it's worth reiterating. Our timely launch was facilitated by a buffer period for unexpected delays. Interestingly, one of the last critical items to arrive was the rack mounting trays. The brief delay underscored the importance of prioritizing and planning for on-time delivery of every essential component, irrespective of its manufacturing simplicity.

### Consistently address the question: How will this scale?

From the outset, our goal was to develop a scalable infrastructure. As the cluster expands, tasks such as preparing Mac minis for job acceptance require increasing manual input, which ultimately impacts costs. Hence, zero-touch provisioning becomes essential, as scalability is not merely a desirable feature but a necessity. 

### Plan and opt in for a power cost structure best suite for your need 

#### Power cost structures

In a colocation setup power costs can be billed in several ways, each with pros and cons:

* **Flat Rate Per Circuit**: A fixed monthly fee, predictable but limits flexibility (e.g., can't exceed 80% without extra circuits).  
* **Allocated kW**: Commit to a fixed power amount (e.g., 100 kW), potentially cheaper but with penalties for overages.  
* **Metered Usage**: Pay for actual consumption (kWh), good for variable loads but may still charge for space.  
* **All-In Space & Power**: Single rate covering both, easy to compare but less flexible for upgrades.

We ultimately opted for an allocated kW commitment, a phased approach based on conservative equipment power ratings and historical usage. We structured this into phases of commitment increases for future capacity growth. 

## Conclusion

The Mac Cloud Exit wasn't just a technical migration; it was a strategic move that fundamentally enhanced our engineering efficiency. By onshoring our infrastructure into Southeast Asia, we have achieved $2.4 million USD in projected savings and supercharged our CI pipeline, delivering performance gains of 20-40%. This project proves that taking ownership of our core infrastructure can be a major competitive advantage, allowing us to deliver faster and more reliably for our users across the region.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grb.to/gebmodel) today!