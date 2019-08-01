---
layout: post
id: automated-erp-charges
title: No More Forgetting to Input ERP Charges - Hello Automated ERP!
date: 2019-07-31 13:43:40
authors: [garvee-garg, kudali-robinson-immanuel, lara-pureum-yim]
categories: [Product]
tags: [Data, Maps, Tech]
comments: true
cover_photo: /img/automated-erp-charges/cover.png
excerpt: "Forgetting to input ERP charges was one of the biggest problems faced by our driver-partners. Read our blog to know how went about solving it."
---

ERP, standing for Electronic Road Pricing, is a system used to manage road congestion in Singapore. Drivers are charged when they pass through ERP gantries during peak hours. ERP rates vary for different roads and time periods based on the traffic conditions at the time. This encourages people to change their mode of transport, travel route or time of travel during peak hours. ERP is seen as an effective measure in addressing traffic conditions and ensuring drivers continue to have a smooth journey.

Did you know that Singapore has a total of 79 active ERP gantries? Did you also know that every ERP gantry changes its fare 10 times a day on average? For example, total ERP charges for a journey from Ang Mo Kio to Marina will cost $10 if you leave at 8:50am, but $4 if you leave at 9:00am on a working day!

Imagine how troublesome it would have been for Grab’s driver-partners who, on top of having to drive and check navigation, would also have had to remember each and every gantry they passed, calculating their total fare and then manually entering the charges to the total ride cost at the end of the ride.

In fact, based on our driver-partners’ feedback, missing out on ERP charges was listed as one of their top-most pain points. Not only did the drivers find the entire process troublesome, this also led to earnings loss as they would have had to bear the cost of the  ERP fares.

We’re glad to share that, as of 15th March 2019, we’ve successfully resolved this pain point for our driver-partners by introducing automated ERP fare calculation!

So, how did we achieve automating the ERP fare calculation for our drivers-partners? How did we manage to reduce the number of trips where drivers would forget to enter ERP fare to almost zero? Read on!

## How we approached the Problem

The question we wanted to solve was - how do we create an impactful feature to make sure that driver -partners have one less thing to handle when they drive?

We started by looking at the problem at hand. ERP fares in Singapore are very dynamic; it changes on the basis of day and time.

<div class="post-image-section">
  <img alt="Caption: Example of ERP fare changes on a normal weekday in Singapore" src="/img/automated-erp-charges/image1.png">
  <small class="post-image-caption">Caption: Example of ERP fare changes on a normal weekday in Singapore</small>
</div>
<p>&nbsp;</p>

We wanted to create a system which can identify the dynamic ERP fares at any given time and location, while simultaneously identifying when a driver-partner has passed through any of these gantries.

However, that wasn’t enough. We wanted this feature to be scalable to every country where Grab is in - like Indonesia, Thailand, Malaysia, Philippines, Vietnam. We started studying the ERP (or tolls - as it is known locally) system in other countries. We realized that every country has its own style of calculating toll. While in Singapore ERP charges for cars and taxis are the same, Malaysia applies different charges for cars and taxis. Similarly, Vietnam has different tolls for 4-seaters and 7-seaters. Indonesia and Thailand have couple gantries where you pay only at one of the gantries.Suppose A and B are couple gantries, if you passed through A, you won't need to pay at B and vice versa. This is where our Ops team came to the rescue!

## Boots on the Ground!

Collecting all the ERP or toll data for every country is no small feat, recalls Robinson Kudali, program manager for the project. “We had around 15 people travelling across the region for 2-3 weeks, working on collecting data from every possible source in every country.”

Getting the right geographical coordinates for every gantry is very important. We track driver GPS pings frequently, identify the nearest road to that GPS ping and check the presence of a gantry using its coordinates. The entire process requires you to be very accurate; incorrect gantry location can easily lead to us miscalculating the fare.

Bayu Yanuaragi, our regional mapops lead, explains - “To do this, the first step was to identify all toll gates for all expressways & highways in the country. The team used various mapping software to locate and plot all entry & exit gates using map sources, open data and more importantly government data as references. Each gate was manually plotted using satellite imagery and aligned with our road layers in order to extract the coordinates with a unique gantry ID.”

Location precision is vital in creating the dataset as it dictates whether a toll gate will be detected by the Grab app or not. Next step was to identify the toll charge from one gate to another. Accuracy of toll charge per segment directly reflects on the fare that the passenger pays after the trip.

<div class="post-image-section">
  <img alt="Caption: ERP gantries visualisation on our map - The purple bars are the gantries that we drew on our map" src="/img/automated-erp-charges/image2.png">
  <small class="post-image-caption">Caption: ERP gantries visualisation on our map - The purple bars are the gantries that we drew on our map</small>
</div>
<p>&nbsp;</p>

Once the data compilation is done, team would then conduct fieldwork to verify its integrity. If data gaps are identified, modifications would be made accordingly.

Upon submission of the output, stack engineers would perform higher level quality check of the content in staging.

Lastly, we worked with a local team of driver-partners who volunteered to make sure the new system is fully operational and the prices are correct. Inconsistencies observed were reported by these driver-partners, and then corrected in our system.

## Closing the loop

Creating a strong dataset did help us in predicting correct fares, but we needed something which allows us to handle the dynamic behavior of the changing toll status too. For example, Singapore government revises ERP fare every quarter, while there could also be ad-hoc changes like activating or deactivating of gantries on an on-going basis.

Garvee Garg, Product Manager for this feature explains: “Creating a system that solves the current problem isn’t sufficient. Your product should be robust enough to handle all future edge case scenarios too. Hence we thought of building a feedback mechanism with drivers.”

In case our ERP fare estimate isn’t correct or there are changes in ERPs on-ground, our driver-partners can provide feedback to us. These feedback directly flow to Customer Experience teamwho does the initial investigation, and from there to our Ops team. A dedicated person from Ops team checks the validity of the feedback, and recommends updates. It only takes 1 day on average to update the data from when we receive the feedback from the driver-partner.

However, validating the driver feedback was a time consuming process. We needed a tool which can ease the life of Ops team by helping them in de-bugging each and every case.

Hence the ERP Workflow tool came into the picture.

99% of the time, feedback from our driver-partners are about error cases. When feedback comes in, this tool would allow the Ops team to check the entire ride history of the driver and map driver’s ride trajectory with all the underlying ERP gantries at that particular point of time. The Ops team  would then be able to identify if ERP fare calculated by our system or as said by driver is right or wrong.

## This is only the beginning

By creating a system that can automatically calculate and key in ERP fares for each trip, Grab is proud to say that our driver-partners can now drive with less hassle and focus more on the road which will bring the ride experience and safety for both the driver and the passengers to a new level!

The Automated ERP feature is currently live in Singapore and we are now testing it with our driver-partners in Indonesia and Thailand. Next up, we plan to pilot in the Philippines and Malaysia and soon to every country where Grab is in - so stay tuned for even more innovative ideas to enhance your experience on our super app!

To know more about what Grab has been doing to improve the convenience and experience for both our driver-partners and passengers, check out other stories on this blog!
