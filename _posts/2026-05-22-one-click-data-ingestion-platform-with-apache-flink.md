---
layout: post
id: 2026-05-22-one-click-data-ingestion-platform-with-apache-flink
title: "The Hugo Evolution: Engineering Grab's Unified, One-Click Data Ingestion Platform with Apache Flink"
date: 2026-05-22 00:23:00
authors: [hung.nguyenphi, hung.tran, shikai.ng, shuguang.xiang]
categories: [Engineering, Data]
tags: [Database, Hugo, FlinkSQL]
comments: true
cover_photo: /img/flink-in-hugo/banner-image.png
excerpt: "At Grab, we're transforming data ingestion and processing with Hugo, our self-service data platform. Now integrated with Apache Flink, Hugo empowers teams to build real-time data pipelines effortlessly. Discover how we've streamlined complex processes into a single, one-click experience that boosts productivity and enables rapid insights. Dive into our blog to explore this game-changing evolution!"
---

## Introduction

Data drives every decision we make at Grab. As our operations scale, so does our need for robust, real-time data ingestion and processing frameworks. Enter Hugo: our self-service data platform that has long empowered teams to seamlessly route data into our Data Lake. Today, Hugo is evolving. We have taken previously siloed onboarding workflows and transformed them into one seamless, unified journey to truly democratize data ingestion and maximize efficiency.

In this blog, we’ll share how Hugo turns complex engineering hurdles into a frictionless, self-service reality. By moving away from siloed workflows, we’ve achieved a unified pipeline experience where one-click RDS CDC and self-service Kafka ingestion are the new standard.

## Background

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-1.png" alt="" style="width:60%"><figcaption align="middle">Figure 1. Hugo ingests data from every source into Grab's data lake.</figcaption>
  </figure>
</div>

Hugo was originally designed as a self-service platform for batch-oriented data ingestion into the Data Lake, built on a single computation engine — Spark. It provided a centralized and streamlined onboarding experience for data sources such as MySQL, Aurora, PostgreSQL, and DynamoDB.

As the organization’s data platform evolved toward near [real-time ingestion](https://engineering.grab.com/real-time-data-ingestion), Hugo expanded to support streaming pipelines from Kafka and CDC binlog. This evolution introduced a more distributed architecture, where ingestion workflows spanned multiple systems, including Kafka Connect, Sprinkler (an in-house Go-based S3 writer), and Hugo.

## The siloed past: A multi-platform hurdle

While powerful, the expanded architecture introduced significant onboarding friction. Creating a single data pipeline now requires users to coordinate across multiple platforms, each with its own configuration model and operational semantics. As a result, the onboarding journey became fragmented and difficult to navigate, especially for new users.

A common challenge emerged during onboarding: users struggled to understand how configurations mapped across systems. For example, after setting up a Kafka Connect job, users frequently asked, *“I have already configured Kafka Connect — what values do I need to provide in Hugo?”* This highlighted a lack of clear abstraction between systems, forcing users to manually bridge conceptual and operational gaps.

The end-to-end setup often required specialized knowledge across three distinct systems:

* **Kafka Connect**: for source configuration.
* **Sprinkler8**: for streaming ingestion handling.
* **Hugo**: for pipeline orchestration and validation.

This multi-step, cross-system dependency increased cognitive load, slowed down onboarding, and created coordination overhead between platform teams and users.

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-2.png" alt="" style="width:100%"><figcaption align="middle">Figure 2. Data ingestion with the legacy CDC pipeline.</figcaption>
  </figure>
</div>

## The Hugo Evolution: A Unified Ingestion Platform

Our answer to legacy complexity was to engineer a new, deeply automated ingestion framework within Hugo. The true paradigm shift wasn't just adopting Apache Flink, but building a custom automation layer that integrates it directly with our core infrastructure—Heimdall for lifecycle management and Khone for resource provisioning.

By unifying workflows under this single framework, we successfully retired Sprinkler8 and Kafka Connect. This transformation turned artisanal, manual work into a streamlined, self-service experience where our custom automation acts as the intelligent chassis for a seamless user journey.

### The Hugo Ingestion Architecture: Engineering a Unified Flow

#### 1. One-Click MySQL CDC Pipelines

We have completely reimagined the Change Data Capture (CDC) journey. What was once a multi-day hurdle is now a one-minute task.

* **Fully automated**: A single click triggers Hugo to validate database prerequisites, provision right-sized resources, and manage the entire backfill process without manual intervention.
* **Zero downtime**: The transition from Kafka Connect-based CDC pipelines to Flink-based CDC pipelines has zero downtime to downstream users.
* **Schema reconciliation**: We engineered a custom schema reconciliation layer within the Spark compaction process to automatically resolve breaking schema changes introduced by a Debezium upgrade in our Flink CDC architecture.

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-3.png" alt="" style="width:100%"><figcaption align="middle">Figure 3. Data ingestion with the new CDC pipeline.</figcaption>
  </figure>
</div>

#### 2. Self-Service Kafka Ingestion

We have eliminated the need for code-based workflows and GitLab Merge Requests.

* **Click-to-query**: Engineers can now ingest streaming data from Kafka topics into queryable Hive tables via a few clicks in the Hugo UI.
* **Orchestrated flow**: The platform automatically handles the multi-stage background work—from Flink consumption and S3 writing to Spark compaction—ensuring data is query-optimized and ready for use immediately.

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-4.png" alt="" style="width:100%"><figcaption align="middle">Figure 4. Data ingestion with the Kafka-to-Hive pipeline.</figcaption>
  </figure>
</div>

## Impact

The platform's new onboarding workflow has significantly reduced a previously multi-day process to mere minutes, enabling faster iteration and improving overall onboarding efficiency. This dramatic change has fundamentally altered how our teams interact with data.

| **Pipeline Type** | **Onboarding Time** |
| --- | --- |
| Kafka Hive Flink | ~6 minutes |
| MySQL Hive CDC Flink | ~3 minutes |

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-5.png" alt="" style="width:90%"><figcaption align="middle">Figure 5. Kafka Flink.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-6.png" alt="" style="width:90%"><figcaption align="middle">Figure 6. CDC Flink.</figcaption>
  </figure>
</div>

The onboarding workflow is intentionally designed with early validation guardrails to proactively surface prerequisite and governance-related issues before pipeline creation proceeds.

* For Kafka sources, user drop-offs between the “Create Kafka Source” and “Kafka Sink” stages are primarily driven by validation checks such as topic ownership verification and topic activity requirements, for example topics with zero message volume. Additional drop-offs between the “Kafka Sink” and “Create Source Pipeline” stages typically occur when the proposed output table name already exists in the data lake, preventing duplicate table creation.

* For MySQL sources, drop-offs are mainly associated with unmet database onboarding prerequisites, including credential setup, binlog user configuration, binlog format requirements, and binlog expiration settings.

In addition, the streamlined self-service experience encourages exploratory usage, allowing teams to familiarize themselves with the onboarding workflow and platform capabilities before fully committing to pipeline creation.

## Summary

The new architecture engineered a custom automation layer that successfully retired the reliance on Kafka Connect and Sprinkler8 for the data lake, turning artisanal work into a streamlined, one-click experience. This transformation provides a direct boost to developer productivity.

The key impact metrics are:

* **Onboarding time reduction**: The time required to set up data pipelines has been dramatically reduced and is now measured in minutes.
  * **Kafka pipelines**: approximately 6 minutes.
  * **MySQL CDC pipelines**: approximately 3 minutes.
* **Adoption**: Since the release, the number of new Kafka and CDC pipelines onboarded in the last year is more than the total number of pipelines onboarded in the previous five years.

## What’s Next

These enhancements are just one step in our broader vision for optimized and self-service data ingestion. Currently, Flink is the default only for Kafka source pipelines. Flink onboarding for MySQL CDC pipelines is impact and cost-driven, as we have not proven the cost of making Flink the default for all ingestion. Our strategic roadmap includes:

* **Next-Generation Formats:** We are investigating the adoption of Apache Iceberg as the data lake table format to further improve pipeline SLA and costs, and improve performance.
* **Seamless Schema Evolution:** Schema changes are operationally painful for pipeline owners. Altering MySQL tables or Kafka Protobuf schemas currently risks manual intervention and data loss. We aim to make schema evolution a zero-touch experience in Hugo by automatically detecting changes, validating compatibility, and updating tables without disruption.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://grab.careers/)!
