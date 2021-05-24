---
layout: post
id: 2021-05-24-building-hyper-self-service-distributed-tracing-feedback-system
title: Building a Hyper Self-Service, Distributed Tracing and Feedback System for Rule & Machine Learning (ML) Predictions, 0 to 1
date: 2021-05-24 00:11:20
authors: [warren-zhou, wenhui-wu, yongguo-mei, muqi-li, varun-kansal]
categories: [Engineering]
tags: [Engineering, Machine Learning, Statistics, Distributed Tracing]
comments: true
cover_photo: /img/archivist/cover.png
excerpt: "Find out how the Trust, Identity, Safety, and Security (TISS) team improved machine learning predictions with Archivist, an in-house built solution."
---

## Introduction

In Grab, the Trust, Identity, Safety, and Security (TISS) is a team of software engineers and AI developers working on fraud detection, login identity check, safety issues, etc. There are many TISS services, like grab-fraud, grab-safety, and grab-id. They make billions of business decisions daily using the [Griffin rule engine](https://engineering.grab.com/griffin), which determines if a passenger can book a trip, get a food promotion, or if a driver gets a delivery booking.

There is a natural demand to log down all these important business decisions, store them and query them interactively or in batches. Data analysts and scientists need to use the data to train their machine learning models. RiskOps and customer service teams can query the historical data and help consumers.

That’s where Archivist comes in; it is a new tracing, statistics and feedback system for rule and machine learning-based predictions. It is reliable and performant. Its innovative data schema is flexible for storing events from different business scenarios. Finally, it provides a user-friendly UI, which has access control for classified data.

Here are the impacts Archivist has already made:

*   Currently, there are 2 teams with a total of 5 services and about 50 business scenarios using Archivist. The scenarios include fraud prevention (e.g. DriverBan, PassengerBan), payment checks (e.g. PayoutBlockCheck, PromoCheck), and identity check events like PinTrigger.
*   It takes only a few minutes to onboard a new business scenario (event type), by using the configuration page on the user portal. Previously, it took at least 1 to 2 days.
*   Each day, Archivist logs down 80 million logs to the ElasticSearch cluster, which is about 200GB of data.
*   Each week, Customer Experience (CE)/Risk Ops goes to the user portal and checks Archivist logs for about 2,000 distinct customers. They can search based on numerous dimensions such as the Passenger/DriverID, phone number, request ID, booking code and payment fingerprint.

## Background

Each day, TISS services make billions of business decisions (predictions), based on the Griffin rule engine and ML models.

After the predictions are made, there are still some tough questions for these services to answer.

*   If Risk Ops believes a prediction is false-positive, a consumer could be banned. If this happens, how can consumers or Risk Ops report or feedback this information to the new rule and ML model training quickly?
*   As CustomService/Data Scientists investigating any tickets opened due to TISS predictions/decisions, how do you know which rules and data were used? E.g. why the passenger triggered a selfie, or why a booking was blocked.
*   After Data Analysts/Data Scientists (DA/DS) launch a new rule/model, how can they track the performance in fine-granularity and in real-time? E.g. week-over-week rule performance in a country or city.
*   How can DA/DS access all prediction data for data analysis or model training?
*   How can the system keep up with Grab’s business launch speed, with maximum self-service?

## Problem

To answer the questions above, TISS services previously used company-wide Kibana to log predictions.  For example, a log looks like: `PassengerID:123,Scenario:PinTrigger,Decision:Trigger,...`. This logging method had some obvious issues:

*   Logs in plain text don’t have any structure and are not friendly to ML model training as most ML models need processed data to make accurate predictions.
*   Furthermore, there is no fine-granularity access control for developers in Kibana.
*   Developers, DS and DA have no access control while CEs have no access at all. So CE can not easily see the data and DA/DS can not easily process the data.

To address all the Kibana log issues, we developed ActionTrace, a code library with a well-structured data schema. The logs, also called documents, are stored in a dedicated ElasticSearch cluster with access control implemented. However, after using it for a while, we found that it still needed some improvements.

1.  Each business scenario involves different types of entities and ActionTrace is not fully self-service. This means that a lot of development work was needed to support fast-launching business scenarios. Here are some examples:
    *   The main entities in the taxi business are Driver and Passenger,

    *   The main entities in the food business can be Merchant, Driver and Consumer.

    All these entities will need to be manually added into the ActionTrace data schema.

2.  Each business scenario may have their own custom information logged. Because there is no overlap, each of them will correspond to a new field in the data schema. For example:
    *   For any scenario involving payment, a valid payment method and expiration date is logged.
    *   For the taxi business, the geohash is logged.

3.   To store the log data from ActionTrace, different teams need to set up and manage their own ElasticSearch clusters. This increases hardware and maintenance costs.

4. There was a simple Web UI created for viewing logs from ActionTrace, but there was still no access control in fine granularity.

## Solution

We developed Archivist, a new tracing, statistics, and feedback system for ML/rule-based prediction events. It’s centralised, performant and flexible. It answers all the issues mentioned above, and it is an improvement over all the existing solutions we have mentioned previously.

The key improvements are:

*   User-defined entities and custom fields
    *   There are no predefined entity types. Users can define up to 5 entity types (E.g. PassengerId, DriverId, PhoneNumber, PaymentMethodId, etc.).
    *   Similarly, there are a limited number of custom data fields to use, in addition to the common data fields shared by all business scenarios.
*   A dedicated service shared by all other services
    *   Each service writes its prediction events to a Kafka stream. Archivist then reads the stream and writes to the ElasticSearch cluster.
    *   The data writes are buffered, so it is easy to handle traffic surges in peak time.
    *   Different services share the same ECE (Elastic Cloud Enterprise) cluster, but they create their own daily file indices so the costs can be split fairly.
*   Better support for data mining, prediction stats and feedback
    *   Kafka stream data are simultaneously written to AWS S3. DA/DS can use the PrestoDB SQL query engine to mine the data.
    *   There is an internal web portal for viewing Archivist logs. Customer service teams and Ops can use no-risk data to address CE tickets, while DA/DS/developers can view high-risk data for code/rule debugging.
*   A reduction of development days to support new business launches
    *   Previously, it took a week to modify and deploy the ActionTrace data schema. Now, it only takes several minutes to configure event schemas in the user portal.
*   Saves time in RiskOps/CE investigations
    *   With the new web UI which has access control in place, the different roles in the company, like Customer service and Data analysts, can access the Archivist events with different levels of permissions.
    *   It takes only a few clicks for them to find the relevant events that impact the drivers/passengers.

### Architecture Details

Archivist’s system architecture is shown in the diagram below.

<div class="post-image-section"><figure>
  <img src="/img/archivist/image7.png" alt="Archivist system architecture" style="width:90%"> <figcaption align="middle"><i>Archivist system architecture</i></figcaption>
  </figure></div>

*   Different services (like fraud-detection, safety-allocation, etc.) use a simple SDK to write data to a Kafka stream (the left side of the diagram).
*   In the centre of Archivist is an event processor. It reads data from Kafka, and writes them to ElasticSearch (ES).
*   The Kafka stream writes to the Amazon S3 data lake, so DA/DS can use the Presto SQL query engine to query them.
*   The user portal (bottom right) can be used to view the Archivist log and update configurations. It also sends all the web requests to the API Handler in the centre.

The following diagram shows how internal and external users use Archivist as well as the interaction between the [Griffin rule engine](https://engineering.grab.com/griffin) and Archivist.

<div class="post-image-section"><figure>
  <img src="/img/archivist/image11.png" alt="Archivist use cases" style="width:90%"> <figcaption align="middle"><i>Archivist use cases</i></figcaption>
  </figure></div>


### Flexible Event Schema

In Archivist, a prediction/decision is called an event. The event schema can be divided into 3 main parts conceptually.

1. Data partitioning: Fields like `service_name` and `event_type` categorise data by services and business scenarios.
    <table class="table">
      <thead>
        <tr>
          <th>Field name</th>
          <th>Type</th>
          <th>Example</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>service_name</td>
          <td>string</td>
          <td>GrabFraud</td>
          <td>Name of the Service</td>
        </tr>
        <tr>
          <td>event_type</td>
          <td>string</td>
          <td>PreRide</td>
          <td>PaxBan/SafeAllocation</td>
        </tr>
      </tbody>
    </table>

2. Business decision making: `request_id`, `decisions`, `reasons`, `event_content` are used to record the business decision, the reason and the context (E.g. The input features of machine learning algorithms).
    <table class="table">
      <thead>
        <tr>
          <th>Field name</th>
          <th>Type</th>
          <th>Example</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>request_id</td>
          <td>string</td>
          <td>a16756e8-efe2-472b-b614-ec6ae08a5912</td>
          <td>a 32-digit id for web requests</td>
        </tr>
        <tr>
          <td>event_content</td>
          <td>string</td>
          <td></td>
          <td>Event context</td>
        </tr>
        <tr>
          <td>decisions</td>
          <td>[string]</td>
          <td>["NotAllowBook", "SMS"]</td>
          <td>A list</td>
        </tr>
        <tr>
          <td>reasons</td>
          <td>string</td>
          <td></td>
          <td>json payload string of the response from engine.</td>
        </tr>
      </tbody>
    </table>

3. Customisation: Archivist provides user-defined entities and custom fields that we feel are sufficient and flexible for handling different business scenarios.
    <table class="table">
      <thead>
        <tr>
          <th>Field name</th>
          <th>Type</th>
          <th>Example</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>entity_type_1</td>
          <td>string</td>
          <td>Passenger</td>
          <td></td>
        </tr>
        <tr>
          <td>entity_id_1</td>
          <td>string</td>
          <td>12151</td>
          <td></td>
        </tr>
        <tr>
          <td>entity_type_2</td>
          <td>string</td>
          <td>Driver</td>
          <td></td>
        </tr>
        <tr>
          <td>entity_id_2</td>
          <td>string</td>
          <td>341521-rdxf36767</td>
          <td></td>
        </tr>
        <tr>
          <td>...</td>
          <td>string</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>entity_id_5</td>
          <td>string</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>custom_field_type_1</td>
          <td>string</td>
          <td>“MessageToUser”</td>
          <td></td>
        </tr>
        <tr>
          <td>custom_field_1</td>
          <td>string</td>
          <td>"please contact Ops"</td>
          <td>User defined fields</td>
        </tr>
        <tr>
          <td>custom_field_type_2</td>
          <td></td>
          <td>“Prediction rule:”</td>
          <td></td>
        </tr>
        <tr>
          <td>custom_field_2</td>
          <td>string</td>
          <td>“ML rule: 123, version:2”</td>
          <td></td>
        </tr>
        <tr>
          <td>...</td>
          <td>string</td>
          <td></td>
          <td></td>
        </tr>
        <tr>
          <td>custom_field_6</td>
          <td>string</td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>


### A User Portal to Support Querying, Prediction Stats and Feedback

DA/DS/Ops/CE can access the internal user portal to see the prediction events, individually and on an aggregated city level.

<div class="post-image-section"><figure>
  <img src="/img/archivist/image5.gif" alt="A snapshot of the Archivist logs showing the aggregation of the data in each city" style="width:90%"> <figcaption align="middle"><i>A snapshot of the Archivist logs showing the aggregation of the data in each city</i></figcaption>
  </figure></div>

There are graphs on the portal, showing the rule/model performance on individual customers over a period of time.

<div class="post-image-section"><figure>
  <img src="/img/archivist/image10.gif" alt="Rule performance on a customer over a period of time" style="width:90%"> <figcaption align="middle"><i>Rule performance on a customer over a period of time</i></figcaption>
  </figure></div>

## How to Use Archivist for Your Service

If you want to get onboard Archivist, the coding effort is minimal (check out this [link](https://wiki.grab.com/display/TEO/Archivist%2BHow-to)). Here is an example of a code snippet to log an event:

![](img/archivist/image2.png)

<div class="post-image-section"><figure>
  <img src="/img/archivist/image2.png" alt="Code snippet to log an event" style="width:90%"> <figcaption align="middle"><i>Code snippet to log an event</i></figcaption>
  </figure></div>

## Lessons

During the implementation of Archivist, we learnt some things:

*   A good system needs to support multi-tenants from the beginning. Originally, we thought we could use just one Kafka stream, and put all the documents from different teams into one ElasticSearch (ES) index. But after one team insisted on keeping their data separately from others, we created more Kafka streams and ES indexes. We realised that this way, it’s easier for us to manage data and share the cost fairly.
*   Shortly after we launched Archivist, there was an incident where the ES data writes were choked. Because each document write is a goroutine, the number of goroutines increased to 400k and the memory usage reached 100% within minutes. We added a patch (2 lines of code) to limit the maximum number of goroutines in our system. Since then, we haven’t had any more severe incidents in Archivist.

## Join Us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
