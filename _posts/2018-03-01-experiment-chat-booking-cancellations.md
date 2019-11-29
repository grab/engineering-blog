---
layout: post
id: experiment-chat-booking-cancellations
title: How Grab Experimented with Chat to Drive Down Booking Cancellations
date: 2018-03-01 00:43:40
authors: [ishita-parbat, kaisen-wang, joseph-khan, mike-tee]
categories: [Product]
tags: [Chat, Booking, Experiment]
comments: true
cover_photo: /img/experiment-chat-booking-cancellations/cover.png
excerpt: "At Grab, we consistently strive to build a platform that delivers excellent user experience to both our Passengers and Driver-Partners. A major degradation to a seamless booking experience is the cancellation of that booking."
---

## Booking cancellations are frustrating and costly

At Grab, we consistently strive to build a platform that delivers excellent user experience to both our Passengers and Driver-Partners. A major degradation to a seamless booking experience is the cancellation of that booking. A cancelled booking is an unpleasant experience and a costly event which only frustrates all parties involved.

<p class="text-center" style="font-weight: bold;">Cancellations at Grab</p>
<div class="post-image-section">
  <img alt="Figure 1 - High intent bookings not completed due to cancellations" src="/img/experiment-chat-booking-cancellations/cancellations.png">
  <small class="post-image-caption">Figure 1 - High intent bookings not completed due to cancellations</small>
</div>

Post allocation cancellations are particularly painful; these are cases where a strong intent to take a ride is expressed, the price is agreed upon but the trip eventually does not happen.  While we recognise that some cancellations are unavoidable, we wanted to know if there are instances where such cancellations, particularly the ones post allocation, can be prevented.

## Service Design as part of our customer-centric culture

Service Design is the process of generating a product, policy or any kind of enhancement that improves the user experience while hitting business metrics.

Booking cancellations were a key problem of which the team was convinced that, with the right interventions in place, some cancellations could be prevented. To identify these scenarios the team conducted several rounds of user research to understand the root cause of cancellations and devise a valid and quality solution that would enhance the ride experience of both Passengers and Driver-Partners.

One interesting anecdote they heard from Driver-Partners was that when the Driver-Partner informed the Passenger that he was on the way to the pick up point, the booking had a lower likelihood of being cancelled! A simple message from the Driver-Partner could help reduce perceived waiting time for Passengers and give them confidence in the service.

This triggered us to dive deeper into understanding the correlation between a GrabChat message and cancellation rates.

## GrabChat is indeed correlated to reduced cancellation rates

GrabChat is our in-app messaging system that allows the matched Passenger and Driver-Partner to chat with each other during the booking, saving on the costs of phone calls and/or SMSes while continuing to be on the app.

We dug into our data to validate the feedback that Service Design team had received and discovered an interesting correlation; bookings which had a GrabChat conversation indeed had a lower likelihood of being cancelled. When the two parties established contact through chat, it transformed the service from a mere transaction to something more human. And this human touch to the service reduced perceived waiting time, making Passengers and Driver-Partners more patient and accepting of any unavoidable delays that might arise.

Building on this insight, we hypothesised that if we could encourage both parties to engage via a chat conversation upon getting a matched ride, we could potentially avoid a cancellation due to the prompted communication at no additional cost to the Passenger, Driver-Partner or our platform. To validate this, we conducted a series of iterative experiments.

## Experimentation on automated-messages and delay-time

First, we tested with system-generated concise and informational messages sent at different delay-time intervals to test and validate if delays matter. We quickly observed that sending out a GrabChat automated-message sooner rather than later was more successful in preventing a booking cancellation. Once we identified the winning-variant on the delay-time to send a message, we explored a variety of message-verbiages, tones and styles across different cities to observe the varying effects.

Test variations included:

* open-ended questions

* direct asks for specific details such as the pick-up location

* first-person-speak (on the Driver-Partner’s behalf)

* Inclusion of *emojis*

<div class="post-image-section">
  <img alt="Figure 3 - Experiment Design for Varying delay time" src="/img/experiment-chat-booking-cancellations/delays.png">
  <small class="post-image-caption">Figure 2 - Experiment Design for Varying delay time</small>
</div>

<table width="100%">
  <tr>
    <td width="50%">
      <div class="post-image-section">
        <img alt="Figure 3 - Examples of automated-messages in GrabChat" src="/img/experiment-chat-booking-cancellations/automated-message-1.png" width="85%">
      </div>
    </td>
    <td width="50%">
        <div class="post-image-section">
          <img alt="Figure 3 - Examples of automated-messages in GrabChat" src="/img/experiment-chat-booking-cancellations/automated-message-2.png" width="85%">
        </div>
    </td>
  </tr>
</table>

<div class="post-image-section">
  <small class="post-image-caption">Figure 3 - Examples of automated-messages in GrabChat</small>
</div>

<div class="post-image-section">
  <img alt="Figure 4 - We experimented on different localized messages based on local cultures" src="/img/experiment-chat-booking-cancellations/localized-message.png" width="50%">
  <small class="post-image-caption">Figure 4 - We experimented on different localized messages based on local cultures</small>
</div>

### Successful experiments yielded new learnings

After thoroughly testing in different cities and verticals, we observed that this small change to the user experience resulted in a reduction of booking cancellations by up to 2 percentage points. In the process, we learnt a lot more about our passengers! For example, it was amazing to observe how, in Kuala Lumpur, Passengers responded best to personalised questions in first-person-speak whereas a simple direct message worked better in Bangkok!

<p class="text-center" style="font-weight: bold;">Cancellation Rate during Experiment</p>
<div class="post-image-section">
  <img alt="Figure 5 - Cancellation rates consistently dropped in all the experimented cities" src="/img/experiment-chat-booking-cancellations/rate-drop.png">
  <small class="post-image-caption">Figure 5 - Cancellation rates consistently dropped in all the experimented cities</small>
</div>

Another key observation was that while the *average number of messages per booking exchanged* between a Passenger and Driver-Partner was higher in the Control groups, cancellations still decreased in comparison to the Treatment groups. This showed us that quality, not quantity, of engagement through chat was the real metric mover. When we sent a clear directed question to the passengers, we were able to solicit a quick and meaningful response which made the conversation and the pick-up experience more efficient.

## Conclusion

Through these experiments and product enhancements, Grab is dedicated to making the experience on our platform more human-centric and context-specific. This is why we build hyper-local products like GrabChat which not only helps our Indonesian Driver-Partners save hundreds in call and SMS costs but also allows our chat-loving Filipino Passengers to talk carefree!

The process is scientific, iterative and often born out of the simplest of ideas - in this case, making people talk more to improve the booking experience.

**Learn more about Grab**

This is one of a number of interesting showcases around Grab’s many services and features. We hope that this short story has piqued your interests in Grab - please feel free to contact us if you like to find out more or check out our Tech Blog [here](http://engineering.grab.com/).
