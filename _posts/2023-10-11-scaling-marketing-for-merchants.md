---
layout: post
id: 2023-10-11-scaling-marketing-for-merchants
title: 'Scaling marketing for merchants with targeted and intelligent promos'
date: 2023-10-11 00:00:10
authors: [sharon-teng]
categories: [Engineering, Data Science]
tags: [Data, Advertising, Scalability, Data science, Marketing]
comments: true
cover_photo: /img/scaling-marketing-for-merchants/cover.jpg
excerpt: "Apart from ensuring advertisements reach the right audience, it is also important to make promos by merchants more targeted and intelligent to help scale their marketing. Read to find out how the Data Science team at Grab used automation and made merchant advertising a more seamless and intelligent process."
---

## Introduction

A promotional campaign is a marketing effort that aims to increase sales, customer engagement, or brand awareness for a product, service, or company. The target is to have more orders and sales by assigning promos to consumers within a given budget during the campaign period. 

<div class="post-image-section"><figure>
  <img src="/img/scaling-marketing-for-merchants/customer-feedback.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

From our research, we found that merchants have specific goals for the promos they are willing to offer. They want a simple and cost-effective way to achieve their specific business goals by providing well-designed offers to target the correct customers. From Grab’s perspective, we want to help merchants set up and run campaigns efficiently, and help them achieve their specific business goals. 

## Problem statement
One of Grab’s platform offerings for merchants is the ability to create promotional campaigns. With the emergence of AI technologies, we found that there are opportunities for us to further optimise the platform. The following are the gaps and opportunities we identified:

- **Globally assigned promos without smart targeting**: The earlier method  targeted every customer, so everyone could redeem until the promo reached the redemption limits. However, this method did not accurately meet business goals or optimise promo spend. The promotional campaign should intelligently target the best promo for each customer to increase sales and better utilise promo spending.
- **No customised promos for every merchant**: To better optimise sales for each merchant, merchants should offer customised promos based on their historical consumer trends, not just a general offer set. For example, for a specific merchant, a 27% discount may be the appropriate offer to uplift revenue and sales based on user bookings. However, merchants do not always have the expertise to decide which offer to select to increase profit. 
- **No AI-driven optimisation**: Without AI models, it was harder for merchants to assign the right promos at scale to each consumer and optimise their business goals. 

As shown in the following figure, AI-driven promotional campaigns are expected to bring higher sales with more promo spend than heuristic ones. Hence, at Grab we looked to introduce an automated, AI-driven tool that helps merchants intelligently target consumers with appropriate promos, while optimising sales and promo spend. That’s where Bullseye comes in. 

<div class="post-image-section"><figure>
  <img src="/img/scaling-marketing-for-merchants/ai-campaign-graph.png" alt="" style="width:60%"><figcaption align="middle"></figcaption>
  </figure>
</div>

## Solution 

Bullseye is an automated, AI-driven promo assignment system that leverages the following capabilities:

- **Automated user segmentation**: Enables merchants to target new, churned, and active users or all users. 
- **Automatic promo design**: Enables a merchant-level promo design framework to customise promos for each merchant or merchant group according to their business goals.
- **Assign each user the optimal promo**: Users will receive promos selected from an array of available promos based on the merchant’s business objective. 
- **Achieve different Grab and merchant objectives**: Examples of objectives are to increase merchant sales and decrease Grab promo spend.
- **Flexibility to optimise for an individual merchant brand or group of merchant brands**: For promotional campaigns, targeting and optimisation can be performed for a single or group of merchants (e.g. enabling GrabFood to run cuisine-oriented promo campaigns).

## Architecture

<div class="post-image-section"><figure>
  <img src="/img/scaling-marketing-for-merchants/architecture.png" alt="" style="width:90%"><figcaption align="middle"></figcaption>
  </figure>
</div>

The Bullseye architecture consists of a user interface (UI) and a backend service to handle requests. To use Bullseye, our operations team inputs merchant information into the Bullseye UI. The backend service will then interact with APIs to process the information using the AI model. As we work with a large customer population, data is stored in S3 and the API service triggering Chimera Spark job is used to run the prediction model and generate promo assignments. During the assignment, the Spark job parses the input parameters, pre-validates the input, makes some predictions, and then returns the promo assignment results to the backend service.

## Implementation 

The key components in Bullseye are shown in the following figure:

<div class="post-image-section"><figure>
  <img src="/img/scaling-marketing-for-merchants/implementation.png" alt="" style="width:90%"><figcaption align="middle"></figcaption>
  </figure>
</div>

- **Eater Segments Identifier**: Identifies each user as active, churned, or new based on their historical orders from target merchants. 
- **Promo Designer**: We constructed a promo variation design framework to adaptively design promo variations for each campaign request as shown in the diagram below.
  - **Offer Content Candidate Generation**: Generates variant settings of promos based on the promo usage history.
  - **Campaign Impact Simulator**: Predicts business metrics such as revenue, sales, and cost based on the user and merchant profiles and offer features. 
  - **Optimal Promo Selection**: Selects the optimal offer based on the predicted impact and the given campaign objective. The optimal would be based on how you define optimal. For example, if the goal is to maximise merchant sales, the model selects the top candidate which can bring the highest revenue. Finally, with the promo selection, the service returns the promo set to be used in the target campaign. 
    
    <div class="post-image-section"><figure>
      <img src="/img/scaling-marketing-for-merchants/promo-designer.png" alt="" style="width:90%"><figcaption align="middle"></figcaption>
      </figure>
    </div>

- **Customer Response Model**: Predicts customer responses such as order value, redemption, and take-up rate if assigning a specific promo. Bullseye captures various user attributes and compares it with an offer’s attributes. Examples of attributes are cuisine type, food spiciness, and discount amount. When there is a high similarity in the attributes, there is a higher probability that the user will take up the offer.

    <div class="post-image-section"><figure>
      <img src="/img/scaling-marketing-for-merchants/customer-response-model.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
      </figure>
    </div>  

- **Hyper-parameter Selection**: Optimises toward multiple business goals. Tuning of hyper-parameters allows the AI assignment model to learn how to meet success criteria such as cost per merchant sales (cpSales) uplift and sales uplift. The success criteria is the achieving of business goals. For example, the merchant wants the sales uplift after assigning promo, but cpSales uplift cannot be higher than 10%. With tuning, the optimiser can find optimal points to meet business goals and use AI models to search for better settings with high efficiency compared to manual specification. We need to constantly tune and iterate models and hyper-parameters to adapt to ever-evolving business goals and the local landscape. 

  As shown in the image below, AI assignments without hyper-parameter tuning (HPT) leads to a high cpSales uplift but low sales uplift (red dot). So the  hyper-parameters would help to fine-tune the assignment result to be in the optimal space such as the blue dot, which may have lower sales than the red dot but meet the success criteria.

    <div class="post-image-section"><figure>
      <img src="/img/scaling-marketing-for-merchants/hpt.png" alt="" style="width:70%"><figcaption align="middle"></figcaption>
      </figure>
    </div>  

## Impact

We started using Bullseye in 2021. From its use we found that:

- Hyper-parameters tuning and auto promo design can increase sales and reduce promo spend for food campaigns. 
- Promo Designer optimises budget utilisation and increases the number of promo redemptions for food campaigns.
- The Customer Response Model reduced promo spend for Mart promotional campaigns.

## Conclusion

We have seen positive results with the implementation of Bullseye such as reduced promo spend and maximised budget spending returns. In our efforts to serve our merchants better and help them achieve their business goals, we will continue to improve Bullseye. In the next phase, we plan to implement a more intelligent service, enabling reinforcement learning, and online assignment. We also aim to scale AI adoption by onboarding regional promotional campaigns as much as possible.

<small class="credits">Special thanks to William Wu, Rui Tan, Rahadyan Pramudita, Krishna Murthy, and Jiesin Chia for making this project a success.</small>

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
