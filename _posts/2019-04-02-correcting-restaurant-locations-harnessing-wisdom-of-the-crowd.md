---
layout: post
id: correcting-restaurant-locations-harnessing-wisdom-of-the-crowd
title: How We Harnessed the Wisdom of Crowds to Improve Restaurant Location Accuracy
date: 2019-04-02 07:43:40
authors: [pravin-kakar]
categories: [Data Science]
tags: [Data Science]
comments: true
cover_photo: /img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/cover.jpeg
excerpt: "We questioned some of the estimates that our algorithm for calculating restaurant wait times was making, and found that the \"errors\" were actually useful to discover restaurants whose locations had been incorrectly registered in our system. By combining such error signals across multiple orders, we were able to identify correct restaurant locations and amend them to improve the experience for our customers."
---

While studying GPS ping data to understand how long our driver-partners needed to spend at restaurants during a GrabFood delivery, we came across an interesting observation. We realised that there was a significant proportion of restaurants where our driver-partners were waiting for abnormally short durations, often for just seconds.

Considering that it typically takes a driver a few minutes to enter the restaurant, pick up the order and then leave, we decided to dig further into this phenomenon. What we uncovered was that these super short pit stops were restaurants that were registered at incorrect coordinates within the system due to reasons such as the restaurant had moved to a new location, or human error during onboarding the restaurants. Incorrectly registered locations within our system impact all involved parties - eaters may not see the restaurant because it falls outside their delivery radius or they may see an incorrect ETA, drivers may have trouble finding the restaurant and may end up having to cancel the order, and restaurants who may get fewer orders without really knowing why. 

So we asked ourselves - how can we improve this situation by leveraging the wealth of data that we have? 

The Solution
------------

One of the biggest advantages we have is the huge driver-partner fleet we have on the ground in cities across Southeast Asia. They know the roads and cities like the back of their hand, and they are resourceful. As a result, they are often able to find the restaurants and complete orders even if the location was registered incorrectly. Knowing this, we looked at GPS pings and timestamps from these drivers, and combined this information with when they indicated that they have ordered or collected food from the restaurant. This is then used to infer the “pick-up location” from which the food was collected. 

Inferring this location is not so straightforward though. GPS ping quality can vary significantly across devices and will be affected by whether the device is outdoors or indoors (e.g. if the restaurant is inside a mall). Hence we compute metrics from times and distances between pings, ping frequency and ping quality to filter out orders where the GPS quality is determined to be sub-par. The thresholds for such filtering are determined based on a statistical analysis of orders by regions and times of day. 

One of the outcomes of such an analysis is that we deemed it acceptable to consider a driver "at" a restaurant, if their GPS ping falls within a predetermined radius of the registered location of the restaurant. However, knowing that a driver is at the restaurant does not necessarily tell us "when" he or she  is actually at the restaurant. See the following figure for an example. 

<div class="post-image-section">
  <img alt="Map showing driver paths and GPS location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image1.png">
</div>

<p>&nbsp;</p>

As you can see from the area covered by the green circle, there are 3 distinct occurrences or "streaks" when the driver can be determined to be at the restaurant location - once when they are approaching the restaurant from the southwest before taking two right turns, then again when they are actually at the restaurant coming in from the northeast, and again when they leave the restaurant heading southwest before making a U-turn and then heading northeast. In this case, if the driver indicates that they have collected the food during the second streak, chronology is respected - the driver reaches the restaurant, the driver collects the food, the driver leaves the restaurant. However if the driver indicates that they have collected the food during one of the other streaks, that is an invalid pick-up even though it is "at" the restaurant.

Such potentially invalid pick-ups could result in noisy estimates of restaurant location, as well as hamper us in our parent task of accurately estimating how long drivers need to wait at restaurants. Therefore, we modify the definition of the driver being at the restaurant to only include the time of the longest streak i.e. the time when the driver spent the longest time within the registered location radius. 

Extending this across multiple orders and drivers, we can form a cluster of pick-up locations (both "at" and otherwise) for each restaurant. Each restaurant then gets ranked through a combination of:


**Order volume**: Restaurants which receive more orders are likely to have more valid signals for any predictions we make. Increasing the confidence we have in our estimates.

**Fraction of the orders where the pick-up location was not "at" the restaurant**: This fraction indicates the number of orders with a pick-up location not near the registered restaurant location (with near being defined both spatially and temporally as above). A higher value indicates a higher likelihood of the restaurant not being in the registered location subject to order volume

**Median distance between registered and estimated locations**: This factor is used to rank restaurants by a notion of "importance". A restaurant which is just outside the fixed radius from above can be addressed after another restaurant which is a kilometre away. 

This ranked list of restaurants is then passed on to our mapping operations team to verify. The team checks various sources to verify if the restaurant is incorrectly located which is then fed back to the GrabFood system and the locations updated accordingly.

Results
-------

*   We have a system to catch and fix obvious errors

The table below shows a few examples of errors we were able to catch and fix. The image on the left shows the distance between an incorrectly registered address and the actual location of the restaurant.

<table class="table">
  <thead>
    <tr>
      <th>Restaurant</th>
      <th>Path from registered location to estimated location</th>
      <th>Zoomed in view of estimated location</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Sederhana  Minang</td>
      <td><img alt="Sederhana  Minang path from registered to estimated location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image3.png"></td>
      <td><img alt="Sederhana  Minang zoomed in view of estimated location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image2.png"></td>
    </tr>
    <tr>
      <td>Papa Ron's Pizza</td>
      <td><img alt="Papa Ron's Pizza path from registered to estimated location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image6.png"></td>
      <td><img alt="Papa Ron's Pizza zoomed in view of estimated location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image4.png"></td>
    </tr>
    <tr>
      <td>Rich-O Donuts & Cafe</td>
      <td><img alt="Rich-O Donuts & Cafe path from registered to estimated location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image9.png"></td>
      <td><img alt="Rich-O Donuts & Cafe zoomed in view of estimated location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image7.png"></td>
    </tr>
  </tbody>
</table>

Fixing these errors periodically greatly reduced the median error distance (measured as the straight line distance between the estimated location and registered location) in each city as restaurant locations were corrected.

<table class="table">
  <thead>
    <tr>
      <th>Bangkok</th>
      <th>Ho Chi Minh</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img alt="Median error distance in Bangkok" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image13.png"></td>
      <td><img alt="Median error distance in Ho Chi Minh" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image5.png"></td>
    </tr>
  </tbody>
</table>

*   We helped to reduce cancellations

We also tracked the number of GrabFood orders cancelled because the restaurant could not be found by our driver-partners as indicated on the app. Once we started making periodic updates, we saw a 5x decrease in cancellations because of incorrect restaurant locations. 

<div class="post-image-section">
  <img alt="Relative cancellation rate due to incorrect location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image8.png">
</div>

*   We discovered some interesting findings!

In some cases, we were actually stumped when trying to correct some of the locations according to what the system estimated. One of the most interesting examples was the restaurant "Waroeng Steak and Shake" in Bekasi. According to our system, the restaurant's location was further up Jalan Raya Jatiwaringin than we thought it to be. 

<div class="post-image-section">
  <img alt="Waroeng Steak and Shake map location" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image10.png">
</div>

Examining this on Google Maps, we noticed that both locations oddly seemed to have a branch of the restaurant. What was going on here? 

<div class="post-image-section">
  <img alt="Waroeng Steak and Shake map location on Google Maps" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image11.png">
</div>

By looking at Google Reviews (credit to my colleague Kenneth Loh for the idea), we realised that the restaurant seemed to have changed its location, and this is what our system was picking up on. 

<div class="post-image-section">
  <img alt="Waroeng Steak and Shake Google Maps reviews" src="/img/correcting-restaurant-locations-harnessing-wisdom-of-the-crowd/image12.png">
</div>

In summary, the system was able to respond to a change in location for the restaurant without any active action taken by the restaurant and while other data sources had duplicates. 

What’s Next?
------------

Going forward, we are looking to automate some aspects of this workflow. Currently, the validation part is handled by our mapping operations team and we are looking to feedback their validation and actions taken so that we can fine-tune various hyperparameters in our system (registered location radii, normalisation factors, etc) and/or train more advanced models that are cognizant of different geo and driver characteristics in different markets.

Additionally while we know that we should expect poor results for some scenarios (e.g. inside malls due to poor GPS quality and often approximate registered locations), we can extract such information (restaurant is inside a mall in this case) through a combination of manual feedback from operations teams and drivers, as well as automated NLP techniques such as name and address parsing and entity recognition. 

In the end, it is always useful to question the predictions that a system makes. By looking at some abnormally small wait times at restaurants, we were able to discover, provide feedback and continually update restaurant locations within the GrabFood ecosystem resulting in an overall better experience for our eaters, driver-partners and merchant-partners.
