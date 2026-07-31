---
layout: post
id: 2026-07-30-crowdsourced-taxonomy-verification
title: "Crowdsourced taxonomy verification: A feedback-driven framework for refining knowledge graph relationships via online search interactions"
date: 2026-07-30 00:00:00
authors: [junpeng.niu, jian.lai, xiaoxue.zhang, wenqing.chen]
categories: [Engineering]
tags: [Engineering, Data, Search, Machine Learning, LLM, Graphs]
comments: true
cover_photo: /img/crowdsource-taxonomy/banner-img.png
excerpt: "Knowledge graphs power modern search and recommendation systems, but automated construction methods can introduce semantic inaccuracies. This framework verifies KG relationships in real time by injecting candidate edges into live search results and using user feedback to validate semantic truth."
---

## Introduction

The efficacy of semantic search relies on the accuracy of the underlying Knowledge Graph (KG). In high-velocity domains like on-demand food delivery or e-commerce, the catalog of entities like dishes, products, and merchants changes rapidly.

Current methods for KG construction and maintenance face three critical challenges:

* **Inaccuracy and hallucination from Large Language Models (LLMs)**: Automated models often infer relationships based on statistical text co-occurrence rather than semantic reality. For instance, an LLM might incorrectly classify "Pho" as a child of "Italian Noodle Soup" due to linguistic similarity, leading to irrelevant search results.

* **Scalability limits of manual verification**: Traditional verification relies on human annotators or domain experts. This approach is slow, expensive, and unable to keep pace with dynamic catalogs containing millions of entities. For example, daily changes in restaurant menus or grocery stock keeping units (SKUs).
* **Error propagation in ranking**: Inaccurate graph edges propagate errors downstream. If a parent-child relationship is wrong, query expansion algorithms will retrieve irrelevant items, directly degrading Click-Through Rate (CTR) and user trust.

We introduce a **feedback-driven verification engine** that operationalizes the search interface as a validation environment. Key contributions include:

* **User feedback-driven verification**: The system treats unverified graph edges as hypotheses. Instead of accepting them as truth, it tests them against live traffic by injecting them into search suggestions and measuring user engagement.  
     
* **Hierarchical relationship refinement**: Unlike systems that only validate entities (nodes), this framework validates structural links (edges). It confirms whether entity A is truly a parent, child, or sibling of entity B, ensuring structural integrity.  
     
* **Adaptive exploration**: The system employs a greedy exploration policy. It intelligently balances exploitation by showing known good results with exploration through injecting unverified candidates to gather data without degrading the user experience.

## Background

Automated KG construction using LLMs and unstructured content extraction can scale quickly across large, dynamic catalogs. However, relationships inferred from text co-occurrence or vector similarity do not always reflect semantic reality. Manual verification by domain experts remains accurate but does not scale to millions of entities that change daily.

When inaccurate edges enter the graph, ranking and query expansion systems propagate those errors to users. Incorrect parent-child or sibling links lead to irrelevant search results, reduced CTR, and lower user trust. An additional solution is required that can validate graph structure continuously, at scale, without relying solely on manual curation.

## Solution

The overall workflow of this invention is shown in the following figure. The details of each step are explained in this section.


<div class="post-image-section"><figure>
  <img src="/img/crowdsource-taxonomy/figure-1.png" alt="" style="width:80%"><figcaption align="middle">Figure 1. The system architecture.</figcaption>
  </figure>
</div>

The proposed framework functions as a closed-loop validation ecosystem. It is composed of four integrated modules designed to continuously cycle data from the KG to the user interface and back, using real-world interactions to separate semantic truth from artificial intelligence (AI) hallucinations.

The verification process follows a continuous, iterative loop that cycles data from the backend graph to the frontend user interface and back. This four-step procedure operationalizes the human-in-the-loop validation mechanism:

1. Hypothesis generation   
2. Candidate injection   
3. Signal aggregation and scoring  
4. Graph update logic 

## Architecture details

### KG core

The central repository acts as the source of truth, storing entities such as dishes, products, or merchants, and the connections between them. To manage the verification process, the system introduces a specialized metadata layer that classifies every connection (or edge) into one of two distinct states:

*  **Verified edges:** These are established relationships that have been validated either by high historical traffic or human confirmation. They represent the safe structure of the graph. For example, "Sushi" is definitely a child of "Japanese Cuisine", and is used to power standard search results.  
* **Candidate edges:** These are probabilistic, unverified relationships generated by automated LLMs or content scrapers. They are treated as hypotheses waiting to be proven. For example, if an LLM ingests a blog post and predicts that "Pho" is related to "Italian Noodle Soup," this link is stored as a candidate edge, invisible to the main search algorithm until validated.

### Search and injection module

This module sits between the KG and the user, intercepting the query execution pipeline. Unlike standard ranking algorithms, which strictly optimize for relevance by showing only the best results, the injection engine employs a balanced strategy known as exploration vs. exploitation.

* **The injection mechanism:** When a user performs a search, the system retrieves a list of high-confidence results (exploitation). Simultaneously, it deliberately retrieves a small subset of candidate edges related to the query. It injects these unverified candidates into specific, lower-risk slots within the user interface, such as the third or fourth position in a related searches chip carousel.  
* **Risk management:** To prevent user frustration, the system limits the number of candidates shown per session. This ensures that the user is primarily served helpful, verified content, while still providing enough data points to test new hypotheses.

### Behavior tracking module

To accurately measure whether a candidate relationship is valid, the system tracks user micro-interactions with high granularity. It captures not just the final click, but the precise context in which the interaction occurred to determine semantic intent.

* **Contextual anchoring**: The system logs the specific search term, also known as the **anchor**, used by the user. A click on "Pho" is only counted as a vote for the relationship if the user was searching for "Noodle Soup" at the time.  
* **Signal classification**: Signals are assessed in aggregate to estimate the relevance of a candidate relationship. Higher-intent engagement contributes stronger positive evidence, lighter exploratory behavior contributes weaker positive evidence, and lack of engagement or explicit negative actions contributes negative evidence.

### Verification and refinement engine

This is an offline processing unit that acts as the final judge. It aggregates thousands of individual user signals to update the topology of the KG.

**Relevance scoring**: Instead of complex formulas, the engine calculates a simple confidence ratio. It looks at the total number of times a candidate was shown versus the number of positive interactions it received.

**Graph topology updates**:

* **Promotion (verify)**: If the confidence ratio exceeds a verification threshold. For example, if the candidate performs as well as known good items, the edge is upgraded from candidate to verified. It becomes a permanent part of the graph and is shown to all users.  
* **Demotion (prune)**: If the candidate consistently fails to garner engagement or receives negative signals, it falls below a pruning threshold. The system automatically deletes this edge, effectively correcting the AI's hallucination and cleaning the dataset.

## Implementation

### Hypothesis generation

The process begins by identifying a target subject, referred to as the anchor entity. For example, the specific dish "Pho". The system queries the KG to retrieve a set of potential relationships. This retrieval includes both verified neighbors, where relationships are already confirmed by experts, and candidate neighbors, where the relationships are predicted by AI models but not yet proven.

### Candidate injection

Once a hypothesis is selected, the system exposes it to real users to gather evidence. When a user actively searches for the anchor entity, the system dynamically injects the candidate neighbor into the search results.

* **User interface (UI) implementation:** The candidate is presented alongside verified items, typically in a related categories carousel or a refine search chip list. This reflects standard relevance experimentation in search, with safeguards to ensure the experience remains controlled and measurable.  
* **Exposure logging:** The system logs an impression event specifically linking the anchor to the candidate. This record serves as the baseline, documenting that the user saw the relationship, which is essential for calculating future engagement rates.

### Signal aggregation and scoring

Instead of using a raw count of clicks, the system calculates a sophisticated relationship confidence score by aggregating user interactions over time. This scoring model uses a weighted tier system to distinguish between casual interest and strong intent.

* **Weighted interaction logic**: The system assigns a higher value to actions that require more effort or commitment. For example, a “Purchase” or “Add-to-Cart” action is weighted significantly heavier than a simple click, as it indicates a strong validation of the relationship. Conversely, scrolling past the item quickly or skipping is treated as a negative signal.  
* **Normalization**: To ensure fairness, the total weighted score is normalized against the total number of times the candidate was shown. This prevents niche items with low total traffic but high accuracy from being unfairly penalized.

#### Graph update logic 

Periodically, the verification engine evaluates the confidence score against predefined benchmarks to update the KG's topology. This is a binary decision process:

* **Validation (cementing the edge)**: If the accumulated confidence score exceeds a strict validation threshold, the system concludes that the relationship is genuine. The status of the edge is updated from candidate to verified. This permanently adds the relationship to the graph, ensuring it appears in future standard searches without the need for further testing.  
* **Rejection (pruning the edge)**: Conversely, if the score falls below a rejection threshold, indicating that users consistently ignore or reject the suggestion, the system concludes the relationship is an AI hallucination. The edge is severed or removed from the graph. This pruning action cleans the dataset, preventing the system from making the same bad recommendation again.

#### Case study: hierarchical refinement in food delivery

To demonstrate the framework, consider a validation scenario in food delivery taxonomy. An LLM-based ingestion pipeline flags a candidate parent-child link  
**Noodle Soup → Dry Mee Pok** and stores it as an unverified candidate edge in the KG, ready for live validation.

**User-triggered validation**:

When a user searches for "Noodle Soup," the search module injects the candidate alongside verified results. For example, in a "Refine by Dish" filter carousel, and logs an impression linking the anchor query to the candidate.

**Outcome collection**:

User interactions like clicks, dwell time, scroll behavior, and conversions are captured and weighted over the validation window. The verification engine aggregates these signals and updates the graph: relationships that meet the validation threshold are promoted to verified status; those that fail are pruned or re-mapped to a more appropriate parent node.

## Impact

By injecting unverified candidate edges into live search results and recommendation interfaces via a multi-armed bandit (MAB) exploration strategy, the system leverages implicit user feedback to validate semantic truth. This dynamic, human-in-the-loop mechanism effectively prunes erroneous connections and reinforces accurate taxonomies without the need for manual curation, significantly enhancing search relevance in dynamic domains such as food delivery and retail.

The case study demonstrates how the framework validates candidate relationships through live user traffic, collecting interaction signals and updating the graph without manual curation.

## Learnings and conclusion

The feedback-driven verification engine operationalizes the search interface as a validation environment for KG relationships. By classifying edges as verified or candidate, injecting candidates through an exploration vs. exploitation strategy, and aggregating weighted user signals, the system promotes accurate relationships and prunes AI hallucinations at scale.

Unlike approaches that validate only entities, this framework validates structural links, confirming whether entity A is truly a parent, child, or sibling of entity B. The food delivery case study shows how a user-triggered search can initiate validation and outcome collection at scale, without manual intervention.

## What's next

**Hierarchical confidence tiers**

To safely graduate new connections into the production graph, we are introducing a dual-measurement trust system that requires both volume and variety before a new connection goes live: support mass (product hits, graph depth, recency) and corroboration (unique sessions, anonymous cohorts, and temporal spread). Connections must climb a strict state machine: **proposed → shadow eligible → canary eligible → production**, advancing only when both metrics meet progressively higher thresholds; if a snapshot causes metrics to fall below a tier’s floor, the connection is automatically demoted.

**Adversarial and spam resistance**

To prevent bad actors, bots, or highly repetitive users from manipulating the search graph, we are building a multi-layered defense system. We enforce per-merchant rate limits and anti‑abuse controls: hourly caps per session/device, exponential backoff for rapidly repeated actions, and a short (few‑hour) freeze of promotions from any user cohort after declines or “irrelevant” signals. For bot and Sybil attack defense, traffic flagged by abuse systems is excluded from trust calculations (but logged for analysis); votes must come from diverse network subnets or cohort buckets, and each bucket is subject to a daily contribution cap.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility, and digital financial services sectors. Serving over 900 cities in eight Southeast Asian countries: Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam. Grab enables millions of people every day to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. We operate supermarkets in Malaysia under Jaya Grocer and Everrise, which enables us to bring the convenience of on-demand grocery delivery to more consumers in the country. As part of our financial services offerings, we also provide digital banking services through GXS Bank in Singapore and GXBank in Malaysia. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line. We aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://grab.careers/)!
