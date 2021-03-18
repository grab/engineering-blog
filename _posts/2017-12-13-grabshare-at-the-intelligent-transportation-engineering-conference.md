---
layout: post
id: grabshare-at-the-intelligent-transportation-engineering-conference
title: GrabShare at the Intelligent Transportation Engineering Conference
date: 2017-12-13 06:00:00
authors: [dominic-widdows]
categories: [Data Science]
tags: [Data Science, GrabShare]
comments: true
cover_photo: /img/grabshare-at-the-intelligent-transportation-engineering-conference/cover.jpg
excerpt: "We're excited to share the publication of our paper GrabShare: The Construction of a Realtime Ridesharing Service, which was Grab's contribution to the Intelligent Transportation Engineering Conference in Singapore last month."
---

We're excited to share the publication of our paper [GrabShare: The Construction of a Realtime Ridesharing Service](http://ieeexplore.ieee.org/document/8056896/), which was Grab's contribution to the [Intelligent Transportation Engineering Conference](http://icite.org) in Singapore last month.

The ICITE conference was a terrific event for getting to know researchers and experts in transportation, with presentations ranging from improving battery life and security in autonomous vehicles, to predicting bus arrival times and traffic congestion in cities from Penang to Beijing. It's inspiring to meet with such a wide range of scientists, committed in many different ways to improving the safety, quality, and sustainability of transportation throughout the world.

[GrabShare](https://www.grab.com/sg/share/) is Grab's service that offers passengers going the same way a more cost effective fare for sharing the ride, and is one of the products for which Grab recently won a [Digital Disruptor of the Year](https://www.digitalnewsasia.com/business/grab-named-digital-disruptor-year) award. The paper itself gives quite a broad overview of how the GrabShare system works.

GrabShare has to connect drivers and passengers who want to know if they can have a ride almost immediately. Passengers may also be using smartphones with spotty connections that may appear and disappear from the network at any time. These real-time demands make the system design somewhat different from that of a traditional transportation provider such as a railway network or airline. There's an algorithm for matching rides together, which has to give very quick answers, deal with volatile supply and demand, and cope with the fact that any message to a driver or passenger might not get through. Good luck with that!

To build a successful product, we need a lot more than this. Pricing needs to work well for both passengers and drivers. Traffic patterns need to be understood to give reliable travel time estimates - and the system uses hundreds of these estimates, because for every match that's made, the scheduling system considers and rejects many others that turn out to be less promising. And just to make this part more challenging, we're dealing with cities like Manila and Jakarta that have some of the world's most notorious traffic jams.

None of this could happen without the teams on the ground. A large part of building GrabShare has been about listening to feedback from these experts and turning it into code. When we hear a passenger or driver complain that a match wasn't appropriate, our country teams analyse the problem, and often the engineering team gets involved directly in updating the online systems to make sure similar problems don't happen again.

We've come this far for GrabShare. It's been a rewarding journey, and we will continue to iterate and innovate. According to our records and estimates, in the past month alone GrabShare saved over 4.5 million km in driving distance by using one car instead of two for thousands of shared journeys. In addition, the service has reduced congestion and pollution including CO<sub>2</sub> and other emissions – by about as much as 1,000 flights from Singapore to Beijing, or about as much CO<sub>2</sub> as what 5 square kilometres of forest absorbs in a month. (As far as we can tell from researching on the web – we're tree enthusiasts, not tree scientists!) And the travel cost savings have been attracting new passengers to the platform – within just two weeks in August, more than 100,000 new users took GrabShare rides.

It's a good time for us to thank the organisers of the ICITE conference, and all the other contributors to the event. We hope some of our readers enjoy finding out more about GrabShare, and getting a more thorough understanding of how it's built. And most importantly, thanks to our drivers, passengers, and dedicated teams across Southeast Asia who've  made this happen. Of all the research I've been involved in over the years, there's never been anything that affected so many people or where the acknowledgements section was so heartfelt.
