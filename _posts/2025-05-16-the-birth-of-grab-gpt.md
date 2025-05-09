---
layout: post
id: 2025-05-16-the-birth-of-grab-gpt
title: 'From failure to success: The birth of GrabGPT, Grab’s internal ChatGPT'
date: 2025-05-16 08:23:00
authors: [wenbo-wei]
categories: [Engineering]
tags: [Engineering, Optimisation, AI]
comments: true
cover_photo: /img/birth-of-grabgpt/grabgpt-banner.png
excerpt: "When Grab's Machine Learning team sought to automate support queries, a failed chatbot experiment sparked an unexpected pivot: GrabGPT. Born from the need to harness Large Language Models (LLMs) internally, this tool became a go-to resource for employees. Offering private, auditable access to models like GPT and Gemini. Author Wenbo shares his journey of turning failed experiments into startegic wins."
---

### Introduction

In March 2023, I embarked on a mission to explore the potential of Large Language Models (LLMs) within Grab. What started off as an attempt to solve a specific problem—reducing the burden on our ML Platform team’s support channels, ended up becoming something much bigger. The creation of **GrabGPT**, an internal ChatGPT-like tool that has transformed how folks in Grab interact with AI. This is the story of how a failed experiment led to one of Grab’s most impactful internal tools.

### The problem: Overwhelmed support channels

As part of Grab’s machine learning platform team, we were drowning in user inquiries. Slack channels were flooded with questions and our on-call engineers were spending more time answering repetitive queries than building innovative solutions. This led me to ponder on this question, “*could we use LLMs to build a chatbot that understands our platform’s documentation and answers these questions automatically?”*

### The first attempt: A chatbot for platform support

I started by exploring open-source frameworks to build a chatbot. I stumbled upon [chatbot-ui](https://github.com/mckaywrigley/chatbot-ui), a simple yet powerful tool that could be wired up with LLMs. My idea was to feed the chatbot our platform’s Q\&A documentation (over 20,000 words) and let it handle user queries.

But there was a catch: **GPT-3.5-turbo could only handle 8,000 tokens (\~2,000 words)**. I spent days summarising the documentation, reducing it to less than 800 words. While the chatbot worked for a handful of frequently asked questions, it was clear that this approach wasn’t scalable. I tried with embedding search and it didn’t work that well too, so I decided to **give up on this idea**.

### The pivot: Why not build Grab’s own ChatGPT?

As I stepped back, a new thought struck me: *Grab doesn’t have its own ChatGPT-like tool yet.* I had the frameworks, the LLM knowledge, and most importantly—access to [Grab’s model-serving platform, catwalk](https://engineering.grab.com/catwalk-evolution). Why not build an internal tool that any Grabber could use?

Over a weekend, I extended the existing frameworks, added Google login for authentication, and deployed the tool internally. I called it **Grab’s ChatGPT**. Little did I know, this would become one of the most widely used tools in the company.

The tool quickly became a staple for Grabbers, especially in regions where ChatGPT was inaccessible (e.g., China). The name evolved too—our PM suggested **GrabGPT**, and it stuck.

### The Success: GrabGPT takes off

The response was overwhelming:

* **Day 1:** 300 users registered.  
* **Day 2:** 600 new users.  
* **Week 1:** 900 new users  
* **Month 3:** Over 3000 users, with 600 daily active users  
* **Today:** Almost all Grabbers are using  GrabGPT. 

<div class="post-image-section"><figure>
  <img src="/img/birth-of-grabgpt/figure-1.png" alt="" style="width:80%"><figcaption align="middle">Figure 1: Number of GrabGPT users in one month</figcaption>
  </figure>
</div>

### Why GrabGPT works: More than just technology

The success of GrabGPT isn’t just about the tech,it’s about **timing, security, and accessibility**. Here’s why it resonated so deeply within Grab:

1. **Data security:** GrabGPT operates on a private route, ensuring that sensitive company data never leaves our infrastructure.  
2. **Global accessibility:** Unlike ChatGPT, which is banned in some regions, GrabGPT is accessible to all Grabbers, regardless of location.  
3. **Model agnosticism:** GrabGPT isn’t tied to a single LLM provider. It supports models from OpenAI, Claude, Gemini, and more.  
4. **Auditability:** Every interaction on GrabGPT is auditable, making it a favorite of our data security and governance teams.

### **The broader impact: A catalyst for LLM strategy**

GrabGPT didn’t just solve an immediate problem, it sparked a broader conversation about how LLMs can be leveraged across Grab. It showed that a single engineer, provided with the right tools and timing, can create something transformative. Today, GrabGPT is more than a tool; it’s a testament to the power of experimentation and adaptability.

### Lessons learned

1. **Failure is a stepping stone:** My initial failure with the support chatbot which then led me to a much bigger opportunity.  
2. **Timing matters:** GrabGPT succeeded because it addressed a critical need at the right time.  
3. **Think big, start small:** What began as a weekend project became a company-wide tool.  
4. **Collaboration is key:** The enthusiasm and contributions from other Grabbers were instrumental in scaling GrabGPT.

### Conclusion

GrabGPT is a story of resilience, innovation, and the unexpected rewards from thinking outside the box. It’s a reminder that sometimes, the best solution comes from pivoting away from what doesn’t work and embracing new possibilities. As LLMs continue to evolve, I’m excited to see how GrabGPT will grow and inspire even more innovation within Grab.

I would like to end this article by letting readers know that if you’re working on a project and feel stuck, don’t be afraid to pivot. You never know, your next failure might just be the beginning of your greatest success. And if you’re at Grab, give GrabGPT a try. It might just change the way you work\!

# Join us

Grab is a leading superapp in Southeast Asia, operating across the deliveries, mobility and digital financial services sectors. Serving over 800 cities in eight Southeast Asian countries, Grab enables millions of people everyday to order food or groceries, send packages, hail a ride or taxi, pay for online purchases or access services such as lending and insurance, all through a single app. Grab was founded in 2012 with the mission to drive Southeast Asia forward by creating economic empowerment for everyone. Grab strives to serve a triple bottom line – we aim to simultaneously deliver financial performance for our shareholders and have a positive social impact, which includes economic empowerment for millions of people in the region, while mitigating our environmental footprint.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
