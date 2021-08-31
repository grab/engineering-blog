---
layout: post
id: 2021-08-30-multi-armed-bandit-system-recommendation
title: Automating Multi-Armed Bandit Testing During Feature Rollout
date: 2021-08-30 01:20:00
authors: [weicheng-zhu][zhuolun-li][weilun-wu][da-huang]
categories: [Engineering]
tags: [Engineering, Testing, Optimisation]
comments: true
cover_photo: /img/multi-armed-bandit-system-recommendation/image7.jpeg
excerpt: "Find out how you can run an automated test and simultaneously roll out a new feature."
---

Automating Multi-Armed Bandit Testing During Feature Rollout
============================================================

A/B testing is an experiment where a random e-commerce platform user is given two versions of a variable: a control group and a treatment group, to discover the optimal version that maximizes conversion. When running A/B testing, you can take the Multi-Armed Bandit optimisation approach to minimise the loss of conversion due to low performance.

In the traditional software development process, Multi-Armed Bandit (MAB) testing and rolling out a new feature are usually separate processes. The novel Multi-Armed Bandit System for Recommendation solution, hereafter the Multi-Armed Bandit Optimiser, proposes automating the Multi-Armed Bandit testing simultaneously while rolling out the new feature.

Advantages
----------

*   Automates the MAB testing process during new feature rollouts.
*   Selects the optimal parameters based on predefined metrics of each use case, which results in an end-to-end solution without the need for user intervention.
*   Uses the Batched Multi-Armed Bandit and Monte Carlo Simulation, which enables it to process large-scale business scenarios.
*   Uses a feedback loop to automatically collect recommendation metrics from user event logs and to feed them to the Multi-Armed Bandit Optimiser.
*   Uses an adaptive rollout method to automatically roll out the best model to the maximum distribution capacity according to the feedback metrics.

Architecture
------------

The following diagram illustrates the system architecture.

<div class="post-image-section">
  <img alt="System architecture" src="/img/multi-armed-bandit-system-recommendation/image5.png">
  <small class="post-image-caption">System architecture</small>
</div>
<p>&nbsp;</p>

The novel Multi-Armed Bandit System for Recommendation solution contains three building blocks.

*   Stream processing framework

A lightweight system that performs basic operations on Kafka Streams, such as aggregation, filtering, and mapping. The proposed solution relies on this framework to pre-process raw events published by mobile apps and backend processes into the proper format that can be fed into the feedback loop.

*   Feedback loop

A system that calculates the goal metrics and optimises the model traffic distribution. It runs a metrics server which pulls the data from [Stalker](https://www.google.com/url?q=https://wiki.grab.com/display/TA/RFC%253A%2BStalkerDB&sa=D&source=editors&ust=1630064223377000&usg=AOvVaw2p482PvLMnDbakK1ldJ2J3), which is a time series database that stores the processed events in the last one hour. The metrics server invokes a Spark Job periodically to run the SQL queries that computes the pre-defined goal metrics: the Clickthrough Rate, Conversion Rate and so on, provided by users. The output of the job is dumped into an S3 bucket, and is picked up by optimiser runtime. It runs the Multi-Armed Bandit Optimiser to optimise the model traffic distribution based on the latest goal metrics.

*   Dynamic value receiver, or the GrabX variable

The optimized model traffic distributions are pushed into a dynamic value receiver (or the GrabX variable) that is set in code. The code then uses the latest probability to distribute the traffic to each model.

Multi-Armed Bandit Optimiser modules
------------------------------------

The Multi-Armed Bandit Optimiser consists of the following modules.

*   Reward Update
*   Batched Multi-Armed Bandit Agent
*   Monte-Carlo Simulation
*   Adaptive Rollout

<div class="post-image-section">
  <img alt="Multi-Armed Bandit Optimiser modules" src="/img/multi-armed-bandit-system-recommendation/image4.png">
  <small class="post-image-caption">Multi-Armed Bandit Optimiser modules</small>
</div>
<p>&nbsp;</p>


The goal of the Multi-Armed Bandit Optimisation is to find the optimal Arm that results in the best predefined metrics, and then allocate the maximum traffic to that Arm.

The solution can be illustrated in the following problem. For K Arm, in which the action space A={1,2,...,K}, the Multi-Arm-Bandit Optimiser goal is to solve the one-shot optimisation problem of ![](images/image2.png).

### Reward Update Module

The Reward Update module collects a batch of the metrics. It calculates the Success and Failure counts, then updates the Beta distribution of each Arm with Batched Multi-Armed Bandit algorithm.

### Multi-Armed Bandit Agent Module

In the Multi-Armed Bandit Agent module, each Arm's metrics are modeled as a Beta distribution which is sampled with Thompson Sampling. The Beta distribution formula is: <div class="post-image-section">
  <img alt="Formula" src="/img/multi-armed-bandit-system-recommendation/image1.png">

</div>
<p>&nbsp;</p>
.

The Batched Multi-Armed Bandit algorithm updates the Beta distribution with the batch metrics. The optimisation algorithm can be described in the following method.

<div class="post-image-section">
  <img alt="Batched Multi-Armed Bandit Algorithm" src="/img/multi-armed-bandit-system-recommendation/image6.png">
  <small class="post-image-caption">Batched Multi-Armed Bandit Algorithm</small>
</div>
<p>&nbsp;</p>

### Monte-Carlo Simulation module

The Monte-Carlo Simulation module runs the simulation for N repeated times to find the best Arm over a configurable simulation window. Then, it applies the simulated results as each Arm’s distribution percentage for the next round.

To handle different scenarios, we designed two strategies.

*   max strategy: by which we count each Arm’s Success count’s result in Monte-Carlo Simulation, and then compute the next round distribution according to the success rate.
*   mean strategy: by which we average each Arm’s Beta distribution probabilities’s result in Monte-Carlo Simulation, and then compute the next round distribution according to the averaged probabilities of each Arm.

### Adaptive Rollout Module

The Adaptive Rollout module rolls out the sampled distribution of each MAB Arm, in the form of MAB Arm Model ID and distribution, to the experimentation platform’s configuration variable. The resulting variable is then read from the online service. The process repeats as it collects feedback from the Adaptive Rollout metrics’ results in the feedback loop.

Multi-Armed Bandit for Recommendation Solution
----------------------------------------------

In the GrabFood Recommended for You widget, there are several food recommendation models that categorize lists of merchants. The choice of the model is controlled through experiments at rollout, and the results of the experiments are analysed offline. After the analysis, data scientists and product managers rectify the model choice based on the experiment results.

The Multi-Armed Bandit System for Recommendation solution improves the process by speeding up the feedback loop with the Multi-Armed Bandit system. Instead of depending on offline data which comes out at T+N, the solution responds to minute-level metrics, and adjusts the model faster.

This results in an optimal solution faster. The proposed Multi-Armed Bandit for Recommendation solution workflow is illustrated in the following diagram.

<div class="post-image-section">
  <img alt=" Multi-Armed Bandit for Recommendation Solution Workflow" src="/img/multi-armed-bandit-system-recommendation/image3.png">
  <small class="post-image-caption"> Multi-Armed Bandit for Recommendation Solution Workflow</small>
</div>
<p>&nbsp;</p>


### Optimisation Metrics

The GrabFood recommendation uses the Effective Conversion Rate metrics as the optimisation objective. The Effective Conversion Rate is defined as the total number of checkouts through the Recommended for You widget, divided by the total widget viewed and multiplied by the coverage rate.

The events of views, clicks, and checkouts are collected over a 30-minute aggregation window and the coverage. A request with a checkout is considered as a success event, while a non-converted request is considered as a failure event.

### Multi-Armed Bandit Strategy

With the Multi-Armed Bandit Optimiser, the Beta distribution is selected to model the Effective Conversion Rate. The use of the mean strategy in the Monte-Carlo Simulation results in a more stable distribution.

### Rollout Policy

The Multi-Armed Bandit Optimiser uses the eater ID as the unique entity, applies a policy and assigns different percentages of eaters to each model, based on computed distribution at the beginning of each loop.

### Fallback Logic

The Multi-Armed Bandit Optimiser first runs model validation to ensure all candidates are suitable for rolling out. If the scheduled MAB job fails, it falls back to a default distribution that is set to 50-50% for each model.

# Join us
Grab is more than just the leading ride-hailing and mobile payments platform in Southeast Asia. We use data and technology to improve everything from transportation to payments and financial services across a region of more than 620 million people. We aspire to unlock the true potential of Southeast Asia and look for like-minded individuals to join us on this ride.
 
If you share our vision of driving South East Asia forward, apply to (join)[https://grab.careers/jobs/] our team today.