---
layout: post
id: 2022-07-08-automated-faq
title: How we automated FAQ responses at Grab
date: 2022-07-07 00:20:55
authors: [preeti-karkera]
categories: [Engineering]
tags: [Automation, Knowledge management, Productivity]
comments: true
cover_photo: /img/automated-faq/cover.png
excerpt: "Knowledge management is a constant challenge companies face internally as information is usually maintained by different teams. Most frequently asked questions are repetitive, which hinder on-call engineers' productivity. Read to find out how we automated FAQ responses at Grab, allowing engineers' to focus on operational tasks."
---

## Overview and initial analysis

Knowledge management is often one of the biggest challenges most companies face internally. Teams spend several working hours trying to either inefficiently look for information or constantly asking colleagues about information already documented somewhere. A lot of time is spent on the internal employee communication channels (in our case, Slack) simply trying to figure out answers to repetitive questions. On our journey to automate the responses to these repetitive questions, we needed first to figure out exactly how much time and effort is spent by on-call engineers answering such repetitive questions.

We soon identified that many of the internal engineering tools' on-call activities involve answering users' (internal users) questions on various Slack channels. Many of these questions have already been asked or documented on the wiki. These inquiries hinder on-call engineers' productivity and affect their ability to focus on operational tasks. Once we figured out that on-call employees spend a lot of time answering Slack queries, we decided on a journey to determine the top questions.

We considered smaller groups of teams for this study and found out that:

*   The topmost user queries are "How do I do ABC?" or "Is XYZ broken?".
*   The second most commonly asked questions revolve around access requests, approvals, or other permissions. The answer to such questions is often URLs to existing documentation.

These findings informed us that we didn't just need an artificial intelligence (AI) based autoresponder to repetitive questions. We must, in fact, also leverage these channels' chat histories to identify patterns.

## Gathering user votes for shortlisted vendors

In light of saving costs and time and considering the quality of existing solutions already available in the market, we decided not to reinvent the wheel and instead purchase an existing product. And to figure out which product to purchase, we needed to do a comparative analysis. And thus began our vendor comparison journey!

While comparing the feature sets offered by different vendors, we understood that our users need to play a part in this decision-making process. However, sharing our vendor analysis with our users and allowing them to choose the bot of their choice posed several challenges:

*   Users could be biased towards known bots (from previous experiences).
*   Users could be biased towards big brands with a preconceived notion that big brands mean better features and better user support.
*   Users may likely pick the most expensive vendor, assuming that a higher cost means higher efficiency.

To ensure that we receive unbiased feedback, here’s how we opened users up to voting. We highlighted the top features of each vendor’s bot compared to other shortlisted bots. We hid the names of the bots to avoid brand attraction. At a high level, here’s what the categorisation looked like:

<table border="1" style="text-align:center;">
  <tr>
    <td><strong>Features</strong></td>
    <td><strong>Vendor 1 (name  hidden)</strong></td>
    <td><strong>Vendor 2 (name  hidden)</strong></td>
    <td><strong>Vendor 3 (name  hidden)</strong></td>
  </tr>
  <tr>
    <td>Enables crowdsourcing, everyone is incentivised to participate. <br/> Participants/SME names are visible. <br/> Everyone can access the web UI and see how the responses configured on the bot.</td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
    <td>-</td>
    <td>-</td>
  </tr>
  <tr>
    <td>Lowers discussions on channels by providing easy ways to raise tickets to the team instead of discussing on Slack.</td>
    <td>-</td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> </td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
  </tr>
  <tr>
    <td>Only a specific set of admins (or oncall engineers) feed and maintain the bot thus ensuring information authenticity and reliability.</td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> </td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
  </tr>
  <tr>
    <td>Easy bot feeding mechanism/web UI to update FAQs.</td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
    <td>-</td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
  </tr>
  <tr>
    <td>Superior natural language processing capabilities.</td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
    <td><img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"> <img src="/img/automated-faq/image1.png" alt="" style="width:10%"></td>
    <td>-</td>    
  </tr>
  <tr>
    <td>Please vote</td>
    <td>Vendor 1</td>
    <td>Vendor 2</td>
    <td>Vendor 3</td>    
  </tr>
</table>

<br/>

Although none of the options had all the features our users wanted, ***about 60% chose Vendor 1 (OneBar)***. From this, we discovered the core features that our users needed while keeping them involved in the decision-making process.

### Matching our requirements with available vendors' feature sets

Although our users made their preferences clear, we still needed to ensure that the feature sets available in the market suited our internal requirements in terms of the setup and the features available in portals that we envisioned replacing. As part of our requirements gathering process, here are some of the critical conditions that became more and more prominent:

*   An ability to crowdsource Slack discussions/conclusions and save them directly from Slack (preferably with a single command).
*   An ability to auto-respond to Slack queries without calling the bot manually.
*   The bot must be able to respond to queries only on the preconfigured Slack channel (not a Slack-wide auto-responder that is already available).
*   Ability to auto-detect frequently asked questions on the channels would mean less work for platform engineers to feed the bot manually and periodically.
*   A trusted and secured data storage setup and a responsive customer support team.

## Proof of concept

We considered several tools (including some of the tools used by our HR for auto-answering employee questions). We then decided to do a complete proof of concept (POC) with OneBar to check if it fulfils our internal requirements.

These were the phases in which we conducted the POC for the shortlisted vendor (OneBar):

**Phase 1**: Study the traffic, see what insights OneBar shows and what it could/should potentially show. Then think about how an ideal oncall or support should behave in such an environment. i.e. we could identify specific messages in history and describe what should've happened to each one of them.

**Phase 2**: Create required records in OneBar and configure it to match the desired behaviour as closely as possible.

**Phase 3**: Let the tool run for a couple of weeks and then evaluate how well it responds to questions, how often people search directly, how much information they add, etc. Onebar adds all these metrics in the app making it easier to monitor activity.

In addition to the Onebar POC, we investigated other solutions and did a thorough vendor comparison and analysis. After running the POC and investigating other vendors, we decided to use OneBar as its features best meet our needs.

### Prioritising Slack channels

While we had multiple Slack channels that we’d love to have enabled the shortlisted bot on, our initial contract limited our use of the bot to only 20 channels. We could not use OneBar to auto-scan more than 20 Slack channels.

Users could still chat directly with the bot to get answers to FAQs based on what was fed to the bot’s knowledge base (KB). They could also access the web login, which displays its KB, other valuable features, and additional features for admins/experts.

Slack channels that we enabled the licensed features on were prioritised based on:

*   Most messages sent on the channel per month, i.e. most active channels.
*   Most members impacted, i.e. channels with a large member count.

To do this, we used Slack analytics reports and identified the channels that fit our prioritisation criteria.

### Change is difficult but often essential

Once we'd onboarded the vendor, we began training and educating employees on using this new Knowledge Management system for all their FAQs. It was a challenge as change is always complex but essential for growth.

A series of tech talks and training conducted across the company and at more minor scales also helped guide users about the bot's features and capabilities.

At the start, we suffered from a lack of data resulting in incorrect responses from the bot. But as the team became increasingly aware of the features and learned more about its capabilities, the bot's number of KB items grew, resulting in a much more efficient experience. It took us around one quarter to feed the bot consistently to see accurate and frequent responses from it.

## Crowdsourcing our internal glossary

With an increasing number of acronyms and company-specific words emerging each year, the number of acronyms and company-specific abbreviations that new joiners face is immense.

We solved this issue by using the bot’s channel-specific KB feature. We created a specific Slack channel dedicated to storing and retrieving definitions of acronyms and other words. This solution turned out to be a big hit with our users.

And who fed the bot with the terms and glossary items? Who better than our onboarding employees to train the bot to help other onboarders. A targeted campaign dedicated to feeding the bot excited many of our onboarders. They began to play around with the bot’s features and provide it with as many glossary items as possible, thus winning swags!

In a matter of weeks, the user base grew from a couple of hundred to around 3000. This effort was also called out in one of our company-wide All Hands meetings, a big win for our team!

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
