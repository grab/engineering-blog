---
layout: post
id: 2026-03-15-r8-optimization-at-scale-with-ai-assisted-debugging
title: 'Enabling R8 optimization at scale with AI-assisted debugging'
date: 2026-03-15 00:23:00
authors: [van.minh]
categories: [Engineering]
tags: [AI]
comments: true
cover_photo: /img/r8-optimization/banner.png
excerpt: "How Grab enabled R8 optimization for its Android app at scale—over 9 million lines of code and 100+ engineers. We achieved 25% Application Not Responding (ANR) reduction, 16% app size decrease, and 27% faster startup through AI-assisted debugging with Model Context Protocol (MCP) tools, pragmatic testing strategies, and optimized feedback loops."
---

Grab is Southeast Asia's leading superapp, providing a suite of services that bring essential needs to users throughout the region. Its offerings include ride-hailing, food delivery, parcel delivery, mobile payments, and more. With safety, efficiency, and user-centered design at heart, Grab remains dedicated to solving everyday issues and improving the lives of millions. As our app continues to expand, we identified platform-level performance challenges that were affecting user experience across the board. In this article, we share how we successfully enabled R8 optimization for the [Grab Android app](https://play.google.com/store/apps/details?id=com.grabtaxi.passenger&hl=en), achieving significant improvements in app size, startup time, and stability through innovative AI-assisted debugging techniques.

## Introduction

Since 2024, our team observed a concerning trend: Application Not Responding (ANR) rates were spiking across the Grab app. Unlike typical isolated issues, the data revealed that ANRs were happening everywhere, not confined to specific features or modules. This pattern pointed to platform-level causes, with our analysis showing strong correlations between ANRs and several factors like memory pressure (particularly when garbage collection was triggered), ad-heavy user flows, overhead from heavy use of Jetpack Compose within XML layouts, and XML views within Compose code.

The Android community had long proven that R8 optimization (beyond basic code shrinking) could deliver substantial performance gains and app size reductions. As Grab has been adopting Jetpack Compose over the last two years, [Google's Jetpack Compose performance documentation](https://developer.android.com/develop/ui/compose/performance#config) specifically recommends R8 optimization for Compose-heavy apps. This made it a natural solution for our systemic performance issues.

## The challenge at scale

However, enabling R8 optimization for Grab's Android app was far from straightforward. Our app operates at a massive scale with over 9 million lines of code and more than a hundred engineers actively working on it daily. While we had basic R8 shrinking enabled, advanced optimization had proven challenging despite multiple attempts over six years (earlier with adopting DexGuard, later with R8 optimization).

In 2022, we almost succeeded with R8 optimization after successfully rolling it out onto our early access build. We were unfortunately faced with [critical roadblocks](https://issuetracker.google.com/u/0/issues/240077160) that compelled us to put the project on hold. After analyzing our previous attempts and the current project situation, we identified three fundamental challenges that had to be solved simultaneously.

This article explains how we tackled each challenge through targeted innovations, including **AI-assisted debugging** for slow investigation cycles, **pragmatic testing strategy** for validation at scale, and **optimized feedback loop** for rapid iteration.

## Understanding R8 optimization

Before diving into our solution, it's important to understand what R8 optimization actually provides beyond basic R8 shrinking.

<div class="post-image-section"><figure>
  <img src="/img/r8-optimization/figure-1.png" alt="" style="width:70%"><figcaption align="middle">Figure 1. The R8 processing pipeline involves multiple interconnected phases that transform, analyze, and optimize code. Understanding this complexity helps explain both the benefits of optimization and why debugging issues become challenging.</figcaption>
  </figure>
</div>

### What we had in place

With `minifyEnabled=true` and `shrinkResources=true` using `proguard-android.txt`, we already had:

- **Tree shaking (shrink phase)**: Removes unused/unreachable code.
- **Code minification (obfuscation)**: Renames classes/methods to short names.
- **Resource shrinking**: Removes unused XML files and drawables.
- **Desugaring**: Java 8+ compatibility.

### What's new with optimization

By switching to `proguard-android-optimize.txt`, we gained access to:

- **Method inlining**: Replaces method calls with actual code, reducing call overhead.
- **Class merging**: Makes code more compact by combining similar classes.
- **Constant folding**: Pre-computes constant expressions at compile time.
- **Dead code elimination**: More aggressive than tree shaking, removes unreachable branches.
- **Devirtualization**: Converts virtual calls to direct calls when possible.

These optimizations work together to improve runtime performance while significantly reducing app size.

## Three core challenges

Despite R8’s clear benefits, enabling it at Grab’s scale remains hard. Lessons from prior attempts and current project context surfaced three fundamental challenges we needed to solve.

### Challenge 1: Slow debugging

R8 optimization issues are notoriously difficult to debug:

- Code is **obfuscated**, class names become `a`, `b`, `c`.
- Code is **modified**, inlined, merged, and optimized beyond recognition.
- Stack traces are **unreadable** without proper mapping files when crashes occur.  
- **Pinpointing the root cause** requires manual reverse engineering.

The challenge was compounded by limited bandwidth and high labor requirements. Most issues had to be either addressed directly or have solutions provided for other teams to fix. Manual decompilation, deobfuscation, and context gathering for each issue are inherently time-consuming, making the investigation cycle prohibitively slow.

### Challenge 2: Testing at scale

R8 optimization affects every corner of the app. Unlike feature-specific changes, enabling optimization transforms how the entire codebase is compiled, inlined, and optimized. A single misconfiguration or missing keep rule can break seemingly unrelated features across different modules and Software Development Kits (SDKs).

When we first enabled R8 optimization, the impact was immediate and widespread—most of the app's features simply stopped working correctly. This presented us with a deeper problem: not just how to test, but what kind of testing strategy would actually give us confidence to roll out to production.

In theory, R8 optimization works reliably with standard codebases that follow Google's and the community's best practices. However, considering the large scale of Grab's project, legacy code patterns, reflection usage, and SDK integrations have been accumulated over the years, creating numerous edge cases.

This combination makes comprehensive testing necessary, but at our scale, it's nearly impossible to execute due to:

- **Full regression testing**: Requires significant effort from all teams across the organization.  
- **Quality Assurance (QA) resource constraints**: Exhaustive testing is impractical.
- **High-quality bar**: At Grab, app stability and zero runtime errors are non-negotiable standards.

This creates a catch-22: we need broad coverage because consistency can’t be guaranteed everywhere, yet the scale makes that coverage infeasible.

### Challenge 3: Slow feedback

Due to the large scale of the project, compiling a build with R8 optimization enabled on a standard engineering laptop is physically impossible. This created a significant bottleneck: a slow feedback loop where every experimental change required a remote Continuous Integration (CI) build to verify, with each R8-optimized build taking up to 2 hours to complete.

Additionally, R8 treats debug and release build types differently. At Grab, we have a QA build for QA testing. This is a debug build type with R8 enabled, pointed to our staging environment. We had to ensure this QA build's R8 configuration matched our production build exactly. This alignment was critical for catching R8-specific issues during QA testing that would actually reflect production behavior.

## Our three-innovation solution

To overcome these three fundamental challenges, we developed a comprehensive strategy centered on targeted innovations that addressed each bottleneck:

### Innovation 1: AI-assisted debugging

**Solving challenge 1**:

How do we speed up the investigation of R8 issues in obfuscated, optimized code at scale? The answer is in emerging AI technology that wasn't available during our previous attempts.

**The AI context at Grab**:

Unlike 2022 and earlier attempts, the landscape had changed dramatically. After the LLM explosion, Grab proactively promoted Large Language Model (LLM) usage to boost engineering productivity. Over the past two years, Grab has dedicated 1 to 2 months annually for engineers to learn how to use AI efficiently. This investment in AI literacy became crucial for this project.

This year, my team gained experience building Model Context Protocol (MCP) servers and identified an opportunity: applying this technology to solve the R8 debugging challenge.

**Our solution**:

At Grab, we use **GitLab for Continuous Integration and Continuous Delivery (CI/CD)**. To tackle R8 debugging bottlenecks, we built a comprehensive solution combining: 
- [Custom MCP tools](#build-mcp-tools-eliminate-manual-reverse-engineering).
- [AI-assisted GitLab CI integration](#ai-and-ci-pipeline-workflow).

#### Build MCP tools: Eliminate manual reverse engineering

- **Automatic Android Application Package (APK) decompilation**: Parse and decompile APKs. 
- **Stack trace deobfuscation**: Automatically map obfuscated traces to source code.  
- **Class/method context fetching**: Pull relevant decompiled code sections for analysis.

#### AI and CI pipeline workflow:

We developed a systematic two-phase approach for investigating and fixing each runtime issue, combining AI assistance with parallel testing. The phase breakdown is as follows:

**Phase 1: MCP server tools for debugging**

1. **Detect runtime issue**: From End-to-End (E2E) tests, QA testing, or crash reports.  
2. **MCP tool orchestrates APK analysis**: Coordinates decompilation tools for reverse engineering.  
3. **MCP tool provides decompiled code context**: Pulls and decompiles problematic code sections.
4. **Engineer and AI analysis**: The engineer uses AI assistance to analyze the decompiled code context and note down multiple solution approaches.

**Phase 2: GitLab CI integration**

We leveraged the GitLab CLI tool ([`glab`](https://docs.gitlab.com/cli/)) and instructed AI to use it for interacting with our CI pipeline:

1. **AI creates multiple Merge Requests (MRs)**: Using `glab` CLI, AI creates merge requests for different solution approaches from Phase 1, each triggering CI compilation. 
2. **Track progress**: Maintain an MD file as the source of truth for the investigation, containing all notes about the issue (root cause analysis, test cases, test branches, CI build status).
3. **AI fetches APK from CI**: Using `glab` CLI to retrieve built APKs from completed CI pipelines.
4. **Verify**: Ask AI to use Android Debug Bridge (ADB) to install APK, then manually test the fix.
5. **Iterate**: If issues remain, loop back to step 2 for further analysis.

**Why this worked**:

Our approach functions as an AI assistant that:

- Decodes the obfuscated code automatically.  
- Finds the relevant code sections without manual searching.  
- Suggests multiple solutions based on the context provided by the MCP tools.  
- Creates multiple test branches simultaneously and runs parallel CI builds to test different approaches.  
- Tracks everything to ensure no progress is lost on complex investigations.

Instead of testing solutions one-by-one (waiting 2 hours per build), AI creates multiple MRs in parallel, dramatically accelerating the verification process. Engineers focus on making decisions about which solutions to pursue while the AI handles both the mechanical work and the parallel experimentation.

**The impact: Accelerating investigation**

While investigating a single R8 issue might still take days, our MCP tools dramatically accelerated critical investigation tasks. Manual tasks that previously took hours for decompilation, deobfuscation, and context gathering were reduced to minutes. Additionally, AI assistance significantly sped up the analysis phase, helping engineers quickly identify patterns, suggest solutions, and explore multiple approaches in parallel, both analytically and through simultaneous CI builds, further accelerating the overall investigation process.

### Innovation 2: Pragmatic testing strategy

**Solving challenge 2**:

How do we do testing at scale? How do we validate R8 optimization across a mature codebase containing more than seven million lines of code when comprehensive testing is necessary but impossible? Our solution came from a critical insight about R8 issues at scale.

**Testing approaches that don't work with R8**:

- **Unit tests**: Run on Java Virtual Machine (JVM), while R8 optimizations affect Android Runtime behavior - fundamentally different environments.  
- **UI tests with R8**: Community solutions exist as Gradle plugins, but [our tests run on Bazel](https://engineering.grab.com/how-grab-is-blazing-through-the-super-app-bazel-migration) - complex setup and reliability concerns.

**Key insight**:

From our experience, R8 issues tend to share similar root causes across the codebase. Legacy patterns like reflection usage, parser implementations, and dynamic class loading follow consistent patterns within a large codebase. This insight led to two key advantages:

- **Fix one, help many**: Fixing one place often resolves issues in others.  
- **Pattern recognition**: Once we identify a pattern, we can search the codebase to find similar issues instead of waiting for QA to discover them.

If we could identify and fix these pattern-based issues, we could address many problems without testing every corner of the app. We decided to start with critical paths and expand from there. This "ripple effect" strategy began at the center with the most important flows, then expanded by identifying common root causes and similar patterns across the codebase.

**We designed a progressive risk-based validation strategy**:

- **Stage 1: E2E tests - pattern discovery phase**: Fortunately, we had existing E2E tests covering most critical paths in the project, and they could be executed with R8 optimization enabled. Initially, all E2E tests failed after enabling optimization. This became our opportunity for pattern discovery. We systematically fixed issues and applied our pattern-based approach to resolve similar problems across the project.

- **Stage 2: QA smoke tests - coverage expansion**: After E2E tests stabilized, we requested our QA team to run smoke tests on critical flows, especially those not covered by E2E automation. This caught additional edge cases and validated that the pattern-based fixes we applied were effective across different user journeys. We fixed any issues that appeared during this phase.

- **Stage 3: Daily QA build enablement - real-world integration**: After confirming stability in controlled testing, we made a significant decision to enable R8 optimization in our daily QA build (the build our QA team uses for daily feature testing). This integrated R8 optimization into the normal development workflow without requiring additional testing effort.

- **Stage 4: Regression testing and Grab Early Access (GEA) - parallel production-scale validation**: After confirming stability in daily QA builds, we moved to production-scale validation with two parallel tracks. Every release at Grab includes **regression testing** covering all critical paths and new features. With R8 optimization now enabled in the QA build, we ran regression tests using this build for a few weeks, providing sustained validation across multiple release cycles. One week after regression testing, we rolled out to **GEA**, Grab's internal production release channel for Grab employees and partners. While GEA users typically receive features one week before general production rollout, for this R8 optimization project, we extended the GEA phase to 2 weeks, given the significance of the change. With hundreds of daily active users using the app in real-world production conditions during this extended period, we encountered only one remaining R8 issue during the GEA phase. This combination of regression testing and real-world GEA production usage gave us the confidence needed before full production rollout.

**Pattern-based issue resolution**:

Throughout these validation phases, when we identified R8 issues, we followed a systematic pattern-based resolution process.

1. **Identify the issue**: Catch the failure through E2E, QA, or monitoring.
2. **Find the pattern**: Analyze the root cause to identify if it's a common pattern across the codebase.
3. **Detect similar instances**: Search the entire codebase to find the same pattern across different modules and the internal SDKs.
4. **Coordinate fixes**: Create tickets requesting teams to modify their code to prevent the same issue in their modules.

This approach required cross-team coordination for fixing, but critically, not for testing. The difference is significant: asking teams to fix identified issues in their modules is much more scalable than requiring all teams to perform comprehensive testing upfront.

**Production rollout results**:

When we made it to production, only one issue escaped to production. Notably, we had actually detected this issue through our pattern-based approach during testing and created a ticket for the responsible team to fix it. However, with ongoing daily development, the team missed one instance when implementing the fix, which caused the production issue.

This demonstrates that while our testing strategy worked effectively, human coordination challenges can still occur at scale. With a project of this scale, having only one small production issue is considered a highly successful rollout.

This approach transformed an "impossible" comprehensive testing problem into a manageable, systematic validation process, reducing what would have been months of coordinated testing effort to days, proving that a smart strategy can overcome resource constraints.

### Innovation 3: Optimized feedback loop

**Solving challenge 3**:

The slow feedback challenge—2-hour CI builds and QA configuration misalignment—created a bottleneck for R8 debugging. We addressed this through a comprehensive infrastructure strategy targeting these critical areas:

**Remote compilation to enable local build and fast feedback loop**:

At Grab, we used to use [Mainframer](https://github.com/buildfoundation/mainframer) for remote execution to handle slow performance on local Gradle builds. However, since [migrating to Bazel](https://engineering.grab.com/how-grab-is-blazing-through-the-super-app-bazel-migration) (only for the debug build without R8 enabled), we removed the large-scale Mainframer setup for every engineer. From that experience, to tackle the local compilation blocker for R8 builds, we decided to deploy a new Mainframer setup, a much smaller one with one powerful Amazon Elastic Compute Cloud (EC2) instance, serving as a solution for local compilation in a short time.

This targeted deployment transformed physically impossible local R8 builds into a manageable remote process, enabling engineers to test R8 changes without requiring powerful local hardware.

The performance improvement was substantial: from up to 2 hours in CI to around 1 hour with Mainframer—a ~50% reduction that enabled rapid iteration cycles essential for R8 debugging.

**QA build configuration alignment**:

We eliminated the critical gap between QA and production R8 behavior by aligning build configurations exactly. The key change was setting `debuggable = false` for QA builds while maintaining the environment configuration.

```groovy
buildTypes {
    debug {
        if (isQaBuild()) {
            minifyEnabled true
            shrinkResources true
            debuggable false
            buildConfigField 'boolean', 'DEBUG', 'true'
            ...
        }
    }
}
```

From our understanding, R8 applies different optimization levels based on the `debuggable` flag, with more aggressive optimizations when debuggable=false. This ensured our QA testing reflected actual production R8 processing. We preserved `DEBUG = true` to maintain staging environment routing while achieving R8 parity.

This infrastructure foundation was essential, providing faster feedback loops that accelerated verification and investigation, while the QA build configuration matching production exactly was critical for catching real production issues during testing.

## A lucky break

Perhaps most surprising: the R8 flakiness issue that blocked us in 2022 ([Issue #240077160](https://issuetracker.google.com/u/0/issues/240077160)) appears to have been resolved by the R8 team. We encountered no build determinism issues during this attempt, which significantly smoothed our path to production.

## Results

After ~10 weeks of systematic implementation led by one engineer collaborating with multiple teams across the organization, we achieved substantial improvements using **Android Gradle Plugin 8.6.1 with R8 version 8.6.39**:

- **Stability**: Around 25% reduction in ANR rates.  
- **App size:** Reduced by 21.6MB (16% decrease) in download size on our reference device (zipped APK).  
- **Performance:** Nearly 27% improvement in startup time. After enabling R8 optimization, we saw ~12% app startup improvement. However, during our analysis, we discovered that our existing baseline and startup profiles implementation was incorrect. After proper implementation, the combination of R8 optimization plus the corrected profiles delivered the full 27% improvement.

These results exceeded our initial targets and validated the significant effort required to enable R8 optimization at scale.

## What's next

Our journey doesn't end here. We're exploring several areas for continued optimization:

- **R8 full mode**: More extreme/aggressive optimization than the current mode for additional performance benefits.  
- **Revisit R8 keep rules**: Clean up unnecessary rules that prevent optimization, and implement a governance solution to guardrail R8 rules in our pre-merge CI pipeline.
- **Dead code removal for experiment framework**: We discovered a solution to help R8 understand our experiment framework flags and remove dead branches for fully turned-off features.

## Conclusion

Enabling R8 optimization for the Grab Android app at scale required innovation beyond traditional debugging approaches. By combining AI-assisted debugging, pragmatic testing strategies, and infrastructure investment, we overcame challenges that had blocked previous attempts for many years.

For other teams considering R8 optimization at scale: the journey is challenging, but the results speak for themselves. With the right tools, strategy, and team collaboration, it's achievable even for the largest codebases.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility, and digital financial services sectors. Serving over 900 cities in eight Southeast Asian countries: Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam. Grab enables millions of people every day to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. We operate supermarkets in Malaysia under Jaya Grocer and Everrise, which enables us to bring the convenience of on-demand grocery delivery to more consumers in the country. As part of our financial services offerings, we also provide digital banking services through GXS Bank in Singapore and GXBank in Malaysia. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line. We aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team today](https://grab.careers/)!
