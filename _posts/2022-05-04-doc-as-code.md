---
layout: post
id: 2022-05-04-doc-as-code
title: Embracing a Docs-as-Code approach
date: 2022-05-04 08:55:55
authors: [shujuan-cheong]
categories: [Engineering, Product]
tags: [Docs-as-Code, Documentation, Technical documentation, Engineering practices]
comments: true
cover_photo: /img/doc-as-code/cover.png
excerpt: "Read to find out how Grab is using the Docs-as-Code approach to improve technical documentation."
---

The Docs-as-Code concept has been gaining traction in the past few years as more tech companies start implementing this approach. One of the most widely-known examples is [Spotify](https://backstage.io/blog/2020/09/08/announcing-tech-docs), that ​​uses Docs-as-Code to publish documentation in an internal developer portal.

Since the start of 2021, Grab has also adopted a Docs-as-Code approach to improve our technical documentation. Before we talk about how this is done at Grab, let’s explain what this concept really means.

## What is Docs-as-Code?

Docs-as-Code is a mindset of creating and maintaining technical documentation. The goal is to empower engineers to write technical documentation frequently and keep it up to date by integrating with their tools and processes.

This means that technical documentation is placed in the same repository as the code, making it easier for engineers to write and update. Next, we’ll go through the motivations behind this initiative.

## Why embark on this journey?

After speaking to Grab engineers, we found that some of their biggest challenges are around finding and writing documentation. Like many other companies on the same journey, Grab is rather big and our engineers are split into many different teams. Within each team, technical documentation can be stored on different platforms and in different formats, e.g. Google drive documents, text files, etc. This makes it hard to find relevant information, especially if you are trying to find another team’s documentation.

On top of that, we realised that the documentation process is disconnected from an engineer’s everyday activities, making technical documentation an awkward afterthought. This means that even if people could find the information, there was a good chance that it would not be up to date.

To address these issues, we need a centralised platform, a single source of truth, so that people can find and discover technical documentation easily. But first, we need to change how we write technical documentation. This is where Docs-as-Code comes in.  

### How does Docs-as-Code solve the problem?

With Docs-as-Code, technical documentation is:

*   Written in plaintext.
*   Editable in a code editor.
*   Stored in the same repository as the source code so it’s easier to update docs whenever a code change is committed.
*   Published on a central platform.

The idea is to consolidate all technical documentation on a central platform, making it easier to discover and find content by using an easy-to-navigate information architecture and targeted search.

## How is Grab embracing Docs-as-Code?

We’ve developed an internal developer portal that simplifies the process of writing, reviewing and publishing technical documentation.

Here’s a brief overview of the process:

1.  Create a dedicated docs folder in a Git repository.
2.  Push Markdown files into the docs folder.
3.  Configure the developer portal to publish docs from the respective code repository.

The latest version of the documentation will automatically be built and published in the developer portal.

<div class="post-image-section"><figure>
  <img src="/img/doc-as-code/image1.png" alt="Point multiplier" style="width:60%"><figcaption align="middle"><i>Simplified documentation process</i></figcaption>
  </figure>
</div>

This way, technical documentation is closer to the source code and integrated into the code development process. Writing and updating technical documentation becomes part of writing code, and this encourages engineers to keep documentation updated.

## Measuring success

Whenever there’s a change throughout big organisations like Grab, it can be tough to implement. But thankfully, our engineers recognised the importance of improving documentation and making it easier to maintain or update.

We surveyed our users and here’s what some have said about our Docs-as-Code initiative:

>“\[W\]ith the doc and source code in one place, test backend engineers can now make doc changes via standard code review process and re-use the same content for CLI helper message and documentation.” - Kang Yaw Ong, Test Automation - Engineering Manager


>“\[Docs-as-Code\] is a great initiative, as it keeps documentation in line and up-to-date with the development of a project. Managing documentation using a version control system and the same tools to handle merges and conflicts reduces overhead and friction in an engineer's workflow.” - Eugene Chiang, Foundations - Engineering Manager

## Progress and future optimisations

Since we first started the Docs-as-Code initiative in Grab, we’ve made a lot of progress in terms of adoption - approximately 80% of Grab services will have their technical documentation on the internal portal by April 2022.

We’ve also improved overall user experience by enhancing stability and performance, improving navigation and content formatting, and enabling feedback. But it doesn’t stop there; we are continuously improving the internal portal and providing more features for our engineers.

Apart from technical documentation, we are also applying the Docs-as-Code approach to our technical training content. This means moving both self-paced and workshop training content to a centralised repository and providing engineers a single platform for all their learning needs.


---

<small class="credits">Special thanks to the Tech Learning - Documentation team for their contributions to this blog post.
</small>

---

## We are hiring!

We are looking for more technical content developers to join the team. If you’re keen on joining our Docs-as-Code journey and improving developer experience, check out our open listings in [Singapore](https://grab.careers/jobs/job-details/?id=be841c804fee010177fceb2a4a740001) and [Malaysia](https://grab.careers/jobs/job-details/?id=be841c804fee0100502ab2e578b70001).

Join us in driving this initiative forward and making documentation more approachable for everyone!

# Join us
Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
