---
layout: post
id: 2022-06-30-graph-visualisation
title: Graph Networks - 10X investigation with Graph Visualisations
date: 2022-06-30 00:20:55
authors: [fujiao-liu, shuqi-wang, muqi-li, jia-chen]
categories: [Engineering, Security, Data Science]
tags: [Security, Graphs concepts, Graph technology, Graph visualisation]
comments: true
cover_photo: /img/graph-visualisation/cover.png
excerpt: "As fraud schemes get more complex, we need to stay one step ahead by improving fraud investigation methods. Read to find out more about graph visualisation, why we need it and how it helps with uncovering patterns and relationships."
---

## Introduction

Detecting fraud schemes used to require investigations using large amounts and varying types of data that come from many different anti-fraud systems. Investigators then need to combine the different types of data and use statistical methods to uncover suspicious claims, which is time consuming and inefficient in most cases.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/image1.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

We are always looking for ways to improve fraud investigation methods and stay one step ahead of our ever-growing fraudsters. In the [introductory blog](https://engineering.grab.com/graph-networks) of this series, we’ve mentioned experimenting with a set of Graph Network technologies, including Graph Visualisation.

In this post, we will introduce our Graph Visualisation Platform and briefly illustrate how it makes fraud investigations easier and more effective.

## Why visualise a graph?

If you’re a fan of crime shows, you would have come across scenes like a detective putting together evidence, such as pictures, notes and articles, on a board and connecting them with thumb tacks and yarn. When you look at the board, it’s easy to see the relationships between the different pieces of evidence. That’s what graphs do, especially in fraud detection.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/image6.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

In the same way, while graph data is the raw material of an investigation, some of the most interesting relationships are often inferred rather than modelled directly in the data. Visualising these relationships can give a unique "big picture" of the data that is difficult or impossible to obtain with traditional relational tables and business intelligence tools.

On the other hand, graph visualisation enhances the quick identification of relationships and significant structures because it is an intuitive way to help detect patterns. Plus, the human brain processes visual information much faster; that’s where our Graph Visualisation platform comes in.

## What is the Graph Visualisation platform?

Graph Visualisation platform is a full-featured investigation platform that can reveal hidden connections and context in data by transforming raw records into highly visual and interactive maps. From there, investigators can grab any data point and quickly see relationships, patterns, and anomalies, and if necessary, drill down to investigate further.

This is all done without writing a manual query, switching between anti-fraud systems, or having to think about data science! These are some of the interactions on the platform that easily make anomalies or relevant patterns stand out.

### Expanding the data

To date, we have over three billion nodes and edges in our storage system. It is not possible (nor necessary) to show all of the data at once. The platform allows the user to grab any data point and easily expand to view the relationships.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/expand-data.gif" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

### Timeline tracking and history replay

The Graph Visualisation platform’s interactive time filter lets you see temporal relationships within your data and clearly reveals the chronological progression of events. You can start with a specific time of interest, track everything that happens after, then quickly focus on the time and relationships that matter most.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/data-replay.gif" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

## 10X investigations

Here are a few examples of how the Graph Visualisation platform facilitates fraud investigations.

### Appeal confirmation

The following image shows the difference between a true fraudster and a falsely identified one. On the left, we have a Grab rental corporate account that was falsely detected by a fraud rule. Upon review, we discovered that there is no suspicious connection to this account, thus the account got unblocked.

On the right, we have a passenger that was blocked by the system and they appealed. Investigations showed that the passenger is, in fact, part of an extremely dense device-sharing network, so we maintained our decision to block.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/image5.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

### Modus operandi discovery

#### Passenger sharing device

Fraudsters tend to share physical resources to maximise their revenue. With our Graph Visualisation platform, you can see exactly how this pattern looks like. The image below shows a device that is shared by a lot of fraudsters.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/image4.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

#### Anti-money laundering (AML)

On the left, we see a pattern of healthy spending on Grab. However, on the right, we can see that passengers are highly connected, and it has frequent large amount transfers to other payment providers.

<div class="post-image-section"><figure>
  <img src="/img/graph-visualisation/image2.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

## Closing thoughts

Graph Visualisation is an intuitive way to investigate suspicious connections and potential patterns of crime. Investigators can directly interact with any data point to get the details they need and literally view the relationships in the data to make fast, accurate, and defensible decisions.

While fraud detection is a good use case for Graph Visualisation, it’s not the only possibility. Graph Visualisation can help make anything more efficient and intelligent, especially if you have highly connected data.

In the next part of this blog series, we will talk about the Graph service platform and the importance of building graph services with graph databases. Check out the other articles in this series:
* [Graph Networks - Striking fraud syndicates in the dark](/graph-networks)
* [Graph concepts and applications](/graph-concepts)

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
