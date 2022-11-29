---
layout: post
id: 2022-11-30-kartacam-powers-grabmaps
title: How KartaCam powers GrabMaps
date: 2022-11-28 01:08:40
authors: [shuangquan-hou, victor-liang, alex-ilisei, zhixin-yu, suwei-yang, an-tran, ameya-mannikar]
categories: [Engineering, Product, Design]
tags: [Engineering, GrabMaps, KartaCam, Maps, Edge AI]
comments: true
cover_photo: /img/kartacam-powers-grabmaps/cover.png
excerpt: "The foundation for making maps lies in imagery and ensuring that it is fresh, high quality and collected in an efficient yet low-cost manner. Read this to find out how the Geo team created KartaCam, how it addresses those concerns and its future enhancements."
---

## Introduction

The foundation for making any map is in imagery, but due to the complexity and dynamism of the real world, it is difficult for companies to collect high-quality, fresh images in an efficient yet low-cost manner. This is the case for Grab’s Geo team as well.

Traditional map-making methods rely on professional-grade cameras that provide high resolution images to collect mapping imagery. These images are rich in content and detail, providing a good snapshot of the real world. However, we see two major challenges with this approach.

The first is high cost. Professional cameras are too expensive to use at scale, especially in an emerging region like Southeast Asia. Apart from high equipment cost, operational cost is also high as local operation teams need professional training before collecting imagery.

The other major challenge, related to the first, is that imagery will not be refreshed in a timely manner because of the high cost and operational effort required. It typically takes months or years before imagery is refreshed, which means maps get outdated easily.

Compared to traditional collection methods, there are more affordable alternatives that some emerging map providers are using, such as crowdsourced collection done with smartphones or other consumer-grade action cameras. This allows more timely imagery refresh and at a much lower cost.

That said, there are several challenges with crowdsourcing imagery, such as:

*   Inconsistent quality in collected images
*   Low operational efficiency as cameras and smartphones are not optimised for mapping
*   Unreliable location accuracy

In order to solve the challenges above, we started building our very own artificial intelligence (AI) camera called KartaCam.

## What is KartaCam?

Designed specifically for map-making, KartaCam is a lightweight camera that is everything you need for accurate and efficient image collection, and is easy to operate. KartaCam is powered by edge AI, and mainly comprises a camera module, a dual-band Global Navigation Satellite System (GNSS) module, and a built-in 4G Long-Term Evolution (LTE) module.

<div class="post-image-section"><figure>
  <img src="/img/kartacam-powers-grabmaps/image1.jpg" alt="" style="width:30%"><figcaption align="middle">KartaCam</figcaption>
  </figure>
</div>

### Camera module

The camera module/optical design of KartaCam focuses on several key features:

*   **Wide field of vision (FOV)**: A wide FOV to capture as many scenes and details as possible without requiring additional trips. KartaCam has a wide lens FOV of >150° and when we use four KartaCams together, this covers 360°.
*   **High image quality**: A combination of high definition optical lens and a high resolution pixel image sensor can help to achieve better image quality. KartaCam uses a high-quality 12MP image sensor.
*   **Ease of use**: Portable and easy to start using for people with little to no photography training. At Grab, we could easily deploy KartaCam to our fleet of driver-partners to map our region better as they regularly travel these roads and streets while ferrying passengers or making deliveries.

### Edge AI for smart capturing on edge

Each KartaCam device is also equipped with [edge AI](https://blogs.nvidia.com/blog/2022/02/17/what-is-edge-ai/), which will enable AI computations to operate closer to the actual data – in our case, imagery collection. With edge AI, we can make decisions about imagery collection (i.e. upload, delete or recapture) at the device-level.

To help with these decisions, we use a series of edge AI models/algorithms that are executed immediately after each image capture such as:

(A) Scene recognition AI model

(B) Image quality (IQ) checking AI model

(C) Object detection AI model

(D) Privacy information detection

<div class="post-image-section"><figure>
  <img src="/img/kartacam-powers-grabmaps/image7.png" alt="" style="width:80%">
  </figure>
</div>

**(A) Scene recognition model**: For efficient map-making, we ensure that we only upload and process the right scene images, also known as screen verdicts. Unqualified images such as indoor, raining and cloudy images are deleted directly on the KartaCam device. Joint detection algorithms are deployed in some instances to improve the accuracy of scene verdicts. For example, to detect indoor recording we look at a combination of driver moving speed, Inertial Measurement Units (IMU) data and edge AI image detection.

**(B) IQ checking AI model**: The quality of the images collected is paramount for map-making. Only qualified images judged by our IQ classification algorithm will be uploaded while those that are blurry or considered low-quality will be deleted. Once an unqualified image is detected (usually within the next second), a new image is captured, improving the success rate of collection.

**(C) Object detection AI model**: Only roadside images that contain relevant map-making content such as traffic signs, lights and POI text are uploaded.

**(D) Privacy information detection**: Edge AI also helps protect privacy when collecting street images for map-making. It automatically blurs privacy information such as pedestrians’ faces and car plate numbers before uploading, ensuring adequate privacy protection.

### Better positioning with a dual-band GNSS module

The Global Positioning System (GPS) mainly uses two frequency bands: L1 and L5. Most traditional phone or GPS modules only support the legacy GPS L1 band, while modern GPS modules support both L1 and L5. KartaCam leverages the L5 band which provides improved signal structure, transmission capabilities and a wider bandwidth that can reduce multipath error, interference and noise impacts. In addition, KartaCam uses a fine tuned high-quality ceramic antenna that, together with the dual frequency band GPS module, greatly improves positioning accuracy.

### Keeping KartaCam connected

KartaCam has a built-in 4G LTE module that ensures it is always connected and can be remotely managed. The KartaCam management portal can monitor camera settings like resolution and capturing intervals, even in edge AI machine learning models. This makes it easy for Grab’s map ops team and drivers to configure their cameras and upload captured images in a timely manner.

## Enhancing KartaCam

### KartaCam 360: Capturing a panorama view

To improve single collection trip efficiency, we group four KartaCams together to collect 360° images. The four cameras can be synchronised within milliseconds, and the collected images are stitched together in a panoramic view.

With KartaCam 360, we can increase the number of images collected in a single trip. According to Grab’s benchmark testing in Singapore and Jakarta, the POI information collected by KartaCam 360 is comparable to that of professional cameras, which cost about 20x more.

<div align="middle">
<img src="/img/kartacam-powers-grabmaps/image3.png" alt="" style="width:30%"><img src="/img/kartacam-powers-grabmaps/image2.jpg" alt="" style="width:30%">
</div>
<div class="post-image-section"><figure>
  <figcaption align="middle">KartaCam 360 & Scooter mount</figcaption>
  </figure>
</div>


<div class="post-image-section"><figure>
  <img src="/img/kartacam-powers-grabmaps/image8.png" alt="" style="width:80%"><figcaption align="middle">Image sample from KartaCam 360</figcaption>
  </figure>
</div>

## KartaCam and the image collection workflow

KartaCam, together with other GrabMaps imagery tools, provides a highly efficient, end-to-end, low-cost and edge AI-powered smart solution to map the region. KartaCam is fully integrated as part of our map-making workflow.

Our map-making solution includes the following components:

*   Collection management tool - Platform that defines map collection tasks for our driver-partners.
*   KartaView application - Mobile application provides map collection tasks and handles crowdsourced imagery collection.
*   KartaCam - Camera device connected to KartaView via Bluetooth and equipped with edge automatic processing for imagery capturing according to the task accepted.
*   Camera management tool - Handles camera parameters and settings for all KartaCam devices and can remotely control the KartaCam.
*   Automatic processing - Collected images are processed for quality check, stitching and personal identification information (PII) blurring.
*   KartaView imagery platform - Processed images are then uploaded and the driver-partner receives payment.

<div class="post-image-section"><figure>
  <img src="/img/kartacam-powers-grabmaps/image4.jpg" alt="" style="width:80%">
  </figure>
</div>

In a future article, we will dive deeper into the technology behind KartaView and its role in GrabMaps.

## Impact

At the moment, Grab is rolling out thousands of KartaCam in all Grab operating locations across Southeast Asia. This saved operational costs while improving the efficiency and quality of our data collection.


<div class="post-image-section"><figure>
  <img src="/img/kartacam-powers-grabmaps/image10.png" alt="" style="width:60%">
  </figure>
</div>


### Better data quality and more map attributes

Due to the excellent image quality, wide FOV coverage, accurate GPS positioning and sensor data, the 360° images captured by KartaCam 360 also register detailed map attributes like POIs, traffic signs and address plates. This will help us build a high quality map with rich and accurate content.


<div class="post-image-section"><figure>
  <img src="/img/kartacam-powers-grabmaps/image6.png" alt="" style="width:80%">
  </figure>
</div>

### Reducing operational costs

Based on our research, the hardware cost for KartaCam 360 is significantly lower compared to similar professional cameras in the market, making it more feasible to scale up in Southeast Asia as the preferred tool for crowdsourcing imagery collection.

With image review (quality checks) and detection are conducted at the edge, we can avoid re-collections and also ensure that only qualified images are uploaded. These result in saving time as well as operational and upload costs.

### Upholding privacy standards

KartaCam automatically blurs captured images that contain PII, like faces, licence plates directly from the edge devices. This means that all sensitive information is removed at this stage and is not uploaded to Grab servers.

<div align="middle">
<img src="/img/kartacam-powers-grabmaps/image9.png" alt="" style="width:40%"><img src="/img/kartacam-powers-grabmaps/image5.png" alt="" style="width:40%">
</div>
<div class="post-image-section"><figure>
  <figcaption align="middle">On-the-edge blurring example</figcaption>
  </figure>
</div>

## What’s next?

Moving forward, Grab will continue to enhance KartaCam’s performance and will focus on the following aspects with the next generation KartaCam:

*   To further improve image quality with better image sensors, unique optical components and state-of-art Image Signal Processor (ISP).
*   To be compatible with Light Detection And Ranging (LIDAR) for high-definition collection and indoor use cases.
*   Improve GNSS module performance with higher sampling frequency and accuracy, and integrate new technology like RTK/PPP solution to further improve the positioning accuracy. When combined with sensor fusion from IMU sensors, we can improve positioning accuracy for map-making further.
*   Improve usability, integration and enhance imagery collection and portability for KartaCam so driver-partners can easily capture mapping data. 
*   Explore new product concepts for future passive street imagery collection.

To find out more about how KartaCam delivers comprehensive cost-effective mapping data, check out [this article](https://www.grab.com/sg/enterprise-blog/kartacam-delivers-comprehensive-cost-effective-mapping-data/).

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!

# References

[^1]: T. Kipf and M. Welling, “Semi-supervised classification with graph convolutional networks,” in ICLR, 2017
[^2]: Schlichtkrull, Michael, et al. "Modeling relational data with graph convolutional networks." European semantic web conference. Springer, Cham, 2018.
[^3]: Wang, Chen, et al.. "Deep Fraud Detection on Non-attributed Graph." IEEE Big Data conference, PSBD, 2021.
[^4]: Fujiao Liu, Shuqi Wang, et al.. "[Graph Networks - 10X investigation with Graph Visualisations](https://engineering.grab.com/graph-visualisation)". Grab Tech Blog.
