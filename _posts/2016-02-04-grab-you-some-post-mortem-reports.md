---
layout: post
id: grab-you-some-post-mortem-reports
title: Grab You Some Post-Mortem Reports
date: 2016-02-04 03:46:00
authors: [lian-yuanlin]
comments: true
---

Grab adopts a Service-Oriented Architecture (SOA) to rapidly develop and deploy new feature services. One of the drawbacks of such a design is that team members find it hard to help with debugging production issues that inevitably arise in services belonging to other stakeholders.

This can generally be credited to unfamiliarity with code and architecture from other teams. On top of regular alignment meetings, post-mortem reports end up becoming the glue that adheres the different engineering teams together in understanding problems that arise in the monolithic architecture we have.

Given the importance of such reports, it was surprising to find numerous incidents recorded as shown:

> [2015-02-02][11pm] XXX Service Went Down
>
> At 23:00 hrs, we experienced downtime in XXX service. We looked through the logs and found a bug in DB connections leading to memory leaks.
>
> XXX Service team has pushed a fix and the problem is resolved.

Let's highlight some of the problems with the example given above:

1. It provides zero context. We know nothing of how the service is designed.
2. There is no explanation of what the bug was and how the code was fixed to prevent engineers from committing the same mistake again.
3. We have zero information on the downtime and impact on production.
4. The lack of chronological records undermine the efforts to improve our response procedures and timing.
5. Most importantly, there is nothing detailing the investigation process. An engineer from another team reading it, is just as clueless as before; they have learnt nothing about diagnosing problems on said service.

We have henceforth distilled the benchmark for Grab Engineering post-mortem reports down to 4 requirements: **Chronology**, **Context**, **Empowerment**, **Solutions**.

### Chronology

A timeline detailing each event is required to track the response time and downtime impact. It becomes incredibly handy in ironing out bottlenecks in our pager processes while highlighting any design flaws in the metric alerts.

### Context

Adequate information about the inner workings of the service should be provided. Instead of "found a bug in DB connections", a better sentence would be:

> "XXX service connects to a master DB through the use of a pool of recycled connections. Code added in commit `abc1234` [link to git commit] introduced a bug where used connections were not being recycled..."

Readers would then be able to read the code with a clearer understanding of how the bug was causing the production issues. We leave the amount of details to the writer's own fuzzy discretion.

### Empowerment

The report should make any engineer reading it feel empowered in helping out with future issues. We break down the approach into several components:

<u>Blameless</u> - Reports are supposed to be beneficial to the overall ops efficiency. Nothing demoralises an engineer as quickly as having his name tagged to an issue for eternity.

<u>Educational</u> - Reports should act as a tutorial guide to solving production problems. Most people know how to grep logs, but only those with experience know what exactly to grep. A step by step display of how problems are diagnosed and the conclusions they lead to, should be recorded.

### Solutions

After the above information has all been fleshed out, problems and bottlenecks should be listed out with possible solutions to them. We divide the problems into 3 separate sections.

<u>People</u> - This is generally a list of communication inhibitions amongst teams. Any practice that is currently leading to potential miscommunications should be removed or improved upon.

<u>Product</u> - Are the services not designed to be sufficiently robust? Is the amount of metric alerts and error triggers currently set up sufficient, or can we do better?

<u>Process</u> - More than often, process problems arise when there is a flaw in how various teams approach an issue. Some examples:

a. Engineer A discovers root of problem but has to await Engineer B to approve of the hotfix. However, B is unavailable, leading to unnecessary extended downtime.

b. Heavy reliance on a single party to execute certain operations. Said party experiences network issues and no one else is able to help.

tl;dr Here is what we believe an example template report should look like:

> ### Post Mortem Report - 20160201
>
> **Initial Symptoms**
>
> XXX metric alert was triggered at XX:XX hours. Notifications were sent to all on-call personnel.
>
> **Timeline**
>
> 10:00 - CPU Utilization hit 95%
>
> 10:01 - XXX metric alert triggered
>
> 10:02 - First on-call response acknowledges alert. Begins investigation.
>
> .
>
> .
>
> .
>
> 10:05 - Issue resolved
>
> **Investigation**
>
> Logs were grepped from example-service-2015-02-02.log with filter "error||timeout"
>
> 2015-02-02 10:00:00 - [127.0.0.1] Error timeout on endpoint XXX
>
> 2015-02-02 10:00:00 - [127.0.0.1] Error timeout on endpoint XXX
>
> 2015-02-02 10:00:00 - [127.0.0.1] Error timeout on endpoint XXX
>
> This indicates that the code at this part of the service is throwing a timeout error.
>
> [File location]:[line number]
>
> ~~~
> // code snippet goes here
> ~~~
>
> Further investigation of the endpoint shows that it was refusing connections.
>
> .
>
> etc.
>
> .
>
> **Solution**
>
> The issue was temporarily resolved by a rollback to version 1.2.3 at 10:05. The bug was later fixed in commit `abc1234` [link to git commit]
>
> **Improvements**
>
> <u>People</u>
>
> Team A realised the problem at 10:03 but felt they had not enough authority to permit a rollback of the service to version X. We should strive to improve on ...
>
> <u>Product</u>
>
> The code was added to optimise processes for feature Y, but this caused a side effect where ...
>
> <u>Process</u>
>
> Code was reviewed, and deployments were checked on staging servers, but due to the requirement to carry out step J, we had missed out on step K. We attribute this to ...

Finished reports should be peer reviewed by engineers from another team for further input and improvements before it can be considered finalised. This is to ensure the service context is adequately provided without any personal bias.

By following the rules and guidelines above, we are confident that any organisation new to writing post-mortem reports should be able to write actually useful documentation, instead of producing an unwanted article of little value out of reluctant obligation.
