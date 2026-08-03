---
layout: post
id: 2026-08-14-jarvis-pro-route-firsr-answer-later
title: 'Building Jarvis Pro: Route first, answer later'
date: 2026-08-14 00:00:00
authors: [christian.coffrant]
categories: [Engineering]
tags: [Artificial Intelligence, Engineering, Product, Account Management]
comments: true
cover_photo: /img/jarvis-pro/banner-img.png
excerpt: "Jarvis Pro routes account-manager questions before answering. This post explains why fluent AI replies are not enough, how routing, memory, and metric reconciliation work, and how we evaluated launch readiness."
---

## Introduction

The first Jarvis Pro prototype could produce answers that sounded right.

That was the problem.

One early answer looked polished: it named the merchant, summarized the week, and recommended pushing promotions before the next review. It was also wrong. The merchant's order volume was down, but the sharper issue was operational: more outlets were paused and fulfilment had slipped. Sending more demand into that setup would have made the merchant look worse.

That failure changed how we judged the system. Fluent was not enough.

Jarvis Pro is the AI assistant we built for Grab account managers. Its job is to help them turn account data into better merchant conversations: what changed, why it changed, and what to do next. They rarely ask clean dashboard questions. They ask: "I am meeting this merchant tomorrow. What should I tell them?" or "Which accounts in my portfolio need attention this week?"

Those questions hide decisions: scope, access, business diagnosis, and metric definition. If the system gets those wrong, confidence becomes a liability.

So the core design became: route first, answer later.

Before launch, routing matched the expected safe route in 99.4% of 351 realistic prompts drawn from labelled offline eval sets in the first half of 2026. In a focused portfolio and brand answer-quality suite, the average score moved from 78.5 to 91.0. These figures come from offline launch-readiness evaluation only; they are not business-impact proof.

## Why dashboards were easier

A dashboard answers a bounded question:

*"Show net sales for merchant X last week."*

An account review question has to diagnose the work to be done:

*"This merchant softened this week. Should I push promos, ads, or operations fixes before the review?"*

If outlets were paused, more traffic can backfire. If average order value fell, the next action may be menu or bundle design. If a dashboard, warehouse table, and local spreadsheet disagree, the first task is metric reconciliation, not recommendation.

We wanted Jarvis Pro to classify the task first, then load only the context needed for that task.

## The route as a contract

The launch router was a prompted LLM classification step constrained by a routing guide: supported task types, allowed context, answer shapes, and conditions that should force a handoff or refusal.

A broad merchant review routes differently from an ads campaign recap or an out-of-scope request. A route is not just a label; it decides the structure, metrics, tool path, and guardrails.

<div class="post-image-section"><figure>
  <img src="/img/jarvis-pro/figure-1.png" alt="" style="width:70%"><figcaption align="middle">Figure 1. Jarvis Pro routes before it answers. The route determines context, tools, and guardrails; evaluation checks each layer, not only the final response.</figcaption>
  </figure>
</div>

Here is a simplified example. The merchant and numbers are illustrative.

**User prompt**

I am seeing Merchant A soften this week. I need talking points for tomorrow's review. Should I push promos, ads, or operations fixes?

**Router decision**

```json
{
  "route": "brand_performance_action_plan",
  "scope": {"merchant": "Merchant A", "country": "Singapore"},
  "memory": "use current question context",
  "context": ["brand action plan", "approved metric catalog", "ads context"],
  "guardrails": ["no private competitor metrics", "no unsupported projection"]
}
```

**Answer extract**

Merchant A's issue looks like order volume, not basket size. Net sales fell 7.8% week-on-week and orders fell 9.1%, while average order value increased 1.4%.

Start with operations before promotions. Temporary pause rate rose from 2.1% to 4.8%, and fulfilment fell from 94.6% to 91.8%. Extra demand may leak unless the merchant fixes availability first.

Talking point: "Before we add promo depth, let's recover lost availability. If we bring pause rate back below 2.5%, we should have a cleaner read on whether the remaining gap is demand, menu, or ads."

The route prevented three common mistakes: jumping straight to discounts, inventing competitor spend, and answering from a generic growth template.

## Memory had to stay narrow

Here, "memory" means saved user context such as country, role, portfolio scope, and preferences. That context is useful when a user says "my portfolio". It is risky when saved defaults override explicit context, missing identity becomes a guess, or a memory request crosses user boundaries.

We put memory before answer generation and kept the decision small: proceed, ask for onboarding information, prefer explicit context, use saved defaults, look up portfolio scope, or refuse. Backend permissions and row-level controls remain the authorization layer.

That extra checking costs time. Jarvis Pro does route classification, memory checking, context selection, warehouse or specialist tool calls, then generation. To keep the wait usable, we loaded route-specific context, ran memory before expensive retrieval, consolidated warehouse queries, capped tool calls, and returned unavailable cells as N/A instead of looping until the conversation stalled.

That tradeoff was deliberate: a slower first token was better than a fast unsafe recommendation.

## Reconcile the metric before blaming the model

Even with good routing and memory, an assistant is only as good as the numbers it pulls.

When a user says "the number is wrong", several failures can look identical: wrong source, different metric definitions, different entity mapping, or stale data. One reconciliation pass showed that what looked like model error was sometimes just a freshness mismatch between reporting surfaces.

We built regression checks that normalised source values and compared daily rows across approved metric paths. The point was not the row count. It was knowing whether to fix source selection, metric guidance, or the caveat shown to the account manager.

## How we evaluated it

One aggregate score would have hidden the failures we cared about.

The routing set had 351 prompts labelled against the routing guide. Each prompt had an expected route family, meaning the broad business category, plus an expected route and any handoff or refusal. "Accepted route accuracy" meant the selected route was exact or semantically equivalent and safe. A wrong business family, missed handoff, or unsafe scope failed.

The answer-quality suite had 501 total cases scored on a 0-100 rubric covering template fit, metric use, diagnosis, next action quality, caveats, and guardrail compliance. Within that suite, the 150-case portfolio and brand subset improved from 78.5 to 91.0. A wrong merchant, wrong country, fabricated metric, unsupported projection, private competitor detail, or another user's memory could fail a case. All scores were measured offline against fixed rubrics for launch readiness; they do not reflect production commercial outcomes.

That caught the answer we most wanted to avoid: plausible, polished, and operationally unsafe.

## The lesson we would reuse

The final paragraph is too late to resolve ambiguity. Jarvis Pro has to earn the right to answer: route the task, check memory and access, load the right evidence, cap the tools, then judge failures at each layer.

Offline evals gave us confidence in system behaviour, not commercial uplift. Measuring that needs production telemetry: recommendations shown, actions taken, accounts affected, and outcomes.

The assistant should not merely sound like a great account manager. It should first prove it understands the account.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
