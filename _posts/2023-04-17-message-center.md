---
layout: post
id: 2023-04-17-message-center
title: Message Center - Redesigning the messaging experience on Grab
date: 2023-04-12 01:23:05
authors: [jie-zhang, vasu-krishnamoorthy, jonathan-lee]
categories: [Engineering, Design]
tags: [Engineering, GrabChat, Redesign, Messaging, Chat support]
comments: true
cover_photo: /img/message-center/cover.jpg
excerpt: "Grab’s messaging feature was designed for two-party communications, but as our superapp grew to include more features, we became more aware of the limitations in our app. Read to find out how we redesigned the messaging experience to make it more extensible and future-proof."
---

Since 2016, Grab has been using [GrabChat](https://www.grab.com/ph/blog/grabchat/), a built-in messaging feature to connect our users with delivery-partners or driver-partners. However, as the Grab superapp grew to include more features, the limitations of the old system became apparent. GrabChat could only handle two-party chats because that’s what it was designed to do. To make our messaging feature more extensible for future features, we decided to redesign the messaging experience, which is now called Message Center.

<div class="post-image-section"><figure>
  <img src="/img/message-center/image2.png" alt="" style="width:80%"><figcaption align="middle">Migrating from the old GrabChat to the new Message Center</figcaption>
  </figure>
</div>

To some, building our own chat function might not be the ideal approach, especially with open source alternatives like [Signal](https://github.com/signalapp). However, Grab’s business requirements introduce some level of complexity, which required us to develop our own solution.

Some of these requirements include, but are not limited to:

* Handle multiple user types (passengers, driver-partners, consumers, delivery-partners, customer support agents, merchant-partners, etc.) with custom user interface (UI) rendering logic and behaviour.
* Enable other Grab backend services to send system generated messages (e.g. your driver is reaching) and customise push notifications.
* Persist message state even if users uninstall and reinstall their apps. Users should be able to receive undelivered messages even if they were offline for hours.
* Provide translation options for non-native speakers.
* Filter profanities in the chat.
* Allow users to handle group chats. This feature might come in handy in future if there needs to be communication between passengers, driver-partners, and delivery-partners.

## Solution architecture

<div class="post-image-section"><figure>
  <img src="/img/message-center/image3.png" alt="" style="width:80%"><figcaption align="middle">Message Center architecture</figcaption>
  </figure>
</div>

The new Message Center was designed to be divided into two services:

1.  Message-center backend: Message processor service that handles logical and database operations.
2.  Message-center postman: Message delivery service that can scale independently from the backend service.

This architecture allows the services to be sufficiently decoupled and scale independently. For example, if you have a group chat with `N` participants and each message sent results in `N` messages being delivered, this architecture would enable message-center postman to scale accordingly to handle the higher load.

As Grab delivers millions of events a day via the Message Center service, we need to ensure that our system can handle high throughput. As such, we are using Apache Kafka as the low-latency high-throughput event stream connecting both services, and Amazon SQS as a redundant delay queue that will attempt a retry 10 seconds later.

Another important aspect for this service is the ability to support low-latency and bi-directional communications from the client to the server. That’s why we chose Transmission Control Protocol (TCP) as the main protocol for client-server communication. Mobile and web clients connect to Hermes, Grab’s TCP gateway service, which then digests the TCP packets and proxies the payloads to Message Center via gRPC. If both recipients and senders are online, the message is successfully delivered in a matter of milliseconds.

Unlike HTTP, individual TCP packets do not require a response so there is an inherent uncertainty in whether the messages were successfully delivered. Message delivery can fail due to several reasons, such as the client terminating the connection but the server’s connection remaining established. This is why we built a system of acknowledgements (ACKs) between the client and server, which ensures that every event is received by the receiving party.

The following diagram shows the high-level sequence of events when sending a message.

<div class="post-image-section"><figure>
  <img src="/img/message-center/image1.png" alt="" style="width:80%"><figcaption align="middle">Events involved in sending a message on Message Center</figcaption>
  </figure>
</div>

Following the sequence of events involved in sending a message and updating its status for the sender from `sending` to `sent` to `delivered` to `read`, the process can get very complicated quickly. For example, the sender will retry the 1302 TCP new message *until* it receives a server ACK. Similarly, the server will also keep attempting to send the 1402 TCP message receipt or 1303 TCP message unless it receives a client ACK. With this in mind, we knew we had to give special attention to the ACK implementation, to prevent infinite retries on the client and server, which can quickly cascade to a system-wide failure.

Lastly, we also had to consider dropped TCP connections on mobile devices, which happens more frequently than you’d think. What happens then? Message Center relies on Hedwig, another in-house notification service, to send push notifications to the mobile device when it receives a failed response from Hermes. Message Center also maintains a user-events DynamoDB database, which updates the state of every pending event of the client to `delivered` whenever a client ACK is received.

Every time the mobile client reconnects to Hermes, it also sends a special TCP message to notify Message Center that the client is back online, and then the server retries sending all the pending events to the client.

## Learnings/Conclusion

With large-scale features like Message Center, it’s important to:

*   Decouple services so that each microservice can function and scale as needed.
*   Understand our feature requirements well so that we can make the best choices and design for extensibility.
*   Implement safeguards to prevent system timeouts, infinite loops, or other failures from cascading to the entire system, i.e. rate limiting, message batching, and idempotent `eventIDs`.

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
