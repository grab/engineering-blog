---
layout: post
id: 2020-02-20-grab-posisi
title: Grab-Posisi - Southeast Asia’s first comprehensive GPS trajectory dataset
date: 2020-02-20 18:43:40
authors: [zhengmin-xu, poornima-badrinath, xiaocheng-huang, abeesh-thomas]
categories: [Engineering]
tags: [gps, datasets, map]
comments: true
cover_photo: /img/grab-posisi/cover.png
excerpt: "This blog highlights Grab's latest GPS trajectory dataset - its content, format, applications, and how you can access the dataset for your research purpose."
---


# Introduction        

At Grab, thousands of bookings happen daily via the Grab app. The driver phones and GPS devices enable us to collect large-scale GPS trajectories.

Apart from the time and location of the object, GPS trajectories are also characterised by other parameters such as speed, the headed direction, the area and distance covered during its travel, and the travelled time. Thus, the trajectory patterns from users GPS data are a valuable source of information for a wide range of urban applications, such as solving transportation problems, traffic prediction, and developing reasonable urban planning.

Currently, it’s a herculean task to create and maintain the GPS datasets since it’s costly and laborious. As a result, most of the GPS datasets available today in the market have poor coverage or contain outdated information. They cover only a small area of a city, have low sampling rates and contain less contextual information of the GPS pings such as no accuracy level, bearing, and speed. Despite over a dozen mapping communities engaged in collecting GPS trajectory datasets, a significant amount of effort would be required for data cleaning and data pre-processing in order to utilize them.

To overcome the shortfalls in the existing datasets, we built Grab-Posisi, the first GPS trajectory dataset of Southeast Asia. The term Posisi refers to a position in Bahasa. The data was collected from Grab drivers’ phones while in transit. By tackling the addition of major arterial roads in regions where existing maps have poor coverage, and the incremental improvement of coverage in regions where major roads are already mapped, Posisi substantially improves mapping productivity.

# What’s inside the dataset

The whole Grab-Posisi dataset contains in total 84K trajectories that consist of more than 80 million GPS pings and cover over 1 million km. The average trajectory length is 11.94 km and the average duration per trip is 21.50 minutes.

The data were collected very recently in April 2019 with a 1 second sampling rate, which is the highest amongst all the publicly available datasets. It also has richer contextual information, including the accuracy level, bearing and speed. The accuracy level is important because GPS measurements are noisy and the true location can be anywhere inside a circle centred at the reported location with a radius equal to the accuracy level. The bearing is the horizontal direction of travel, measured in degrees relative to true north. Finally, the speed is reported in meters/second over ground.

As the GPS trajectories were collected from Grab drivers’ phones while in transit, we labelled each trajectory by phone device type being either Android or iOS. This is the first dataset which differentiates such device information. Furthermore, we also label the trajectories by driving mode (Car or Motorcycle).

All drivers’ personal information is encrypted and the real start/end locations are removed within the dataset.

## Data format

Each trajectory is serialised in a file in Apache Parquet format. The whole dataset size is around 2 GB. Each GPS ping is associated with values for a trajectory ID, latitude, longitude, timestamp (UTC), accuracy level, bearing and speed. The GPS sampling rate is 1 second, which is the highest among all the existing open source datasets. Table 1 shows a sample of the dataset.

<div class="post-image-section"><figure>
  <img src="/img/grab-posisi/image6.png" alt="Table 1: Sample dataset">
  <figcaption align="middle"><i>Table 1: Sample dataset</i></figcaption>
</figure></div>

## Coverage

Figure 1a shows the spatial coverage of the dataset in Singapore. Compared with the GPS datasets available in the market that only cover a specific area of a city, the Grab-Posisi dataset encompasses almost the whole island of Singapore. Figure 1b depicts the GPS density in Singapore. Red represents high density while green represents low density. Expressways in Singapore are clearly visible because of their dense GPS pings.

<div class="post-image-section"><figure>
  <img src="/img/grab-posisi/image7.png" alt="Figure 1a. Spatial coverage (Singapore)">
  <figcaption align="middle"><i>Figure 1a. Spatial coverage (Singapore)</i></figcaption>
</figure></div>

<div class="post-image-section"><figure>
  <img src="/img/grab-posisi/image5.png" alt="Figure 1b. GPS density (highways have more GPS)">
  <figcaption align="middle"><i>Figure 1b. GPS density (highways have more GPS)</i></figcaption>
</figure></div>

Figure 2a illustrates that the Grab-Posisi dataset encloses not only central Jakarta but also extends to external highways. Figure 2b depicts the GPS density of cars in Jakarta. Compared with Singapore, trips in Jakarta are spread out in all different areas, not just concentrated on highways.


<div class="post-image-section"><figure>
  <img src="/img/grab-posisi/image2.png" alt="Figure 2a. Spatial coverage (Jakarta)">
  <figcaption align="middle"><i>Figure 2a. Spatial coverage (Jakarta)</i></figcaption>
</figure></div>

<div class="post-image-section"><figure>
  <img src="/img/grab-posisi/image1.png" alt="Figure 2b. GPS density (Car)">
  <figcaption align="middle"><i>Figure 2b. GPS density (Car)</i></figcaption>
</figure></div>


### Applications of Grab-Posisi

The following are some of the applications of Grab-Posisi dataset.

#### On Map Inference

The traditional method used in updating road networks in maps is time-consuming and labour-intensive. That’s why maps might have important roads missing and real-time traffic conditions might be unavailable. To address this problem, we can use GPS trajectories in reconstructing road networks automatically.

A bunch of map generation algorithms can be applied to infer both map topology and road attributes. Figure 3b shows a snippet of the inferred map from our GPS trajectories (Figure 3a) using one of the algorithms. As you can see from the blue dots, the skeleton of the underlining map inferred is correct, although some section of the inferred road is disconnected, and at the roundabout in the bottom right corner it’s not a smooth curve.


<div style="text-align: center;">
<div class="row">
  <div class="column">
    <img src="/img/grab-posisi/image3.jpg" alt="Figure 3a. Raw GPS trajectories">
    <figcaption align="middle"><i>Figure 3a. Raw GPS trajectories  </i></figcaption>
  </div>
  <div class="column">
    <img src="/img/grab-posisi/image4.jpg" alt="Figure 3b. Inferred Map">
    <figcaption align="middle"><i>Figure 3b. Inferred Map</i></figcaption>
  </div>
</div>
</div>



#### On Map Matching                                         

The map matching refers to the task of automatically determining the correct route where the driver has travelled on a digital map, given a sequence of raw and noisy GPS points. The correction of the raw GPS data has been important for many location-based applications such as navigation, tracking, and road attribute detection as aforementioned. The accuracy levels provided in the Grab-Posisi dataset can be of great use to address this issue.

#### On Traffic Detection and Forecast                         

In addition to the inference of a static digital map, the Grab-Posisi GPS dataset can also be used to perform real-time traffic forecasting, which is very important for congestion detection, flow control, route planning, and navigation. Some examples of the fundamental indicators that are mostly used to monitor the current status of traffic conditions include the average speed, volume, and density in each road segment. These variables can be computed based on drivers’ GPS trajectories and can be used to predict the future traffic conditions.

#### On Mode Detection                         

Transportation mode detection refers to the task of identifying the travel mode of a user (some examples of transportation mode include walk, bike, car, bus, etc.). The GPS trajectories in our dataset are associated with rich attributes including GPS accuracy, bearing, and speed in addition to the latitude and longitude of geo-coordinates, which can be used to develop mode detection models. Our dataset also provides labels for each trajectory to be collected from a car or motorcycle, which can be used to verify performance of those models.

#### Economics Perspective                                         

The real-world GPS trajectories of people reveal realistic travel patterns and demands, which can be of great help for city planning. As there are some realistic constraints faced by governments such as budget limitations and construction inconvenience, it is important to incorporate both the planning authorities’ requirements and the realistic travel demands mined from trajectories for intelligent city planning. For example, the trajectories of cars can provide suggestions on how to schedule highway constructions. The trajectories of motorcycles can help the government to choose the optimal locations to construct motorcycle lanes for safety concerns.

# Want to access our dataset?

Grab-Posisi dataset offers a great value and is a significant resource to the community for benchmarking and revisiting existing technologies.         

If you want to access our dataset for research purposes, email [grab.posisi@grabtaxi.com](mailto:grab.posisi@grabtaxi.com) with the following details:

*   Your Name and contact details
*   Your institution
*   Your potential usage of the dataset

When using Grab-Posisi dataset, please cite the following paper:

_Huang, X., Yin, Y., Lim, S., Wang, G., Hu, B., Varadarajan, J., ... & Zimmermann, R. (2019, November). Grab-Posisi: An Extensive Real-Life GPS Trajectory Dataset in Southeast Asia. In Proceedings of the 3rd ACM SIGSPATIAL International Workshop on Prediction of Human Mobility (pp. 1-10). DOI: [https://doi.org/10.1145/3356995.3364536](https://doi.org/10.1145/3356995.3364536)_

<div>Click <a href="/files/Grab-Posisi_An_Extensive_Real-Life_GPS_Trajectory_Dataset_in_Southeast_Asia.pdf" download>here</a> to download the published paper.<p></p></div>

<div>Click <a href="/files/grab-posisi-dataset.bib" download>here</a> to download the BibTex file.<p></p></div>

**Note: You cannot use Grab-Posisi dataset for commercial purposes.**

# Join us

Grab is more than just the leading ride-hailing and mobile payments platform in Southeast Asia. We use data and technology to improve everything from transportation to payments and financial services across a region of more than 620 million people. We aspire to unlock the true potential of Southeast Asia and look for like-minded individuals to join us on this ride.

If you share our vision of driving South East Asia forward, [apply](https://grab.careers/jobs/) to join our team today.
