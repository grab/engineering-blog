---
layout: post
id: 2026-06-12-scaling-out-distroless-adoption-with-ai
title: 'Scaling out Distroless adoption with AI'
date: 2026-06-12 00:00:00
authors: [jiayee.chong, kevin.leejunhong, shikai.ng]
categories: [Engineering]
tags: [Security, Containers, Artificial Intelligence, DevSecOps, Engineering]
comments: true
cover_photo: /img/scaling-out-distroless-adoption-with-ai/banner-image.png
excerpt: "Grab is moving hundreds of services to Distroless images to cut CVEs but only if workloads still run cleanly. Learn how Medium Tests became the migration gate, where the scaffolding toil stalled the campaign, and how an agentic workflow (skills, MCP, guardrails) generated tests and Docker changes at fleet scale; with humans still approving every MR."
---

## Introduction

Grab is migrating from heavy base images like Ubuntu to **Distroless images** to reduce security risks. By stripping containers down to the bare application and its runtime, we eliminate unnecessary binaries and Common Vulnerabilities and Exposures (CVEs).

This migration is more than a compliance mandate; it is a strategic security decision to build a more resilient and defensible production environment. By moving to Distroless, we are fundamentally shrinking our attack surface; eliminating the binaries and shells that attackers use for lateral movement. With over 900 services already transitioned, we are on track for 80% adoption by mid-2026.

## Why Distroless requires rigorous testing

### Distroless adoption risk: runtime failure

However, shifting to Distroless images introduces a critical technical risk: **runtime failure**. A service might build perfectly in Continuous Integration (CI), but fail at the deployment stage due to:

* **Missing shared objects**: Binaries might require specific libraries (`.so` files) present in Ubuntu but absent in Distroless.
* **Implicit links**: Third-party tools may expect specific system utilities or directory structures.

Testing is required to ensure two things:

* The service spins up with the correct config.
* All runtime dependencies remain intact.

Scaling this verification across thousands of services manually? That would take years unless we found a way to automate the trust.

## The testing methodology

As we perform changes to the Dockerfile definition of our services, it is crucial for us to include the corresponding test strategy so that changes we make do not introduce regressions in our running services. Assessing the change introduced to our services, the lowest possible testing boundary would be that of what we define as Medium Tests in Grab.

### Medium tests in Grab

At Grab, we categorize our test suites into three main sizes: small, medium and large. Small tests refer to functional tests whereby mocks are introduced via dependency injection. Large tests refer to end-to-end tests that run on actual services in our staging environment where nothing is mocked.

<div class="post-image-section"><figure>
  <img src="/img/scaling-out-distroless-adoption-with-ai/mammoth-image-1.png" alt="Architecture diagram of a medium test environment." style="width:70%"><figcaption align="middle">Figure 1. Architecture diagram of a medium test environment.</figcaption>
  </figure>
</div>

Medium tests belong in the middle ground, whereby external dependencies (such as service to service dependencies) are mocked with a network proxy layer in a similar concept as [WireMock](https://wiremock.org/), but internal dependencies like MySQL are not mocked and instead spun up using [Testcontainers](https://testcontainers.com/). In this setup, systems under test are actually built into Docker containers and run in Docker before their endpoints are being hit by test inputs, with the corresponding responses being asserted on. As such, we could now effectively test if any changes of the Dockerfile definition broke the service. An added bonus is that all of these could occur within the CI environment, without reaching the Continuous Deployment (CD) stage.

<div class="post-image-section"><figure>
  <img src="/img/scaling-out-distroless-adoption-with-ai/mammoth-image-2.png" alt="Happy path for Distroless changes." style="width:80%"><figcaption align="middle">Figure 2. Happy path for Distroless changes.</figcaption>
  </figure>
</div>

This makes Medium Test effective and efficient for testing changes to the services associated with distroless adoption. We could now largely scale up our adoption process by:

1. Raising batch Merge Requests to dockerfile definitions for Distroless adoption.
2. Running medium tests in CI.
3. Upon passing the medium tests, automatically merge the changes and trigger CD. 

## Introduction of toil

The approach above works nicely for services that already have Medium Tests defined. However, we quickly hit a blocker running this rollout methodology for services without a Medium Test setup. Inherently, scaffolding Medium Tests for a service is a tedious task. Most of the toil comes from first figuring out the internal dependencies, then spinning up their corresponding test containers in test time before wiring the internal dependencies up with the service under test by updating the test environment configurations.

<div class="post-image-section"><figure>
  <img src="/img/scaling-out-distroless-adoption-with-ai/mammoth-image-3.png" alt="Current gap in Medium Test coverage." style="width:80%"><figcaption align="middle">Figure 3. Services without Medium Test setup blocked the rollout.</figcaption>
  </figure>
</div>

These tasks are not challenging but are generally tedious to set up. At the same time, they cannot be automated completely given the different internal dependency combinations that each service uses, as well as the difference in how the configurations are being defined and used in each service. With ~400 services in scope without Medium Test setup, this became a huge blocker for our distroless migration campaign.

The need for flexibility in how each task is executed, together with each task's fairly low complexity, made artificial intelligence (AI) a natural tool to accelerate distroless adoption work.

## AI: The toil buster

<div class="post-image-section"><figure>
  <img src="/img/scaling-out-distroless-adoption-with-ai/mammoth-image-4.png" alt="Solution leveraging AI." style="width:70%"><figcaption align="middle">Figure 4. Solution overview: AI-driven workflow for Medium Test scaffolding and migration.</figcaption>
  </figure>
</div>

AI was a good fit because the work we needed to automate had **clearly defined output**, and we could tell, deterministically, whether it worked. Success was straightforward: the CI pipeline would turn **green**, running **basic Medium test health checks**. With a measurable end goal and a reliable success signal, we pursued an **agentic workflow** rather than a one-off generation attempt.

### The starting point

We started by adopting **[skills](https://code.claude.com/docs/en/skills)** to guide the agent on how to proceed with Medium test work and how to unblock itself when it hit repo-specific friction. These skills gave context for scaffolding basic Medium tests, setting up internal dependencies, and debugging issues in the code. Once those foundations were in place, we rolled the approach out to a batch of **20 services**, completed by the AI in about **two working days**. That batch validated the core hypothesis: the AI could scaffold Medium tests first, then use those tests to verify that our Dockerfile change (building **distroless images**) introduced no regressions.

### Teaching an agent to test

At that point, the real shift was turning "can do the task" into "can repeat the behavior." We captured the Medium-test knowledge as a **list of skills** grounded in Grab's internal Medium test SDK.

Then DevSecOps wrapped those skills into an **Entrypoint Skill**, an orchestrator that runs a **multi-phase** workflow across services. The result is a single agent loop that moves from candidate detection, to scaffolding, to fixing failures, and onward to CI verification without treating each service as a brand-new, one-off problem.

<div class="post-image-section"><figure>
  <img src="/img/scaling-out-distroless-adoption-with-ai/mammoth-image-5.png" alt="Workflow overview for Medium Test generation." style="width:70%"><figcaption align="middle">Figure 5. Workflow overview for Medium Test generation.</figcaption>
  </figure>
</div>

Leveraging the skills we've acquired, we utilized [Claude Code](https://docs.anthropic.com/en/docs/claude-code/overview), Anthropic's agentic coding tool. This tool operates by accepting a list of services and then processing them in a batch.

* **Detect**: Is this a deployable service or is it a library? Is it still maintained? The agent skips anything that doesn't qualify, so human time is only spent on real candidates.
* **Scaffold**: Using Grab's scaffolding tool, the agent generates the medium test boilerplate.
* **Fix**: The scaffold rarely works on the first try due to the unique setup of each repository like missing environment variables, database dependencies at startup, port mismatches, and similar issues. The agent reviews its knowledge base and pattern-matches errors against known fixes.
* **Raise MR**: Once the medium test passes locally, the agent creates a draft merge request on GitLab with a description explaining what changes were done for that specific service and why.
* **Monitor CI**: The agent polls the pipeline, reads job logs on failure, and attempts CI-specific fixes. If the same error persists after two attempts, it flags the issue for human review.
* **Repeat**: Push the fix and move to the next service while the pipeline runs. The agent doesn't sit idle waiting for CI! It starts scaffolding the next service asynchronously, checking back on previous pipelines as results come in.

### What made it work

Getting the workflow to *function* was the easy part. Getting it to function *reliably across hundreds of services* required deliberate design choices.

**Model Context Protocol (MCP)**: The agent never leaves Claude Code. GitLab interactions like creating branches, raising MRs, reading pipeline error logs, all happen through a [MCP](https://modelcontextprotocol.io/) server. When the agent needs Grab-specific context like what a service does, or who owns it, it queries Glean, an enterprise search tool used by Grab through its MCP integration rather than guessing. For code-level context, finding how a service is structured or how dependencies are wired across repositories, it queries Sourcegraph through its own MCP integration.

**Guardrails over autonomy**: The agent can only touch test files and CI configs.  Application code is off-limits, enforced before every commit. It can't gut tests to make them pass. If it can't fix the problem, it escalates.

**Knowledge that compounds**: We maintain a feedback loop for scaffolding, mocking, and known failure patterns. After each batch, we review what the agent hit and promote recurring fixes into the skill. The agent improves not because the model gets better, but because its instructions do.

**Integrating scripts with skills**: For deterministic tasks like boilerplate generation, scripts are far more reliable than raw AI logic. By integrating these scripts as "skills," we also optimize the agent's performance in context window management. During test execution, standard output often produces hundreds of lines of repetitive logs that could exhaust token limits or distract the model. Using a script as an intermediary allows us to programmatically filter logs, extracting only the specific error messages or stack traces required for debugging. This ensures the AI receives a clean, actionable summary rather than being overwhelmed by noisy data.

**Token efficiency**: Batch runs across dozens of services burn through tokens fast. We configured a compressed communication style that cuts output by ~75%, keeping technical substance while stripping filler. Proper communication is reserved for MR descriptions and messages to service owners.

**Isolated execution**: Each batch run spawns the agent in its own context window. Long sessions processing dozens of services don't bloat the main conversation, keeping the agent focused and responsive.

**Human-in-the-loop**: Every MR is raised as a draft; a human reviews before anything merges. A human also decides which learnings become permanent knowledge. The agent proposes; people approve.

### From tests to migration at scale

With medium tests in place across our service fleet, we had the safety net we needed. The next step was automating the distroless migration itself.

#### The patch-test-compare loop

<div class="post-image-section"><figure>
  <img src="/img/scaling-out-distroless-adoption-with-ai/mammoth-image-6.png" alt="Patch–test–compare loop for Distroless migration." style="width:70%"><figcaption align="middle">Figure 6. Patch–test–compare loop: baseline Medium Tests, apply Distroless Dockerfile changes, re-run tests, and triage results.</figcaption>
  </figure>
</div>

Before touching a single Dockerfile, the system runs the service's existing medium tests to establish a baseline. Pre-existing test failures are baselined, allowing for a clear distinction between legacy issues and new regressions introduced by the distroless patch.

Then comes the distroless patching. The system inspects each service's Dockerfile for OS-level package dependencies by scanning for **`apt-get install`** lines and filtering out packages already included in the distroless base image. Two scenarios to consider here:

* If no extra packages are needed, it's a straightforward base image swap.
* If packages are detected, the system generates a multi-stage build: a builder stage installs the required packages, then copies only the necessary shared libraries into the distroless runtime stage. The result is a minimal image that still has everything the service needs to run.

After patching, the same medium tests run again. Results fall into clear categories: **pass** (tests still green - safe to migrate), **regression** (tests broke - the patch caused a problem), or **already failing** (was broken before we touched it). Regressions trigger an automated remediation step. A separate AI agent inspects the container for missing shared libraries and attempts to fix the Dockerfile. If it can't resolve the issue, the service is flagged for human review.

#### Scaling with batch changes

The previous section explains the patch-test-compare loop, but how can we scale to handle more than one service at a time? To migrate at scale, we use batch change tooling that applies the Dockerfile transformation across dozens of repositories simultaneously, creating merge requests automatically. The system handles both standalone GitLab repositories and Grab's shared Go monorepo, adapting the patching and MR strategy to each.

## Impact on our services

### Medium test generation at scale

With medium tests in place, services with possible regressions have higher chances of being caught before reaching staging, providing the safety guarantee we needed. Each generated test also became a permanent safety net for the service, not just for the distroless migration but for all future changes. Over 1.5 months, the agent raised 100+ medium test MRs across repositories, bringing more services into compliance with Grab's "shift-left" testing initiative.

### Distroless adoption

The campaign moved the needle significantly across our service fleet. Overall distroless adoption for our scope grew from 52.7% in December 2025 to 70.8% by April 2026, covering 997 out of 1,408 services.

### Autonomous with oversight

The agent autonomously handles the majority of medium test generation and Dockerfile migration work with little human intervention for standard cases. Engineers remain in the loop, reviewing every draft MR and making the final call on what merges.

### Engineering bandwidth reclaimed

Manually generating a basic medium test requires familiarity with Grab's internal SDK, typically 1–3 days per repository for developers new to the framework. Across ~400 services without medium tests, that adds up to 400–1,200 engineer-days. By leveraging AI we brought this down to roughly 0.1 days per service, compressing what would have taken well over a year into a fraction of the calendar time. This freed the team to focus on higher-leverage work like improving migration tooling, handling edge cases, and advancing the roadmap beyond distroless.

## Conclusion

With distroless images and stronger medium test coverage, we made Grab's services more secure and easier to verify. We demonstrated that AI can shoulder much of the scale-up effort.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
