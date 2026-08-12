---
layout: post
id: 2026-08-10-grab-bench-evaluating-ai
title: 'Grab Bench: Evaluating AI on Grab-shaped production work'
date: 2026-08-1 00:00:00
authors: [christian.coffrant]
categories: [Engineering]
tags: [Artificial Intelligence, Engineering, Product, Machine Learning]
comments: true
cover_photo: /img/grab-bench/banner-img.png
excerpt: "Broad AI benchmarks are good at telling us which models look strong on public leaderboards. They are less good at catching the quiet failures that break production systems. Grab Bench is our internal evaluation framework for testing AI models and agents on Grab-shaped work, with task-specific scoring, hidden cases, and row-level failure analysis so teams can see what actually went wrong."
---

## Introduction

What worried us wasn’t the hallucination, it was the subtle plausibility. Answers an engineer could easily read past and accept: a right-looking Structured Query Language (SQL) query, a plausible tool call, an innocent profile update, or a patch that satisfied the surface tests.

When we analyzed the row-level failures, a clear pattern emerged:

* SQL generation: kept the query shape but changed the underlying metric.
* Tool calling: selected the right tool family but drifted on parameters.
* Profile updates: cited every event instead of only the evidence that supported the claim.
* Coding agents: passed visible tests while missing a hidden stateful invariant.

Grab Bench bridges this exact gap. Grab Bench is a configurable eval (evaluation) harness for artificial intelligence (AI) systems on Grab-shaped work. It runs model providers through task plugins, records one row per case/model pair, and uses deterministic scorers or large language model (LLM) judges depending on the task. We treat the eval like software: version it, run baselines, keep score records, and make the failure modes visible enough for a team to debug.

This write-up focuses on the design choices behind that work.

## The problem: plausible is not correct

Public leaderboards are still useful; we read them too. They just answer a different question. A product team needs to know whether a model can preserve a metric definition, obey an internal tool contract, stay cautious with weak evidence, or make a code change without breaking behaviour hidden from the prompt.

The hard part is that real examples are rarely reusable as-is. Production traces, schemas, user records, and internal workflows need protection. So the benchmark has to preserve the shape of the work without depending on the work itself.

That constraint shaped Grab Bench from the beginning. Some surfaces stay internal. Others use synthetic or redacted cases. Either way, the case has to keep the thing that makes the work hard: metric faithfulness, tool-parameter discipline, evidence grounding, safety boundaries, or repository-level behaviour.

## What Grab Bench runs

The harness is deliberately ordinary. A YAML configuration defines providers, models, task settings, sampling, concurrency, judge settings, and output paths. The runner loads rows, checks whether each model supports the required modality and application programming interface (API) family, calls the task plugin, and writes row-level records plus model summaries for dashboards.

The unusual part is that each task owns its contract:

* Query generation cares about preserving metric and schema intent.
* Tool use compares canonical tool names and parameters.
* Multimodal pair matching scores constrained yes/no decisions.
* Passenger-profile reasoning checks grounded claims, evidence, uncertainty, action quality, and safety.
* Agentic coding runs visible and hidden workspace tests, plus hard-failure and anti-gaming checks.

This is why the row record matters. A leaderboard can tell us that one model is ahead. It cannot tell us whether the loss came from a fabricated evidence identifier (ID), a weak action, a hidden invariant, latency, cost, or a genuine capability gap.

Each run also keeps the unglamorous fields that make reruns possible: token use, latency, judge latency where applicable, skip reasons, resolved configurations, and dashboard-ready summaries. Without those fields, the next comparison starts from memory instead of evidence.

Figure 1 is deliberately boring: add a plugin; providers, records, and dashboards stay shared.

<div class="post-image-section"><figure>
  <img src="/img/grab-bench/figure-1.png" alt="" style="width:70%"><figcaption align="middle">Figure 1. Grab Bench keeps execution shared while task plugins own request shaping, parsing, and scoring.</figcaption>
  </figure>
</div>

## Design choice 1: make the cases safe, not generic

A useful eval case should feel familiar to the people who own the system. It should include distractors, stale context, ambiguous evidence, and the kind of boundary conditions that make production work tricky.

In passenger-profile reasoning, each case is a synthetic evidence ledger: rides, food, support, app events, saved places, promotions, and noise. All cases use synthetic data with no live user records. The model must return strict JavaScript Object Notation (JSON). Claims must come from an ontology; values must be valid for that claim; evidence IDs must exist; weak or sensitive inferences should be suppressed, not laundered into confident prose.

The scorer is deliberately mechanical where it can be: schema validity, claim correctness, evidence faithfulness, confidence calibration, action quality, and safety. It distinguishes required claims from acceptable auxiliary claims and forbidden claims, so a model can get credit for useful extra evidence without getting a pass on unsafe or unsupported inferences.

A simplified case might ask whether a passenger has a stable weekday commute:

* The evidence ledger contains repeated morning rides from a home-like saved place to an office-like area, plus unrelated food orders and stale support contacts.

* A good answer returns a claim such as `weekday_commute = likely_home_to_office_commute`, cites only the commute evidence IDs, and keeps confidence within the allowed range.

* The scorer checks that the claim and value exist in the ontology, that every cited evidence ID exists, and that the cited rows actually support the claim.

* If the model cites every event, fabricates an ID, adds a dietary-preference claim from one old order, or recommends an unsafe action, the row gets explicit failure tags or a score cap.

* The result is still a number, but the row also says what failed, which is what an engineer needs to fix the prompt, scorer, data, or model choice.

For agentic coding, the repository is synthetic too, but it asks for a real-shaped change: default ride insurance across backend services, API compatibility, mobile helpers, analytics events, rollout controls, migration compatibility, idempotency, concurrency, and cancellation lifecycle. A patch that only satisfies visible tests is not enough.

The safety comes from using synthetic data. The pressure comes from keeping the real contract intact.

## Design choice 2: score contracts, not confidence

LLM judges are useful for open-ended tasks such as SQL, where correctness can depend on business intent and query shape. But for many surfaces, the benchmark should not ask another model whether an answer seems good.

Grab Bench uses deterministic scoring when the task contract allows it. Passenger-profile reasoning scores ontology values and evidence IDs. Tool use compares canonical tool names and parameters. Multimodal pair matching scores exact labels. Agentic coding scores visible and hidden tests, maintainability, efficiency, and hard-failure gates.

The audit trail is the point. A fluent answer should not get credit for missing the contract. The row needs to say whether the model misunderstood the task, ignored a constraint, exceeded a budget, or produced something plausible but unsupported.

## Design choice 3: make shortcuts visible

Benchmarks get weaker when shortcuts work. The scorer has to make those shortcuts visible.

In the reasoning benchmark, fabricated evidence IDs, unsupported claims, broad cite-everything behaviour, unsafe actions, and forbidden sensitive claims trigger penalties or caps. In the coding benchmark, hidden-test tampering, network-access patterns, oversized patches, case-id leakage, visible-only overfit, and implausible difficulty curves are blocked or investigated.

Baselines make that visible. Empty output, schema-only output, cite-all-evidence output, unsafe-sensitive output, no-op coding agents, and reference agents are not busywork; they are checks on the scorer. If a shortcut baseline can pass, the benchmark is not ready.

This is not about assuming bad faith. It is about refusing to reward behaviour that would fail the moment it left the harness. A profile update that cites every event has not shown evidence discipline. A SQL answer that changes the metric has not preserved intent. A coding agent that passes only visible tests has not earned trust.

## Internal reproducibility and hidden pressure

The package has to be inspectable and hard to overfit at the same time. Engineers need to rerun the harness, read score records, and understand failures. Certification still needs unseen cases, or we end up optimising prompts against the examples everyone can see.

Grab Bench handles this with a split between teaching artifacts and certification artifacts. Teaching artifacts explain the task contract, scorer, examples, baselines, and canaries. Certification artifacts keep hidden splits, seeds, raw outputs, and full comparison evidence behind the right access boundaries.

One dataset cannot do all of that honestly. Shared examples are for learning the method. Hidden cases are for checking generalisation. Row-level outputs are for debugging. Aggregates are for comparison.

Before a comparison run is trusted, the package also has to pass gates: oracle or reference solutions behave as expected, weak baselines fail, redaction passes where applicable, score spread remains useful, and canaries catch harness regressions. Here, a canary is a deliberately simple or malformed case with a known expected result, such as a no-evidence profile update that must be rejected.

<div class="post-image-section"><figure>
  <img src="/img/grab-bench/figure-2.png" alt="" style="width:70%"><figcaption align="middle">Figure 2. Teaching artifacts and certification artifacts share the same harness but need different access boundaries.</figcaption>
  </figure>
</div>

## What we learned

The most useful Grab Bench output is often not the leaderboard. It is the failure taxonomy.

We saw that more reasoning is not a universal good. It can help planning-heavy tool use and hurt tasks that need literal schema discipline. Evidence selection is also part of reasoning: citing everything is not safer when only a few rows are direct support. For agentic coding, category-level results matter because a model can handle API contracts while missing stateful invariants.

We also learned not to treat prompt or model settings as universal. A setting that helps one task can make another worse. That pushed us toward task-level reports, not one global recommendation, and toward comparisons that show failure tags alongside scores.

Most of all, evals need hygiene: versions, baselines, gates, dashboards, and scope limits.

One limit is worth stating plainly: synthetic evals do not prove production uplift. They tell us whether a model respects the contract under controlled pressure. Live retrieval quality, user impact, and rollout decisions still need separate evidence.

## What comes next

Next, we want the benchmark surfaces to look more like pipelines. Instead of scoring only the final answer, we want to separate retrieval, reasoning, action selection, latency, cost, and safety where the task supports it.

We also want packages to be easier for other teams to reuse. A good eval should not depend on one team remembering how it works; it should be documented, versioned, and safe enough for others to run.

Grab Bench is our attempt to make AI evaluation boring in the useful way: configuration in, rows out, failures explained, shortcuts caught. The question is not which model wins in the abstract. It is which model is ready for this work, under these constraints, with these failure modes.

The test I would apply to any eval is simple. If a cite-everything baseline can pass, the eval is not measuring evidence discipline. If a visible-test-only agent can pass, it is not measuring production behaviour. The useful conversation starts when the benchmark can show the shortcut and make it fail.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
