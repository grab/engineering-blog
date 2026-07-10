---
layout: post
id: 2026-07-15-our-journey-to-apache-iceberg-adoption
title: "Scaling Grab's Data Lake: Our journey to Apache Iceberg adoption"
date: 2026-07-16 00:00:00
authors: [rahul.penti]
categories: [Engineering]
tags: [Data, Database, Engineering, Apache Iceberg, Spark]
comments: true
cover_photo: /img/journey-to-apache-iceberg/banner-image.png
excerpt: "As Grab's Data Lake grew to petabytes, the limitations of Hive Parquet became clear, from catalog latency and small files to manual partition management. This blog shares our journey adopting Apache Iceberg as our default table format: why we chose it, how we rolled it out at scale, the tooling we built along the way, and the lessons we learned."
---

## Introduction: The evolution of Grab's Data Lake

At Grab's scale, managing petabytes of data across billions of S3 objects demands more than a storage layer. It demands a robust architectural primitive that supports the high-concurrency needs of a modern "Lakehouse." Our goal is full storage-compute separation, leveraging S3 as an elastic foundation for both near-real-time metrics and large-scale batch transformations.

For years, the vast majority of our tables were Hive Parquet, managed through the Hive Metastore with a directory-based layout. This model served us well, but as data volume grew, the directory-and-metastore approach became the limiting factor. We are now transitioning to a table-centric architecture built on modern table formats, treating data as a first-class primitive to ensure consistency and performance across our internal data transformation platforms: Slide, which powers batch transformations, and Hugo, which handles online-to-data-lake ingestion. Along the way, we also built the UnifiedSparkCatalog, a unified Spark catalog that hides table-format differences from users entirely, which we are open-sourcing alongside this post.

## The catalyst for change: Challenges with Hive Parquet

For years, Hive Parquet was the backbone of our Data Lake, representing the vast majority of our tables. However, as data volume scaled, the architectural limitations of directory-based storage became apparent. We identified four primary bottlenecks:

* **Catalog latency:** The Hive Metastore (HMS) became a centralized failure point. High concurrency during metadata access led to O(n) listing overhead, where query planning time scaled linearly with partition count, crippling throughput.
* **The small file problem:** The directory layout left us with severe file fragmentation. Certain Machine Learning (ML) datasets had an average file size under 1 MB, with thousands of files in each partition. At this scale, the overhead of S3 object listing and metadata request latency drove up Application Programming Interface (API) costs and slowed scan operations.
* **Operational toil:** Data engineers faced constant manual overhead for partition registration. Without native ACID support (no native `UPSERT` or `DELETE`), teams relied on complex workarounds to manage data changes carefully.
* **The broken information loop:** A fundamental disconnect existed between the catalog and storage. Because the HMS, not the storage layer, was treated as the source of truth, direct S3 modifications frequently left the catalog stale and out of sync with the actual state on disk.

## Why Iceberg? Strategic alignment and future-proofing

We evaluated several open table formats before selecting Apache Iceberg as our default. The deciding factors came down to community governance, engine compatibility, and long-term flexibility.

Recent industry momentum, including growing cloud-native support for Iceberg, further validates this direction. We are positioning Grab to be format-agnostic in the long term, but Iceberg provides the most mature foundation today.

<div class="post-image-section"><figure>
  <img src="/img/journey-to-apache-iceberg/table-1.png" alt="Comparison of Legacy Hive Parquet and Apache Iceberg" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

## Adopting Iceberg at scale

Migrating an established lake is not a flag flip. Our challenge was rolling out Iceberg across a lake that was overwhelmingly Hive Parquet, queried by many engines and teams, without breaking the downstream consumers that depended on those tables. Rather than converting everything at once, we moved the highest-value tables first. The efficiency gains across our production workloads have been substantial. Here are representative examples:

* **Query performance via Z-ordering:** On a high-traffic navigation dataset, we achieved roughly a **10x improvement in query runtime**. Z-ordering co-locates rows with similar values across specified dimensions, enabling Trino to leverage data skipping and min/max statistics to prune irrelevant files during query planning. This reduced query runtime from 70 seconds to 6 seconds.
* **S3 API cost reduction:** For a heavily queried operations table, daily S3 API costs were reduced by up to 95% with no changes to the queries themselves. Larger file sizes and the elimination of expensive object listing during query planning drove most of the savings.
* **Compute savings:** For a dataset used in funnel analysis, we reduced cluster resource usage by approximately half. A separate ML feature pipeline also improved feature freshness for downstream models.

## The UnifiedSparkCatalog: Making mixed formats transparent

Migrating to Iceberg solved our storage and metadata problems, but it surfaced a new one at the developer-experience layer. Modern table formats like Delta, Iceberg, and Hudi each implement their own custom catalog that extends Spark's `SessionCatalog`. In a standard Spark runtime, only one catalog implementation can be set as the default `spark_catalog`. Supporting additional formats requires explicit catalog declarations, meaning users must reference tables with format-specific prefixes like `iceberg_catalog.schema.table` or `delta_catalog.schema.table`.

With Iceberg, Delta, Hudi, and Hive tables now coexisting and tables actively migrating between formats, this created two problems: engineers had to know the underlying format of every table they queried, and any format migration silently broke every downstream query that hardcoded a prefix.

The UnifiedSparkCatalog is our answer. It is a unified Spark catalog that abstracts the complexity of working with mixed table formats so users never need to think about which format a table uses. We took inspiration from Trino's Table Redirection, a feature that transparently points a query at the right connector when a table's format differs from the catalog it was queried through. Our Spark equivalent works as follows:

### How it works

1. **Table detection:** The catalog loads metadata from the Hive Metastore.
2. **Format identification:** A `TableTypeDetector` utility identifies the format based on metadata properties (e.g., the `provider` field) or path-based inference.
3. **Operation routing:** The catalog delegates the operation to the correct format-specific catalog (Iceberg's `SparkCatalog`, Delta's `DeltaCatalog`, etc.) without requiring any prefix from the user.

### Key design decisions

* **Lazy initialization:** Catalogs for each format are initialized only when first needed, reducing startup overhead. If a format's JAR is missing from the classpath, initialization continues gracefully. The catalog simply skips that format rather than failing the entire session.
* **Naming as `spark_catalog`:** The catalog reports its name as `spark_catalog` because Spark treats this name specially for legacy Hive Data Manipulation Language (DML) operations. Many internal Spark code paths check for this exact name to determine whether to use Hive-compatible logic for inserts, updates, and deletes. Using any other name would break legacy Hive table operations.
* **Catalog reuse:** Before creating a new catalog instance, the system checks whether one already exists in Spark's catalog manager. This preserves compatibility with plugins like OpenLineage, which inspect catalog class types for lineage extraction.
* **Fallback behavior:** If a table is not found in the expected format-specific catalog, the system falls back to the base session catalog, ensuring robust behavior for standard Hive tables.

We are open-sourcing UnifiedSparkCatalog alongside this blog post. The code and documentation are available [here](https://github.com/grab/unified-spark-catalog).

## Lessons learned and overcoming hurdles

Scaling Iceberg across a large ecosystem revealed several technical nuances:

* **Hive lock contention:** We encountered "zombie locks" in the HMS that blocked commits. We traced this to a low read timeout on the metastore side under high load. Adjusting retry intervals and increasing the timeout resolved the issue.
* **Timestamp handling:** Spark 3.4 introduced `TIMESTAMP_NTZ` (no time zone), while Iceberg defaults to `TIMESTAMP_LTZ` (local time zone). This caused compatibility issues with legacy Hive views. We resolved it through a custom migration workflow and targeted patches to our Trino deployment to ensure consistent casting.
* **Storage tier costs:** Generating Iceberg metadata involves reading historical data, which can trigger a one-time cost spike as files move between S3 storage tiers. To manage this, we prioritize migrations based on a table's scan frequency and API operation costs rather than migrating the entire lake at once.

## Conclusion: The road ahead

Apache Iceberg is now foundational to Grab's data strategy. It is the default format for Slide and Hugo, and adoption is expanding across our compute platforms.

Looking forward, we are experimenting with **Storage Partitioned Joins** to eliminate shuffle stages in Spark and monitoring the **Apache XTable** project to maintain interoperability between formats. Our journey does not end with adoption. We will continue contributing back to the ecosystem, starting with the upcoming release of the UnifiedSparkCatalog.

**Acknowledgments:** This journey was made possible by the dedicated efforts of the Data Engineering, Infrastructure, and Search & Personalization teams at Grab.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
