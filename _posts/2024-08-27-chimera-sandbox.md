---
layout: post
id: 2024-08-27-chimera-sandbox
title: 'Chimera Sandbox: A scalable experimentation and development platform for Notebook services'
date: 2024-08-25 00:00:10
authors: [arkarming-aung, yiyang-liao, xian-zhou, padarn-wilson, dheeraj-pidatala]
categories: [Engineering, Design]
tags: [Engineering, Generative AI, LLM, Experiment, Machine learning]
comments: true
cover_photo: /img/chimera-sandbox/cover.png
excerpt: "Unleash the potential of machine learning with Grab's Chimera Sandbox. This scalable platform facilitates rapid development and experimentation of ML solutions, offering deep integration with Large Language Models and a variety of compute instances. Discover how it's driving AI innovation at Grab."
---

Key to innovation and improvement in machine learning (ML) models is the ability for rapid iteration. Our team, Chimera, part of the Artificial Intelligence (AI) Platform team, provides the essential compute infrastructure, ML pipeline components, and backend services. This support enables our ML engineers, data scientists, and data analysts to efficiently experiment and develop ML solutions at scale.

With a commitment to leveraging the latest Generative AI (GAI) technologies, Grab is enhancing productivity tools for all Grabbers. Our Chimera Sandbox, a scalable Notebook platform, facilitates swift experimentation and development of ML solutions, offering deep integration with our AI Gateway. This enables easy access to various Large Language Models (LLMs) (both proprietary and open source), ensuring scalability, compliance, and access control are managed seamlessly.

## What is Chimera Sandbox?

Chimera Sandbox is a Notebook service platform. It allows users to launch multiple notebook and visualisation services for experimentation and development. The platform offers an extremely quick onboarding process enabling any Grabber to start learning, exploring and experimenting in just a few minutes. This inclusivity and ease of use have been key in driving the adoption of the platform across different teams within Grab and empowering all Grabbers to be GAI-ready.

One significant challenge in harnessing ML for innovation, whether for technical experts or non-technical enthusiasts, has been the accessibility of resources. This includes GPU instances and specialised services for developing LLM-powered applications. Chimera Sandbox addresses this head-on by offering an extensive array of compute instances, both with and without GPU support, thus removing barriers to experimentation. Its deep integration with Grab's suite of internal ML tools transforms the way users approach ML projects. Users benefit from features like hyperparameter tuning, tracking ML training metadata, accessing diverse LLMs through Grab's AI Gateway, and experimenting with rich datasets from Grab's data lake. Chimera Sandbox ensures that users have everything they need at their fingertips. This ecosystem not only accelerates the development process but also encourages innovative approaches to solving complex problems.

The underlying compute infrastructure of the Chimera Sandbox platform is Grab’s very own battle-tested, highly scalable ML compute infrastructure running on multiple Kubernetes clusters. Each cluster can scale up to thousands of nodes at peak times gracefully. This scalability ensures that the platform can handle the high computational demands of machine learning tasks. The robustness of Kubernetes ensures that the platform remains stable, reliable, and highly available even under heavy load. At any point in time, there can be hundreds of data scientists, ML engineers and developers experimenting and developing on the Chimera Sandbox platform.

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/chimera-sandbox-platform.png" alt="" style="width:80%"><figcaption align="middle">Figure 1: Chimera Sandbox Platform.</figcaption>
  </figure>
</div>

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/ui-starting-chimera.png" alt="" style="width:80%"><figcaption align="middle">Figure 2: UI for Starting Chimera Sandbox.</figcaption>
  </figure>
</div>

## Best of both worlds

Chimera Sandbox is suitable for both new users who want to explore and experiment ML solutions and advanced users who want to have full control over the Notebook services they run. Users can launch Notebook services using default Docker images provided by the Chimera Sandbox platform. These images come pre-loaded with popular data science and ML libraries and various Grab internal systems integrations. Chimera also provides basic Docker images from which the users can use as base images to build their own customised Notebook service Docker images. Once the images are built, the users can configure their Notebook services to use their custom Docker images. This ensures their Notebook environment can be exactly the way they want them to be.

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/customise-notebook-packages.png" alt="" style="width:80%"><figcaption align="middle">Figure 3: Users are able to customise their Notebook service with additional packages.</figcaption>
  </figure>
</div>

## Real-time collaboration
The Chimera Sandbox platform also features a real-time collaboration feature. This feature fosters a collaborative environment where users can exchange ideas and work together on projects.

## CPU and GPU choices

Chimera Sandbox offers a wide variety of CPU and GPU choices to cater to specific needs, whether it is a CPU, memory, or GPU intensive experimentation. This flexibility allows users to choose the most suitable computational resources for their tasks, ensuring optimal performance and efficiency.

## Deep integration with Spark

The platform is deeply integrated with internal Spark engines, enabling users to experiment building  extract, transform, and load (ETL) jobs with data from Grab’s data lake. Integrated helpers provide a faster developer experience, such as %%spark_sql magic cell to execute spark SQL queries without needing to write additional code to start a Spark session.

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/magic-cell.gif" alt="" style="width:80%"><figcaption align="middle">Figure 4: %%spark_sql magic cell enables users to quickly explore data with Spark.</figcaption>
  </figure>
</div>

In addition to Magic Cell, the Chimera Sandbox offers advanced Spark functionalities. Users can write PySpark code using pre-configured and configurable Spark clients in the runtime environment. The underlying computation engine leverages Grab's custom Spark-on-Kubernetes operator, enabling support for large-scale Spark workloads. This high-code capability complements the low-code Magic Cell feature, providing users with a versatile data processing environment.

## AI Gallery

Chimera Sandbox features an AI Gallery to guide and accelerate users to start experimenting with ML solutions or building GAI-powered applications. This is especially useful for new or novice users who are keen to explore what they can do on the Chimera Sandbox platform. With Chimera Sandbox, users are not just presented with a bare bones compute solution but rather are provided with ways to do ML tasks right from Chimera Sandbox Notebooks. This approach saves users from the hassle of having to piece together the examples from the public internet, which may not work on the platform. These ready-to-run and comprehensive notebooks in the AI Gallery assure users that they can run end-to-end examples without a hitch. Based on these examples, the users can only extend their experimentations and development for their specific needs. Not only that, these tutorials and notebooks exhibit the platform capabilities and integrations available on the platform in an interactive manner rather than having the users refer to a separate documentation.

Lastly, the AI Gallery encourages contributions from other Grabbers, fostering a collaborative environment. Users who are enthusiastic about creating educational contents on Chimera Sandbox can effectively share their work with other Grabbers.

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/ai-gallery.png" alt="" style="width:80%"><figcaption align="middle">Figure 5: Including AI Gallery in user specified sandbox images.</figcaption>
  </figure>
</div>

## Integration with various LLM services

Notebook users on Chimera Sandbox can easily tap into a plethora of LLMs, both open source and proprietary models, without any additional setup via our AI Gateway. The platform takes care of access mechanisms and endpoints for various LLM services so that the users can easily use their favourite libraries to create LLM-powered applications and conduct experimentations. This seamless integration with LLMs enables users to focus on their GAI-powered ideas rather than having to worry about underlying logistics and technicalities of using different LLMs.

## More than a notebook service

While Notebook is the most popular service on the platform, Chimera Sandbox offers much more than just notebook capabilities. It serves as a comprehensive namespace workspace equipped with a suite of ML/AI tools. Alongside notebooks, users can access essential ML tools such as Optuna for hyperparameter tuning, MLflow for experiment tracking, and other tools including Zeppelin, RStudio, Spark history, Polynote, and LabelStudio. All these services use a shared storage system, creating a tailored workspace for ML and AI tasks.

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/sandbox-namespace.png" alt="" style="width:80%"><figcaption align="middle">Figure 6: A Sandbox namespace with its out-of-the-box services.</figcaption>
  </figure>
</div>

Additionally, the Sandbox framework allows for the seamless integration of more services into personal workspaces. This high level of flexibility significantly enhances the capabilities of the Sandbox platform, making it an ideal environment for diverse ML and AI applications.

## Cost attribution

For a multi-tenanted platform such as Chimera Sandbox, it is crucial to provide users information on how much they have spent with their experimentations. Cost showback and chargeback capabilities are of utmost importance for a platform on which users can launch Notebook services that use accelerated instances with GPUs. The platform provides cost attribution to individual users, so each user knows exactly how much they are spending on their experimentations and can make budget-conscious decisions. This transparency in cost attribution encourages responsible usage of resources and helps users manage their budgets effectively.

## Growth and future plans

In essence, Chimera Sandbox is more than just a tool; it's a catalyst for innovation and growth, empowering Grabbers to explore the frontiers of ML and AI. By providing an inclusive, flexible, and powerful platform, Chimera Sandbox is helping shape the future of Grab, making every Grabber not just ready but excited to contribute to the AI-driven transformation of our products and services.

Since the GAI sprint started, we have observed hockey stick growth on the Chimera Sandbox platform. We are enabling massive experimentation across different teams at Grab to experiment and work on different GAI-powered applications.

<div class="post-image-section"><figure>
  <img src="/img/chimera-sandbox/daily-active-users.png" alt="" style="width:80%"><figcaption align="middle">FFigure 7:. Chimera Sandbox daily active users.</figcaption>
  </figure>
</div>

Our future plans include mechanisms for better notebook discovery, collaboration and usability, and the ability to enable users to schedule their notebooks right from Chimera Sandbox. These enhancements aim to improve the user experience and make the platform even more versatile and powerful.

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!