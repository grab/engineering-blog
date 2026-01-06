---
layout: post
id: 2026-01-09-kinabalu-ai-sre 
title: 'Kinabalu AI SRE - Leveraging AI for scalable diagnostics and alert management (Part 1)'
date: 2026-01-09 00:23:00
authors: [david-khu, jolin-zhou, ruike-zhang, ziqin-yeow]
categories: [Engineering]
tags: [Database, FLinkSQL]
comments: true
cover_photo: /img/kinabalu-ai-sre/banner.jpg
excerpt: "Grab is redefining how engineers respond to operational incidents by introducing Kinabalu AI Site Reliability Engineering (AI SRE); an AI-assisted platform that brings together fragmented context, automates reasoning, and accelerates the path from alert to action. As we have scaled across transport, deliveries, and financial services, we've encountered new complexities that present us with opportunities to innovate and improve our troubleshooting processes. This article explores why we built Kinabalu AI SRE, the design principles and engineering decisions behind it, and how it’s transforming incident response for teams across Grab."
---

## Introduction

If you’ve ever been on-call during an outage, you know the drill: a flood of alerts, five dashboards open, logs streaming from different places, a dozen threads in Slack, and still no clear picture. Context-switching kills velocity, and “where do I even start?” becomes the default question.

Kinabalu AI Site Reliability Engineering (AI SRE for short) is our attempt to flip this experience. It aggregates the right context in one place, reasons over it with assistive AI agents, and helps us go from alert to action, fast.

Target audience:

* On-call engineers and incident commanders.   
* Service owners validating health, dependencies, and changes.   
* SRE/platform teams standardizing triage and root cause analysis (RCA) quality.

## Background

Incidents today suffer from several issues, including alert overload, fragmented context across tools, slow RCA, operational redundancy from tool-hopping, and scattered runbooks that are hard to find and apply under pressure. 

AI SRE solves these issues by serving a unified view that streamlines diagnostics and correlates signals to recommend the best next actions. This approach accelerates response time, further reducing time-to-resolution (TTR), lowers cognitive load of on-calls by keeping all relevant context in one place, and strengthens collaboration through evidence-backed updates and clear ownership.

## A typical user journey

Kinabalu’s AI SRE is a 24/7 automator reachable via Slack and a Web UI. It takes input in the form of an automated alert or a direct question and responds with an evidence-backed, actionable insight. 

In a hypothetical user journey with AI SRE, the process might begin with a trigger. For instance, if a monitoring alert is triggered by a 5 times increase in a Datadog report and increasing latency for a service, AI SRE initiates an incident thread and gathers the initial context.

The following components of AI SRE are then executed in sequence:

**Component 1**: Auto-triage with context from incident records, tagging on severity, priority, owner/oncall, as well as issue types.

**Conponent 2**:  AI SRE (static diagnostics) establishes correlations by
  - Metrics and dashboards: analyzes recent deltas and compares against time-of-day/week baselines. 
  - Dependencies: checks upstream/downstream services to separate causes from symptoms. 
  - Changes: retrieves recent deployments, config updates, and feature-flag flips. 
  - Logs: clusters error signatures and tracks frequency shifts. 
Delivers an incident summary with actionable insights, aRCA draft, and concrete recommendations (queries to run, rollback/feature-flag options, runbook links).

**Component 3**: Dynamic conversation.
- Conversational follow-up where user enters questions in Slack, such as “List owners for impacted services”, or “Compare p95 across top markets.” AI SRE replies with evidence-backed answers and links for drill-down.

## Architecture

Under the hood, the backend combines a central signal aggregator with Model Context Protocol (MCP) servers for instant search, and a Large Language Model (LLM) powered intelligence layer that analyzes signals to auto-triage incidents and produce actionable insights.


<div class="post-image-section"><figure>
  <img src="/img/kinabalu-ai-sre/figure-1.png" alt="" style="width:100%"><figcaption align="middle">Figure 1. SRE AI architecture.</figcaption>
  </figure>
</div>


### Signal aggregator: Context engineering

We follow a Retrieval Augmented Generation (RAG) approach and are building a knowledge graph that stitches together incident signals across the stack. The aggregator ingests the information as follows:

* Datadog (metrics, monitors)  
* Kibana/Elasticsearch (logs)   
* Grafana (dashboards)  
* Hystrix (circuit state)  
* GitLab/Jira (changes/issues)  
* CI/CD and deployment metadata  
* Service/product catalog (ownership, dependencies)

With this context, AI SRE agents can provide a clear view of what changed, when, and who owns it, making incident understanding and debugging faster and more reliable, in a near-real-time manner.

<div class="post-image-section"><figure>
  <img src="/img/kinabalu-ai-sre/figure-1.png" alt="" style="width:100%"><figcaption align="middle">Figure 2. Examples of signal aggregation for building context.</figcaption>
  </figure>
</div>


### Unified intelligence - an agentic approach

Agents can basically “normalize” the alerts and signals, meaning they standardize and interpret them for better understanding. They can semantically search through historical changes that can explain current symptoms, correlate co-occurring signals, and surface likely causes. 

AI SRE uses frameworks of SuperAgent and A2A multi-agent to analyze incidents with two workflows, and these two workflows can co-exist. 

* For static diagnosis, a separate flow collects all data and logs for services via the MCP toolkit and sends them to A2A multi-agents for a deep-dive investigation.  
* For dynamic analysis, SuperAgent uses the MCP toolkit to investigate and pull real-time data.  

#### Static diagnosis

The Static diagnostics workflow starts with a trigger from Slack or the Web UI and ends with a comprehensive service health report. It coordinates six domain-specific sub-agents encompassing the areas of incident management, deployment, application, database, infrastructure, and external APIs. Each sub-agent pulls the relevant signals and runs targeted checks, producing detailed findings. The supervisor then synthesizes these into an investigation-ready brief. The brief contains a concise summary of suspects and blast radius, timeline, and recommended next steps. The briefs are grounded in logs and metrics, so engineers can quickly understand the impact and move toward resolution.


<div class="post-image-section"><figure>
  <img src="/img/kinabalu-ai-sre/figure-3.png" alt="" style="width:100%"><figcaption align="middle">Figure 3. Examples of static diagnosis by AI SRE.</figcaption>
  </figure>
</div>
 

#### Dynamic chat

Users can inquire via Slack or the Web UI to receive an immediate, evidence-supported action plan. Examples of such questions include:
* “How many recent deployments touched the food service?”  
* “How many Terraform changes in the past 5 minutes?”

Powered by our SuperAgent and MCP tool layer, Dynamic chat queries live systems such as metrics, logs, deploy history, and configs. It then returns cited data, comparisons, and next-best actions. On-call engineers can diagnose issues and pull logs on the fly, before escalating actions (e.g., open a ticket, compare regions, list owners, suggest rollbacks). It’s human-in-the-loop (HITL) by design.




<div class="post-image-section"><figure>
  <img src="/img/kinabalu-ai-sre/figure-4a.png" alt="" style="width:70%"><figcaption align="middle">Figure 4. Examine related deployments within the same time frame.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/kinabalu-ai-sre/figure-4b.png" alt="" style="width:70%"><figcaption align="middle">Figure 5. Analyze Splunk or DataDog alerts to identify the root cause of an issue.</figcaption>
  </figure>
</div>
 

### MCP toolkit

The Kinabalu MCP Toolkit serves as a universal integration layer that empowers AI SRE by unifying 25 operational tools into a single, consistent interface. This comprehensive toolkit spans six key domains:

* Incident and communications: Manages historical incidents, Slack thread context, and ticketing.
* Internal platforms: Includes changelogs, experiments, rollout history, and automated analyses.
* Knowledge and AI: Facilitates enterprise document search/chat and unstructured data analysis.
* Service and configuration: Offers topology and configuration introspection.
* Observability: Provides insights through metrics, logs, and profiling.
* Deployment: Tracks recent releases and commit history.

The Kinabalu MCP Toolkit is designed to provide AI SRE with a 360 degree view of incidents, significantly accelerating root-cause discovery and response.

## Conclusion

Our journey highlights the importance of structured context, robust diagnostic layers, and hybrid AI models for dependable incident automation. With Kinabalu AI SRE, we’re moving toward an ecosystem where alerts are normalized, evidence is automatically synthesized, and engineers can focus on higher level decision-making rather than firefighting.

Stay tuned for part 2, where we will cover the challenges, design decisions, and lessons that shaped Kinabalu AI SRE.  

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!

