---
layout: post
id: 2024-11-29-supercharging-llm-application-development-with-llm-kit
title: 'Supercharging LLM Application Development with LLM-Kit'
date: 2024-11-29 00:00:10
authors: [boonzhan-chew, kendrick-tan, swati-joshi, yujie-ang]
categories: [Engineering, Data Science]
tags: [Engineering, Generative AI, LLM, Machine Learning]
comments: true
cover_photo: /img/llm_kit/llmkit-banner.png
excerpt: "Discover how Grab's LLM-Kit enhances AI app development by addressing scalability, security, and integration challenges. This article discusses the challenges faced in LLM app building, the solution, the architecture of the LLM-Kit as well as the future plans of the LLM-Kit."
---


## Introduction

At Grab, we are committed to leveraging the power of technology to deliver the best services to our users and partners. As part of this commitment, we have developed the LLM-Kit, a comprehensive framework designed to supercharge the setup of production-ready Generation AI applications. This blog post will delve into the features of the LLM-Kit, the problems it solves, and the value it brings to our organisation.

## The Challenges

The introduction of the LLM-Kit has significantly addressed the challenges encountered in LLM application development. The involvement of sensitive data in AI applications necessitates that security remains a top priority, ensuring data safety is not compromised during AI application development.

Concerns such as scalability, integration, monitoring, and standardisation are common issues that any organisation will face in their LLM and AI development efforts.

The LLM-Kit has empowered Grab to pursue LLM application development and the rollout of Generative AI efficiently and effectively in the long term.

## Introducing the LLM-Kit

The LLM-Kit is our solution to these challenges. Since the introduction of the LLM Kit, it has helped onboard hundreds of GenAI applications at Grab and has become the de facto choice for developers. It is a comprehensive framework designed to supercharge the setup of production-ready LLM applications. The LLM-Kit provides:

* **Pre-configured Structure**: The LLM-Kit comes with a pre-configured structure containing an API server, configuration management, a sample LLM Agent, and tests.  
* **Integrated Tech Stack**: The LLM-Kit integrates with Poetry, Gunicorn, FastAPI, Langchain, Langsmith, Hashicorp Vault, Amazon EKS, and Gitlab CI pipelines to provide a robust and end-to-end tech stack for LLM application development.  
* **Observability**: The LLM-Kit features built-in observability with Datadog integration and Langsmith, enabling real-time monitoring of LLM applications.  
* **Config & Secret Management**: The LLM-Kit utilises Python's configparser and Vault for efficient configuration and secret management.  
* **Authentication**: The LLM-Kit provides built-in OpenID Connect (OIDC) auth helpers for authentication to Grab's internal services.  
* **API Documentation**: The LLM-Kit features comprehensive API documentation using Swagger and Redoc.  
* **Redis & Vector Databases Integration**: The LLM-Kit integrates with Redis and Vector databases for efficient data storage and retrieval.  
* **Deployment Pipeline**: The LLM-Kit provides a deployment pipeline for staging and production environments.  
* **Evaluations**: The LLM-Kit seamlessly integrates with LangSmith, utilising its robust evaluations framework to ensure the quality and performance of the LLM applications.



In addition to these features, the team has also included a cookbook with many commonly used examples within the organisation providing a valuable resource for developers. Our cookbook includes a diverse range of examples, such as persistent memory agents, Slackbot LLM agents, image analysers and full-stack chatbots with user interfaces, showcasing the versatility of the LLM-Kit.

## The Value of the LLM-Kit

The LLM-Kit brings significant value to our teams at Grab:

* **Increased Development Velocity**: By providing a pre-configured structure and integrated tech stack, the LLM-Kit accelerates the development of LLM applications.  
* **Improved Observability**: With built-in Langsmith and Datadog integration, teams can monitor their LLM applications in real-time, enabling faster issue detection and resolution.  
* **Enhanced Security**: The LLM-Kit's built-in OIDC auth helpers and secret management using Vault ensure the secure development and deployment of LLM applications.  
* **Efficient Data Management**: The integration with Vector databases facilitates efficient data storage and retrieval, crucial for the performance of LLM applications.  
* **Standardization**: The LLM-Kit provides a paved road framework for building LLM applications, promoting best practices and standardisation across teams.

Through the LLM-Kit, we can save an estimate of 1.5 weeks before teams start working on their first feature.


<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-1.png" alt="" style="width:60%"><figcaption align="middle">Figure 1. Project development process before LLM-Kit</figcaption>
  </figure>
</div>


<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-2.png" alt="" style="width:60%"><figcaption align="middle">Figure 2. Project development process after LLM-Kit</figcaption>
  </figure>
</div>




## Architecture Design and Technical Implementation

The LLM-Kit is designed with a modular architecture that promotes scalability, flexibility, and ease of use. Figure 3 shows the breakdown of what the LLM-Kit covers:

<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-3.png" alt="" style="width:60%"><figcaption align="middle">Figure 3. LLM-Kit modules</figcaption>
  </figure>
</div>
<br/>

### Automated Steps

To better illustrate the technical implementation of the LLM-Kit, let's take a look at figure 4 which outlines the step-by-step process of how an LLM application is generated with the LLM-Kit:


<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-4.png" alt="" style="width:60%"><figcaption align="middle">Figure 4. Process of generation LLM apps using LLM-Kit</figcaption>
  </figure>
</div>

The process begins when an engineer submits a form with the application name and other relevant details. This triggers the creation of a GitLab project, followed by the generation of a code scaffold specifically designed for the LLM application. GitLab CI files are then generated within the same repository to handle continuous integration and deployment tasks. The process continues with the creation of staging infrastructure, including components like Elastic Container Registry (ECR) and Elastic Kubernetes Service (EKS). Additionally, a Terraform folder is created to provision the necessary infrastructure, eventually leading to the deployment of production infrastructure. At the end of the pipeline, a GPT token is pushed to a secure vault path, and the engineer is notified upon the successful completion of the pipeline. 
<br/>

### Scaffold Code Structure


<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-5.png" alt="" style="width:40%"><figcaption align="middle">Figure 5. Scaffold Code Structure</figcaption>
  </figure>
</div>
<br/>

The scaffolded code is broken down into multiple folders:

1. **Agents**: This folder contains the code to initialise an agent. We have gone ahead with Langchain as the agent framework; essentially the entry point for the endpoint defined in the routes folder.  
2. **Auth**: Authentication and authorisation  module for executing some of the APIs within Grab.  
3. **Core**: Includes extracting all configurations(i.e. GPT token) and secret decryption for running the LLM application.  
4. **Models**: Used to define the structure for the core LLM APIs within Grab.  
5. **Routes:** REST API endpoint definitions for the LLM Applications, comes with health check and authentication and authorisation and a simple agent by default.  
6. **Storage**: This folder includes connectivity with PGVector, our managed vector database within Grab and database schemas.  
7. **Tools**: Functions which are used as tools for the LLM Agent.  
8. **Tracing**: Integration with our tracing and monitoring tools to monitor various metrics for a production application.  
9. **Utils**: Because every code base comes with a utils strategy.

### Infrastructure provisioning and deployment


<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-6.png" alt="" style="width:60%"><figcaption align="middle">Figure 6. Pipeline infrastructure </figcaption>
  </figure>
</div>


Within the same codebase, we have integrated a comprehensive pipeline that automatically scaffolds the necessary code for infrastructure provisioning, deployment, and build processes. Using Terraform, the pipeline provisions the required infrastructure seamlessly. The deployment pipelines are defined in the .gitlab-ci.yml file, ensuring smooth and automated deployments. Additionally, the build process is specified in the Dockerfile, allowing for consistent builds. This automated scaffolding streamlines the development workflow, enabling developers to focus on writing business logic without worrying about the underlying infrastructure and deployment complexities.

### RAG scaffolding 

<div class="post-image-section"><figure>
  <img src="/img/llm_kit/figure-7.png" alt="" style="width:60%"><figcaption align="middle">Figure 7. Form submitted to access credentials and database host path</figcaption>
  </figure>
</div>


At Grab, we've established a streamlined process for setting up a vector database (PGVector) and whitelisting the service using the LLM-Kit. Once the form above is submitted, you can access the credentials and database host path. The secrets will be automatically added to the vault path. Engineers will then only need to include the DB host path in the configuration file of the scaffolded LLM-Kit application.

## Conclusion

The LLM-Kit is a testament to Grab's commitment to fostering innovation and growth in AI and ML. By addressing the challenges faced by our teams and providing a comprehensive, scalable, and flexible framework for LLM application development, the LLM-Kit is paving the way for the next generation of AI applications at Grab.

## Growth and future plans

Looking ahead, the LLM-Kit team aims to significantly enhance the web server's concurrency and scalability while providing reliable and easy-to-use SDKs. The team plans to offer reusable and composable LLM SDKs, including evaluation and guardrails frameworks, to enable service owners to build feature-rich Generative AI programs with ease. Key initiatives also include the development of a CLI for version updates and dev tooling, as well as a polling-based agent serving function. These advancements are designed to drive innovation and efficiency within the organisation, ultimately providing a more seamless and efficient development experience for engineers.

<br/>

 <small class="credits">We would like to acknowledge and thank Pak Zan Tan, Han Su, and Jonathan Ku from the Yoshi team and Chen Fei Lee from the MEKs team for their contribution in this project under the leadership of Padarn George Wilson.</small>

## Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!