---
layout: post
id: 2026-05-29-evolving-documentation-strategy
title: "From Decentralized Docs-as-Code to a Centralized Repository: Evolving Grab's Documentation Strategy"
date: 2026-05-29 00:00:00
authors: [karen.kue, athar.hameed, preeti.karkera, aaqib.kurfan, anna.ooi]
categories: [Engineering]
tags: [Blog, TechDocs, Helix, Engineering]
cover_photo: /img/journey-of-doc/banner-enhanced.png
comments: true
excerpt: "Building on Grab's Docs-as-Code approach, we reflect on our documentation journey, uncovering the benefits, challenges, and limitations along the way. Learn why we made the shift, what we gained in search and quality assurance, and when each approach works best."
---


## Introduction: The journey of documentation at Grab

In early 2021, Grab adopted a Docs-as-Code approach to address gaps in our technical documentation processes, as illustrated in our blog post [Embracing a Docs-as-Code](https://engineering.grab.com/doc-as-code). Inspired by the practices of other market leaders, we integrated documentation into our engineers' workflows, making it part of the codebase.

This approach addressed our initial documentation challenges by creating a single source of truth for engineers to search and build knowledge, making documentation upkeep necessary and less of an afterthought. After four years of use, we transitioned to a centralized documentation repository. This change was not about abandoning Docs-as-Code but adapting it to meet new and growing organizational needs.

This post walks through the motivations, benefits, and lessons from each phase of this journey, showing how our documentation strategy evolved.

## What is Docs-as-Code?

Docs-as-Code is an approach that manages documentation with the same tools and workflows engineers use for source code. Content is written in plain-text Markdown, which is easy to edit in any code editor. Markdown is a lightweight markup language that uses simple, readable symbols like `#` for headings and `* ` for lists to format text, and can be rendered to HTML and other outputs. It lives in version-controlled repositories (e.g., GitLab), so documentation evolves alongside code. Updates go through the same merge request reviews and automated CI/CD checks.

This integrated model lets teams at Grab build, test, and publish documentation as part of a pipeline. We then surface it through a centralized internal developer portal for easier discovery and implement governance for quality assurance.

### Ideal use case at Grab

Imagine an engineer responsible for maintaining documentation for a product or platform managed by their team. This engineer creates comprehensive documentation in Markdown, containing pages such as an overview, a getting-started guide, how-tos, troubleshooting, FAQs, and related references for a specific platform. The documentation is included in the merge request and published on the documentation portal immediately after the code is merged. This seamless integration fosters a sense of ownership over the documentation. However, while this scenario is ideal, implementing it in practice presents significant challenges.

### Problems we solved with Docs-as-Code

Before adopting a Docs-as-Code model, documentation was often scattered across Google Docs, slide decks, wikis, and ad hoc text files, which led to version confusion, poor discoverability, and gaps in quality assurance. Centralizing documentation in version-controlled repositories next to the code creates a single source of truth, ties updates to the same pull/merge request reviews, and enables automated checks such as link validation, style linting, and preview builds.

Industry practice reflects this shift: [Kubernetes](https://kubernetes.io/docs/contribute/docs/) maintains its documentation as Markdown on the Kubernetes website, uses GitHub as a repository, and builds the site with Hugo, encouraging doc updates alongside feature work.

When documentation is embedded with the code and flows through the same CI/CD pipeline, engineers are more likely to update it in tandem with code changes. This method keeps the content up to date and in sync with releases by default. The TechDocs team can also set standardized metrics to uphold quality across all documentation and implement quality gates and blockers to ensure each document meets quality standards.

## The limits of decentralized repositories

As Grab's engineering footprint expanded, our decentralized Docs-as-Code approach began to strain at scale, surfacing friction that made documentation harder to discover, maintain, and ship with confidence.

### Fragmented user experience and uneven standards

When documentation is scattered across many repositories and managed independently by teams, information architecture, voice, terminology, and granularity diverge. Similar concepts end up with different names, pages follow inconsistent navigation and templates, and redundant or misaligned guidance proliferates.

Ultimately, the search experience becomes noisy and unreliable as multiple versions of "the truth" surface. The impact shows up as longer onboarding, more tech support escalations, slower incident response when runbooks differ by team, and eroding trust that eventually pushes people toward tribal knowledge.

For the TechDocs team, decentralization made it hard to enforce standard templates, formatting, and quality gates. With documentation spread across many repositories, each with different or no linters, CI setups, and conventions, running organization-wide automation (linters, link checkers, readability checks) or applying uniform review steps was unreliable. This resulted in limited oversight and persistent inconsistencies, which degraded the user experience and trust in the documentation.

### Difficulty keeping pace and staying discoverable

A fast-moving platform means decentralized documentation ages quickly and becomes hard to find. Frequent infrastructure and framework releases introduce breaking changes and deprecations. Teams struggled to stay informed, leading to missed opportunities for optimization and potential security risks due to outdated practices.

Meanwhile, with content sprawled across many repositories, managing and tracking the content became increasingly challenging for the team overseeing TechDocs. When teams changed the location of their source repositories, they often failed to notify the managing team, making it difficult to keep track of newer and updated locations. This lack of coordination created significant hurdles in discovering relevant documentation and maintaining a centralized record, ultimately impacting productivity and delaying decision-making.

## Why we transitioned to a centralized repository

A centralized repository allowed us to address these scaling challenges while keeping the benefits of Docs-as-Code:

### AI-driven enhancements

We are no longer writing only for human engineers. As we integrate more AI tools into our developer experience, our documentation also serves as the knowledge base for internal agents. A centralized, Markdown-based format gives agents clean, readable content in one location, which supports better integration, faster comprehension, and more accurate responses.

### Improved quality assurance

Centralizing our documentation enabled the managing team to run automated linters for quality checks across all content. This helped ensure consistent standards, reducing manual oversight and minimizing the risk of errors. Contributors were also required to use the appropriate template for each document type, ensuring a consistent structure by default.

### Unified search experience

The unified search experience changes how engineers access information. They can search for any topic and find relevant documentation without navigating multiple repositories. A global search overlay combines two methods: fuzzy page-title search for quick navigation and Glean-powered search across all TechDocs content. Glean is an enterprise search and AI assistant platform that integrates with internal tools to help users find and use information more efficiently. This search capability saves time and helps engineers stay informed.

### Streamlined contribution process

While the decentralized model allowed engineers to use the GitLab web IDE, local editors, and GitLab CLI commands for faster updates, the transition to a centralized system helped streamline this process by offering a consistent editing environment. Even with these advanced tools, the centralized repository provided a unified location for all documentation, reducing the need to navigate across multiple repositories.

Centralization also gives the TechDocs team clearer visibility into documentation behavior and health. After implementing a centralized repository, the team extracted statistics on user activity: a new update is merged roughly every 52 minutes, with roughly 27 commits per day, and approximately 63% of changes being small to medium improvements. These signals point to ongoing documentation maintenance, with frequent touch-ups that fix typos, clarify steps, and keep guidance current rather than sporadic bulk updates. The image below illustrates how Grabbers use the centralized repository in practice.

## Reflecting on the evolution

The transition was not without its hurdles. To bridge the gap left by decentralized Docs-as-Code workflows, we implemented:

* **Automated syncs:** We synchronized critical content from service and platform repositories into a central hub to prevent gaps, while keeping the overlap period short to avoid two sources of truth and missed updates as legacy repos were retired.

* **Training sessions:** We ran hands-on workshops to help engineers navigate the new platform and understand its benefits.

* **Continuous feedback:** We set up surveys and regular check-ins to refine tooling and processes based on real-world usage.

## Conclusion: choosing what works for your context

Docs-as-Code with decentralized and centralized repositories are not mutually exclusive; they excel in different contexts and can be combined. Decentralized authoring works well when engineers are the primary contributors and documentation naturally ships with code. Centralization becomes valuable when you optimize for organization-wide discoverability, consistency, governance, and analytics. We conclude with these findings from our shift to a centralized Docs-as-Code repository:

* Use decentralized Docs-as-Code when teams need autonomy and documentation is tightly coupled to services.
* Use a centralized repository when you need a single source of truth for discovery, standardized templates and style, consistent CI checks, ownership metadata, and clearer compliance and review gates.
* Consider a hybrid approach: authors create documentation in service repos and publish to a central portal with shared templates, ownership metadata, automated quality checks, and centralized discovery and governance.


At Grab, decentralized Docs-as-Code fostered strong ownership early on. As we scaled and our audience broadened, a centralized repository and unified discovery surface became essential to maintain consistency, improve findability, and support diverse user needs. Documentation strategies evolve with the organization. The goal is not picking one model forever, but recognizing the signals to pivot and adapting so engineers can reliably find the right information at the right time.

## Join Us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
