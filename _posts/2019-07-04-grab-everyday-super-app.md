---
layout: post
id: grab-everyday-super-app
title: Making Grab’s Everyday App Super
date: 2019-07-03 18:43:40
authors: [justin-bolilia, romain-basseville, karen-kue]
categories: [Data Science, Product]
tags: [Super App, Feed, Recommendations, Data Science, Machine Learning]
comments: true
cover_photo: /img/grab-everyday-super-app/cover.gif
excerpt: "To excel in a heavily diversified market like Southeast Asia, we leverage on the depth of our data to understand what sorts of information users want to see on our Feed and when they should see them. In this article we will discuss Grab Feed’s recommendation logic and strategies, as well as its future roadmap."
---

Grab is [Southeast Asia’s leading superapp](https://www.grab.com/sg/blog/welcome-to-our-everyday-super-app/), providing highly-used daily services such as ride-hailing, food delivery, payments, and more. Our goal is to give people better access to the services that matter to them, with more value and convenience, so we’ve been expanding our ecosystem to include bill payments, hotel bookings, trip planners, and videos - with more to come. We want to outserve our customers - not just by packing the Grab app with useful features and services, but by making the whole experience a unique and personalized one for each of them.

To realize our super app ambitions, we work with [partners](https://www.grab.com/sg/press/consumers-drivers/grab-introduces-four-new-services-in-singapore-in-its-super-app/) who, like us, want to help drive Southeast Asia forward.

A lot of the collaborative work we do with our partners can be seen in the Grab Feed. This is where we broadcast various types of content about Grab and our partners in an aggregated manner, adding value to the overall user experience. Here's what the feed looks like:

<div class="post-image-section">
  <img alt="Grab super app feed" src="/img/grab-everyday-super-app/image2.gif">
  <small class="post-image-caption">Waiting for the next promo? Check the Feed.<br/>Looking for news and entertainment? Check the Feed.<br/>Want to know if it's a good time to book a car? CHECK. THE. FEED.</small>
</div>
<p>&nbsp;</p>

As we continue to add more cards, services, and chunks of content into Grab Feed, there’s a risk that our users will find it harder to find the information relevant to them. So we work to ensure that our platform is able to distinguish and show information based on what’s most suited for the user’s profile. This goes back to what has always been our central focus - the customer - and is why we put so much importance in personalising the Grab experience for each of them.

To excel in a heavily diversified market like Southeast Asia, we leverage on the depth of our data to understand what sorts of information users want to see and when they should see them. In this article we will discuss Grab Feed’s recommendation logic and strategies, as well as its future roadmap.

Start your Engines
------------------

<div class="post-image-section">
  <img alt="Grab super app feed" src="/img/grab-everyday-super-app/image3.png">
</div>

The problem we’re trying to solve here is known as the [recommendations](https://en.wikipedia.org/wiki/Recommender_system) problem. In a nutshell, this problem is about inferring the preference of consumers to recommend content and services to them. In Grab Feed, we have different types of content that we want to show to different types of consumers and our challenge is to ensure that everyone gets quality content served to them.

<div class="post-image-section">
  <img alt="Grab super app feed" src="/img/grab-everyday-super-app/image4.gif">
</div>

To solve this, we have built a recommendation engine, which is a system that suggests the type of content a user should consider consuming. In order to make a recommendation, we need to understand three factors:

1.  **Users**. There’s a lot we can infer about our users based on how they've used the Grab app, such as the number of rides they’ve taken, the type of food they like to order, the movie voucher deals they’ve purchased, the games they’ve played, and so on. <br />This information gives us the opportunity to understand our users’ preferences better, enabling us to match their profiles with relevant and suitable content.
2.  **Items**. These are the characteristics of the content. We consider the type of the content (e.g. video, games, rewards) and consumability (e.g. purchase, view, redeem). We also consider other metadata such as store hours for merchants, points to burn for rewards, and GPS coordinates for points of interest.
3.  **Context**. This pertains to the setting in which a user is consuming our content. It could be the time of day, the user's location, or the current feed category.

Using signals from all these factors, we build a model that returns a ranked set of cards to the user. More on this in the next few sections.


Understanding our User
----------------------

<div class="post-image-section">
  <img alt="Grab super app feed" src="/img/grab-everyday-super-app/image5.png">
</div>

Interpreting user preference from the signals mentioned above is a whole challenge in itself. It's important here to note that we are in a constant state of experimentation. Slowly but surely, we are continuing to fine tune how to measure content preferences. That being said, we look at two areas:

1.  **Action**. We firmly believe that not all interactions are made equal. Does liking a card actually mean you like it? Do you like things at the same rate as your friends? What about transactions, are those more preferred? The feed introduces a lot of ways for the users to give feedback to the platform. These events include likes, clicks, swipes, views, transactions, and call-to-actions. <br />Depending on the model, we can take slightly different approaches. We can learn the importance of each event and aggregate them to have an expected rating, or we can predict the probability of each event and rank accordingly.

2.  **Recency**. Old interactions are probably not as useful as new ones. The feed is a product that is constantly evolving, and so are the preferences of our users. Failing to decay the weight of older interactions will give us recommendations that are no longer meaningful to our users.

Optimising the Experience
-------------------------

<div class="post-image-section">
  <img alt="Grab super app feed" src="/img/grab-everyday-super-app/image1.png">
</div>

Building a viable recommendation engine requires several phases. Working iteratively, we are able to create a few core recommendation strategies to produce the final model in determining the content’s relevance to the user. We’ll discuss each strategy in this section.

1.  **Popularity**. This strategy is better known as trending recommendations. We capture online clickstream events over a rolling time window and aggregate the events to show the user what's popular to everyone at that point in time. Listening to the crowds is generally an effective strategy, but this particular strategy also helps us address the cold start problem by providing recommendations for new feed users.
2.  **User Favourites**. We understand that our users have different tastes and that users will have content that they engage with more than other users would.  In this strategy, we capture that personal engagement and the user’s evolving preferences.
3.  **Collaborative Filtering**.A key goal in building our everyday super app is to let users experience different services. To allow discoverability, we study similar users to uncover a s et ofsimilar preferences they may have, which we can then use to guide what we show other users.
4.  **Habitual Behaviour**. There will be times where users only want to do a specific thing, and we wouldn't want them to scroll all the way down just to do it. We've built in habitual recommendations to address this. So if users always use the feed to scroll through food choices at lunch or to take a peek at ride peaks (pun intended) on Sunday morning, we've still got them covered.
5.  **Deep Recommendations**. We've shown you how we use Feed data to drive usage across the platform. But what about using the platform data to drive the user feed behaviour? By embedding users’ activities from across our multiple businesses, we're also able to leverage this data along with clickstream to determine the content preferences for each user.

We apply all these strategies to find out the best recommendations to serve the users either by selection or by aggregation. These decisions are determined through regular experiments and studies of our users.

Always Learning
---------------

We’re constantly learning and relearning about our users. There are a lot of ways to understand behaviour and a lot of different ways to incorporate different strategies, so we're always iterating on these to deliver the most personal experience on the app.

To identify a user's preferences and optimal strategy exposure, we capitalise on our[ Experimentation Platform](https://engineering.grab.com/building-grab-s-experimentation-platform) to expose different configurations of our Recommendation Engine to different users. To monitor the quality of our recommendations, we measure the impact with online metrics such as interaction, clickthrough, and engagement rates and offline metrics like Recall@Kand Normalized Discounted Cumulative Gain (NDCG).

Future Work
-----------

Through our experience building out this recommendations platform, we realised that the space was large enough and that there's a lot of pieces that can continuously be built. To keep improving, we're already working on the following items:

1.  Multi-objective optimisation for business and technical metrics
2.  Building out automation pipelines for hyperparameter optimisation
3.  Incorporating online learning for real-time model updates
4.  Multi-armed bandits for user personalised recommendation strategies
5.  Recsplanation system to allow stakeholders to better understand the system

Conclusion
----------

Grab is one of Southeast Asia's fastest growing companies. As its business, partnerships, and offerings continue to grow, the super app real estate problem will only keep on getting bigger. In this post, we discuss how we are addressing that problem by building out a recommendation system that understands our users and personalises the experience for each of them. This system (us included) continues to learn and iterate from our users feedback to deliver the best version for them.

If you've got any feedback, suggestions, or other great ideas, feel free to reach me at justin.bolilia@grab.com. Interested in working on these technologies yourself? Check out our [career](https://grab.careers/job-details/?id%3D72866c152804010108099fb6ea2fc56d) page.
