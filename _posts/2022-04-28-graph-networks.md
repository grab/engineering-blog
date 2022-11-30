---
layout: post
id: 2022-04-28-graph-networks
title: Graph Networks - Striking fraud syndicates in the dark
date: 2022-04-28 10:55:55
authors: [muqi-li]
categories: [Engineering, Security]
tags: [Graph Networks, Graphs, Fraud detection, Security]
comments: true
cover_photo: /img/graph-intro/cover.png
excerpt: "As fraudulent entities evolve and get smarter, Grab needs to continuously enhance our defences to protect our consumers. Read to find out how Graph Networks help the Integrity team advance fraud detection at Grab."
---

<div class="post-image-section"><figure>
  <img src="/img/graph-intro/image2.png" style="width:60%">
  </figure>
</div>

As a leading superapp in Southeast Asia, Grab serves millions of consumers daily. This naturally makes us a target for fraudsters and to enhance our defences, the Integrity team at Grab has launched several hyper-scaled services, such as the [Griffin real-time rule engine](https://engineering.grab.com/griffin) and [Advanced Feature Engineering](https://engineering.grab.com/using-grabs-trust-counter-service-to-detect-fraud-successfully). These systems enable data scientists and risk analysts to develop real-time scoring, and take fraudsters out of our ecosystems.

Apart from individual fraudsters, we have also observed the fast evolution of the dark side over time. We have had to evolve our defences to deal with professional syndicates that use advanced equipment such as device farms and GPS spoofing apps to perform fraud at scale. These professional fraudsters are able to camouflage themselves as normal users, making it significantly harder to identify them with rule-based detection.

Since 2020, Grab’s Integrity team has been advancing fraud detection with more sophisticated techniques and experimenting with a range of graph network technologies such as graph visualisations, graph neural networks and graph analytics. We’ve seen a lot of progress in this journey and will be sharing some key learnings that might help other teams who are facing similar issues.

### What are Graph-based Prediction Platforms?

> “You can fool some of the people all of the time, and all of the people some of the time, but you cannot fool all of the people all of the time.” - Abraham Lincoln

A Graph-based Prediction Platform connects multiple entities through one or more common features. When such entities are viewed as a macro graph network, we uncover new patterns that are otherwise unseen to the naked eye. For example, when investigating if two users are sharing IP addresses or devices, we might not be able to tell if they are fraudulent or just family members sharing a device.

However, if we use a graph system and look at all users sharing this device or IP address, it could show us if these two users are part of a much larger syndicate network in a device farming operation. In operations like these, we may see up to hundreds of other fake accounts that were specifically created for promo and payment fraud. With graphs, we can identify fraudulent activity more easily.

### Grab’s Graph-based Prediction Platform

Leveraging the power of graphs, the team has primarily built two types of systems:

* **Graph Database Platform**: An ultra-scalable storage system with over one billion nodes that powers:
    1.  **Graph Visualisation**: Risk specialists and data analysts can review user connections real-time and are able to quickly capture new fraud patterns with over 10 dimensions of features (see Fig 1).

        <div class="post-image-section"><figure>
          <img src="/img/graph-intro/image1.gif" alt="Change Data Capture flow" style="width:60%"><figcaption align="middle"><i>Fig 1: Graph visualisation</i></figcaption>
          </figure>
        </div>

    2.  **Network-based feature system**: A configurable system for engineers to adjust machine learning features based on network connectivity, e.g. number of hops between two users, numbers of shared devices between two IP addresses.

* **Graph-based Machine Learning**: Unlike traditional fraud detection models, Graph Neural Networks (GNN) are able to utilise the structural correlations on the graph and act as a sustainable foundation to combat many different kinds of fraud. The data science team has built large-scale GNN models for scenarios like anti-money laundering and fraud detection.

    Fig 2 shows a Money Laundering Network where hundreds of accounts coordinate the placement of funds, layering the illicit monies through a complex web of transactions making funds hard to trace, and consolidate funds into spending accounts.

<div class="post-image-section"><figure>
  <img src="/img/graph-intro/image3.gif" alt="Change Data Capture flow" style="width:60%"><figcaption align="middle"><i>Fig 2: Money Laundering Network</i></figcaption>
  </figure>
</div>


### What’s next?
In a future article of our Graph Network blog series, we will dive deeper into how we develop the graph infrastructure and database using AWS Neptune.

Check out the other articles in this series:
* [Graph concepts and applications](/graph-concepts)
* [Graph Networks - 10X investigation with Graph Visualisations](/graph-visualisation)
* [Graph for fraud detection](/graph-for-fraud-detection)


# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
