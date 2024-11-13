---
layout: post
id: 2024-11-13-metasense-v2
title: 'Metasense V2: Enhancing, improving and productionisation of LLM powered data governance'
date: 2024-11-14 00:00:10
authors: [nick-buhrer, shreyas-parbat, yucheng-zeng]
categories: [Engineering, Data Science]
tags: [Engineering, Generative AI, LLM, Machine Learning]
comments: true
cover_photo: /img/metasensev2/metasense-banner.png
excerpt: "In the initial article, we explored the integration of Large Language Models (LLM) to automate metadata generation, addressing challenges like limited customisation and resource constraints. This integration enabled efficient column-level tag classifications and data sensitivity tiering. With the model initially scanning over 20,000 entries, we identified areas for improvement post-rollout. These advancements have significantly reduced manual workloads, increased accuracy, and bolstered trust in our data governance processes."
---



## Introduction


In the initial article, [LLM Powered Data Classification](https://engineering.grab.com/llm-powered-data-classification), we addressed how we integrated Large Language Models (LLM) to automate governance-related metadata generation. The LLM integration enabled us to resolve challenges in Gemini, such as restrictions on the customisation of machine learning classifiers and limitations of resources to train a customised model. Gemini is a metadata generation service built internally to automate the tag generation process using a third-party data classification service. We also focused on LLM-powered column-level tag classifications. The classified tags, combined with Grab’s data privacy rules, allowed us to determine sensitivity tiers of data entities. The affordability of the model also enables us to scale it to cover more data entities in the company. The initial model scanned more than 20,000 data entries, at an average of 300-400 entities per day. Despite its remarkable performance, we were aware that there was room for improvement in the areas of data classification and prompt evaluation.

## Improving the model post-rollout

Since its launch in early 2024, our model has gradually grown to cover the entire data lake. To date, the vast majority of our data lake tables have undergone analysis and classification by our model. This has significantly reduced the workload for Grabbers. Instead of manually classifying all new or existing tables, Grabbers can now rely on our model to assign the appropriate classification tier accurately.

Despite table classification being automated, the data pipeline still requires owners to manually perform verification to prevent any misclassifications. While it is impossible to entirely eliminate human oversight from critical machine learning workflows, the team has dedicated substantial time post-launch to refining the model, thereby safely minimising the need for human intervention.


### Utilising post-rollout data

Following the deployment of our model and receipt of extensive feedback from table owners, we have accumulated a large dataset to further enhance the model. This data, coupled with the dataset of manual classifications from the Data Governance Office to ensure compliance with information classification protocols, serves as the training and testing datasets for the second iteration of our model.


### Model improvements with prompt engineering

Expanding the evaluation and testing data allowed us to uncover weaknesses in the previous model. For instance, we discovered that seemingly innocuous table columns like “business email” could contain entries with Personal Identifiable Information (PII) data.

An example of this would be a business that uses a personal email address containing a legal name—a discrepancy that would be challenging for even human reviewers to detect. Additionally, we discovered nested JSON structures occasionally included personal names, phone numbers, and email addresses hidden among other non-PII metadata. Lastly, we identified passenger communications with Grab occasionally mentioning legal names, phone numbers, and other PII, despite most of the content being non-PII.

Ultimately, we hypothesised the model’s main issue was model capacity. The model displayed difficulty focusing on large data samples containing a mixture of PII and non-PII data despite having a good understanding of what constitutes PII. Just like humans, when given high volumes of tasks to work on simultaneously, the model’s effectiveness is reduced. In the original model, 13 out of 21 tags were aimed at distinguishing different types of non-PII data. This took up significant model capacity and distracted the model from its actual task: identifying PII data. 

To prevent the model from being overwhelmed, large tasks are divided into smaller, more manageable tasks, allowing the model to dedicate more attention to each task. The following measures were taken to free up model capacity:


1. Splitting the model into two parts to make problem solving more manageable.  
   * One part for adding PII tags.  
   * Another part for adding all other types of tags. 

2. Reducing the number of tags for the first part from 21 to 8 by removing all non-PII tags. This simplifies the task of differentiating types of data. 

3. Using clear and concise language, removing unnecessary detail. This was done by reducing word count in prompt from 1,254 to 737 words for better data analysis.

4. Splitting tables with more than 150 columns into smaller tables. Fewer table rows means that the LLM has sufficient capacity to focus on each column.


### Enabling rapid prompt experimentation and deployment

In our quest to facilitate swift experimentation with various prompt versions, we have empowered a diverse team of data scientists and engineers to work together effectively on the prompts and service. This has been made possible by upgrading our model architecture to incorporate the LangChain and LangSmith frameworks.


**LangChain** introduces a novel framework that streamlines the process from raw input to the desired outcome by chaining interoperable components. **LangSmith**, on the other hand, is a unified DevOps platform that fosters collaboration among various team members and developers, including product managers, data scientists, and software engineers. It simplifies the processes of development, collaboration, testing, deployment, and monitoring for all involved.

Our new backend leverages LangChain to construct an updated model that supports classification tasks for both non-PII and PII tagging. Integration with LangSmith enables data scientists to directly develop prompt templates and conduct experiments via the LangSmith user interface. In addition, managing the evaluation dataset on LangSmith provides a clear view of the performance of prompts across multiple custom metrics.

The integration of LangChain and LangSmith has significantly improved our model architecture, fostering collaboration and continuous improvement. This has not only streamlined our processes but also enhanced the transparency of our performance metrics. By harnessing the power of these innovative tools, we are better equipped to deliver high-quality, efficient solutions.

The benefits of the LangChain and LangSmith framework enhancements in Metasense are summarised as follows:


**Streamlined prompt optimisation process.** 

   Data scientists can create, update, and evaluate prompts directly on the LangSmith user interface and save them in commit mode. For rapid deployment, the prompt identifier in service configurations can be easily adjusted.  

<div class="post-image-section"><figure>
  <img src="/img/metasensev2/figure-1.png" alt="" style="width:60%"><figcaption align="middle">Figure 1: Streamlined prompt optimisation process.</figcaption>
  </figure>
</div>


**Transparent prompt performance metrics.** 

   LangSmith's capabilities allow us to effortlessly run evaluations on a dataset and obtain performance metrics across multiple dimensions, such as accuracy, latency, and error rate.  
   

### Assuring quality in perpetuity

With exceptionally low misclassification rates recorded, table owners can place greater trust in the model's outputs and spend less time reviewing them. Nevertheless, as a prudent safety measure, we have set up alerts to monitor misclassification rates periodically, sounding an internal alarm if the rate crosses a defined threshold. A model improvement protocol has also been set in place for such alarms.


## Conclusion

The integration of LLM into our metadata generation process has significantly improved our data classification capabilities, reducing manual workloads and increasing accuracy. Continuous improvements, including the adoption of LangChain and LangSmith frameworks, have streamlined prompt optimisation and enhanced collaboration among our team. With low misclassification rates and robust safety measures, our system is both reliable and scalable, fostering trust and efficiency. In conclusion, these advancements ensure we remain at the forefront of data governance, delivering high-quality solutions and valuable insights to our stakeholders.

<br/>

<small class="credits">We would like to express our sincere gratitude to Infocomm Media Development Authority (IMDA) for supporting this initative.</small>


## Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 700 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!