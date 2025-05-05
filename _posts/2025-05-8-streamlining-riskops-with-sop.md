---
layout: post
id: 2025-05-8-streamlining-riskops-with-sop
title: 'Streamlining RiskOps with the SOP agent framework'
date: 2025-05-04 00:00:10
authors: [fujiao-liu, haitao-bao, jia-chen, meichen-lu, muqi-li] 
categories: [Engineering, Data Analytics, Data Science]
tags: [Engineering, Generative AI, LLM, Experiment, Machine learning]
comments: true
cover_photo: /img/riskops-sop-img/banner-figure-1.png
excerpt: "Discover how the SOP-driven Large Language Model (LLM) agent framework is revolutionising Risk Operations (RiskOps) by automating Account Takeover (ATO) investigations. Explore the potential of this transformative tool to unlock unprecedented levels of productivity and innovation across industries."
---

## Introduction

In the blog our previous introduction to the [SOP-driven LLM Agent Framework](https://engineering.grab.com/introducing-the-sop-drive-llm-agent-framework), we the potential of LLM agent framework to revolutionise business operations was discussed. Now, we're excited to explore a compelling use case: automating Account Takeover (ATO) investigations in Risk Operations (RiskOps). This framework has significantly reduced manual effort, improved efficiency, and minimised errors in the investigation process, setting a new standard for secure and streamlined operations.

## The challenge in RiskOps

Traditionally, ATO investigations have been fraught with challenges due to their complexity and the manual effort required. Analysts must sift through vast amounts of data, cross-referencing multiple systems and executing numerous SQL queries to make informed decisions. This process is not only labor-intensive but also susceptible to human error, which can lead to inconsistencies and potential security breaches.

The manual approach often involves:

* **Time-consuming data analysis:** Analysts spend significant time gathering and interpreting data from disparate sources, leading to delays and inefficiencies.  
* **Decision fatigue:** Continuous decision-making in a high-pressure environment can result in oversight or errors, especially when relying on predefined thresholds without adaptive insights.  
* **Resource constraints:** The need for specialised skills to handle SQL queries and interpret complex patterns limits the scalability of the process.

These challenges highlight the need for a more efficient, reliable, and scalable solution.

## Leveraging the SOP agent framework

Our framework transforms the ATO investigation process by mirroring manual workflows while leveraging advanced automation.

At its core, a Standard Operating Procedure (SOP) guides the investigation process. This comprehensive SOP, is designed with an intuitive tree structure. It outlines the sequence of investigative actions, required data for each step, necessary SQL queries and external function calls, as well as decision criteria guiding the investigation. **Figure 1** shows the example of ATO investigation SOP.


<div class="post-image-section"><figure>
  <img src="/img/riskops-sop-img/figure-1.png" alt="" style="width:80%"><figcaption align="middle"> Figure 1: Example of fictional ATO investigation SOP</figcaption>
  </figure>
</div>


The SOP is written in natural language in an indentation format. Users can easily define SOPs using an intuitive editor. This format also clearly denotes the specific functions or queries associated with each step in the SOP. The @function\_name notation (eg. @IP\_web\_login\_history) makes it easy to identify where external calls are made within the process, highlighting the integration points between the SOP-driven LLM agent framework and the existing systems or databases.

## Dynamic execution

The dynamic execution engine consists of the SOP planner and the Worker Agent, working in tandem to drive efficient operations. The SOP planner serves as the navigator, guiding the investigation’s path by generating the necessary SOP steps and determining the appropriate APIs to call. It uses a structured execution approach inspired by Depth-First Search (DFS) to ensure thorough and systematic processing. Meanwhile, the Worker Agent acts as the executor, interpreting the JSON-formatted SOPs, invoking required APIs or SQL queries, and storing results. This continuous interplay between the SOP planner and the Worker Agent establishes an efficient feedback loop, propelling the investigation forward with precision and reliability.

The automated investigation process begins at the root of the SOP tree and methodically progresses through each defined step. At each juncture, the system executes specified SQL queries as needed, retrieving and analysing relevant data. Based on this analysis, the framework evaluates step specific criteria and makes informed decisions that guide subsequent steps. This iterative process allows the investigation to delve as deeply into the data as the SOP dictates, ensuring both thoroughness and efficiency.

As the investigation concludes, having completed all of the steps, the framework enters its final phase. It compiles a comprehensive summary of the entire process, synthesising all gathered information to generate a final decision. The culmination of this process is a detailed report that encapsulates the investigation's findings and provides clear, actionable conclusions.

This automated approach combines the best of human expertise with computational efficiency. It maintains the depth and detail of a human-conducted investigation while leveraging the speed and consistency of automation. The result is a powerful tool that can handle complex investigations with precision and reliability, making it an invaluable asset in various fields requiring thorough and systematic analysis.


<div class="post-image-section"><figure>
  <img src="/img/riskops-sop-img/figure-2.gif" alt="" style="width:80%"><figcaption align="middle"> Figure 2: Example of dynamic execution</figcaption>
  </figure>
</div>


## Efficiency, impact and future potential

The SOP-driven LLM agent framework has demonstrated remarkable efficiency and impact in automating RiskOps processes. By automating data handling and leveraging AI to adapt to emerging patterns, the framework has significantly reduced manual tasks and streamlined operations. **Figure 3** shows an example of an automated RiskOps process integrated with Slack.  


<div class="post-image-section"><figure>
  <img src="/img/riskops-sop-img/figure-3.png" alt="" style="width:80%"><figcaption align="middle">Figure 3: Slack integration</figcaption>
  </figure>
</div>


Key achievements of automating RiskOps process:

* Reduction in handling time from 22 to 3 minutes per ticket.  
* Automation of 87% of ATO cases since launch.  
* Achievement of a zero-error rate, enhancing both efficiency and security.

These results not only demonstrate the framework's effectiveness in streamlining RiskOps but also provide stakeholders with increased confidence in the security and reliability of their operations.

The success of the framework in automating ATO investigations opens the door to a wider range of applications across various sectors. By adapting the framework to different processes, organisations can achieve similar improvements in efficiency and reliability, leading to a more responsive and agile business environment.

## Conclusion

The SOP-driven LLM agent framework is more than an automation tool. It's a catalyst for transforming enterprise operations. By applying it to ATO investigations, we've demonstrated its potential to enhance efficiency, reliability, and security. As we continue to explore its capabilities, we anticipate unlocking new levels of productivity and innovation across industries.

We look forward to sharing more as we explore how this groundbreaking framework can be applied to various challenges, helping organisations navigate the complexities of modern operations with confidence and precision.

## Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
