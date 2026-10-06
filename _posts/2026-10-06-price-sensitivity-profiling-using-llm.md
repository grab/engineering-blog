---
layout: post
id: 2026-10-06-price-sensitivity-profiling-using-llm
title: 'Smarter personalization: How property data helps us understand user price sensitivity'
date: 2026-10-06 00:23:00
authors: [muqi.li, jia.chen, fujiao.liu]
categories: [Engineering]
tags: [Engineering, Analytics, AI]
comments: true
cover_photo: /img/smart-personalization/banner-img.png
excerpt: "Grab combines public residential property data, LLM-powered enrichment, and hierarchical clustering to add location context to user profiles so personalization and planning can better reflect local market differences, not spend patterns alone."
---

## Introduction

Existing systems estimate user price sensitivity primarily from spending behavior or demographic proxies. They do not systematically account for residential property values, which can indicate a user's financial circumstances. This omission creates three limitations:

1. **Limited property insights**: Existing profiles do not account for property values.  
2. **One-dimensional profiles**: Users with similar spending patterns but different living standards receive the same classification.  
3. **Regional variation**: Manual classification does not adapt well to differences between property markets.

This invention adds property data to user profiles to produce affluence segments that account for regional property markets. The invention remains unimplemented and is not deployed in any live market.

## Background

Property values vary across buildings, neighborhoods, and regions. A useful classification method must account for these differences while processing property records in several formats. The same classification method could support other industries that use affluence segments.

## Solution

A  four-step method that combines public property data with clustering techniques to classify user affluence was created:

1. Data collection and enrichment.  
2. Building-level property price estimation.  
3. Property tier classification.  
4. User mapping to affluence tiers.

The method combines external property data, large language model (LLM) enrichment, and cluster-based segmentation. The resulting profiles can inform personalized offers, targeted marketing, and operational planning.

### Data gathering and processing

The system collects public property data from external sources. These records include transaction prices, building types, and related attributes in raw text formats. LLMs standardize the records and extract key attributes such as postcode, building address, transaction price, price per square meter, property size, and floor level. This stage produces a structured property-level dataset for analysis and modeling.

### Building-level price estimation

Under the proposed method, transaction records for properties within the same building would be aggregated to calculate a weighted average sale price. The weighting would account for transaction recency and data volume, with the aim of reflecting recent market conditions.

When transaction data is limited, the method could apply rules based on comparable properties in the area. It could also evaluate LLM-assisted extraction of contextual signals from appropriately licensed external sources, such as real estate listings. Any LLM-derived signals would require validation against independent reference data before contributing to a property-value estimate. 

The invention has not been implemented, deployed, or tested in a live market. Its model and version, validation methodology, error bounds, and operational safeguards remain subjects for future technical evaluation.

### Property tier classification

A hierarchical clustering model groups buildings into affluence tiers based on their estimated resale values. The model accounts for regional differences and local market-value distributions across property types and locations. This stage assigns each building to an affluence tier.

### User mapping to property tiers

The system maps would use appropriately aggregated geographic signals to associate users with broad property-market segments and assign a corresponding affluence classification. 

## Potential future applications

This invention presents a conceptual approach for exploring new ways to support personalization, advertising, and operational planning. It has not been implemented, deployed, or tested in a live market. Subject to technical validation and approval from Privacy, Legal, PR, and the relevant product owners, potential applications could include:

* Personalization: Tailoring promotions, discounts, subscription plans, and recommendations for optional products and services.  
* Advertising: Supporting more relevant connections between advertising content, merchants, and broad audience segments, alongside tailored marketing campaigns.  
* Operational planning: Informing aggregated analysis used to plan and prioritize delivery and transport capacity.

## Learnings and conclusion

This invention presents a conceptual approach that combines publicly available property data, LLM-assisted data structuring, building-level value estimation, hierarchical clustering, and contextual tier assignment. It demonstrates how regional property-market context could complement existing signals, while highlighting dependencies on data quality, model accuracy, geographic coverage, privacy, and fairness.

The approach shows potential applications in personalization, advertising, and operational planning, but these are illustrative, not demonstrated outcomes.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility, and digital financial services sectors. Serving over 900 cities in eight Southeast Asian countries: Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam. Grab enables millions of people every day to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. We operate supermarkets in Malaysia under Jaya Grocer and Everrise, which enables us to bring the convenience of on-demand grocery delivery to more consumers in the country. As part of our financial services offerings, we also provide digital banking services through GXS Bank in Singapore and GXBank in Malaysia. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line. We aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://www.grab.careers/en/)!
