---
layout: post
id: 2025-04-25-introducing-the-sop-drive-llm-agent-framework
title: 'Introducing the SOP-driven LLM agent frameworks'
date: 2025-04-25 00:00:10
authors: [fujiao-liu, shuqi-wang, wenhui-wu, muqi-li, jia-chen, haitao-bao, meichen-lu] 
categories: [Engineering, Data Analytics, Data Science]
tags: [Engineering, Generative AI, LLM, Experiment, Machine learning]
comments: true
cover_photo: /img/sop-llm-agent-framework-img/banner-figure-1.png
excerpt: "The SOP-driven Large Language Model (LLM) agent framework, revolutionises enterprise AI by integrating Standard Operating Procedures (SOPs) to ensure reliable execution and boost productivity. Achieving over 99.8% accuracy, it offers versatile automation tools and app development, making AI solutions 10 times faster. The framework addresses LLM challenges by structuring SOPs as a tree, enabling intuitive workflow creation. The framework aims to transform enterprise operations and explore industry applications."
---


## Introduction

We're excited to introduce an innovative Large Language Model (LLM) agent framework that reimagines how enterprises can harness the power of AI to streamline operations and boost productivity. At its core, this framework leverages Standard Operating Procedures (SOPs) to guide AI-driven execution, ensuring reliability and consistency in complex processes. Initial evaluations have shown remarkable results, with over 99.8% accuracy in real-world use cases. For example, the framework has powered solutions like the Account Takeover Investigations (ATI) bot, which achieved a 0 false rate while reducing investigation time from 23 minutes to just 3, automating 87% of cases. The fraud investigation use case also reduced the average handling time (AHT) by 45%, saving over 300 man-hours monthly with a 0 false rate, demonstrating its potential to transform even the most intricate enterprise operations with a high degree of accuracy. 

The framework's capabilities extend far beyond just accuracy, it offers a versatile suite of tools that revolutionise automation and app development, enabling AI-powered solutions up to 10 times faster than traditional methods.


## The power of SOPs in AI automation

Traditional agent-based applications often use LLMs as the core controller to navigate through standard operating procedure (SOPs). However, this approach faces several challenges. LLMs may make incorrect decisions or invent non-existent steps due to hallucination. As generative models, they struggle to consistently produce results in a fixed format. Moreover, navigating complex SOPs with multiple branching pathways is particularly challenging for LLMs. These issues can lead to inefficiencies and inaccuracies in implementing business operations, especially when dealing with intricate, multi-step procedures.

Our framework addresses these challenges head-on by leveraging the structure and reliability of SOPs. We represent SOPs as a tree, with nodes encapsulating individual actions or decision points. This structure supports both sequential and conditional branching operations, mirroring the hierarchical nature of real-world business processes.

To make this powerful tool accessible to all, we've developed an intuitive SOP editor that allows non-technical users to easily define and visualise complex workflows. These visual representations are then converted into a structured, indented format that our system can interpret and execute efficiently.


<div class="post-image-section"><figure>
  <img src="/img/sop-llm-agent-framework-img/figure-1.png" alt="" style="width:80%"><figcaption align="middle">Figure 1: SOP editor in our framework</figcaption>
  </figure>
</div>


The example above demonstrates how our framework transforms the customer support process by mirroring manual workflows while leveraging advanced automation. The SOP is written in natural language using an indentation format, making it easy for users to define and understand. The @function_name (@get_order_detail) notation clearly identifies where external calls are made within the process, highlighting the integration points between the SOP-driven LLM agent framework and existing systems or databases.

## The magic behind the scenes

The framework's strength lies in the synergy between three key components: the planner module, LLM-powered worker agent, and user agent. This intelligent trio works in harmony to deliver a seamless, efficient, and adaptable automation experience.

The planner module employs a Depth-First Search (DFS) algorithm to navigate the SOP tree, ensuring thorough execution with step-by-step prompt generation and sophisticated backtracking mechanisms. The LLM-powered worker agent dynamically updates its understanding and makes decisions based on the most current information. Our approach tackles hallucination and improves efficiency through context compression and strategic limitation of available Application Programming Interface tools (APIs). The framework's dynamic branching capability allows for adaptive navigation based on real-time data and analysis.

Serving as the primary user interface, the user agent offers multilingual interaction, accurate intent identification, and seamless handling of out-of-order scenarios.

By combining structured SOPs with flexible LLM-powered agents and advanced algorithmic approaches, our framework adeptly handles complex, real-world scenarios while maintaining reliability and consistency. This innovative architecture effectively mitigates common LLM challenges, resulting in a robust system capable of navigating intricate business processes with high accuracy and adaptability.

## Beyond SOPs: A suite of powerful features

While SOPs form the backbone of our framework, we've incorporated several other cutting-edge features to create a truly comprehensive solution. Our Graph Retrieval-Augmented Generation (GRAG) pipeline enhances information retrieval and content generation tasks, allowing for more accurate and context-aware responses. The workflow feature enables chaining multiple plugins together to handle complex processes effortlessly, improving efficiency across various departments.

Our plugin system seamlessly integrates with various technologies such as API, Python, and SQL, providing the flexibility to meet diverse needs. Whether you're an engineer coding in Python, a data analyst working with SQL, or a risk operations specialist, our plugin system adapts to your preferred tools. Additionally, our playground feature allows users to develop, test, and refine LLM applications easily in an interactive environment, supporting the latest multi-modal APIs for accelerated innovation.


<div class="post-image-section"><figure>
  <img src="/img/sop-llm-agent-framework-img/figure-2.gif" alt="" style="width:80%"><figcaption align="middle">Figure 2: Workflow builder feature in our framework</figcaption>
  </figure>
</div>


## Empowering teams through versatility and accessibility

Our framework is designed to empower teams across the organisation. The multilingual capabilities of our user agent ensure that language barriers don't hinder adoption or efficiency. For scenarios requiring human intervention, we've implemented a state stack that allows for pausing and resuming execution seamlessly. This feature ensures that complex processes can be handled with the right balance of automation and human oversight.

## Security and transparency at the forefront

In an era where data security and process transparency are paramount, our framework doesn't fall short. It's designed with a security-first approach, ensuring granular access control so that users only access information they're authorised to see. Additionally, we provide detailed logging and visualisation of each execution, offering complete explainability of the automation process. This level of transparency not only aids in troubleshooting but also helps in building trust in the AI-driven processes across the organisation.

## Looking ahead

As we continue to refine and expand this LLM agent framework, we're excited to explore its potential across different industries. We'll be sharing more about each of these features in the future and showcase how they can be leveraged to solve specific business challenges and explore real-world applications.

Look forward to more in-depth explorations of the framework's capabilities, use cases, and technical innovations. With this revolutionary approach, you're not just automating tasks – you're transforming the way your enterprise operates, unleashing the true power of LLM in your organisation.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers) today!
