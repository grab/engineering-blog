---
layout: post
id: 2024-09-10-the-creation-of-our-powerful-campaign-builder
title: 'Unveiling the process: The creation of our powerful campaign builder'
date: 2024-09-10 00:00:10
authors: [jie-zhang, kevin-hutama, abdullah-mamun]
categories: [Engineering, Design]
tags: [Engineering, Generative AI, LLM, Experiment, Machine learning]
comments: true
cover_photo: /img/the-creation-of-our-powerful-campaign-builder/cover.png
excerpt: "Dive into Trident, our real-time event-driven marketing tool at Grab. Explore the build of the core units powering our If This, Then That (IFTTT) logic. Learn how we deal with complex campaigns and discover the secret behind how we support various processing mechanisms"
---

In a previous [blog](https://engineering.grab.com/trident-real-time-event-processing-at-scale), we introduced Trident, our internal marketing campaign platform. As part of the Core Experience team, we have created Trident to empower our marketing team to configure If This, Then That (IFTTT) logic and processes real-time events based on that.

While we mainly covered how we scaled up the system to handle large volumes of real-time events, we did not explain the implementation of the event processing mechanism. This blog will fill up this missing piece. We will walk you through the various processing mechanisms supported in Trident and how they were built.

## Base building block: Treatment

In our system, we use the term “treatment” to refer to the core unit of a full IFTTT data structure. A treatment is an amalgamation of three key elements - an event, conditions (which are optional), and actions. For example, consider a promotional campaign that offers "100 GrabPoints for completing a ride paid with GrabPay Credit". This campaign can be transformed into a treatment in which the event is "ride completion", the condition is "payment made using GrabPay Credit", and the action is "awarding 100 GrabPoints".

Data generated across various Kafka streams by multiple services within Grab forms the crux of events and conditions for a treatment. Trident processes these Kafka streams, treating each data object as an event for the treatments. It evaluates the set conditions against the data received from these events. If all conditions are met, Trident then executes the actions.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/processing-treatments.png" alt="" style="width:80%"><figcaption align="middle">Figure 1. Trident processes Kafka streams as events for treatments.</figcaption>
  </figure>
</div>

When the Trident user interface (UI) was first established, campaign creators had to grasp the treatment concept and configure the treatments accordingly. As we improved the UI, it became more user-friendly.

## Building on top of treatment

Campaigns can be more complex than the example we provided earlier. In such scenarios, a single campaign may need transformation into several treatments. All these individual treatments are categorised under what we refer to as a "treatment group". In this section, we discuss features that we have developed to manage such intricate campaigns.

### Counter

Let's say we have a marketing campaign that "rewards users after they complete 4 rides". For this requirement, it's necessary for us to keep track of the number of rides each user has completed. To make this possible, we developed a capability known as **counter**.

On the backend, a single counter setup translates into two treatments.

**Treatment 1**:

- Event: `onRideCompleted`
- Condition: N/A
- Action: `incrementUserStats`

**Treatment 2**:

- Event:  `onProfileUpdate`
- Condition: `Ride Count == 4`
- Action: `awardReward`

In this feature, we introduce a new event, `onProfileUpdate`. The `incrementUserStats` action in **Treatment 1** triggers the `onProfileUpdate` event following the update of the user counter. This allows **Treatment 2** to consume the event and perform subsequent evaluations.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/end-to-end-evaluation-process.png" alt="" style="width:80%"><figcaption align="middle">Figure 2. The end-to-end evaluation process when using the Counter feature.</figcaption>
  </figure>
</div>

When the `onRideCompleted` event is consumed, **Treatment 1** is evaluated which then executes the `incrementUserStat` action. This action increments the user's ride counter in the database, gets the latest counter value, and publishes an `onProfileUpdate` event to Kafka.

There are also other consumers that listen to `onProfileUpdate` events. When this event is consumed, **Treatment 2** is evaluated. This process involves verifying whether the `Ride Count` equals to 4. If the condition is satisfied, the `awardReward` action is triggered.

This feature is not limited to counting the number of event occurrences only. It's also capable of tallying the total amount of transactions, among other things.

### Delay

Another feature available on Trident is a delay function. This feature is particularly beneficial in situations where we want to time our actions based on user behaviour. For example, we might want to give a ride voucher to a user three hours after they've ordered a ride to a theme park. The intention for this is to offer them a voucher they can use for their return trip.

On the backend, a delay setup translates into two treatments. Given the above scenario, the treatments are as follows:

**Treatment 1**:

- Event: `onRideCompleted`
- Condition: `Dropoff Location == Universal Studio`
- Action: `scheduleDelayedEvent`

**Treatment 2**:

- Event:  `onDelayedEvent`
- Condition: N/A
- Action: `awardReward`

We introduce a new event, `onDelayedEvent`, which **Treatment 1** triggers during the `scheduleDelayedEvent` action. This is made possible by using Simple Queue Service (SQS), given its built-in capability to publish an event with a delay.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/end-to-end-evaluation-process-delay-feature.png" alt="" style="width:80%"><figcaption align="middle">Figure 3. The end-to-end evaluation process when using the Delay feature.</figcaption>
  </figure>
</div>

The maximum delay that SQS supports is 15 minutes; meanwhile, our platform allows for a delay of up to x hours. To address this limitation, we publish the event multiple times upon receiving the message, extending the delay by another 15 minutes each time, until it reaches the desired delay of x hours.

### Limit

The **Limit** feature is used to restrict the number of actions for a specific campaign or user within that campaign. This feature can be applied on a daily basis or for the full duration of the campaign.

For instance, we can use the **Limit** feature to distribute 1000 vouchers to users who have completed a ride and restrict it to only one voucher for one user per day. This ensures a controlled distribution of rewards and prevents a user from excessively using the benefits of a campaign.

In the backend, a limit setup translates into conditions within a single treatment. Given the above scenario, the treatment would be as follows:

- Event: `onRideCompleted`
- Condition: `TotalUsageCount <= 1000 AND DailyUserUsageCount <= 1`
- Action: `awardReward`

Similar to the **Counter** feature, it's necessary for us to keep track of the number of completed rides for each user in the database.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/end-to-end-evaluation-process-limit-feature.png" alt="" style="width:80%"><figcaption align="middle">Figure 4. The end-to-end evaluation process when using the Limit feature.</figcaption>
  </figure>
</div>

## A better campaign builder

As our campaigns grew more and more complex, the treatment creation quickly became overwhelming. A complex logic flow often required the creation of many treatments, which was cumbersome and error-prone. The need for a more visual and simpler campaign builder UI became evident.

Our design team came up with a flow-chart-like UI. Figure 5, 6, and 7 show examples of how certain imaginary campaign setup would look like in the new UI.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/better-campaign-builder-example-1.png" alt="" style="width:80%"><figcaption align="middle">Figure 5. When users complete a food order, if they are a gold user, award them with A. However, if they are a silver user, award them with  B.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/better-campaign-builder-example-2.png" alt="" style="width:80%"><figcaption align="middle">Figure 6. When users complete a food or mart order, increment a counter. When the counter reaches 5, send them a message. Once the counter reaches 10, award them with points.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/better-campaign-builder-example-3.png" alt="" style="width:80%"><figcaption align="middle">Figure 7. When a user confirms a ride booking, wait for 1 minute, and then conduct A/B testing by sending a message 50% of the time.</figcaption>
  </figure>
</div>

The campaign setup in the new UI can be naturally stored as a node tree structure. The following is how the example in figure 5 would look like in JSON format. We assign each node a unique number ID, and store a map of the ID to node content.

```
{
  "1": {
    "type": "scenario",
    "data": { "eventType": "foodOrderComplete"  },
    "children": ["2", "3"]
  },
  "2": {
    "type": "condition",
    "data": { "lhs": "var.user.tier", "operator": "eq", "rhs": "gold" },
    "children": ["4"]
  },
  "3": {
    "type": "condition",
    "data": { "lhs": "var.user.tier", "operator": "eq", "rhs": "silver" },
    "children": ["5"]
  },
  "4": {
    "type": "action",
    "data": {
      "type": "awardReward",
      "payload": { "rewardID": "ID-of-A"  }
    }
  },
  "5": {
    "type": "action",
    "data": {
      "type": "awardReward",
      "payload": { "rewardID": "ID-of-B"  }
    }
  }
}
```

### Conversion to treatments

The question then arises, how do we execute this node tree as treatments? This requires a conversion process. We then developed the following algorithm for converting the node tree into equivalent treatments:

```
// convertToTreatments is the main function
func convertToTreatments(rootNode) -> []Treatment:
  output = []

  for each scenario in rootNode.scenarios:
    // traverse down each branch
    context = createConversionContext(scenario)
    for child in rootNode.children:
      treatments = convertHelper(context, child)
      output.append(treatments)

  return output

// convertHelper is a recursive helper function
func convertHelper(context, node) -> []Treatment:
  output = []
  f = getNodeConverterFunc(node.type)
  treatments, updatedContext = f(context, node)

  output.append(treatments)

  for child in rootNode.children:
    treatments = convertHelper(updatedContext, child)
    output.append(treatments)

  return output
```

The `getNodeConverterFunc` will return different handler functions according to the node type. Each handler function will either update the conversion context, create treatments, or both.

<table class="table">
  <caption style="caption-side:bottom">Table 1. The handler logic mapping for each node type.</caption>
  <thead>
    <tr>
      <th style="width:20%">Node type</th>
      <th>Logic</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>condition</td>
      <td>Add conditions into the context and return the updated context.</td>
    </tr>
    <tr>
      <td>action</td>
      <td>Return a treatment with the event type, condition from the context, and the action itself.</td>
    </tr>
    <tr>
      <td>delay</td>
      <td>Return a treatment with the event type, condition from the context, and a scheduleDelayedEvent action.</td>
    </tr>
    <tr>
      <td>count</td>
      <td>Return a treatment with the event type, condition from the context, and an incrementUserStats action.</td>
    </tr>
    <tr>
      <td>count condition</td>
      <td>Form a condition with the count key from the context, and return an updated context with the condition.</td>
    </tr>
  </tbody>
</table>

It is important to note that treatments cannot always be reverted to their original node tree structure. This is because different node trees might be converted into the same set of treatments.

The following is an example where two different node trees setups correspond to the same set of treatments:

- Food order complete -> if gold user -> then award A
- Food order complete -> if silver user -> then award B

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/two-node-tree-setup.png" alt="" style="width:100%"><figcaption align="middle">Figure 8. An example of two node tree setups corresponding to the the same set of treatments.</figcaption>
  </figure>
</div>

Therefore, we need to store both the campaign node tree JSON and treatments, along with the mapping between the nodes and the treatments. Campaigns are executed using treatments, but displayed using the node tree JSON.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/storing-campaigns.png" alt="" style="width:80%"><figcaption align="middle">Figure 9. For each campaign, we store both the node tree JSON and treatments, along with their mapping.</figcaption>
  </figure>
</div>

### How we handle campaign updates

There are instances where a marketing user updates a campaign after its creation. For such cases we need to identify:

- Which existing treatments should be removed.
- Which existing treatments should be updated.
- What new treatments should be added.

We can do this by using the node-treatment mapping information we stored. The following is the pseudocode for this process:

```
func howToUpdateTreatments(oldTreatments []Treatment, newTreatments []Treatment):
  treatmentsUpdate = map[int]Treatment // treatment ID -> updated treatment
  treatmentsRemove = []int // list of treatment IDs
  treatmentsAdd = []Treatment // list of new treatments to be created

  matchedOldTreamentIDs = set()

  for newTreatment in newTreatments:
    matched = false

    // see whether the nodes match any old treatment
    for oldTreatment in oldTreatments:
      // two treatments are considered matched if their linked node IDs are identical
      if isSame(oldTreatment.nodeIDs, newTreatment.nodeIDs):
        matched = true
        treatmentsUpdate[oldTreament.ID] = newTreatment
        matchedOldTreamentIDs.Add(oldTreatment.ID)
        break

    // if no match, that means it is a new treatment we need to create
    if not matched:
      treatmentsAdd.Append(newTreatment)

  // all the non-matched old treatments should be deleted
  for oldTreatment in oldTreatments:
    if not matchedOldTreamentIDs.contains(oldTreatment.ID):
      treatmentsRemove.Append(oldTreatment.ID)

  return treatmentsAdd, treatmentsUpdate, treatmentsRemove
```

For a visual illustration, let’s consider a campaign that initially resembles the one shown in figure 10. The node IDs are highlighted in red.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/campaign-node-tree-structure.png" alt="" style="width:60%"><figcaption align="middle">Figure 10. A campaign in node tree structure.</figcaption>
  </figure>
</div>

This campaign will generate two treatments.

<table style="width: 70%" class="table">
  <caption style="caption-side:bottom">Table 2. The campaign shown in the figure 10 will generated two treatments.</caption>
  <thead>
    <tr>
      <th style="width:10%">ID</th>
      <th style="width:50%">Treatment</th>
      <th>Linked node IDs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Event: food order complete <br> Condition: gold user <br> Action: award A</td>
      <td>1, 2, 3</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Event: food order complete <br> Condition: silver user <br> Action: award B</td>
      <td>1, 4, 5</td>
    </tr>
  </tbody>
</table>

After creation, the campaign creator updates the upper condition branch, deletes the lower branch, and creates a new branch. Note that after node deletion, the deleted node ID will not be reused.

<div class="post-image-section"><figure>
  <img src="/img/the-creation-of-our-powerful-campaign-builder/updated-campaign-node-tree-structure.png" alt="" style="width:60%"><figcaption align="middle">Figure 11. An updated campaign in node tree structure.</figcaption>
  </figure>
</div>

According to our logic in figure 11, the following update will be performed:

- Update action for treatment 1 to “award C”.
- Delete treatment 2
- Create a new treatment: food -> is promo used -> send push

## Conclusion

This article reveals the workings of Trident, our bespoke marketing campaign platform. By exploring the core concept of a "treatment" and additional features like Counter, Delay and Limit, we illustrated the flexibility and sophistication of our system.

We've explained changes to the Trident UI that have made campaign creation more intuitive. Transforming campaign setups into executable treatments while preserving the visual representation ensures seamless campaign execution and adaptation.

Our devotion to improving Trident aims to empower our marketing team to design engaging and dynamic campaigns, ultimately providing excellent experiences to our users.

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!