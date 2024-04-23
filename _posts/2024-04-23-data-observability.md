---
layout: post
id: 2024-04-23-data-observability
title: "Ensuring data reliability and observability in risk systems"
date: 2024-04-23 00:15:10
authors: [yini-ong, kamesh-chandran, jialong-loh]
categories: [Data Science, Engineering, Security]
tags: [Data Science, Security, Risk, Data observability, Data reliability]
comments: true
cover_photo: /img/data-observability/cover.png
excerpt: "As the amount of data Grab handles grows, there is an increased need for quick detections for data anomalies (incompleteness or inaccuracy), while keeping it secure. Read this to learn how the Risk Data team utilised Flink and Datadog to enhance data observability within Grab’s services."
---
Grab has an in-house Risk Management platform called [GrabDefence](https://www.grab.com/sg/business/defence/) which relies on ingesting large amounts of data gathered from upstream services to power our heuristic risk rules and data science models in real time.

<div class="post-image-section"><figure>
  <img src="/img/data-observability/image4.png" alt="" style="width:80%"><figcaption align="middle">Fig 1. GrabDefence aggregates data from different upstream services</figcaption>
  </figure>
</div>

As Grab’s business grows, so does the amount of data. It becomes imperative that the data which fuels our risk systems is of reliable quality as any data discrepancy or missing data could impact fraud detection and prevention capabilities.

We need to quickly detect any data anomalies, which is where data observability comes in.

## Data observability as a solution

Data observability is a type of data operation (DataOps; similar to DevOps) where teams build visibility over the health and quality of their data pipelines. This enables teams to be notified of data quality issues, and allows teams to investigate and resolve these issues faster.

We needed a solution that addresses the following issues:

1.  Alerts for any data quality issues as soon as possible - so this means the observability tool had to work in real time.
2.  With hundreds of data points to observe, we needed a neat and scalable solution which allows users to quickly pinpoint which data points were having issues.
3.  A consistent way to compare, analyse, and compute data that might have different formats.

Hence, we decided to use Flink to standardise data transformations, compute, and observe data trends quickly (in real time) and scalably.

## Utilising Flink for real-time computations at scale

### What is Flink?

Flink SQL is a powerful, flexible tool for performing real-time analytics on streaming data. It allows users to query continuous data streams using standard SQL syntax, enabling complex event processing and data transformation within the Apache Flink ecosystem, which is particularly useful for scenarios requiring low-latency insights and decisions.

### How we used Flink to compute data output

In Grab, data comes from multiple sources and while most of the data is in JSON format, the actual JSON structure differs between services. Because of JSON’s nested and dynamic data structure, it is difficult to consistently analyse the data – posing a significant challenge for real-time analysis.

To help address this issue, Apache Flink SQL has the capability to manage such intricacies with ease. It offers specialised functions tailored for parsing and querying JSON data, ensuring efficient processing.

Another standout feature of Flink SQL is the use of custom table functions, such as JSONEXPLOAD, which serves to deconstruct and flatten nested JSON structures into tabular rows. This transformation is crucial as it enables subsequent aggregation operations. By implementing a 5-minute tumbling window, Flink SQL can easily aggregate these now-flattened data streams. This technique is pivotal for monitoring, observing, and analysing data patterns and metrics in near real-time.

Now that data is aggregated by Flink for easy analysis, we still needed a way to incorporate comprehensive monitoring so that teams could be notified of any data anomalies or discrepancies in real time.

### How we interfaced the output with Datadog 

Datadog is the observability tool of choice in Grab, with many teams using Datadog for their service reliability observations and alerts. By aggregating data from Apache Flink and integrating it with Datadog, we can harness the synergy of real-time analytics and comprehensive monitoring. Flink excels in processing and aggregating data streams, which, when pushed to Datadog, can be further analysed and visualised. Datadog also provides seamless integration with collaboration tools like Slack, which enables teams to receive instant notifications and alerts.

With Datadog's out-of-the-box features such as anomaly detection, teams can identify and be alerted to unusual patterns or outliers in their data streams. Taking a proactive approach to monitoring is crucial in maintaining system health and performance as teams can be alerted, then collaborate quickly to diagnose and address anomalies.

This integrated pipeline—from Flink's real-time data aggregation to Datadog's monitoring and Slack's communication capabilities—creates a robust framework for real-time data operations. It ensures that any potential issues are quickly traced and brought to the team's attention, facilitating a rapid response. Such an ecosystem empowers organisations to maintain high levels of system reliability and performance, ultimately enhancing the overall user experience.

## Organising monitors and alerts using out-of-the-box solutions from Datadog

Once we integrated Flink data into Datadog, we realised that it could become unwieldy to try to identify the data point with issues from hundreds of other counters.

<div class="post-image-section"><figure>
  <img src="/img/data-observability/image3.png" alt="" style="width:80%"><figcaption align="middle">Fig 2. Hundreds of data points on a graph make it hard to decipher which ones have issues</figcaption>
  </figure>
</div>

We decided to organise the counters according to the service stream it was coming from, and create individual monitors for each service stream. We used Datadog’s Monitor Summary tool to help visualise the total number of service streams we are reading from and the number of underlying data points within each stream.  

<div class="post-image-section"><figure>
  <img src="/img/data-observability/image2.png" alt="" style="width:80%"><figcaption align="middle">Fig 3. Data is grouped according to their source stream</figcaption>
  </figure>
</div>

Within each individual stream, we used Datadog’s [Anomaly Detection](https://docs.datadoghq.com/monitors/types/anomaly/) feature to create an alert whenever a data point from the stream exceeds a predefined threshold. This can be configured by the service teams on Datadog.

<div class="post-image-section"><figure>
  <img src="/img/data-observability/image1.png" alt="" style="width:80%"><figcaption align="middle">Fig 4. Datadog’s built-in Anomaly Detection function triggers alerts whenever a data point exceeds a threshold</figcaption>
  </figure>
</div>

These alerts are then sent to a Slack channel where the Data team is informed when a data point of interest starts throwing anomalous values.

<div class="post-image-section"><figure>
  <img src="/img/data-observability/image5.png" alt="" style="width:80%"><figcaption align="middle">Fig 5. Datadog integration with Slack to help alert users</figcaption>
  </figure>
</div>

## Impact

Since the deployment of this data observability tool, we have seen significant improvement in the detection of anomalous values. If there are any anomalies or issues, we now get alerts within the same day (or hour) instead of days to weeks later.

Organising the alerts according to source streams have also helped simplify the monitoring load and allows users to quickly narrow down and identify which pipeline has failed.

## What’s next?

At the moment, this data observability tool is only implemented on selected checkpoints in GrabDefence. We plan to expand the observability tool’s coverage to include more checkpoints, and continue to refine the workflows to detect and resolve these data issues.

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
