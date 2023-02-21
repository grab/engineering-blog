---
layout: post
id: 2023-02-21-geohash-plugin
title: New zoom freezing feature for Geohash plugin
date: 2023-02-21 01:18:05
authors: [maria-mitisor]
categories: [Engineering, Product]
tags: [Engineering, Geohash, Maps, Open source]
comments: true
cover_photo: /img/geohash-plugin/cover.png
excerpt: "Built by Grab, the Geohash Java OpenStreetMap Editor (JOSM) plugin is widely used in map-making, but a common pain point is the inability to zoom in to a specific region without displaying new geohashes. Read to find out more about the issue and how the latest update addresses it."
---

## Introduction

Geohash is an encoding system with a unique identifier for each region on the planet. Therefore, all geohash units can be associated with an individual set of digits and letters.

Geohash is a plugin built by Grab that is available in the Java OpenStreetMap Editor (JOSM) tool, which comes in handy for those who work on precise areas based on geohash units.

## Background

Up until recently, users of the Geohash JOSM plugin were unable to stop the displaying of new geohashes with every zoom-in or zoom-out. This meant that every time they changed the zoom, new geohashes would be displayed, and this became bothersome for many users when it was unneeded. The previous behaviour of the plugin when zooming in and out is depicted in the following short video:

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image7.gif" alt="" style="width:70%">
  </figure>
</div>
This led to the implementation of the zoom freeze feature, which helps users toggle between Enable zoom freeze and Disable zoom freeze, based on their needs.

## Solution

As you can see in the following image, a new label was created with the purpose of freezing or unfreezing the display of new geohashes with each zoom change:

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image3.png" alt="" style="width:70%">
  </figure>
</div>

By default, this label says “Enable zoom freeze”, and when zoom freezing is enabled, the label changes to “Disable zoom freeze”.

In order to see how zoom freezing works, let’s consider the following example: a user wants to zoom inside the geohash with the code w886hu, without triggering the display of smaller geohashes inside of it. For this purpose, the user will enable the zoom freezing feature by clicking on the label, and then they will proceed with the zoom. The map will look like this:

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image1.png" alt="" style="width:70%">
  </figure>
</div>

It is apparent from the image that no new geohashes were created. Now, let’s say the user has finished what they wanted to do, and wants to go back to the “normal” geohash visualisation mode, which means disabling the zoom freeze option. After clicking on the label that now says ‘Disable zoom freeze’, new, smaller geohashes will be displayed, according to the current zoom level:

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image2.png" alt="" style="width:70%">
  </figure>
</div>

The functionality is illustrated in the following short video:

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image5.gif" alt="" style="width:70%">
  </figure>
</div>

Another effect that enabling zoom freeze has is that it disables the ‘Display larger geohashes’ and ‘Display smaller geohashes’ options, since the geohashes are now fixed. The following images show how these options work before and after disabling zoom freeze:

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image6.png" alt="" style="width:70%">
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/geohash-plugin/image4.png" alt="" style="width:70%">
  </figure>
</div>

To conclude, we believe that the release of this new feature will benefit users by making it more comfortable for them to zoom in and out of a map. By turning off the display of new geohashes when this is unwanted, map readability is improved, and this translates to a better user experience.

## Impact/Limitations

In order to start using this new feature, users need to update the Geohash JOSM plugin.

## What’s next?

Grab has come a long way in map-making, from using open source map-making software and developing its own suite of map-making tools to contributing to the open-source map community and building and launching GrabMaps. To find out more, read [How KartaCam powers GrabMaps](/kartacam-powers-grabmaps) and [KartaCam delivers comprehensive, cost-effective mapping data](https://www.grab.com/sg/enterprise-blog/kartacam-delivers-comprehensive-cost-effective-mapping-data/).

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
