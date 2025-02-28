---
layout: post
id: 2025-02-27-techdocs-at-grab-cultivating-a-culture-of-quality-documentation
title: 'TechDocs at Grab: Cultivating a culture of quality documentation'
date: 2025-02-27 08:23:00
authors: [david-khu, karen-kue, preeti-karkera,sita-yadav]
categories: [Engineering]
tags: [Blog, TechDocs, Helix, Engineering]
comments: true
cover_photo: /img/TechDocs-at-Grab/banner-img3.png
excerpt: "Discover the steps taken in building a strong documentation culture that produces high-quality content, while making the tools easy to use for everyone involved in Grab."

---

# Introduction

Changing how a company approaches writing and documentation is a complex task. It’s not just about the tools and processes—it’s about shifting the mindset of the people who create and use documentation. Building a strong documentation culture means ensuring everyone takes ownership of producing high-quality content, while making the tools easy to use for everyone involved.

At Grab, our first significant step was adopting the **Docs-as-Code** approach, which we’ve covered in the blog [Embracing a Docs-as-Code approach](https://engineering.grab.com/doc-as-code). This method integrated documentation into the engineering workflow, allowing teams to create and update content effortlessly.

Since then, the TechDocs working group — a collaboration between Tech Learning and the internal development team — has focused not just on improving tools, but on fostering a mindset where documentation is an essential part of everyday work. In this post, let us dive into how we’ve continued to embed high-quality documentation into the core of Grab’s engineering culture.

## What is TechDocs?

Helix is Grab's engineering platform designed to unify infrastructure, tooling, services, and documentation into a single, consistent user interface. It serves as a central hub for managing various engineering tasks and resources within Grab. Helix provides a comprehensive set of guides and tools for users.

TechDocs is an internal documentation platform built on Helix and integrates with our Docs-as-Code approach. It allows engineering teams to create, manage, and access technical content seamlessly within their workflows. TechDocs makes it easier for teams to maintain up-to-date, high-quality documentation with customised features for notification and editing.

# How to create a healthy documentation culture 

Over a span of 2 to 3 years, the TechDocs team executed these key steps in quarterly chunks to influence Grab’s documentation culture as seen in figure 1.

<div class="post-image-section"><figure>
  <img src="/img/TechDocs-at-Grab/figure-1.png" alt="" style="width:70%"><figcaption align="middle">Figure 1: Key steps in influencing documentation culture in Grab</figcaption>
  </figure>
</div>


1. [**Take inventory**](#take-inventory-of-existing-internal-processes-and-tools-portals-understand-user-behaviour): Assess current internal processes, tools, and user behaviour.  
2. [**Finalise policy**](#finalise-a-suitable-policy-and-begin-enforcing-it-collect-feedback-and-reiterate): Establish a clear policy, enforce it, and iterate based on feedback.  
3. [**Empower teams**](#empower-creators-and-maintainers-to-self-serve-documentation-upkeep): Equip creators and maintainers with tools to manage their documentation.  
4. [**Track metrics, celebrate wins**](#track-metrics): Recognise and reward teams that follow best practices. Repeat regularly.

Now let's look at each of these steps in detail.

## Take inventory: Assess existing internal processes and tools/portals and understand user behaviour {#take-inventory-of-existing-internal-processes-and-tools-portals-understand-user-behaviour}

#### Understanding the current culture 

To shift the documentation culture at a company, you need to first understand what that culture is. At Grab, with its diverse business units, tech teams, and varied documentation practices, just grasping this was a big step. We needed to look at it from two angles: how teams and business units approach documentation, and what portals hold what kinds of resources.

Here are a few observations that apply not just to Grab but to most tech companies:

* People default to the easiest way to get information, either by asking someone or searching familiar places. If they can’t find a document quickly, they assume it doesn’t exist.  
* Different teams use different documentation tools, leading to scattered, hard-to-maintain content. Without a unified search, finding the right document is a challenge.  
* Documentation is often created during development but rarely maintained, resulting in outdated or duplicate content over time.  
* Lack of clear ownership and governance causes inconsistencies, making it harder to trust or rely on documentation.

#### Conducting extensive user research

The insights on understanding the culture of documentation were obtained from conducting extensive feedback-gathering activities. We adopted two separate strategies for user research:

1. The first focused on gathering feedback from as many people as possible. We scaled this approach to reach a wide audience across multiple teams and departments. To manage this volume, we used closed-ended questions with multiple-choice options, allowing us to collect broad, organisation-wide insights on user needs and preferences.  
2. The second approach was more in-depth and personal. We conducted 1:1 sessions where we observed how users interacted with tools, asked open-ended questions, and dug into the reasons behind their behaviors. This helped us understand not just what users did, but why and how they did it.

From the first approach, we were able to gather that users frequently browse for **Runbooks, how-to's, and FAQs** when it comes to technical documentation. They emphasise structure, ease of navigation, and up-to-date content when it comes to quality.

Based on the feedback, only 2% of engineers (1 out of 56) reported that 80-100% of on-call engineering questions were resolved using technical documentation. In contrast, 29% of engineers indicated that 40-60% of their questions were addressed through documentation, while 25% stated that 20-40% were resolved in this manner.

To improve the documentation and **Docs-as-Code** workflows for seamless integration of documentation into the engineering process, we built the **TechDocs Editor** on the Helix platform. This rich text editor allowed teams to write and maintain their documents more effectively. However, while many engineers appreciated the new features, they highlighted areas for improvement for a smoother experience. Key suggestions included enhancing the creation of merge requests (MRs), resolving conflicts more efficiently, and offering an auto-approval process. They also wanted a way to preview content before MR approval, capabilities like bulk migration, and integration options such as plugins for **Jira** and **Confluence wiki*. Additionally, there was a call to increase clarity on what content should belong in TechDocs versus the Wiki.

#### Rooting TechDocs tool’s improvements in the user’s feedback

Based on the feedback received from the extensive user research, the TechDocs tool’s new features were planned and lined up based on a priority mapping that was entirely rooted in the feedback from user research and interviews. While not all feedback was directly implementable in terms of tool improvements, a significant amount was. For issues that couldn't be resolved through tools, cultural changes and learning best practices became key to addressing the challenges.

Here are insights from the 1-1 user research that helped us enhance the TechDocs tools and processes:

* **Search experience is average**. The search experience on the TechDocs portal has room for improvement, with a CSAT score of 58.57%. Some users prefer using a more centralised search option, as it searches across multiple platforms and offers more relevant results, especially considering gaps in documentation on the internal TechDocs portal.  
* **Documentation landing page needs improvement**. The Documentation landing page scored 10.71% CSAT, highlighting its need for better design and categorisation. Users found the page cluttered, and the categorisation was seen as random and confusing.  
* **Reading experience is positive**. Overall, users are satisfied with reading documentation on Helix, with an 88.31% CSAT for reading experience. Users appreciated the navigation’s organisation and structure. Suggestions for further improvement include:  

   * Better table content display  
   * Maximising content space  
   * Enhancing color contrast  
 
* **TechDocs adoption still faces challenges**. Although TechDocs adoption has grown, several challenges remain:  
    * **Migration efforts**: The migration process requires significant effort, and without support or a clear push, some employees do not see the need to migrate.  
    * **Cultural factors**: Users continue using familiar platforms and are looking for incentives, such as unique Helix features, to consider making the move.  
    * **Accessibility**: VPN access is required for some features.  
    * **Awareness**: Many users are unaware of Helix TechDocs' full range of features, such as the different search options, available search filters, and commenting capabilities.  
* **Cross-team collaboration challenges**: Users reported difficulties in collaborating with non-engineering roles. While engineers are comfortable with the Docs-as-Code approach, which allows for more flexibility and simplicity, some find the TechDocs editor useful for initial document creation or small edits.

Using this feedback, the product roadmap was set for the year to focus on addressing the top user complaints and improving the TechDocs tools accordingly.

## Finalise a suitable policy and begin enforcing it. Collect feedback and reiterate {#finalise-a-suitable-policy-and-begin-enforcing-it-collect-feedback-and-reiterate}

To improve discoverability and maintain consistency, we established a structured policy for organising documents. This policy ensures that documentation is stored in the right place based on its purpose and usage, making it easier for Grabbers to find what they need. The key guidelines are as follows:

* **Markdown for ‘create and publish’ type content:** Documentation related to platforms, products, or services that don’t require frequent updates should be in markdown format and stored in GitLab. These documents were rendered in Helix.  
* **Collaborative portals for collaborative docs:** Time-sensitive and collaborative documents—such as postmortems, RFCs, design docs, and project plans— are not compatible with docs-as-code and hence should reside in portals that offer collaboration features, like easy commenting and multi-user editing. Dedicated spaces within Confluence Wiki are ideal for this purpose.  
* **Separation of internal data:** Internal documents meant only for specific teams should not mix with general engineering resources for end users. These can be stored in portals with less stringent review processes, as they don't require the same level of quality or accuracy checks. Team-specific spaces on Confluence Wiki can serve this need effectively.


## Empower creators and maintainers to self-serve documentation upkeep {#empower-creators-and-maintainers-to-self-serve-documentation-upkeep}

#### More documentation doesn't mean good documentation

Getting people to create documentation is one thing, but getting them to maintain and update it is a whole different challenge. One major issue is the lack of accountability. Without a clear owning team or point of contact (PIC) for a document, everyone assumes someone else will handle updates. This leads to stale, outdated information because no one takes responsibility. To address this, the TechDocs team introduced features like showing the "last updated" date on each page and flagging documents that hadn’t been updated in over three months. This approach helped in two ways:

* Readers could quickly gauge how up-to-date the information was.  
* Content owners were reminded when their documents needed attention.

Another key strategy was requiring every document to have a dedicated PIC at the time of creation. This ensured:

* Clear accountability for maintaining the document.  
* The PIC would receive notifications about outdated documents and any comments from readers, making it easier to address issues.

#### What about docs that are not really meant to be updated that frequently?

When building any feature, it’s important to consider different use cases. While flagging outdated documents helped maintainers keep track of their content, it could also frustrate those responsible for more static documents that don’t require frequent updates.

To make the “last updated” feature more relevant, we introduced an option for users to mark documents as “verified.” This allowed maintainers to turn off the “your doc is outdated” flag if they felt the information was still accurate. While this feature could be misused in an extremely large organisation, it worked well at Grab where internal products and employees generally rely on mutual trust and respect for maintaining simple systems and policies.

#### Training and info-typing workshops

The TechDocs team had a unique advantage in influencing the quality of internal product and platform documentation. Many of the creators and maintainers of these documents belonged to the same organisation, which allowed for smoother collaboration.

To elevate the quality of TechDocs, we recognised that improving the drafts produced by platform engineers was essential. This realisation led us to create self-paced training materials focused on information typing guidelines and writing best practices specifically designed for these engineers, which included:

* **Info-typing guidelines**: Helping engineers categorise information for better clarity.  
* **Writing best practices**: Teaching techniques to enhance readability and engagement.

Building on the positive feedback from the training course, we launched interactive workshops. In these sessions, participants brought their own team’s user-facing documentation, and with the guidance of expert Tech Content Developers (TCDs), they made significant, live updates to their documents using the info-typing principles they had learned. This process enabled participants to:

* **Revise their documents**: Make real-time improvements during the workshop.  
* **Receive expert feedback**: Gain insights from TCDs on enhancing document quality.

The workshops received outstanding feedback and were further refined to cater to the specific needs of each team, ensuring that the training remained relevant and effective for the different documentation sets they managed. By focusing on collaboration and practical learning, we were able to foster a culture of continuous improvement in our documentation practices.

## Track metrics, celebrate wins. Recognise and repeat. {#track-metrics}

Recognising teams and individuals who follow best practices is key to sustaining momentum. We celebrated these wins by publicly acknowledging contributions in newsletters and internal communications, along with offering swag and rewards. Additionally, we tracked the accuracy of responses from oncall-bots, which use documentation to auto-respond to user queries on our internal communicator. By analysing whether these automated responses were accurate, we could assess the quality of the docs being referenced. Teams that kept their documentation up-to-date and adhered to our internal TechDocs policy were rewarded, further reinforcing these good practices.

Celebrating wins wasn’t a one-off—it became a regular practice, helping to solidify desired behaviors and create a cycle of continuous improvement.

# What's next

Looking ahead, we have some exciting goals to push the documentation culture even further:

* **Boost documentation quality**: We’re aiming to improve the quality of platform docs by a significant percentage, which will help reduce support tickets and inquiries to the automated tech support bot.  
* **Expand training**: We're ramping up training for more engineers, helping them sharpen their tech writing skills and aiming for top CSAT ratings.  
* **Launch new TechDocs portal**: Our goal is to build a well-structured doc portal with clear navigation, aiming for high satisfaction from both consumers and document producers.  
* **Increase advocacy and engagement**: We’ll be focusing on getting more engineering teams to contribute to blogs and more actively participate in sessions like TILT (knowledge sharing ‘show and tell’ sessions).  
* **Enhance onboarding and reduce redundancies**: We’ll update the onboarding bootcamp with hands-on exercises to speed up the time to first commit, while also reducing duplicate onboarding docs and increasing task list usage across teams.

# Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
