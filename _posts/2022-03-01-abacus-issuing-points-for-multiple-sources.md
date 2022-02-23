---
layout: post
id: 2022-03-01
title: Abacus - Issuing points for multiple sources
date: 2022-02-21 00:20:00
authors: [chandrakanth]
categories: [Engineering]
tags: [Engineering, Event processing, Optimisation, Stream Processing]
comments: true
cover_photo: /img/abacus-issuing-points-for-multiple-sources/cover.png
excerpt: "Learn about the challenges of points rewarding and how GrabRewards Points are rewarded for different Grab offerings."
---
## Introduction
Earlier in 2021 we published an article on [Trident](https://engineering.grab.com/trident-real-time-event-processing-at-scale), Grab’s in-house real-time if this, then that (IFTTT) engine which manages campaigns for the Grab Loyalty Program. The Grab Loyalty Program encourages consumers to make Grab transactions by rewarding points when transactions are made. Grab rewards two types of points namely OVOPoints and GrabRewards Points (GRP). OVOPoints are issued for transactions made in Indonesia and GRP are for the transactions that are made in all other markets. In this article, the term GRP will be used to refer to both OVOPoints and GrabRewards Points.

Rewarding GRP is one of the main components of the Grab Loyalty Program. By rewarding GRP, our consumers are incentivised to transact within the Grab ecosystem. Consumers can then redeem their GRP for a range of exciting items on the GrabRewards catalogue or to offset the cost of their spendings.

As we continue to grow our consumer base and our product offerings, a more robust platform is needed to ensure successful points transactions. In this post, we will share the challenges in rewarding GRP and how Abacus, our Point Issuance platform helps to overcome these challenges while managing various use cases.

## Challenges

### Growing number of products
The number of Grab’s product offerings has grown as part of Grab’s goal in becoming a superapp. The demand for rewarding GRP increased as each product team looked for ways to retain consumer loyalty. For this, we needed a platform which could support the different requirements from each product team.

### External partnerships
Grab’s external partnerships consist of both one- and two-way point exchanges. With selected partners, Grab users are able to convert their GRP for the partner's loyalty program points, and the other way around.

## Use cases
Besides the need to cater for the growing number of products and external partnerships, Grab needed a centralised points management system which could cater to various use cases of points rewarding. Let’s take a look at the use cases.

### Any product, any points
There are many products in Grab and each product should be able to reward different GRP for different scenarios. Each product rewards GRP based on the goal they are trying to achieve.

The following are some examples of the different scenarios

**GrabCar**: Reward 100 GRP for when a driver cancels a booking as a form of compensation or to reward GRP for every ride a consumer makes.

**GrabFood**: Reward consumers for each meal order.

**GrabPay**: Reward consumers three times the number of GRP for using GrabPay instead of cash as the mode of payment.

### More points for loyal consumers
Another use case is to reward loyal consumers with more points. This incentivises consumers to transact within the Grab ecosystem. One example are membership tiers granted based on the number of GRP a consumer has accumulated. There are four membership tiers: Member, Silver, Gold and Platinum.

<div class="post-image-section"><figure>
  <img src="/img/abacus-issuing-points-for-multiple-sources/point-multiplier.png" alt="Point multiplier" style="width:60%"><figcaption align="middle"><i>Point multiplier</i></figcaption>
  </figure>
</div>

There are different points multipliers for different membership tiers. For example, a Gold member would earn 2.25 GRP for every dollar spent while a Silver member earns only 1.5 GRP for the same amount spent. A consumer can view their membership tier and GRP information from the account page on the Grab app.

<div class="post-image-section"><figure>
  <img src="/img/abacus-issuing-points-for-multiple-sources/grp-and-membership-tier.png" alt="GrabRewards Points and membership tier information" style="width:70%"><figcaption align="middle"><i>GrabRewards Points and membership tier information</i></figcaption>
  </figure>
</div>

### Growing number of transactions
Teams within Grab and external partners use GRP in their business. There is a need for a platform that can process millions of transactions every day with high availability rates. Errors can easily impact the issuance of points which may affect our consumers’ trust.

## Our solution - Abacus
To overcome the challenges and cater for various use cases, we developed a Points Management System known as Abacus. It offers an interface for external partners with the capability to handle millions of daily transactions without significant downtime.

## Points rewarding
There are seven main components of Abacus as shown in the following architectural diagram. Details of each component are explained in this section.

<div class="post-image-section"><figure>
  <img src="/img/abacus-issuing-points-for-multiple-sources/abacus-architecture.png" alt="Abacus architecture" style="width:100%"><figcaption align="middle"><i>Abacus architecture</i></figcaption>
  </figure>
</div>

### Transaction input source
The points rewarding process begins when a transaction is complete. Abacus listens to streams for completed transactions on the Grab platform. Each transaction that abacus receives in the stream carries the data required to calculate the GRP to be rewarded such as country ID, product ID, and payment ID etc.

Apart from computing the number of GRP to be rewarded for a transaction and then rewarding the points, Abacus also allows clients from within the Grab platform and outside of the Grab platform to make an API call to reward GRP to consumers. The client who wants to reward their consumers with GRP will call Abacus with either a specific point value (for example 100 points) or will provide the necessary details like transaction amount and the relevant multipliers for Abacus to compute the points and then reward them.

### Point Calculation module
The Point Calculation module calculates the GRP using the data and multipliers that are unique to each transaction.

#### Point Calculation dependencies for internal services
Point calculation dependencies are the multipliers needed to calculate the number of points. The Point Calculation module fetches the correct point multipliers for each transaction. The multipliers are configured by specific country teams when the product is launched. They may vary by country to allow country teams the flexibility to achieve their growth and retention targets. There are different types of multipliers.

**Vertical multiplier**: The multiplier for each vertical. A vertical is a service or product offered by Grab. Examples of verticals are GrabCar and GrabFood. The multiplier can be different for each vertical.

**EPPF multiplier**: The effective price per fare multiplier. EPPF is the reference conversion rate per point. For example:

- EPPF = 1.0; if you are issuing X points per SGD1

- EPPF = 0.1; if you are issuing X points per THB10

- EPPF = 0.0001; if you are issuing X points per IDR10,000

**Payment Type multiplier**: The multiplier for different modes of payments.

**Tier multiplier**: The multiplier for each tier.

#### Point Calculation formula for internal clients
The Point Calculation module uses a formula to calculate GRP. The formula is the product of all the multipliers and the transaction amount.

**GRP = Amount * Vertical multiplier * EPPF multiplier * Cashless multiplier * Tier multiplier**

The following are examples for calculating GRP.

***Example 1:***

Bob is a platinum member of Grab. He orders lunch in Singapore for SGD15 using GrabPay as the payment method. Let’s assume the following:

*Vertical multiplier* = 2

*EPPF multiplier* = 1

*Cashless multiplier* = 2

*Tier multiplier* = 3

**GRP** = Amount * Vertical multiplier * EPPF multiplier * Cashless multiplier * Tier multiplier

= 15 * 2 * 1 * 2 * 3

= 180

From this transaction, Bob earns 180 GRP.

***Example 2:***

Jane is a Gold member of Grab. She orders lunch in Indonesia for Rp150000 using GrabPay as the payment method. Let’s assume  the following:

*Vertical multiplier* = 2

*EPPF multiplier* = 0.00005

*Cashless multiplier* = 2

*Tier multiplier* = 2


**GRP** = Amount * Vertical multiplier * EPPF multiplier * Cashless multiplier * Tier multiplier

= 150000 * 2 * 0.00005 * 2 * 2

= 60

From this transaction, Jane earns 60 GRP.

<div class="post-image-section"><figure>
  <img src="/img/abacus-issuing-points-for-multiple-sources/multipliers-for-payment-options-and-tiers.jpg" alt="Example of multipliers for payment options and tiers" style="width:70%"><figcaption align="middle"><i>Example of multipliers for payment options and tiers</i></figcaption>
  </figure>
</div>

#### Point Calculation dependencies for external clients
External partners supply the point calculation dependencies which are then configured in our backend at the time of integration. These external partners can set their own multipliers instead of using the above mentioned multipliers which are specific to Grab. This [document](https://developer.grab.com/assets/docs/grab-rewards/Rewards_Events_API.pdf) details the APIs which are used to award points for external clients.

### Simple Queue Service
Abacus uses Amazon Simple Queue Service (SQS) to ensure that the points system process is robust and fault tolerant.

#### Point Awarding SQS
If there are no errors during the point calculation process, the Point Calculation module will send a message containing the points to be awarded to the Point Awarding SQS.

#### Retry SQS
The Point Calculation module may not receive the required data when there is a downtime in the point calculation dependencies. If this occurs,  an error is triggered and the Point Calculation module will send a message to Retry SQS. Messages sent to the Retry SQS will be re-processed by the Point Calculation module. This ensures that the points are properly calculated despite having outages on dependencies. Every message that we push to either the Point Awarding SQS or Retry SQS will have a field called Idempotency key which is used to ensure that we reward the points only once to a particular transaction.

### Point Awarding module
The successful calculation of GRP triggers a message to the Point Awarding module via the Point SQS. The Point Awarding module tries to reward GRP to the consumer’s account. Upon successful completion, an ACK is sent back to the Point SQS signalling that the message was successfully processed and triggers deletion of the message. If Point SQS does not receive an ACK, the message is redelivered after an interval.  This process ensures that the points system is robust and fault tolerant.

### Ledger
GRP is rewarded to the consumer once it is updated in the Ledger. The Ledger tracks how many GRP a consumer has accumulated, what they were earned for, and the running total number of GRP.

### Notification service
Once the Ledger is updated, the Notification service sends the consumer a message about the GRP they receive.

### Point Kafka stream
For all successful GRP transactions, Abacus sends a message to the Point Kafka stream. Downstream services listen to this stream to identify the consumer’s behavior and take the appropriate actions. Services of this stream can listen to events they are interested in and execute their business logic accordingly. For example, a service can use the information from the Point Kafka stream to determine a consumer’s membership tier.

## Points expiry
Further addition to Abacus is the handling of points expiry. The Expiry Extension module enables activity-based points expiry. This enables GRP to not expire as long as the consumer makes one Grab transaction within the next three or six months of their last transaction.

The Expiry Extension module updates the point expiry date to the database after successfully rewarding GRP to the consumer. At the end of each month, a process loads all consumers whose points will expire in that particular month and sends it to the Point Expiry SQS. The Point Expiry Consumer will then expire all the points for the consumers and this data is updated in the Ledger. This process repeats on a monthly basis.

<div class="post-image-section"><figure>
  <img src="/img/abacus-issuing-points-for-multiple-sources/expiry-extension-module.png" alt="Expiry Extension module" style="width:90%"><figcaption align="middle"><i>Expiry Extension module</i></figcaption>
  </figure>
</div>

Points expiry date is always the last day of the third or sixth month. For example, Adam makes a transaction on 10 January. His points expiry date is 31 July which is six months from the month of his last transaction. Adam then makes a transaction on 28 February. His points expiry period is shifted by one month to 31 August.

<div class="post-image-section"><figure>
  <img src="/img/abacus-issuing-points-for-multiple-sources/points-expiry.gif" alt="Points expiry" style="width:80%"><figcaption align="middle"><i>Points expiry</i></figcaption>
  </figure>
</div>

## Conclusion
The Abacus platform enables us to perform millions of GRP transactions on a daily basis. Being able to curate rewards for consumers increases the value proposition of our products and consumer retention. If you have any comments or questions about Abacus, feel free to leave a comment below.

---

<small class="credits">Special thanks to Arianto Wibowo and Vaughn Friesen.</small>

---

## Join us
Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
