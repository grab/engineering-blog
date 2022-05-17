---
layout: post
id: 2022-05-17-service-architecture-revamp
title: Service architecture revamp
date: 2022-05-17 03:55:55
authors: [lipeng-zhang, tao-hou, weilun-wu]
categories: [Engineering]
tags: [Architecture, Optimisation, Search]
comments: true
cover_photo: /img/service-architecture-revamp/cover.jpg
excerpt: "Grab’s search architecture was initially designed to only support exact text matching based on user queries. Find out what problems the Deliveries search team faced and how they improved the search architecture to address these issues."
---

## Background

Prior to 2021, Grab’s search architecture was designed to only support textual matching, which takes in a user query and looks for exact matches within the ecosystem through an [inverted index](https://en.wikipedia.org/wiki/Inverted_index). This legacy system meant that only textual matching results could be fetched.

In the second half of 2021, the Deliveries search team worked on improving this architecture to make it smarter, more scalable and also unlock future growth for different search use cases at Grab. The figure below shows a simplified overview of the legacy architecture.

<div class="post-image-section"><figure>
  <img src="/img/service-architecture-revamp/image2.png" alt="Point multiplier" style="width:60%"><figcaption align="middle"><i>Legacy architecture</i></figcaption>
  </figure>
</div>


## Problem statement

With the legacy system, we noticed several problems.

#### Search results were textually matched without considering intention and context

If a user types in a query “Roti Prata” (flatbread), he is likely looking for Roti Prata dishes and those matches with the dish name should be prioritised compared with matches with the merchant-partner’s name or matches with other entities.

In the legacy system, all entities whose names partially matched “Roti Prata” were displayed and ranked according to hard coded weights, and matches with merchant-partner names were always prioritised, even if the user intention was clearly to search for the “Roti Prata” dish itself.  

This problem was more common in Mart, as users often intended to search for items instead of shops. Besides the lack of intention recognition, the search system was also unable to take context into consideration; users searching the same keyword query at different times and locations could have different objectives. E.g. if users search for “Bread” in the day, they may be likely to look for cafes while searches at night could be for breakfast the next day.

#### Search results from multiple business verticals were not blended effectively

In Grab’s context, results from multiple verticals were often merged. For example, in Mart searches, Ads and Mart organic search results were displayed together; in Food searches, Ads, Food and Mart organic results were blended together.

In the legacy architecture, multiple business verticals were merged on the Deliveries API layer, which resulted in the leak of abstraction and loss of useful data as data from the search recall stage was also not taken into account during the merge stage.

#### Inability to quickly scale to new search use cases and difficulty in reusing existing components

The legacy code base was not written in a structured way that could scale to new use cases easily. If new search use cases cannot be built on top of an existing system, it can be rather tedious to keep rebuilding the function every time there is a new search use case.

## Solution

In this section, solutions from both architecture and implementation perspectives are presented to address the above problem statements.

### Architecture

In the new architecture, the flow is extended from lexical recall only to multi-layer including boosting, multi-recall, and ranking. The addition of boosting enables capabilities like intent recognition and query expansion, while the change from single lexical recall to multi-recall opens up the potential for other recall methods, e.g. embedding based and graph based.

These help address the [first problem statement](#search-results-were-textually-matched-without-considering-intention-and-context). Furthermore, the multi-recall framework enables fetching results from multiple business verticals, addressing the [second problem statement](#search-results-from-multiple-business-verticals-were-not-blended-effectively). In the new framework, results from different verticals and different recall methods were grouped and ranked together without any leak of abstraction or loss of useful data from search recall stage in ranking.

<div class="post-image-section"><figure>
  <img src="/img/service-architecture-revamp/image1.png" alt="Point multiplier" style="width:60%"><figcaption align="middle"><i>Upgraded architecture</i></figcaption>
  </figure>
</div>

### Implementation

We believe that the key to a platform’s success is modularisation and flexible assembling of plugins to enable quick product iteration. That is why we implemented a combination of a framework defined by the platform and plugins provided by service teams. In this implementation, plugins are assembled through configurations, which addresses the [third problem statement](#inability-to-quickly-scale-to-new-search-use-cases-and-difficulty-in-reusing-existing-components) and has two advantages:

*   Separation of concern. With the main flow abstracted and maintained by the platform, service team developers could focus on the application logic by writing plugins and fitting them into the main flow. In this case, developers without search experience could quickly enable new search flows.
*   Reusing plugins and economies of scale. With more use cases onboarded, more plugins are written by service teams and these plugins are reusable assets, resulting in scale effect. For example, an Ads recall plugin could be reused in Food keyword or non-keyword searches, Mart keyword or non-keyword searches and universal search flows as all these searches contain non-organic Ads. Similarly, a Mart recall plugin could be reused in Mart keyword or non-keyword searches, universal search and Food keyword search flows, as all these flows contain Mart results. With more plugins accumulated on our platform, developers might be able to ship a new search flow by just reusing and assembling the existing plugins.

Conclusion
==========

Our platform now has a smart search with intent recognition and semantic (embedding-based) search. The process of adding new modules is also more straightforward and adds intention recognition to the boosting step as well as embedding as an additional recall to the multi-recall step. These modules can be easily reused by other use cases.

On top of that, we also have a mixed Ads and an organic framework. This means that data in the recall stage is taken into consideration and Ads can now be ranked together with organic results, e.g. text relevance.

With a modularised design and plugins provided by the platform, it is easier for clients to use our platform with a simple onboarding process. Furthermore, plugins can be reused to cater to new use cases and achieve a scale effect.

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
