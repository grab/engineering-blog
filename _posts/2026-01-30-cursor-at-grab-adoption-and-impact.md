---
layout: post
id: 2026-01-30-cursor-at-grab-adoption-and-impact
title: 'Cursor at Grab: Adoption and impact'
date: 2026-01-30 00:23:00
authors: [akshay-misra, nguyen-karmi]
categories: [Engineering]
tags: [AI] 
comments: true
cover_photo: /img/cursor-at-grab/banner-cursor.png
excerpt: "A look inside how we scaled AI-assisted coding across Grab, moving Cursor from pilot to daily use to help us work faster and more reliably. Here’s what changed in our workflows with Cursor, how we integrated it responsibly, and what’s next for Cursor within Grab's ecosystem."
---

## Adoption overview

### Multi-tool strategy as a foundation

Grab embraces a multi-tool strategy to AI coding assistants, so that we remain open-minded, experimenting with multiple tools simultaneously, in a field that is rapidly evolving. This approach has been detailed in our previous [Inside Grab Blog](https://www.grab.com/sg/inside-grab/stories/beyond-one-size-fits-all-why-grab-embraces-multiple-ai-coding-assistants/). This openness to continuous experimentation has allowed us to quickly conduct proof of concepts (POCs), compare outcomes, and selectively incorporate tools into our arsenal when they demonstrate tangible value.

### Rapid growth in usage

We introduced [Cursor](https://cursor.com/), as one of the many tools in Grab’s AI engineering toolkit in late 2024. Cursor's growth at Grab began with an impressive organic adoption rate of over 90% for monthly active users (MAUs), and approximately 75% for weekly active users (WAUs) among tech engineers. 

Cursor's built-in integrated development environment (IDE) suggestions played a pivotal role in its high user engagement, boasting an acceptance rate of around 50%, significantly exceeding the industry average of 30%. This feature became a cornerstone of productivity, enhancing the coding experience for tech teams. Cursor's AI-powered features led to a peak of 1,800 daily active users, making it a significant tool for boosting efficiency and productivity.

### Relevance and trustworthiness

The acceptance rate for Cursor’s code suggestions at approximately 50% indicates that they find Cursor's code suggestions relevant. This is enabled by Grab’s ongoing feedback and environment-specific integration to make the use of Cursor relevant, useful, and safe in our environment.

## Productivity impact

The ultimate test of any engineering tool is its impact on productivity and output. In our reviews, we see a strong positive correlation between greater proficiency with Cursor and higher engineering productivity across individuals and teams. For example, high-engagement Cursor users showed improvements in code throughput and faster merge times for merge requests compared to non-users. This statement is supported by internal research conducted over the span of 10 months on the rates of successful merged Merge Requests (MRs), processing time, and volume of MRs across teams in the company.

This supports the following chain of thought: 

“Time saved using Cursor → Increased usage and experimentation → Deeper AI intuition and fluency → Discovering more creative ways to leverage AI → Greater time savings and productivity.”

Qualitative feedback and case studies underscore Cursor’s impact: tasks that once took an entire day can often be completed in just a few hours. Cursor users have noted many improvements, such as large-scale refactoring or extensive test additions, which likely would have been deferred without the tool due to the effort involved.

Beyond raw acceleration, Cursor makes worthwhile code improvements feasible, even those that engineers might skip under time pressure. Together, the combination of quantitative analysis and on-the-ground reports indicates that Cursor is delivering real value in terms of developer productivity, code quality, and the velocity of delivery

## Developer engagement

We observe a healthy cohort of “heavy users" emerging, with approximately half of all Cursor users employing it 10 or more days per month. This indicates that adoption isn’t superficial; engineers are not just trying Cursor, but are integrating it into their daily workflows. Engineers who experimented with the tool share tips, best practices, and "cookbooks" through internal channels such as a dedicated Slack channel to help others including non-technical teams maximize their use of Cursor. This could be one of the many factors why roughly 90% of daily active users (DAUs) show minimal weekly retention, and more than 98% of MRs are authored using Cursor. In addition to that, some teams have achieved 100% Cursor adoption.

## Key use cases

Developers have discovered diverse applications for Cursor in their daily work, ranging from routine tasks to complex problem-solving. Some of the most common and high-value use cases include unit test generation, which significantly accelerates test writing and facilitates automated generation and iterative refinement. Cursor also aids in code refactoring by assisting with repetitive code changes and clean-ups, simplifying migrations, and standardization. For cross-repository understanding, Cursor enhances code navigation and comprehension across services, streamlining onboarding and cross-team contributions. In terms of bug fixing and troubleshooting, it quickly identifies potential causes and suggests fixes, supporting parallel debugging workflows during incidents. Additionally, Cursor reduces repetitive work by handling routine coding tasks, such as API scaffolding and commit messages, and generates utility scripts for daily tasks. 

Despite these advancements, humans remain in the driver's seat, with robust guardrails in place to ensure that Cursor's assistance complements rather than replaces human decision-making and oversight.

## Closing remarks and key takeaways

Integration with Grab’s ecosystem has been pivotal in enhancing Cursor's value within our engineering workflows. We have developed custom solutions to tackle performance challenges by utilizing Cursor for monorepo indexing, as well as the development of internal tools and protocols. Custom coding conventions and preconfigured setups ensure that Cursor aligns with Grab-specific rules and playbooks have also been distributed to developers.

Cursor has now become one of the essential components of Grab’s engineering toolkit, delivering significant productivity gains, improved code quality, and increased engineer satisfaction with higher MR throughput and a strong engineering community.

We’re excited to continue advancing Cursor by continuously measuring its impact and staying at the forefront of AI coding innovations. We are now actively testing new workflows and capabilities, background agents and the Cursor CLI to unlock even greater productivity and provide an outstanding developer experience.

Our multi-tool strategy has been a core enabler. By maintaining an open mindset, we have been able to experiment, learn quickly, and integrate Cursor in most impactful ways. We remain open to further enhancing the experience and offerings for our engineers. The use of Cursor marks progress, not the finish line. 

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
