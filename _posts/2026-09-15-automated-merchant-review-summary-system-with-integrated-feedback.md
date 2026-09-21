---
layout: post
id: '2026-09-15-automated-merchant-review-summary-system-with-integrated-feedback'
title: 'Automated merchant review summary system with integrated feedback'
date: 2026-09-21 00:00:00
authors: [chengju.zhou, shlok.jain, yanye.li, waiteng.tang, thinh.leduc]
categories: [Engineering]
tags: [Artificial Intelligence, LLM]
comments: true
cover_photo: /img/automated-merchant-review/banner-img.png
excerpt: "The Automated Merchant Review Summary System provides concise, AI-generated summaries of merchant reviews on Grab, helping consumers make informed decisions without reading extensive feedback while giving merchants actionable insights from customer feedback."
---

## Introduction

Merchant reviews contain useful details about food quality, portion size, packaging, and value. Finding these details often requires reading many comments. Aggregate ratings simplify comparisons, but they do not explain what shaped each score.

We built the Automated Merchant Review Summary System to turn written reviews into concise summaries. Consumers can scan an overall summary or focus on a specific topic. Merchants can identify what customers value and which parts of the experience need attention.

## Problem statement

A long, unstructured list of reviews creates two related problems. Consumers spend time searching for comments that match their priorities, while merchants must combine individual comments to identify recurring themes.

Consumers may see hundreds or thousands of reviews for a merchant. Reading only the first few can produce an incomplete picture, while the aggregate star rating provides little context. Two restaurants with the same rating may differ in food quality, delivery experience, portion size, or value.

Merchants face a related problem. Reading and classifying every review takes time, and the task becomes harder as review volume grows. Recurring complaints and positive patterns can remain hidden among individual comments.

## Existing approaches

### Manual review analysis

Consumers and merchants can read reviews one by one and form their own conclusions. Their conclusions depend on which reviews they read and how they interpret them. This method becomes impractical as review volume grows.

### Aggregate star ratings

An average score quickly indicates customer opinion but does not explain the reasons behind it. A merchant can see overall performance but not the themes that may require attention.

### Keyword search and filtering

Keyword search helps readers who already know what to look for. It does not reveal unexpected themes, and literal matching may separate phrases with the same meaning. For example, "too cold", "not warm enough", and "lukewarm" all describe a food-temperature issue.

## Our solution

The system uses representative sampling, large language model (LLM) summarisation, automated quality checks, and consumer feedback. It generates an overall summary and topic-based summaries for areas such as taste, packaging, and portion size.

The pipeline has three flows:

* **Summary generation and validation:** The pipeline samples reviews, generates overall and topic-based summaries, and checks whether the source reviews support each claim.
* **Summary maintenance:** The system monitors new reviews and consumer feedback, then regenerates a summary when either reaches a configured threshold.
* **Summary display and feedback:** The interface retrieves a validated summary for the merchant's review page and records whether consumers found it helpful.

### Architecture

The generation pipeline prepares the source reviews, produces summaries, and validates the output before publication.

<div class="post-image-section"><figure>
  <img src="/img/automated-merchant-review/figure-1.png" alt="" style="width:90%"><figcaption align="middle">Figure 1. Representative review sampling flow.</figcaption>
  </figure>
</div>

**Data preparation and representative sampling:** The pipeline calculates the merchant's rating distribution. A sentiment model assigns each written review a score from one to five. Stratified sampling then selects a smaller set of reviews that follows this distribution, reducing the chance that one rating group dominates the summary.

**Summary generation with an LLM:** The system sends the sampled reviews to an LLM with instructions to produce:

* A concise summary of the sampled reviews.
* Topic-based summaries for categories such as taste, packaging, and portion size.

The system can update the topic set when new themes appear in consumer feedback.

<div class="post-image-section"><figure>
  <img src="/img/automated-merchant-review/figure-2.png" alt="" style="width:80%"><figcaption align="middle">Figure 2. Summary generation, validation, and feedback flow.</figcaption>
  </figure>
</div>

**Quality control (QC) with an LLM:** A second LLM receives the generated summary and the sampled reviews. It checks whether the reviews support each claim. The system discards summaries that fail this check and stores those that pass.

The maintenance flow updates stored summaries in response to incoming reviews and consumer feedback:

* **New-review trigger:** A monitoring service counts reviews submitted after the latest summary. When the count reaches a configured threshold, the service starts the generation and validation flow.
* **Consumer-feedback trigger:** The interface records whether consumers found a summary helpful. When negative feedback reaches a configured threshold, the system generates and validates a new summary.

<div class="post-image-section"><figure>
  <img src="/img/automated-merchant-review/figure-3.png" alt="" style="width:80%"><figcaption align="middle">Figure 3. Consumer feedback analysis and prompt refinement flow.</figcaption>
  </figure>
</div>

### Impact

Review summaries give consumers less text to scan when comparing merchants. Topic-based summaries reveal details that an aggregate rating cannot show. For merchants, the summaries make recurring positive and negative themes easier to identify.

The quality-control step rejects unsupported claims. The regeneration triggers incorporate new reviews and consumer feedback into later summaries.

## Learnings and conclusion

Useful review summaries depend on more than generation quality. The source sample must reflect the intended population, each claim must remain grounded in source reviews, and the output must change with the underlying feedback.

Representative sampling, separate generation and validation stages, and feedback-based regeneration form a complete system for maintaining merchant review summaries.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
