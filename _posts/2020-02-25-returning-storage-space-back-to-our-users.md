---
layout: post
id: 2020-02-25-returning-storage-space-back-to-our-users
title: Returning 575 Terabytes of Storage Space to Our Users
date: 2020-02-25 20:13:00
authors: [lucas-nelaupe]
categories: [Engineering]
tags: [Mobile, Android, Performance]
comments: true
cover_photo: /img/returning-storage-space-back-to-our-users/cover.png
excerpt: "This blog explains how we measured and reduced our app's storage footprint on user devices."
---

Have you ever run out of storage on your phone? Mobile phones come with limited storage and with the multiplication of apps and large video files, many of you are running out of space.

In this article, we explain how we measure and reduce the storage footprint of the Grab app on a user's device to help you overcome this issue.

## The Wakeup Call

[Android vitals](https://developer.android.com/topic/performance/vitals) (information provided by Google play Console about our app performance) gives us two main pieces of information about storage footprint.

15.7% of users have less than 1GB of free storage and they tend to uninstall more than other users (1.2x).

The proportion of 30 day active devices which reported less than 1GB free storage. Calculated as a 30 days rolling average.

<div class="post-image-section"><figure>
  <img src="/img/returning-storage-space-back-to-our-users/image2.png" alt="Active devices with <1GB free space">
  <figcaption align="middle"><i>Active devices with <1GB free space</i></figcaption>
</figure></div>

This is the ratio of uninstalls on active devices with less than 1GB free storage to uninstalls on all active devices. Calculated as a 30 days rolling average.

<div class="post-image-section"><figure>
  <img src="/img/returning-storage-space-back-to-our-users/image5.png" alt="Ratio of uninstalls on active devices with less than 1GB">
  <figcaption align="middle"><i>Ratio of uninstalls on active devices with less than 1GB</i></figcaption>
</figure></div>

## Instrumentation to Know Where We Stand

First things first, we needed to know how much space the Grab app occupies on user device. So we started using our personal devices. We can find this information by opening the phone settings and selecting Grab app.

<div class="post-image-section"><figure>
  <img src="/img/returning-storage-space-back-to-our-users/image3.jpg" alt="App Settings">
  <figcaption align="middle"><i>App Settings</i></figcaption>
</figure></div>

For this device (screenshot), the application itself (Installed binary) was 186 MB and the total footprint was 322 MB. Since this information varies a lot based on the usage of the app, we needed this information directly from our users in production.

_Disclaimer: We are only measuring files that are inside the internal Grab app folder (Cache/Database). We do NOT measure any file that is not inside the private Grab folder._

We decided to leverage on our current implementation using [StorageManager](https://developer.android.com/reference/android/os/storage/StorageManager) API to gather the following information during each session launch:

*   Application Size (Installed binary size)
*   Cache folder size
*   Total footprint

<div class="post-image-section"><figure>
  <img src="/img/returning-storage-space-back-to-our-users/image1.png" alt="Sample code to retrieve storage information on Android">
  <figcaption align="middle"><i>Sample code to retrieve storage information on Android</i></figcaption>
</figure></div>


### Data Analysis

We began analysing this data one month after our users’ updated their app and found that the cache size was anomaly huge (> 1GB) for a lot of users. Intrigued, we dug deeper.

We added code to log the top largest files inside the cache folder, and we found that most of the files were inside a sub cache folder that was no longer in use. This was due to a usage of a 3rd party library that was removed from our app. We added a specific metric to track the size of this folder.

In the end, a lot of users still had this old cache data and for some users the amount of data can be up to 1GB.

### Root Cause Analysis

The Grab app relies a lot on 3rd party libraries. For example, [Picasso](https://github.com/square/picasso) was a library we used in the past for image display which is now replaced by [Glide](https://developer.android.com/topic/performance/graphics/load-bitmap). Picasso uses a cache to store images and avoid making network calls again and again. After removing Picasso from the app, we didn’t delete this cache folder on the user device. We knew there would likely be more third-party libraries that had been discontinued so we expanded our analysis to look at how other 3rd party libraries cached their data.

## Freeing Up Space on Users' Phones

Here comes the fun part. We implemented a cleanup mechanism to remove old cache folders. When users update the Grab app, any old cache folders which were there before would automatically be removed. By doing this, we released up to 1GB of data in a second back to our users. In total, we removed 575 terabytes of old cache data across more than 13 million devices (approximately 40MB per user on average).

## Data Summary

The following graph shows the total size of junk data (in Terabytes) that we can potentially remove each day, calculated by summing up the maximum size of cache when a user opens the Grab app each day.

The first half of the graph reflects the amount of junk data in relation to the latest app version before auto-clean up was activated. The second half of the graph shows a dramatic dip in junk data after auto-clean up was activated. We were deleting up to 33 Terabytes of data per day on the user's device when we first started!

<div class="post-image-section"><figure>
  <img src="/img/returning-storage-space-back-to-our-users/image4.png" alt="Sum of all junk data on user’s device reported per day in Terabytes">
  <figcaption align="middle"><i>Sum of all junk data on user’s device reported per day in Terabytes</i></figcaption>
</figure></div>


## Next Step

This is the first phase of our journey in reducing the storage footprint of our app on Android devices. We specifically focused on making improvements at scale i.e. deliver huge storage gains to the most number of users in the shortest time. In the next phase, we will look at more targeted improvements for specific groups of users that still have a high storage footprint. In addition, we are also reviewing iOS data to see if a round of clean up is necessary.

Concurrently, we are also reducing the maximum size of cache created by some libraries. For example, Glide by default creates a cache of 250MB but this can be configured and optimised.

We hope you found this piece insightful and please remember to update your app regularly to benefit from the improvements we’re making every day. If you find that your app is still taking a lot of space on your phone, be assured that we’re looking into it.

## Join us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
