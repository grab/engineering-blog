---
layout: post
id: 2026-05-07-enhancing-flink-shadow-testing
title: 'Enhancing Flink Deployment with Shadow Testing'
date: 2026-05-07 00:23:00
authors: [fabrice.harbulot, shikai.ng, teelong.lang]
categories: [Engineering, Data]
tags: [Database, Testing, FlinkSQL]
comments: true
cover_photo: /img/shadow-testing/banner.jpg
excerpt: "Discover how Grab's data streaming team has revolutionized Apache Flink deployments with Shadow Testing, ensuring seamless reliability for real-time applications. By deploying new versions alongside existing ones without disruption, we eliminate downtime and enhance application availability. Dive into our article to explore this innovative approach and how it boosts deployment confidence and efficiency."
---

## Introduction

Ensuring the reliability of Apache Flink deployments in Grab is crucial for the availability of our business-critical, real-time applications. While all applications are tested in a staging environment before getting promoted to the production environment, there is still a class of issues that can only surface when deploying in the production environment, e.g.:

1. The new version of the application is unable to cope with the volume or the nature of production traffic.  
2. The new version of the application is unable to resume from a production checkpoint or savepoint taken by the previous version of the application.  
3. Certain environment-specific dependencies or configurations are malfunctioning or misconfigured.

When an application faces such issues upon deployment in production, our in-house deployment system automatically rolls it back after 10 minutes of observation, leading to a downtime of the application for about the same duration.

In this article, we will describe how Grab’s data streaming team (Coban) has enriched the traditional deployment pipeline for Flink applications with a **Shadow Testing stage** that eliminates this downtime during deployment failures, enhancing the availability of our Flink applications during this critical moment of their lifecycle.

**Shadow Testing** is a testing technique whereby a new version of an application (*Shadow*) is deployed in parallel with the current version of the application (*Main*), but without impacting it. It involves replicating production data to the new version of the application and comparing its behavior with the current version of the application to identify potential issues and regressions. 

## Architecture overview

<div class="post-image-section"><figure>
  <img src="/img/shadow-testing/figure-1.png" alt="" style="width:90%"><figcaption align="middle">Figure 1. Overall architecture of Shadow Testing.</figcaption>
  </figure>
</div>

We integrated Shadow Testing directly into the production environment, alongside the Main application (1). The Shadow application is deployed next to it via the same deployment process (2). An environment variable `isShadow=true` as well as a distinct job ID are injected for runtime differentiation, enabling the Shadow application to produce its results to distinct, isolated sinks that do not interfere with those of the Main application (3).

## Deployment flow

Shadow Testing is embedded within our normal Flink deployment pipeline to make it a seamless experience for the users of our platform.

<div class="post-image-section"><figure>
  <img src="/img/shadow-testing/figure-2.png" alt="" style="width:90%"><figcaption align="middle">Figure 2. Deployment flow diagram.</figcaption>
  </figure>
</div>

The deployment flow is as follows.

1. A user triggers a deployment of their Flink application in Grab's in-house deployment tool. At this step, they decide whether they want to enable Shadow Testing for this particular deployment.  
2. The deployment pipeline validates the input parameters provided by the user.  
3. If the user has not opted for Shadow Testing, the deployment flow directly jumps to step 8 and deploys the latest version to the Main application. However, if the user has enabled Shadow Testing, the deployment flow first goes through the Shadow Testing stages described in steps 4 to 7.  
4. The Shadow Kubernetes manifest is baked with its set of distinctive parameters:  
   * The application name is prefixed with *shadow-* which propagates to all the Kubernetes objects that are part of the Shadow application  
   * An environment variable `isShadow` is injected and set to *true*. It instructs the Shadow application to produce its results to the shadow sinks.  
   * A distinct *Job ID* is attributed  
   * The target Kubernetes namespace is overridden with a *shadow* namespace  
5. The Shadow application is deployed into the *shadow* Kubernetes namespace.  
6. The Shadow application runs for a configured period of 1 hour by default to reach a steady state. The status of the job manager is monitored to determine the success of the Shadow Testing. If the Shadow application is stable, the Shadow Testing is considered successful.  
7. The user is prompted to continue with the deployment of the Main application.  
8. The Kubernetes manifest of the Main application is baked with its standard parameters and the environment variable `isShadow` is set to *false*.  
9. The Main application is deployed in its standard Kubernetes namespace.  
10. After 10 minutes of observation, the deployment pipeline determines if the Main application is healthy by querying the status of its job manager. If it is healthy, the Main application is considered successfully deployed. Otherwise, the deployment pipeline automatically triggers a rollback to the previous version.

During the deployment, the user can leverage our standard observability stack to monitor the behavior of the Shadow application. For example, in the case of an Apache Kafka sink, they can compare the number of messages produced by the Main and Shadow applications.

<div class="post-image-section"><figure>
  <img src="/img/shadow-testing/figure-3.png" alt="" style="width:90%"><figcaption align="middle">Figure 3. Tracking of the Kafka messages.in_rate metric for the respective Kafka sink topics of the Main application (purple) and Shadow application (blue) at the beginning of the Shadow deployment stage.</figcaption>
  </figure>
</div>
 
Besides, our standard Datadog dashboard that comes with each application can conveniently be toggled to view the metrics of the respective Shadow application.

## Connector implementation

Our standard sink and source connectors, provided by our platform, ensure the absence of interference with the Main application during Shadow Testing. For example, Kafka source connectors use distinct consumer group IDs, while the various sink connectors direct the data to dedicated shadow sinks.

The Flink application evaluates the `isShadow` environment variable to set up the connectors at runtime.

```java
if (isShadow){
    // Shadow Testing operation
}
else {
    // Normal operation
}
```

The following table shows how some typical connectors are dynamically configured if `isShadow=true`:

<table class="table" border="1" style="border-collapse: collapse;">
  <thead>
    <tr>
      <th>Type</th>
      <th>Connector</th>
      <th>Dynamic configuration</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Source</td>
      <td>Kafka</td>
      <td>The consumer group ID for the Shadow application is suffixed with <em>-shadow</em>. This is crucial so as to consume a full copy of the data stream without interfering with the Main application. <br/> Main application: consumerGroup = &lt;application_name&gt; <br/> Shadow application: consumerGroup = &lt;application_name&gt;-shadow</td>
    </tr>
    <tr>
      <td>Source</td>
      <td>Change Data Capture</td>
      <td>The Server ID range of <a href="https://debezium.io/">Debezium</a> is shifted to the next non-overlapping range of the same size. This enables the Shadow application to get a full copy of the database binlog stream without interfering with the Main application. Note that the misleading <em>Server ID</em> naming is because Debezium acts as a pseudo-replica of the database server. <br/> Main application: serverId = 1001-2000 <br/> Shadow application: serverId = 2001 - 3000</td>
    </tr>
    <tr>
      <td>Sink</td>
      <td>Kafka</td>
      <td>The cluster endpoint is replaced with that of a Kafka cluster dedicated to Shadow Testing, set up with <em>auto.create.topics.enable=true</em> and 8h retention. <br/> Main application: brokers = &lt;flink-kafka&gt;:9092 <br/> Shadow application: brokers = &lt;flink-kafka-shadow&gt;:9092</td>
    </tr>
    <tr>
      <td>Sink</td>
      <td>S3</td>
      <td>The S3 bucket name is replaced with that of a bucket dedicated to Shadow Testing, set up with a 7-day retention lifecycle policy.<br/>  Main application: s3://&lt;flink-s3&gt;/&lt;application_name&gt; <br/>  Shadow application: s3://&lt;flink-s3-shadow&gt;/&lt;application_name&gt;</td>
    </tr>
    <tr>
      <td>Sink</td>
      <td>Metrics</td>
      <td>The StatsD prefix configuration is overridden. A <em>shadow.</em> prefix is added. <br/>  Main application: flink.&lt;application_name&gt;.&lt;metric_name&gt;<br/> Shadow application: shadow.flink.&lt;application_name&gt;.&lt;metric_name&gt;</td>
    </tr>
    <tr>
      <td>Sink</td>
      <td>Logs</td>
      <td>The <em>Shadow</em> Kubernetes manifest prefixes the Shadow application name with <em>shadow-</em>. The resulting name becomes available as a field in Kibana, enabling discriminated filtering. This tweak is done at the Kubernetes manifest level, not at the Flink application level.<br/> Main application: app_name = &lt;application_name&gt; <br/> Shadow application: app_name = shadow-&lt;application_name&gt;</td>
    </tr>
  </tbody>
</table>

## Conclusion

Our Shadow Testing framework represents a meaningful step forward in enhancing the reliability of our Flink applications during deployment. By leveraging and enriching the existing components of our platform, we have created a robust system that enables our users to confidently increase their Deployment Frequency and reduce their Change Failure Rate.

## What’s next

To drive wider adoption, we intend to support more source and sink connectors. By expanding the range of supported connectors, we could empower teams to leverage Shadow Testing across a broader spectrum of applications.

For connectors that are less frequently used, we consider implementing a no-op approach combined with metrics collection to expose a minimal set of actionable data points.

We will remain focused on making Shadow Testing accessible, scalable, and adaptable to various applications. Stay tuned as we continue to push the boundaries of innovation and deliver solutions that enhance reliability and efficiency across our systems.  

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://grab.careers/)!
