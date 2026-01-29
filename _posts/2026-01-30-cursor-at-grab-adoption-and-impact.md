---
layout: post
id: 2026-01-30-cursor-at-grab-adoption-and-impact
title: 'Cursor at Grab: Adoption and impact'
date: 2026-01-29 00:23:00
authors: [akshay-misra, nguyen-karmi]
categories: [Engineering]
tags: [AI] 
comments: true
cover_photo: /img/cursor-at-grab/banner-cursor.png
excerpt: "A look inside how we scaled AI-assisted coding across Grab, moving Cursor from pilot to daily use to help us work faster and more reliably. Read what changed in our workflows with Cursor, how we integrated it responsibly, and what’s next for Cursor within Grab's ecosystem."
---

## Adoption overview

The illustration below encapsulates how Cursor is scaled across Grab, achieving rapid and widespread adoption that accelerated software development and empowered non-technical teams to build solutions.

<div class="post-image-section"><figure>
  <img src="/img/cursor-at-grab/cursor-figure-1.png" alt="" style="width:70%"><figcaption align="middle">Figure 1: Adoption overview of AI tool Cursor in Grab.</figcaption>
  </figure>
</div>

### Multi-tool strategy

Grab embraces a multi-tool strategy for AI coding assistants. Rather than committing to a single solution, we experiment with multiple tools simultaneously, allowing us to compare outcomes and adopt what works. This approach keeps us flexible in a space that evolves quickly. We covered this philosophy in a [previous post](https://www.grab.com/sg/inside-grab/stories/beyond-one-size-fits-all-why-grab-embraces-multiple-ai-coding-assistants/).

### Growth

We introduced [Cursor](https://cursor.com/) in late 2024 as one of several tools in our AI engineering toolkit. Adoption grew quickly—98% of tech Grabbers became monthly active users, and about 75% use it weekly. For comparison, Google's [2025 State of AI-Assisted Software Development](https://services.google.com/fh/files/misc/2025_state_of_ai_assisted_software_development.pdf) report highlights that even among high-performing teams, AI coding tool adoption seldom surpasses 70%. Notably, Cursor's appeal extended beyond engineering, with non-technical teams incorporating it into their workflows.

A standout metric is Cursor's suggestion acceptance rate, which is around 50%, surpassing the industry average of 30%. This indicates two key insights: first, the suggestions are sufficiently relevant for engineers to accept them half of the time; second, engineers maintain a critical review process rather than accepting suggestions indiscriminately. We attribute this relevance to continuous feedback loops and environment-specific tuning, ensuring suggestions remain aligned with Grab's codebase and conventions.

## Extent of adoption

Raw adoption figures don't provide the complete picture. We aimed to determine whether engineers were truly incorporating Cursor into their daily workflows or merely experimenting with it sporadically.

The data indicates genuine integration. Approximately half of Cursor users engage with it 10 or more days each month, with some teams achieving full adoption. Over 98% of merge requests now incorporate Cursor in some capacity. Engineers actively share tips and workflows via a dedicated Slack channel, fostering an organic knowledge base.

Across various teams, we've observed significant transitions from light usage to moderate and power user levels over the past six months.

## Engineer utilization patterns

The most common patterns we see are unit test generation, code refactoring, cross-repository navigation, bug fixing, and automation of routine tasks like API scaffolding or commit messages.

Test generation is particularly popular. Writing tests manually is tedious, and Cursor's ability to generate and iteratively refine tests has become a standard part of many engineers' workflows. Cross-repository navigation helps with onboarding and context-switching—engineers can ask Cursor questions about unfamiliar codebases rather than hunting through documentation.

Qualitative feedback confirms what the adoption numbers suggest: tasks that took a full day to complete now take hours. Engineers report tackling refactors and test additions they would have otherwise skipped due to time pressure. Cursor doesn't just speed up existing work; it makes previously impractical work feasible.

## Integration with Grab's stack

Integrating Cursor effectively at Grab required custom tooling. We built solutions for monorepo indexing to handle Grab's scale and to distribute preconfigured rules that align Cursor's suggestions with Grab-specific coding conventions. This integration ensures that Cursor understands our environment rather than offering generic suggestions.

## What's next

Cursor is one tool in a broader toolkit. Our multi-tool strategy means we're also investing in terminal-based workflows and [GrabGPT](https://engineering.grab.com/the-birth-of-grab-gpt) for internal knowledge retrieval. Different tools suit different workflows. The aim is to empower users, not to restrict them.

Beyond engineering, we're expanding AI-assisted development to new personas. Our AI Upskilling workshops have trained several hundred Grabbers across five countries, including executive committee members and senior leaders who have built and deployed their own apps. Non-engineers in Financial Planning and Analysis (FP&A), Operations, and regional teams are now building tools with the assitance of AI to solve their own pain points.

Our product design team has launched an initiative empowering designers to directly implement production fixes. Designers have successfully merged hundreds of merge requests, often with same-day turnaround, facilitating quicker iterations on UI fixes without the engineering queue delay. This process requires designers to be trained in Git fundamentals prior to gaining access, with initial reviews conducted by design managers.

Cursor has become part of daily work at Grab. But adoption is only half the question — the other half is impact. We've been running a parallel effort to measure productivity effects rigorously, using fixed-effects regression to isolate Cursor's contribution from other factors. Early findings show a dose-response relationship: productivity gains scale with usage intensity, and the effects hold up to statistical scrutiny.

We will address the measurement methodology and present our findings in a subsequent post.


## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
