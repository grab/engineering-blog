---
layout: post
id: how-to-go-from-a-quick-idea-to-an-essential-feature-in-four-steps
title: How to Go from a Quick Idea to an Essential Feature in Four Steps
date: 2017-05-14 18:43:40
authors: [huang-da, tan-sien-yi]
comments: true
excerpt: "How do you work within a startup team and build a quick idea into a key feature for an app that impacts millions of people? It's one of those things that is hard to understand when you just graduate as an engineer."
---

How do you work within a startup team and build a quick idea into a key feature for an app that impacts millions of people? It's one of those things that is hard to understand when you just graduate as an engineer.

Software engineer Huang Da and data scientist Tan Sien Yi can explain just that. Huang Da and his team first came up with the idea for a chat function in the Grab app in early 2016 and since the official roll out of GrabChat, the first messaging tool in a ride-hailing app, more than 78 million messages have been exchanged across the region. Here's their story on how this feature evolved from a quick idea to an essential feature.

### 1. Identify the problem

**Huang Da:** Southeast Asia is a pretty challenging place for an app. We have countries with vastly different internet conditions and infrastructural capabilities. You don't always have access to Wi-Fi. A lot of people are still using 2G, which has limited bandwidth, slow speeds and the high probability of data packets dropping due to congestion or interference affecting the Wi-Fi signal.

With that context in mind, in January 2016, we first started thinking of a new, safe and automated way for drivers and passengers to communicate better. Cities in Southeast Asia change so fast, so being able to communicate makes a big difference if you're trying to find your driver or passenger.

In discussing the problem with my team, one idea jumped out: why don't we build an in-app chat solution? It's the safest and most anonymized way to allow passengers and drivers to communicate. Also, if there's one thing we know, it's that people in Southeast Asia love to chat, with applications such as WhatsApp, Facebook Messenger and Line being ubiquitous.

### 2. Build an MVP solution

**Huang Da:** Once we decided to build GrabChat, we started with a prototype. We could have integrated it with third parties, but building it yourself allows more flexibility and options, as well as the opportunity to scale up down the line.

We started with a very simple TCP server, without making use of our architecture or entire back end, because we were expecting challenges to arise in any case. While the basic communication protocol is easy, making sure messages get delivered in the real world, is a different ordeal. The messages going through a TCP connection might get lost; we might have to get up with an ad-layer and that's just two examples.

As a next step, we built an architecture, which made use of the whole Grab infrastructure, extracting out the TCP layer and making it a stand-alone layer.

<div class="post-image-section">
  <img alt="GrabChat System Architecture" src="/img/how-to-go-from-a-quick-idea-to-an-essential-feature-in-four-steps/grabchat-system-architecture.png">
</div>

We decided to design GrabChat as a service: it opens interfaces for other services to create and manage the chat room. After a chat room is created, clients in the same chat room could send messages to each other through TCP messages. Services interacts with GrabChat through internal HTTPS requests, and clients interact with GrabChat through Message Exchange service via Gundam and Hermes, our TCP gateway and message dispatcher.

The core component of a GrabChat conversation is the message exchange service, which oversees the delivery of messages to all the recipients. It implements a protocol that involves sufficient handshake acknowledgement to make sure the message arrives. There are multiple ways to design the protocol, but finally we agreed on implementing around the concept of "server only push once".

The difficult part of coming up with the protocol is to decide which part of the system, the client or the server, should handle the message loss. It essentially becomes a push or pull problem: If we handle it on the server, the server needs to keep pushing (spamming) the message until the client acknowledges it; on the other hand, if we handle it on the client's side, the client needs to poll the server for the latest status and message.

We chose not to do with the server push method because a message could remain unacknowledged for many reasons, key reason among them being network issues, but if a server pushes regardless, it might drop into a resend loop and never come out, resulting in a severe loss of resources.

On the other hand, if we do it on the client side, we don't need to worry too much about the extra resource consumption: we only process the requests that reach the backend. From the perspective of a client, it keeps trying to send a message until it receives a response from the server before it times out, or fails to maintain a keep-alive heartbeat with the server. When that happens, it terminates the connection and reconnects. In other words, clients only send requests when needed, which is more friendly to server.

### 3. Evaluate

After building the initial architecture is when the most time-intensive part comes in. There's a lot of discussions across different teams, including product manager, team leads, front-end and design around the feature's impact and ways to mature the design.

Data scientist Sien Yi evaluated the impact of GrabChat to give the engineering team the analysis it needed to further improve the product. One hypothesis was that the use of GrabChat would lower the cancellation rates in the Grab app. Sien Yi tested this thesis.

**Sien Yi:** Measuring the effect of GrabChat isn't just about comparing the cancellations ratios on the Grab app, before and after implementation of the GrabChat feature. For all we know, those who use GrabChat could be the more engaged customers who are less likely to cancel anyway — even without GrabChat.

We approached testing the hypothesis from two sides.

#### Comparing non-chat vs chat bookings of individual passengers

As a first line of enquiry, we looked at a sample size of 20,000 passengers who had done a significant number of bookings before GrabChat and continued making a significant number of bookings after GrabChat was introduced.

Our research showed that 8 out of 10 passengers cancelled less on bookings where GrabChat was used.

<div class="post-image-section">
  <img alt="GrabChat CR minus Non-GrabChat CR" src="/img/how-to-go-from-a-quick-idea-to-an-essential-feature-in-four-steps/cancellation-likelihood-prediction.png">
</div>

There were still some remaining issues with this analysis though:

1. One could say that even for the same passenger, they might already be more engaged at a booking level when they use GrabChat.
1. There might be a selection bias in that we necessarily sample passengers with more experience on the Grab platform in order to measure meaningful differences between their Chat and non-Chat bookings.
1. We haven't accounted for driver cancels.

#### Using the cancellation prediction model

This is where the cancellation prediction model came in. With the data science team, we've been building a model that predicts how likely an allocated booking will be cancelled. We trained the model on GrabCar data for September in Singapore (before GrabChat was ever used), and then ran the model on October data (after GrabChat was adopted).

<div class="post-image-section">
  <img alt="Match cancel likelihood predicted by GrabChat-unaware model" src="/img/how-to-go-from-a-quick-idea-to-an-essential-feature-in-four-steps/grabchat-cancellation-rate-graph.png">
</div>

We developed a calibration plot (see above), which put actual cancellation proportions against predicted cancellation figures. The plot above suggests the model predicted that many allocated bookings would have been cancelled had GrabChat not been used. In other words, the data implied the use of GrabChat correlated with a decrease in the likelihood of cancellations.

Sien Yi and the data science team confirmed that the use of GrabChat is correlated with lower cancellation rates, meaning that the experience of passengers and drivers has been improved by the introduction of GrabChat.

### 4. Iterate

**Huang Da:** While the first protocol was built in March 2016, we've had many evaluation and iteration sessions before and after GrabChat was made available to all users in September/October. Together with the product manager, we built a roadmap with updates far beyond the first set of protocols.

For example, one of our insights from the first tests with the communications protocol was that the driver needs to be able to continue driving and not get distracted by the messages. To make it easier for our drivers to deal with the messages, we built template messages such as "I'm here" or "I'll be there in 2 minutes", which created a serious uptick in the volume of messages.

Building a product which is essential to our business is a never-ending project. We're never "done". Instead, we continue to look for iterations and solutions which serve our passengers and drivers in the best way possible.
