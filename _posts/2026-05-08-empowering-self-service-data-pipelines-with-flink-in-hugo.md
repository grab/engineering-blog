---
layout: post
id: 2026-05-08-empowering-self-service-data-pipelines-with-flink-in-hugo
title: 'Empowering self-service data pipelines with Flink in Hugo'
date: 2026-05-08 00:23:00
authors: [hung.nguyenphi, hung.tran, shikai.ng, shuguang.xiang]
categories: [Engineering, Data]
tags: [Database, Hugo, FlinkSQL]
comments: true
cover_photo: /img/flink-in-hugo/banner-image.png
excerpt: "At Grab, we're transforming data ingestion and processing with Hugo, our self-service data platform. Now integrated with Apache Flink, Hugo empowers teams to build real-time data pipelines effortlessly. Discover how we've streamlined complex processes into a seamless, one-click experience, boosting productivity and enabling rapid insights. Dive into our blog to explore this game-changing evolution!"
---

## Introduction

At Grab, data is the lifeblood of decision-making. As we scale our operations, the need for robust, real-time data ingestion and processing frameworks has become paramount. Hugo, our self-service data platform, has been instrumental in enabling teams to ingest data from various sources into the Data Lake. Now, with the integration of Apache Flink, Hugo is evolving to support real-time data processing, empowering users to build and manage their pipelines with minimal latency and maximum reliability.

This blog outlines the journey of empowering self-service data pipelines within Hugo by utilizing Apache Flink for data ingestion into the Lake. We will explore how Hugo leverages Flink to address critical challenges, including supporting diverse sources like Relational Database Service (RDS) and Apache Kafka, enabling auto schema evolution through integration with the schema registry, and implementing reactive scaling based on Kafka throughput.

## Background

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-1.png" alt="" style="width:60%"><figcaption align="middle">Figure 1. Data ingestion with Hugo.</figcaption>
  </figure>
</div>
 
Hugo was originally designed to facilitate self-service ingestion of data from RDS, DynamoDB, and Coban archives (Coban is a team and platform within Grab that focuses on real-time data streaming and processing) into the Data Lake. Initially, this focused on traditional, batch-oriented ingestion. 

Our journey with Apache Flink began as our data needs evolved toward near real-time analytics. To achieve this, we introduced Apache Hudi as our near-real-time table format, and Flink was the clear choice for a powerful streaming engine to write to it. While developing the automation for this advanced Flink-to-Hudi pipeline, we had a breakthrough. We realized that the robust automation framework we built could be repurposed to revolutionize our most common ingestion path to Apache Hive (Hive) as well. 

This led us to expand Flink's role, using it to replace older, more complex systems like Kafka Connect (KC) and Sprinkler. By adapting the automations created for a specific use case, we were able to create a single, unified, and dramatically simplified self-service experience for all data ingestion, fulfilling our core mission on a whole new level.

Several strategic goals drove the integration of Flink into Hugo:  

* **Self-service user journey:** Enhancing Flink pipeline onboarding so that onboarding for MySQL or Kafka sources has been reduced from several days to a single minute with one button click in the Hugo user interface (UI). Users without knowledge of Flink configurations or Kafka schema can onboard pipelines with a few button clicks.  
* **Stability and reliability:** Automating processes like binary log (binlog) offset management for Flink Change Data Capture (CDC) pipelines to reduce manual intervention and avoid backfills.   
* **Expansion and adoption:** Migrating legacy pipelines to Flink for improved performance and cost efficiency. 

## From friction to flow: Overcoming our legacy data hurdles

Our goal has always been to empower our teams with easy-to-use, self-service data tools. Before our recent updates, however, creating a new data pipeline was a complicated and slow process. It involved many manual steps across different systems, which meant that setting up a single pipeline could take several days and had a high risk of errors.

* **The context-switching of Hive CDC pipelines**: To capture data changes from a database, an engineer had to piece together a solution across multiple UIs. This involved setting up a KC connector, then moving to a different platform to configure Sprinkler8 (Sprinkler8 is a pipeline framework used for deploying and managing data streams used within Grab's data infrastructure), and finally returning to Hugo to enable the pipeline, all while performing manual validation at each stage. It was a disjointed process that demanded specialized knowledge of three different systems; it was more an issue of disjointed platform journeys, and what we did here was to unify it.  

* **The "some assembly required" Hive Kafka pipelines**: Ingesting data from Kafka required service users to make manual code changes to vend their deployment pipelines. An engineer had to leave the data platform, clone a GitLab repository to manually write and submit pipeline configurations, and then oversee the deployment themselves. This wasn't a streamlined workflow; it was a "some assembly required" kit with a high margin for error. Furthermore, teams were also responsible for the self-management of the entire schema evolution process, which involved updating Protocol Buffers (protobuf) schema, updating the binary, and redeploying the binary.  

* **The lack of self-service for Hudi Tables (CDC and Kafka)**: Without self-service automation, creating a near-real-time Hudi table was less like engineering and more like artisanal craftsmanship. For every single table, an engineer had to perform a checklist of fragile, error-prone tasks: manually generating schemas, submitting code changes, requesting network rule updates, writing custom Apache Spark Structured Query Language (Spark SQL) for table creation, setting up freshness data quality tests, and then hand-scheduling separate jobs for compaction, cleaning, and metadata registration.

Ultimately, these weren't just technical hurdles; they were significant barriers to productivity. The sheer overhead of this manual work placed a heavy burden on our engineering teams and slowed the delivery of data-driven insights to the business.

## The Flink integration: A paradigm shift

Our answer to this complexity was to engineer a new, deeply automated ingestion framework for Hugo. To be clear, the true paradigm shift was not simply adopting Apache Flink, but rather building this new automation layer on top of it.

A direct comparison between a Vanilla Flink implementation and our legacy Sprinkler8 system would not show much improvement. The primary reason Sprinkler8 was lagging was its lack of integration with Grab's core infrastructure platforms, such as Heimdall for orchestration and Khone for infrastructure provisioning.

Our key innovation was developing a new framework that tightly integrates a data processing engine with these internal platforms. For the engine, we chose the powerful open-source framework, Apache Flink. This new automation layer, built by our team, now handles the entire pipeline lifecycle from provisioning and deployment to monitoring, and directly addresses the shortcomings of our previous setup.

In essence, while Flink is the powerful engine, our custom automation is the intelligent chassis that delivers a seamless, one-click experience. This is more than just a technical upgrade; it's a complete reimagining of our data pipeline experience. Here’s a look at the powerful new functionalities that turn these principles into reality:

### One-click MySQL Hive CDC ingestion pipelines: From days to a minute

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-2.png" alt="" style="width:60%"><figcaption align="middle">Figure 2. Enabling CDC with one click.</figcaption>
  </figure>
</div>

We have completely reimagined the CDC onboarding experience.

* **Simplified journey**: The previously multi-day setup for a CDC pipeline using KC has been streamlined into a process that now takes only one minute. This is accomplished with a single button click in the Hugo UI. Behind this click, a fully automated workflow sets up the Flink pipeline, manages the entire data backfill process, and enables CDC without any data loss or disruption to the pipeline's SLA.  
* **Built-in validation**: To ensure success, Hugo automatically validates all prerequisites on the source database, including essential binlog settings and vault configurations required for Flink to operate.  
* **Schema compatibility**: For migrating users, Flink CDC maintains the same schema as the legacy KC-based CDC. 

### Automating Kafka Hive ingestion pipelines: The end of manual configuration

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-3.png" alt="" style="width:60%"><figcaption align="middle">Figure 3. Creating a sink from Kafka to Data Lake table with one click.</figcaption>
  </figure>
</div>

In addition to database sources, Hugo also handles the ingestion of streaming data from an Apache Kafka topic into a queryable Hive table in our data lake. 

* **Effortless onboarding**: The previous workflow, using our legacy Sprinkler8 framework, was a multi-day, code-based process that required engineers to submit and review merge requests (MRs) in GitLab. We have replaced this entirely. Now, the new Flink-based process accomplishes this in just a few clicks directly within the Hugo UI.  

* **Seamless background automation**: Behind every click, Hugo orchestrates a complete, multi-stage workflow. It first deploys a Flink pipeline to consume from Kafka and write data as Avro files to our data lake. Immediately after, it launches a compaction job to convert those files into query-optimized Parquet, making them available in the final Hive table.  

* **Intelligent prerequisites**: The system validates prerequisites on the Kafka source before starting the process, ensuring that there is active data traffic and that the topic's schema is correctly registered.

### Near real-time analytics with Apache Hudi (Kafka and MySQL CDC ingestion)

Enabling immediate, data-driven decisions requires fresh data. To that end, Hugo now supports Apache Hudi as a first-class citizen, offering near real-time data access.

* **20-minute data freshness**: Teams can now create Hudi tables that refresh every 20 minutes, a significant improvement over the previous one-hour delay with standard Hive tables. This enables use cases that require near-real-time data analytics on the data lake.  
* **Expanded source support**: Hudi tables can be created directly from both Kafka streams and MySQL (CDC) sources, providing flexibility for various data ingestion patterns.  
* **Assured data quality**: We have integrated table validation support in Genchi, our data quality platform, to ensure Hudi tables meet predefined quality checks before processing.  
* **Informed cost decisions**: While Hudi provides faster access, it incurs higher operational costs. To maintain transparency, the Hugo UI now includes a cost comparison feature between Hive and Hudi, empowering users to make informed decisions based on the return on investment (ROI) of their use case.

## Impact

With the current workflow, the onboarding time has been reduced significantly.

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/table.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-4.png" alt="" style="width:80%"><figcaption align="middle">Figure 4. Kafka Flink onboarding time.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-5.png" alt="" style="width:80%"><figcaption align="middle">Figure 5. CDC Flink onboarding time.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/flink-in-hugo/figure-6.png" alt="" style="width:80%"><figcaption align="middle">Figure 6. Hudi onboarding time.</figcaption>
  </figure>
</div>


Despite what appears to be a high drop-off rate, this does not necessarily indicate that users are unable to onboard their pipelines. Many users initiate the process simply to explore the workflow before fully committing to creating a pipeline.

This transformation from a multi-day process to one that completes in mere minutes has fundamentally changed how our teams interact with data, enabling them to move from idea to insight faster than ever before.

While our onboarding success rate is high, we analyzed user drop-off points to better understand and improve the user experience. We found that most drop-offs are not due to system failures, but are the result of built-in guardrails or user exploration:

* **Permission checks**: In some cases, users attempt to create a pipeline for a Kafka topic they do not own. Our system correctly prevents this as a governance and security measure.  

* **Missing schema registration**: A common reason for stopping is that the source Kafka topic does not have a schema registered in our schema registry. This is a mandatory prerequisite that our system validates. To address this, we have developed clear tooling and documentation to guide users through the schema registration process *before* they begin pipeline creation in Hugo.  

* **User exploration**: The simplicity of the new UI encourages users to explore the workflow without fully committing to creating a pipeline. This "window shopping" is a sign of a successful, low-friction self-service tool.

## Looking ahead: The future of Flink in Hugo

These enhancements are just one step in our broader vision to establish Flink as the default, optimized, and self-service framework for all data ingestion and processing at Grab. Our strategic roadmap includes:

* **Expansion and adoption**: Building on the success of having migrated 100% of our legacy KC-based CDC pipelines to Flink, our next major focus is migrating the remaining legacy Sprinkler8 pipelines. In parallel, we are actively working to expand our CDC capabilities to new database sources, with support for PostgreSQL (Postgres) planned for the near future.  

* **Lightweight extract, transform, and load (ETL) with Flink Structured Query Language (FlinkSQL)**: We are exploring the possibility of leveraging FlinkSQL to empower users to perform lightweight ETL directly within their Hugo pipelines. While this could unlock powerful new transformation capabilities, we are carefully considering the support model to manage potential query complexity.  

* **Next-generation formats**: We are investigating the adoption of Apache Iceberg as a data lake table format to further reduce latency and improve performance.  

* **Enhanced developer experience**: Our goals include streamlining schema evolution management and further automating database configuration for CDC to simplify prerequisite steps.

## Conclusion

The integration of Flink into Hugo represents a transformative step in our mission to democratize access to real-time data. By replacing fragmented and manual legacy systems with a unified framework, we have successfully addressed our core goals of improving reliability and enabling true self-service. What once required days of developer-centric work across multiple platforms has been transformed into a simple, automated experience. The introduction of one-click CDC pipelines, effortless Kafka ingestion, and the new capability of self-service Hudi tables are all testaments to this achievement.

This is more than a platform improvement; it's a direct boost to developer productivity and project velocity. By providing a faster, simpler, and more reliable path to data, we empower our teams to build and innovate more efficiently. We are excited to see how our users leverage these new capabilities and look forward to continuing this journey of innovation.  

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://grab.careers/)!
