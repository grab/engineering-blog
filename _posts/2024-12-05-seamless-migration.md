---
layout: post
id: 2024-12-05-seamless-migration
title: 'How we seamlessly migrated high volume real-time streaming traffic from one service to another with zero data loss and duplication'
date: 2024-12-05 00:00:10
authors: [riyadh-sharif, jialong-loh, muqi-li, pu-li]
categories: [Engineering, Data Science]
tags: [Engineering, Optimisation, Data streaming, Real-time streaming, Service]
comments: true
cover_photo: /img/seamless-migration/cover.jpg
excerpt: "In the world of high-volume data processing, migrating services without disruption is a formidable challenge. At Grab, we recently undertook this task by splitting one of our backend service's stream read and write functionalities into two separate services. Discover how we conducted this transition with zero data loss and duplication using a simple switchover strategy, along with rigorous validation mechanisms."
---

At Grab, we continuously enhance our systems to improve scalability, reliability and cost-efficiency. Recently, we undertook a project to split the read and write functionalities of one of our backend services into separate services. This was motivated by the need to independently scale these operations based on their distinct scalability requirements.

In this post, we will dive deep into how we migrated the stream processing (write) functionality to a new service with zero data loss and duplication. This was accomplished while handling a high volume of real-time traffic averaging 20,000 reads per second from 16 source Kafka streams writing to other output streams and several DynamoDB tables.

## Migration challenges and strategy

Migrating the stream processing to the new service while ensuring zero data loss and duplication posed some interesting challenges, especially given the high volume of real-time data. We needed a strategy that would enable us to:

- Migrate streams one by one gradually.
- Validate the new service's processing in production before fully switching over.
- Perform the switchover with no downtime or data inconsistencies.

We considered various options for the switchover such as using feature flags via our unified config management and experimental rollout platform. However, these approaches had some limitations:

- There could be some data loss or duplication during the deployment time when toggling the flags, which can be up to a few minutes.
- There might be data inconsistencies as the flag value could be updated on the services (the existing and and the new one) at slightly different times.

Ultimately, we decided on a custom time-based switchover logic implemented in shared code between the two services leveraging our monorepo structure. In the following sections, we will walk you through the steps we took to achieve this seamless migration.

## Step 1: Preparation

First, since both the existing and new services reside in our monorepo, we moved the stream processing code from the existing service to a shared `/commons` directory. This allowed both the old and new services to import and use the same code. We added logic in this `commons` package to selectively turn stream processing on or off based on the service processing them.

Next, we created temporary "sink" resources  such as streams and DynamoDB tables  for the new service to write the processed data. This allowed us to monitor and validate the new service's behavior in production without impacting the main resources.

<div class="post-image-section"><figure>
  <img src="/img/seamless-migration/figure1.png" alt="" style="width:80%"><figcaption align="middle">Figure 1. For a short period, both services consumed the incoming streams, but only the old service continued to write to the actual sink resources while the new service wrote to validation sink resources.</figcaption>
  </figure>
</div>

## Step 2: Scheduling the switchover

In the shared `/commons` code, we added a `map[string]time.Time` to schedule the switchover for each stream.

```
map[string]time.Time{
  "streamA": time.Date(2024, 2, 28, 12, 0, 0, 0, time.UTC),
  "streamB": time.Date(2024, 3, 10, 12, 0, 0, 0, time.UTC),
  // ...
}
```

When a stream is added to this map, it means it is scheduled for switchover at the specified time. This logic is shared between both services, so the switchover happens simultaneously. The new service starts writing to the main resources while the old service stops, with no overlap or gap.

## Step 3: Deployment and monitoring

To perform the switchover, we:
1. Updated the switchover times for the streams.
2. Deployed both services with enough buffer time before the scheduled switch.
3. Closely monitored the process by creating dedicated monitors for the migration process using our observability tools.

<div class="post-image-section"><figure>
  <img src="/img/seamless-migration/figure2.png" alt="" style="width:80%"><figcaption align="middle">Figure 2. This timeseries graph shows the stream received at the old and the new service (dotted line), facilitating real time monitoring of the stream processing volume across both services during the validation period.</figcaption>
  </figure>
</div>

The old service continued consuming the streams for a short monitoring period post-switchover, but without writing anywhere, ensuring no loss or duplication at the output sink resources. Then, the stream consumption was removed from the old service altogether, completing the entire migration process.

## Results and learnings

Using this time-based approach, we were able to seamlessly migrate the high-volume stream processing to the new service with:
- Zero data loss or duplication.
- No downtime or production issues.

The whole migration, including the gradual stream-by-stream switchover, was completed in about three weeks.

One learning was that such custom time-based logic, while effective for our use case, has limitations. If a rollback was needed for any of the two services for some unexpected reasons, some data inconsistency would be unavoidable. Generally, such time-based logic should be used with caution as it can lead to unexpected scenarios if the systems fall out of sync. We went ahead with this approach as it was a temporary measure and we had thoroughly tested it before carrying out the switchover.

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!