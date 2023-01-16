---
layout: post
id: 2020-03-24-grabchat-much-talk-data-to-me
title: GrabChat Much? Talk Data to Me!
date: 2020-03-24 05:02:55
authors: [jason-lee, lara-pureum-yim]
categories: [Data Science]
tags: [Data, Data Analytics, Data Visualisation]
comments: true
cover_photo: /img/grabchat-much-talk-data-to-me/cover.png
excerpt: "This blog post uncovers some interesting insights from our GrabChat data in Singapore, Malaysia, and Indonesia."

---

<p align="center"><i>This article was originally published in the Grab Medium account on November 20, 2019. Reposting it here for your reading pleasure.</i></p>

In September 2016 GrabChat was born, a platform designed to allow seamless communication between passenger and driver-partner. Since then, Grab has continuously improved the GrabChat experience by introducing features such as instant translation, images, and audio chats, and as a result — reduced cancellation rates by up to 50%! We’ve even [experimented with various features](https://engineering.grab.com/experiment-chat-booking-cancellations) to deliver hyper-localised experiences in each country! So with all these features, how have our users responded? Let’s take a deeper look into this to uncover some interesting insights from our data in Singapore, Malaysia and Indonesia.

## The Chattiest Country

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image1.png" alt="Number of Chats by Country">
  <figcaption align="middle"><i>Number of Chats by Country</i></figcaption>
</figure></div>

In a previous [blog post](https://www.grab.com/sg/blog/grabchat-feature/) several years ago, we revealed that Indonesia was the chattiest nation in South-east Asia. Our latest data is no different. **Indonesia is still the chattiest country out of the three, having an average of 5.5 chats per bookings, while Singapore is the least chatty!** Furthermore, passengers in Singapore tend to be chattier than driver-partners, while the reverse relationship is true for the other two countries.

**But what do people talk about?**

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image2.png" alt="Common words in Indonesia">  
  <figcaption align="middle"><i>Common words in Indonesia</i></figcaption>
</figure></div>

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image3.png" alt="Common words in Singapore">  
  <figcaption align="middle"><i>Common words in Singapore</i></figcaption>
</figure></div>

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image4.png" alt="Common words in Malaysia">  
  <figcaption align="middle"><i>Common words in Malaysia</i></figcaption>
</figure></div>

As expected, most of the chats revolve around pick-up points. There are **many similarities between the three countries, such as typing courtesies such as ‘Hi’ and ‘Thank you’, and that the driver-partner/passenger is coming.** However, there are slight differences between the countries. Can you spot them all?

In Indonesia, chats are usually in Bahasa Indonesia, and tend to be mostly driver-partners thanking passengers for using Grab.

Chats in Singapore on the other hand, tend to be in English, and contain mostly pick-up locations, such as a car park. There are quite a few unique words in the Singapore context, such as ‘rubbish chute’ and ‘block’ that reflect features of the ubiquitous HDB’s (public housing) found everywhere in Singapore that serve as popular residential pickup points.

Malaysia seems to be a blend of the other two countries, with chats in a mix of English and Bahasa Malaysia. Many of the chats highlight pickup locations, such as a guard house, as well as the phrase all Malaysians know: being stuck in traffic.

## Time Trends

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image5.png" alt="Time Trend">
  <figcaption align="middle"><i>Time Trend</i></figcaption>
</figure></div>

Analysis in chat trends across the three countries revealed an unexpected insight: **a trend of talking more from midnight until around 4am**. Perplexed but intrigued, we dug further to discover what prompted our users to talk more in such odd hours.

From midnight to 4am shops and malls are usually closed during these hours, and pickup locations become more obscure as people wander around town late at night. Driver-partners and passengers thus tend to have more conversations to determine the pickup point. This also explains why the **proportion of** **pick-up location based messages out of all messages is highest between 12 and 6am**. On the other hand, these messages are less common in the mornings (6am-12pm) as people tend to be picked up from standard residential locations.

## Image Trends

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image6a.png" alt="GrabChat’s Image-function uptake in Jakarta, Singapore, and Kuala Lumpur (Nov 2018 — March 2019) - Image 1">
  <figcaption align="middle"><i>GrabChat’s Image-function uptake in Jakarta, Singapore, and Kuala Lumpur (Nov 2018 — March 2019) - Image 1</i></figcaption>
</figure></div>

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image6b.png" alt="GrabChat’s Image-function uptake in Jakarta, Singapore, and Kuala Lumpur (Nov 2018 — March 2019)  - Image 2">
  <figcaption align="middle"><i>GrabChat’s Image-function uptake in Jakarta, Singapore, and Kuala Lumpur (Nov 2018 — March 2019) - Image 2</i></figcaption>
</figure></div>

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image6c.png" alt="GrabChat’s Image-function uptake in Jakarta, Singapore, and Kuala Lumpur (Nov 2018 — March 2019) - Image 3">
  <figcaption align="middle"><i>GrabChat’s Image-function uptake in Jakarta, Singapore, and Kuala Lumpur (Nov 2018 — March 2019) - Image 3</i></figcaption>
</figure></div>

The ability to send images on GrabChat was introduced in September 2018, with the aim of helping driver-partners identify the exact pickup location of passengers. Within the first few weeks of release, 22,000 images were sent in Singapore alone. The increase in uptake of the image feature for the cities of Jakarta, Singapore and Kuala Lumpur can be seen in the images above.

From analysis, we found that **areas that were more remote such as Tengah in Singapore tended to have the highest percentage of images sent**, indicating that images are useful for users in unfamiliar places.

## Safety First

Aside from images, Grab also introduced two other features: templates and audio chats, to **avoid driver-partners from texting while driving**.

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image7.png" alt="Templates and audio features used by driver-partners, and a reduced number of typed texts by driver-partners per booking">
  <figcaption align="middle"><i>Templates and audio features used by driver-partners, and a reduced number of typed texts by driver-partners per booking</i></figcaption>
</figure></div>

“Templates” (pre-populated phrases) allowed driver-partners to send templated messages with just a quick tap. In our recent data analysis, we discovered that almost 50% of driver-partner texts comprised of templates.

“Audio chat” alongside “images chat” were introduced in September 2018, and the use of this feature has been steadily increasing, with audio comprising an increasing percentage of driver-partner texts.

With both features being picked up by driver-partners across all three countries, Grab has successfully seen a decrease in the overall number of driver-partner texts (non-templates) per booking within a 3 month period.

## A Brief Pick-up Guide

No one likes a cancelled ride, right? Well, after analysing millions of data points, we’ve unearthed some neat tips and tricks to help you complete your ride, and we’re sharing them with you!

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image8.png" alt="Completed Rides">
  <figcaption align="middle"><i>Completed Rides</i></figcaption>
</figure></div>

This first tip might be a no-brainer, but replying your driver-partner would result in a higher completion rate. No one likes to be blue-ticked do they?

Next, we discovered various things you could say that would result in higher completion rates, explained below in the graphic.

<div class="post-image-section"><figure>
  <img src="/img/grabchat-much-talk-data-to-me/image9.png" alt="Tips for a Better Pickup Experience">
  <figcaption align="middle"><i>Tips for a Better Pickup Experience</i></figcaption>
</figure></div>

Informing the driver-partner that you’re coming, giving them directions, and telling them how to identify you results in almost double the chances of completing the ride!

Last but not least, **let’s not forget our manners**. Grab’s data analysis revealed that saying ‘thank you’ correlated with an increase in completion rates! Also, be at the pickup point on time — remember, time is money for our driver-partners!

## Conclusion

Just like in Shakespeare’s *Much Ado about Nothing*, ample information can be gathered from the mere whim of a message. Grab is constantly aspiring to achieve the best experience for both passengers and driver-partners, and data plays a huge role in helping us achieve this.

This is just the first page of the book. The amount of information lurking between every page is endless. So stay tuned for more interesting insights about our GrabChat platform!

## Join us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
