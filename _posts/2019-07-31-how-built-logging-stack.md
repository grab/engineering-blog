---
layout: post
id: how-built-logging-stack
title: How We Built a Logging Stack at Grab
date: 2019-07-31 11:43:40
authors: [daniel-kasen]
categories: [Engineering]
tags: [Logging]
comments: true
cover_photo: /img/how-built-logging-stack/cover.jpeg
excerpt: "This blog post explains what we did to solve our inhouse logging problem around the lack of visualizations and metrics for our service logs."
---

## Problem

Let me take you back a year ago at Grab. When we lacked any visualizations or metrics for our service logs. When performing a query for a string from the last three days was something only run before you went for a beverage.

When a service stops responding, Grab’s core problems were and are:

*   We need to know it happened before the customer does.
*   We need to know why it happened.
*   We need to solve our customers’ problems fast.

We had a hodgepodge of log-based solutions for developers when they needed to figure out the above, or why a driver never showed up, or a customer wasn’t receiving our promised promotions. These included logs in a cloud based storage service (which could take hours to retrieve). Or a SAS provider constantly timing out on our queries. Or even asking our SREs to fetch logs from the potential machines for the service engineer, a rather laborious process.

Here’s what we did with our logs to solve these problems.

## Issues

Our current size and growth rate ruled out several available logging systems. By size, we mean a LOT of data and a LOT of users who search through hundreds of billions of logs to generate reports. Or who track down that one user who managed to find that pesky corner case in our code.

When we started this project, we generated 25TB of logging data a day. Our first thought was _“Do we really need all of these logs?”_. To this day our feeling is _“probably not”_.

However, we can’t always define what another developer can and cannot do. Besides, this gave us an amazing opportunity to build something to allow for all that data!

Some of our SREs had used the ELK Stack (Elasticsearch / Logstash / Kibana). They thought it could handle our data and access loads, so it was our starting point.

## How We Built a Multi-Petabyte Cluster

### Information Gathering

It started with gathering numbers. How much data did we produce each day? How many days were retained? What’s a reasonable response time to wait for?

Before starting a project, understand your parameters. This helps you spec out your cluster, get buy-in from higher ups, and increase your success rate when rolling out a product used by the entire engineering organization. Remember, if it’s not better than what they have now, why will they switch?

A good starting point was opening the floor to our users. What features did they want? If we offered a visualization suite so they can see ERROR event spikes, would they use it? How about alerting them about SEGFAULTs? Hands down the most requested feature was speed; _“I want an easy webUI that shows me the user ID when I search for it, and get all the results in <5 seconds!”_

### Getting Our Feet Wet

New concerns always pop up during a project. We’re sure someone has correlated the time spent in R&D to the number of problems. We had an always moving target, since as our proof of concept began, our daily logger volume kept increasing.

Thankfully, using [Elasticsearch](https://www.elastic.co/) as our data store meant we could fully utilize horizontal scaling. This let us start with a simple 5 node cluster as we built out our proof-of-concept (POC). Once we were ready to onboard more services, we could move into a larger footprint.

The specs at the time called for about 80 nodes to handle all our data. But if we designed our system correctly, we’d only need to increase the number of Elasticsearch nodes as we enrolled more customers. Our key operating metrics were CPU utilization, heap memory needed for the JVM, and total disk space.

### Initial Design

First, we set up tooling to use [Ansible](https://www.ansible.com/) both to launch a machine and to install and configure Elasticsearch. Then we were ready to scale.

Our initial goal was to keep the design as simple as possible. Opting to allow each node in our cluster to perform all responsibilities. In this setup each node would behave as all of the four available types:

*   Ingest: Used for transforming and enriching documents before sending them to data nodes for indexing.
*   Coordinator: Proxy node for directing search and indexing requests.
*   Master: Used to control cluster operations and determine a quorum on indexed documents.
*   Data: Nodes that hold the indexed data.

These were all design decisions made to move our proof of concept along, but in hindsight they might have created more headaches down the road with troubleshooting, indexing speed, and general stability. Remember to do your homework when spec’ing out your cluster.

It’s challenging to figure out why you are losing master nodes because someone filled up the field data cache performing a search. Separating your nodes can be a huge help in tracking down your problem.

We also decided to further reduce complexity by going with ingest nodes over Logstash. But at the time, the documentation wasn’t great so we had a lot of trial and error in figuring out how they work. Particularly as compared to something more battle tested like Logstash.

If you’re unfamiliar with ingest node design, they are lightweight proxies to your data nodes that accept a bulk payload, perform post-processing on documents,and then send the documents to be indexed by your data nodes. In theory, this helps keep your entire pipeline simple. And in Elasticsearch’s defense, ingest nodes have made massive improvements since we began.

But adding more ingest nodes means ADDING MORE NODES! This can create a lot of chatter in your cluster and cause more complexity when  troubleshooting problems. We’ve seen when an ingest node failing in an odd way caused larger cluster concerns than just a failed bulk send request.

### Monitoring

This isn’t anything new, but we can’t overstate the usefulness of monitoring. Thankfully, we already had a robust tool called Datadog with an additional integration for Elasticsearch. Seeing your heap utilization over time, then breaking it into smaller graphs to display the field data cache or segment memory, has been a lifesaver. There’s nothing worse than a node falling over due to an OOM with no explanation and just hoping it doesn’t happen again.

At this point, we’ve built out several dashboards which visualize a wide range of metrics from query rates to index latency. They tell us if we sharply drop on log ingestion or if circuit breakers are tripping. And yes, Kibana has some nice monitoring pages for some cluster stats. But to know each node’s JVM memory utilization on a 400+ node cluster, you need a robust metric system.

## Pitfalls

### Common Problems

There are many blogs about the common problems encountered when creating an Elasticsearch cluster and Elastic does a good job of keeping [blog posts](https://elastic.co/blog) up to date. We strongly encourage you to read them. Of course, we ran into classic problems like ensuring our Java objects were compressed (Hints: Don’t exceed 31GB of heap for your JVM and always confirm you’ve enabled compression).

But we also ran into some interesting problems that were less common. Let’s look at some major concerns you have to deal with at this scale.

### Grab’s Problems

#### Field Data Cache

So, things are going well, all your logs are indexing smoothly, and suddenly you’re getting Out Of Memory (OOMs) events on your data nodes. You rush to find out what's happening, as more nodes crash.

A visual representation of your JVM heap’s memory usage is very helpful here. You can always hit the Elasticsearch API, but after adding more then 5 nodes to your cluster this kind of breaks down. Also, you don’t want to know what's going on while a node is down, but what happened before it died.

Using our graphs, we determined the field data cache went from virtually zero memory used in the heap to 20GB! This forced us to read up on how this value is set, and, as of this writing, the default value is still 100% of the parent heap memory. Basically, this breaks down to allowing 70% of your total heap being allocated to a single search in the form of field data.

Now, this should be a rare case and it’s very helpful to keep the field names and values in memory for quick lookup. But, if, like us, you have several trillion documents, you might want to watch out.

From our logs, we tracked down a user who was sorting by the _id_ field. We believe this is a design decision in how Kibana interacts with Elasticsearch. A good counter argument would be a user wants a quick memory lookup if they search for a document using the _id_. But for us, this meant a user could load into memory every ID in the indices over a 14 day period.

The consequences? 20+GB of data loaded into the heap before the circuit breaker tripped. It then only took 2 queries at a time to knock a node over.

You can’t disable indexing that field, and you probably don’t want to. But you can prevent users from stumbling into this and disable the _id_ field in the Kibana advanced settings. And make sure you re-evaluate your circuit breakers. We drastically lowered the available field cache and removed any further issues.

#### Translog Compression

At first glance, compression seems an obvious choice for shipping shards between nodes. Especially if you have the free clock cycles, why not minimize the bandwidth between nodes?

However, we found compression between nodes can drastically slow down shard transfers. By disabling compression, shipping time for a 50GB shard went from 1h to 20m. This was because Lucene segments are already compressed, a new issue we ran into full force and are actively working with the community to fix. But it's also a configuration to watch out for in your setup, especially if you want a fast recovery of a shard.

#### Segment Memory

Most of our issues involved the heap memory being exhausted. We can’t stress enough the importance of having visualizations around how the JVM is used. We learned this lesson the hard way around segment memory.

This is a prime example of why you need to understand your data when building a cluster. We were hitting a lot of OOMs and couldn’t figure out why. We had fixed the field cache issue, but what was using all our RAM?

There is a reason why having a 16TB data node might be a poorly spec’d machine. Digging into it, we realized we simply allocated too many shards to our nodes. Looking up the total segment memory used per index should give a good idea of how many shards you can put on a node before you start running out of heap space. We calculated on average our 2TB indices used about 5GB of segment memory spread over 30 nodes.

The numbers have since changed and our layout was tweaked, but we came up with calculations showing we could allocate about 8TB of shards to a node with 32GB heap memory before we running into issues. That’s if you really want to push it, but it’s also a metric used to keep your segment memory per node around 50%. This allows enough memory to run queries without knocking out your data nodes. Naturally this led us to ask “What is using all this segment memory per node?”

#### Index Mapping and Field Types

Could we lower how much segment memory our indices used to cut our cluster operation costs? Using the segments data found in the ES cluster and some simple Python loops, we tracked down the total memory used per field in our index.

We used a lot of segment memory for the _id_ field (but can’t do much about that). It also gave us a good breakdown of our other fields. And we realized we indexed fields in completely unnecessary ways. A few fields should have been integers but were keyword fields. We had fields no one would ever search against and which could be dropped from index memory.

Most importantly, this began our learning process of how tokens and analyzers work in Elasticsearch/Lucene.

#### Picking the Wrong Analyzer

By default, we use Elasticsearch’s Standard Analyzer on all analyzed fields. It’s great, offering a very close approximation to how users search and it doesn’t explode your index memory like an N-gram tokenizer would.

But it does a few things we thought unnecessary, so we thought we could save a significant amount of heap memory. For starters, it keeps the original tokens: the Standard Analyzer would break **IDXVB56KLM** into tokens **IDXVB**, **56**,  and **KLM**. This usually works well, but it really hurts you if you have a lot of alphanumeric strings.

We never have a user search for a user ID as a partial value. It would be more useful to only return the entire match of an alphanumeric string. This has the added benefit of only storing the single token in our index memory. This modification alone stripped a whole 1GB off our index memory, or at our scale meant we could eliminate 8 nodes.

We can’t stress enough how cautious you need to be when changing analyzers on a production system. Throughout this process, end users were confused why search results were no longer returning or returning weird results. There is a nice [kibana plugin](https://github.com/johtani/analyze-api-ui-plugin) that gives you a representation of how your tokens look with a different analyzer, or use the build in [ES tools](https://www.elastic.co/guide/en/elasticsearch/reference/master/_testing_analyzers.html) to get the same understanding.

#### Be Careful with Cloud Maintainers

We realized that running a cluster at this scale is expensive. The hardware alone sets you back a lot, but our hidden bigger cost was cross traffic between availability zones.

Most cloud providers offer different “zones” for your machines to entice you to achieve a High-Availability environment. That’s a very useful thing to have, but you need to do a cost/risk analysis. If you migrate shards from HOT to WARM to COLD nodes constantly, you can really rack up a bill. This alone was about 30% of our total cluster cost, which wasn’t cheap at our scale.

We re-worked how our indices sat in the cluster. This let us create a different index for each zone and pin logging data so it never left the zone it was generated in. One small tweak to how we stored data cut our costs dramatically. Plus, it was a smaller scope for troubleshooting. We’d know a zone was misbehaving and could focus there vs. looking at everything.

## Conclusion

Running our own logging stack started as a challenge. We roughly knew the scale we were aiming for; it wasn’t going to be trivial or easy. A year later, we’ve gone from pipe-dream to production and immensely grown the team’s ELK stack knowledge.

We could probably fill 30 more pages with odd things we ran into, hacks we implemented, or times we wanted to pull our hair out. But we made it through and provide a superior logging platform to our engineers at a significant price reduction while maintaining a stable platform.

There are many different ways we could have started knowing what we do now. For example, using Logstash over Ingest nodes, changing default circuit breakers, and properly using heap space to prevent node failures. But hindsight is 20/20 and it’s rare for projects to not change.

We suggest anyone wanting to revamp their centralized logging system look at the ELK solutions. There is a learning curve, but the scalability is outstanding and having subsecond lookup time for assisting a customer is phenomenal. But, before you begin, do your homework to save yourself weeks of troubleshooting down the road. In the end though, we’ve received nothing but praise from Grab engineers about their experiences with our new logging system.
