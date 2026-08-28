---
layout: post
id: 2026-08-28-data-mesh-at-grab-part-three
title: 'Data Mesh at Grab (Part III): Operationalizing data reliability with automated DPIs'
date: 2026-09-04 00:00:00
authors: [harvey.li, shuguang.xiang, ziqin.yeow, feng.cheng]
categories: [Engineering]
tags: [Data, Database, Engineering, Data Quality, Observability]
comments: true
cover_photo: /img/datamesh-three/banner-img.png
excerpt: "Make data reliability as dependable as running water. Learn how Grab operationalises this vision using automated Data Production Issues (DPIs) to convert data contract breaches into structured, actionable workflows. By closing the loop from detection to recovery, DPIs ensure certified data products remain trusted at scale."
---

## Introduction

In the [first](https://engineering.grab.com/signals-market-place) [two parts of this series](https://engineering.grab.com/data-mesh-part-2-the-foundational-tools-behind-certification), we described how Grab approaches data mesh through the Signals Marketplace: a way for teams to publish, discover, and reuse trusted data products across domains. [Part II](https://engineering.grab.com/data-mesh-part-2-the-foundational-tools-behind-certification) introduced the foundational tools behind certification: Hubble for metadata and ownership, Genchi for data quality observability, and the Data Contract Registry for explicit producer-consumer guarantees.

Certification is the starting point for a trusted data marketplace. It gives downstream consumers confidence in an asset's ownership, documentation, lineage, and quality controls. Certification does not eliminate runtime failure. A certified table can still arrive late. A certified metric can still be affected by a broken dependency. A certified Kafka stream can still violate a freshness expectation.

Keeping certified data products reliable in production requires more than defining standards upfront. Teams need a consistent way to detect failures, diagnose the root cause, fix the issue, and verify recovery. That is where *Data Production Issues* (DPIs) come in. At Grab, DPIs turn data quality signals into an operational workflow.

## The DPI lifecycle

A good DPI should be clear enough to act on, and it should close automatically when the underlying condition recovers. From the beginning, we designed the DPI lifecycle to be automated, with minimal human-in-the-loop.

The lifecycle starts when *Kinabalu,* Grab's incident orchestrator, observes that a data asset may no longer satisfy its contract. The contract captures the reliability expectations that matter for the asset, along with the health checks, exposed through Test Health application programming interfaces (APIs), that evaluate those expectations.

The orchestrator stays decoupled from platform internals. It does not need to know how each platform computes freshness, completeness, or other quality dimensions. It only needs to ask whether the relevant contract tests are healthy. If one or more contract tests are unhealthy, the contract is considered breached, and the DPI lifecycle begins.

<div class="post-image-section"><figure>
  <img src="/img/datamesh-three/figure-1.png" alt="Diagram of the automated Data Production Issue workflow from contract-test evaluation through triage, diagnosis, resolution, and close." style="width:70%"><figcaption align="middle">Figure 1. Automated DPI workflow.</figcaption>
  </figure>
</div>


## Triaging DPIs: From alerts to confirmed contract breaches

Data platforms emit many alerts. An Airflow schedule may be delayed, a data quality test may fail, or a pipeline job may exit unexpectedly. These alerts are useful, but they are not automatically DPIs. Triage decides whether an alert represents a real contract breach for a data asset.

As introduced in [Part II](https://engineering.grab.com/data-mesh-part-2-the-foundational-tools-behind-certification), a data contract is an explicit, versioned agreement between a data producer and its consumers. It outlines the data's schema, freshness, completeness, and other semantic guarantees. These guarantees are codified and enforced through data quality tests in Genchi.

When the incident orchestrator evaluates contract tests, it distinguishes an individual test run result from the overall health of a test. A test run can pass or fail at a point in time, but the test itself may only be considered healthy after the underlying issue has been fully resolved. For example, consider a completeness test that checks whether the T-1 daily partition is complete. If the test failed two days ago but passed yesterday and today, the test may still be considered unhealthy until the partition from two days ago has been backfilled and verified as complete.

The orchestrator also deduplicates around the active unhealthy condition. If an asset already has an open DPI for the same breach, new signals update the existing DPI with additional context rather than creating parallel issues. DPIs that share the same underlying root cause can also be grouped. This keeps responders focused on solving the underlying issue rather than chasing a stream of repetitive alerts.

During triage, the workflow also gathers context for the DPI: affected asset, breached contract, unhealthy tests, data interval, and upstream and downstream dependencies. Not every alert becomes a DPI. Triage protects the operational workflow from noise by promoting only meaningful contract breaches into production issues.

## Diagnosing DPIs: Assigning owners with root cause analysis (RCA)

Once a DPI is created, the system must answer *why the data is unhealthy, who should fix it, and how.*

Not every data issue should be assigned to the data asset owner. A data product may be unhealthy because of a platform incident, a failed producing job, or a delayed upstream dependency. Assigning every issue to the asset owner creates unnecessary handoffs and slows down resolution.

This is where the Data Health API matters. It answers the question: "What kind of failure made this asset unhealthy?" The Data Health API keeps the error taxonomy small:

* `UPSTREAM_ERROR`: the asset is unhealthy because an upstream dependency is late, failed, or unavailable.
* `PLATFORM_ERROR`: the asset is unhealthy because the underlying platform or infrastructure is impaired.
* `JOB_ERROR`: the asset is unhealthy because the producing job or pipeline failed.
* `DATA_ERROR`: the asset is unhealthy because the produced data violates quality expectations.

The taxonomy is not meant to replace platform-specific diagnostics. The high-level Data Health API gives the orchestrator just enough structure to assign DPIs and manage their lifecycle consistently. An ingestion platform, streaming platform, metrics platform, or machine learning (ML) platform can still maintain detailed internal error catalogs, logs, retry states, and debugging tools. Platforms remain free to evolve their internals, while the incident orchestrator consumes a stable API contract, so the DPI workflow can interoperate across heterogeneous systems.

A simplified Data Health API response might look like this:

*Disclaimer: The fields in this API response are mock data generated for demonstration purposes and do not represent real operational metrics.*

```json
{
  "assetId": "urn:li:dataset:(urn:li:dataPlatform:hive,schema.table_A,PROD)",
  "healthStatus": "UNHEALTHY",
  "errorCategory": "UPSTREAM_ERROR",
  "context": {
    "upstreamAsset": "urn:li:dataset:(urn:li:dataPlatform:hive,schema.table_B,PROD)",
    "reason": "upstream data has not arrived for the expected data interval."
  },
  "lastCheckedAt": "2026-06-15T08:30:00Z"
}
```

From this response, the orchestrator can see that table_A is unhealthy because of an upstream dependency rather than a problem in the asset itself. It then traces the active DPI for the upstream asset and links the table_A DPI to that upstream issue. The downstream DPI can inherit the same owner as the upstream DPI, keeping related failures grouped under the team best positioned to resolve the root cause.

The DPI process works only when the issues it raises can be assigned and fixed. If DPIs are frequently noisy, duplicated, or difficult to act on, users will eventually learn to ignore them. Diagnostic accuracy matters because it keeps DPIs useful for the people who receive them. It also creates a forcing function for each data-producing platform to improve its diagnostics. To produce accurate RCA, platforms need to incorporate signals from their dependencies and surrounding systems, not just their own local failure state.

Grab operationalizes DPI diagnosis across its internal data platforms. Our ingestion platform, *Hugo*, is a primary example of this approach, as outlined in a previous [tech blog](https://engineering.grab.com/improving-hugo-stability). Hugo's intelligent diagnosis architecture uses a three-layered system to automatically detect, analyze, and troubleshoot data pipeline failures within its domain, as shown in Figure 2.

<div class="post-image-section"><figure>
  <img src="/img/datamesh-three/figure-2.png" alt="Diagram of Hugo's three-stage diagnosis architecture: signal collection, alert diagnosis, and diagnosis result." style="width:70%"><figcaption align="middle">Figure 2. Hugo diagnosis architecture.</figcaption>
  </figure>
</div>

Modern data platforms generate alerts from many independent systems. Individually, these signals show only a partial view of a dataset. Hugo consolidates platform-specific signals into a unified diagnostic workflow to pinpoint root causes and recommend pipeline remediations. The diagnosis architecture consists of three stages:

1. **Signal collection** collects events from multiple signal sources to build a full view of the dataset and pipeline health.
2. **Alert diagnosis** creates a structured alert context, classifies the alert, routes it to the appropriate diagnoser, and identifies the root cause using specialized diagnosis logic.
3. **Diagnosis result** persists the structured diagnosis output, including the identified root cause, affected dataset, and recommended fix or action.

For example, when a dataset fails, the workflow orchestrator notifies Hugo with a job failure event. Hugo then routes the alert to its internal diagnostic layer to check for conditions such as upstream database replica lag, storing both the diagnosis and recommended fix alongside the affected dataset.

Decoupling signal ingestion, diagnosis, and result management makes it straightforward to add new signal sources and specialized diagnosers. Immediate RCA removes the need for manual log inspection, which shortens remediation and feeds directly into automated resolution workflows.

## Resolving DPIs: Auto-healing first, human judgment when needed

After triage and RCA, the final stage of the DPI lifecycle is resolution. The lifetime of a DPI is a proxy for data downtime: it begins when a contract breach is detected and ends when the affected dataset becomes healthy again. Reducing that window requires more than identifying the correct issue. It also depends on recovering safely and consistently from recurring failure modes.

Many incidents are routine and recoverable, such as transient compute interruptions, database connection timeouts, S3 throttling, or upstream pipelines that are delayed rather than permanently broken. Instead of relying on manual intervention for every incident, Hugo automates recovery for these well-understood failure patterns. Once the diagnosis workflow identifies the root cause, it produces a structured diagnosis result containing the affected dataset, the root cause, and the recommended resolution strategy. The auto-resolution workflow then consumes this result to execute the appropriate remediation automatically. Figure 3 shows Hugo's auto-resolution architecture in two stages.

<div class="post-image-section"><figure>
  <img src="/img/datamesh-three/figure-3.png" alt="Diagram of Hugo's auto-resolution architecture, covering resolution execution plus notification and audit." style="width:70%"><figcaption align="middle">Figure 3. Hugo auto-resolution architecture.</figcaption>
  </figure>
</div>

1. **Resolution execution** applies the recommended resolution strategy, such as retrying a failed job, waiting for an upstream dependency, or executing a custom resolver. After the action completes, the system verifies both pipeline health and data correctness to confirm the issue has been fully resolved. If a failure cannot be resolved safely through automation, such as in cases of data corruption, invalid records, or application code defects, the workflow escalates the incident for human intervention.

2. **Notification and audit** records every resolution attempt and its outcome, while notifying the appropriate engineering teams. That record supports operational analysis, auditing, and later improvements to resolution policies.

For example, a dataset may miss its freshness Service Level Agreement (SLA) because the workflow orchestrator becomes temporarily unresponsive and fails to submit the scheduled ingestion job. The diagnosis workflow identifies the incident as a pipeline execution failure and recommends a retry strategy. Hugo automatically retries the job, verifies that the pipeline completes and data health is restored, then logs the recovery and notifies the responsible team. This end-to-end process, from incident detection to resolution, runs automatically without manual intervention.

Hugo closes the loop between detection, diagnosis, and recovery. Rather than stopping at identification, the platform turns diagnosis results into targeted remediation, so routine operational issues can be resolved automatically while preserving human oversight for complex or high-risk incidents. Separating diagnosis from execution also lets new diagnosis capabilities and resolution strategies evolve independently without changing the overall architecture.

The impact is already evident in production. 86.9% of DPI incidents were automatically resolved, significantly reducing manual operational effort. By automating routine recoveries, engineers spend less time performing repetitive operational tasks and more time building new platform capabilities, while overall data downtime is significantly reduced.

## Conclusion

Certified data products still need to prove their reliability in production. Freshness delays, upstream failures, platform incidents, and data quality violations can all break consumer trust, even when an asset has already met certification standards.

Automated DPIs are the operating model for managing these failures. By turning contract breaches into structured production issues, the DPI lifecycle makes data reliability operational: triage separates real breaches from alert noise, diagnosis identifies the likely failure domain, ownership routing reduces handoffs, and resolution closes the loop through auto-healing or human intervention when needed.

The most important outcome is not simply that issues are detected faster. It is that data downtime becomes visible, measurable, and reducible. With every DPI tracked from detection to recovery, teams can understand where time is spent, which failure modes repeat, and where automation can safely reduce operational toil. To date, more than 95% of DPIs are raised automatically rather than by humans, with a mean time to resolve (MTTR) that is 6 times faster for automated DPIs than for manually raised ones.

For Grab, this shifts data reliability from reactive firefighting to a managed production workflow. Automated DPIs help keep trusted data products trustworthy after certification, so downstream teams can depend on them with greater confidence.

## What's next

Across the three-blog series, the story is how Grab turns data mesh from an operating principle into an artificial intelligence (AI)-ready foundation for the company.

* **Part I: Building trust through certification.** Grab needed the Signals Marketplace because the business had scaled across mobility, deliveries, financial services, and many data-producing domains. The old model of relying on a central Data Engineering team could no longer keep up. Certification became the mechanism for making high-quality data products visible, reusable, and accountable. With clear ownership, data contracts, and measurable adoption, Grab moved more consumption toward trusted assets, reduced duplication, and created stronger incentives for teams to curate the data they publish.

* **Part II: The foundational tools behind certification.** Trust becomes operational through platforms. Hubble covers discovery, lineage, ownership, and the certification engine. Genchi runs continuous data quality observability across freshness, completeness, schema, and business-rule checks. The Data Contract Registry formalizes producer-consumer expectations as versioned, enforceable contracts. Combined, these systems keep data certification an actively maintained standard rather than a static label.

* **Part III: Operationalizing data reliability with automated DPIs.** Certification tells consumers which data products should be trusted; DPIs keep that trust true in production. Kinabalu evaluates contract breaches, deduplicates noisy alerts, assigns ownership, and tracks recovery. Data Health APIs make RCA portable across platforms, while Hugo's diagnosis and auto-resolution patterns show how common failures can be remediated faster and with less operational toil. The result is a measurable reduction in time to resolve and a stronger feedback loop back into certification.

The bigger takeaway is that Grab's data moat is not just the volume of data we have. It is the system that makes our data trustworthy, discoverable, reusable, and continuously reliable. This foundation is what lets us embrace the agentic world: AI agents can search certified assets, reason over contracts and lineage, trust quality signals, detect production issues, draft RCA, and eventually suggest or execute safe remediation. In that world, data reliability becomes a compounding advantage. The better our foundations are, the more confidently Grab can build agentic experiences on top of them.


<small class="credits">We would like to thank all the data practitioners across Grab, including engineers and analysts to data scientists and product teams,  who have invested in certification, contracts, and data quality to build a solid foundation for AI agents and AI-powered experiences. We are equally grateful for the unwavering sponsorship, strategic guidance, and hands-on support from our leadership (Mohan Krishnan and Nikhil Dwarakanath), without which this long-term data foundation initiative would not have been possible.</small>

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
