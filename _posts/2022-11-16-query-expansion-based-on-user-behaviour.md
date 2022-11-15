---
layout: post
id: 2022-11-16-query-expansion-based-on-user-behaviour
title: Query expansion based on user behaviour
date: 2022-11-16 00:29:00
authors: [shuailong-liang, weilun-wu, yuan-meng, simone-wong]
categories: [Engineering, Data Science]
tags: [Analytics, Data Science]
comments: true
cover_photo: /img/query-expansion-based-on-user-behaviour/cover.jpg
excerpt: "User behaviour data is a gold mine to gain insights about users and help us improve user experience. In this blog, we explore a query expansion framework based on user rewrite behaviour and how it improves user search experience and conversion. "
---

# Introduction

Our customers used to face a few common pain points while searching for food with the Grab app. Sometimes, the results would include merchants that were not yet operational or locations that were out of the delivery radius. Other times, no alternatives were provided. The search system would also have difficulties handling typos, keywords in different languages, synonyms, and even word spacing issues, resulting in a suboptimal user experience.

Over the past few months, our search team has been building a query expansion framework that can solve these issues. When a user query comes in, it expands the query to a few related keywords based on semantic relevance and user intention. These expanded words are then searched with the original query to recall more results that are high-quality and diversified. Now let’s take a deeper look at how it works.

# Query expansion framework

## Building the query expansion corpus

We used two different approaches to produce query expansion candidates: manual annotation for top keywords and data mining based on user rewrites.

### Manual annotation for top keywords

Search has a pronounced fat head phenomenon. The most frequent thousand of keywords account for more than 70% of the total search traffic. Therefore, handling these keywords well can improve the overall search quality a lot. We manually annotated the possible expansion candidates for these common keywords to cover the most popular merchants, items and alternatives. For instance, "McDonald’s" is annotated with {“burger”, “western”}.

### Data mining based on user rewrites

We observed that sometimes users tend to rewrite their queries if they are not satisfied with the search result. As a pilot study, we checked the user rewrite records within some user search sessions and found several interesting samples:

    {Ya Kun Kaya Toast,Starbucks}
    {healthy,Subway}
    {Muni,Muji}
    {奶茶,koi}
    {Roti,Indian}

We can see that besides spelling corrections, users’ rewrite behaviour also reveals deep semantic relations between these pairs that cannot be easily captured by lexical similarity, such as similar merchants, merchant attributes, language differences, cuisine types, and so on. We can leverage the user’s knowledge to build a query expansion corpus to improve the diversity of the search result and user experience. Furthermore, we can use the wisdom of the crowd to find some common patterns with higher confidence.

Based on this intuition, we leveraged the high volume of search click data available in Grab to generate high-quality expansion pairs at the user session level. To augment the original queries, we collected rewrite pairs that happened to multiple users and multiple times in a time period. Specifically, we used the heuristic rules below to collect the rewrite pairs:

- Select the sessions where there are at least two distinct queries (rewrite session)
- Collect adjacent query pairs in the search session where the second query leads to a click but the first does not (effective rewrite)
- Filter out the sample pairs with time interval longer than 30 seconds in between, as users are more likely to change their mind on what to look for in these pairs (single intention)
- Count the occurrences and filter out the low-frequency pairs (confidence management)

After we have the mining pairs, we categorised and annotated the rewrite types to gain a deeper understanding of the user’s rewrite behaviour. A few samples mined from the Singapore area data are shown in the table below.


<table class="table">
<thead>
  <tr>
    <th>Original query</th>
    <th>Rewrite query</th>
    <th>Frequency in a month</th>
    <th>Distinct user count</th>
    <th>Type</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>playmade by 丸作</td>
    <td>playmade</td>
    <td>697</td>
    <td>666</td>
    <td>Drop keywords</td>
  </tr>
  <tr>
    <td>mcdonald's</td>
    <td>burger</td>
    <td>573</td>
    <td>535</td>
    <td>Merchant -&gt; Food</td>
  </tr>
  <tr>
    <td>Bubble tea</td>
    <td>koi</td>
    <td>293</td>
    <td>287</td>
    <td>Food -&gt; Merchant</td>
  </tr>
  <tr>
    <td>Kfc</td>
    <td>McDonald's</td>
    <td>238</td>
    <td>234</td>
    <td>Merchant -&gt; Merchant</td>
  </tr>
  <tr>
    <td>cake</td>
    <td>birthday cake</td>
    <td>206</td>
    <td>205</td>
    <td>Add words</td>
  </tr>
  <tr>
    <td>麦当劳</td>
    <td>mcdonald's</td>
    <td>205</td>
    <td>199</td>
    <td>Locale change</td>
  </tr>
  <tr>
    <td>4 fingers</td>
    <td>4fingers</td>
    <td>165</td>
    <td>162</td>
    <td>Space correction</td>
  </tr>
  <tr>
    <td>krc</td>
    <td>kfc</td>
    <td>126</td>
    <td>124</td>
    <td>Spelling correction</td>
  </tr>
  <tr>
    <td>5 guys</td>
    <td>five guys</td>
    <td>120</td>
    <td>120</td>
    <td>Number synonym</td>
  </tr>
  <tr>
    <td>koi the</td>
    <td>koi thé</td>
    <td>45</td>
    <td>44</td>
    <td>Tone change</td>
  </tr>
</tbody>
</table>

We further computed the percentages of some categories, as shown in the figure below.

<div class="post-image-section"><figure>
  <img src="/img/query-expansion-based-on-user-behaviour/image1.png" alt="" style="width:80%">
  <figcaption align="middle">Figure 1. The donut chart illustrates the percentages of the distinct user counts for different types of rewrites.</figcaption>
  </figure>
</div>


Apart from adding words, dropping words and spelling corrections, a significant portion of the rewrites are in the category of Other. It is more semantic driven, such as merchant to merchant, or merchant to cuisine. Those rewrites are useful for capturing deeper connections between queries and can be a powerful diversifier to query expansion.

### Grouping

After all the rewrite pairs were discovered offline through data mining, we grouped the query pairs by the original query to get the expansion candidates of each query. For serving efficiency, we limited the max number of expansion candidates to three.

## Query expansion serving

### Expansion matching architecture

The expansion matching architecture benefits from the recent search architecture upgrade, where the system flow is changed to a query understanding, multi-recall and result fusion flow. In particular, a query goes through the query understanding module and gets augmented with additional information. In this case, the query understanding module takes in the keyword and expands it to multiple synonyms, for example, KFC will be expanded to fried chicken. The original query together with its expansions are sent together to the search engine under the multi-recall framework. After that, results from multiple recallers with different keywords are fused together.

### Continuous monitoring and feedback loop

It’s important to make sure the expansion pairs are relevant and up-to-date. We run the data mining pipeline periodically to capture the new user rewrite behaviours. Meanwhile, we also monitor the expansion pairs’ contribution to the search result by measuring the net contribution of recall or user interaction that the particular query brings, and eliminate the obsolete pairs in an automatic way. This reflects our effort to build an adaptive system.

# Results

We conducted online A/B experiments across 6 countries in Southeast Asia to evaluate the expanded queries generated by our system. We set up 3 groups:

- Control group, where no query is expanded.
- Treatment group 1, where we expanded the queries based on manual annotations only.
- Treatment group 2, where we expanded the queries using the data mining approach.

We observed decent uplift in click-through rate and conversion rate from both treatment groups. Furthermore, in treatment group 2, the data mining approach produced even better results.

# Future work

## Data mining enhancement

Currently, the data mining approach can only identify the pairs from the same search session by one user. This limits the number of linked pairs. Some potential enhancements include:

- Augment expansion pairs by associating queries from different users who click on the same merchant/item, for example, using a click graph. This can capture relevant queries across user sessions.
- Build a probabilistic model on top of the current transition pairs. Currently, all the transition pairs are equally weighted but apparently, the transitions that happen more often should carry higher probability/weights.

## Ads application

Query expansion can be applied to advertising and would increase ads fill rate. With “KFC” expanded to “fried chicken”, the sponsored merchants who buy the keyword “fried chicken” would be eligible to show up when the user searches “KFC”. This would enable Grab to provide more relevant sponsored content to our users, which helps not only the consumers but also the merchants. 

<small class="credits">Special thanks to Zhengmin Xu and Daniel Ng for proofreading this article.</small>

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!