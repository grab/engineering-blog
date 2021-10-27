---
layout: post
id: 2020-08-24-data-gateway
title: Securing and Managing Multi-cloud Presto Clusters with Grab’s DataGateway
date: 2020-08-24 08:12:56
authors: [vinnson-lee]
categories: [Engineering, Data Science]
tags: [Engineering, Presto, Data, Data Pipeline, Access Control, Workload Distribution, Cluster]
comments: true
cover_photo: /img/data-gateway/cover.png
excerpt: "This blog post discusses how Grab's DataGateway plays a key role in supporting hundreds of users in our entire Presto ecosystem - from managing user access, cluster selection, workload distribution, and many more."
---

## Introduction

Data is the lifeblood of Grab and the insights we gain from it drive all the most critical business decisions made by Grabbers and our leaders every day.

Grab’s Data Engineering (DE) team is responsible for maintaining the data platform, which consists of data pipelines, job schedulers, and the query/computation engines that are the key components for generating insights from data. SQL is the core language for analytics at Grab and as of early 2020, our Presto platform serves about 200 user groups that add up to 500 users who run 350,000 queries every day. These queries span across 10,000 tables that process up to 1PB of data daily.

In 2016, we started the DataGateway project to enable us to manage data access for the hundreds of Grabbers who needed access to [Presto](https://aws.amazon.com/big-data/what-is-presto/) for their work. Since then, DataGateway has grown to become much more than just an access control mechanism for Presto. In this blog, we want to share what we’ve achieved since the initial launch of the project.

## The Problems We Wanted to Solve

As we were reviewing the key challenges around data access in Grab and assessing possible solutions, we came up with this prioritised list of user requirements we wanted to work on:

*   Use a single endpoint to serve everyone.
*   Manage user access to clusters, schemas, tables, and fields.
*   Provide seamless user experience when presto clusters are scaled up/down, in/out, or provisioned/decommissioned.
*   Capture audit trail of user activities.

To provide Grabbers with the critical need of interactive querying, as well as performing extract, transform, load (ETL) jobs, we evaluated several technologies. Presto was among the ones we evaluated, and was what we eventually chose although it didn’t meet all of our requirements out of the box. In order to address these gaps, we came up with the idea of a security gateway for the Presto compute engine that could also act as a load balancer/proxy, this is how we ended up creating the DataGateway.

DataGateway is a service that sits between clients and Presto clusters. It is essentially a smart HTTP proxy server that is an abstraction layer on top of the Presto clusters that handles the following actions:

1.  Parse incoming SQL statements to get requested schemas, tables, and fields.
2.  Manage user Access Control List (ACL) to limit users' data access by checking against the SQL parsing results.
3.  Manage users' cluster access.
4.  Redirect users' traffic to the authorised clusters.
5.  Show meaningful error messages to users whenever the query is rejected or exceptions from clusters are encountered.

## Anatomy of DataGateway

The DataGateway’s key components are as follows:

*   API Service
*   SQL Parser
*   Auth framework
*   Administration UI

We leveraged Kubernetes to run all these components as microservices.

<div class="post-image-section">
  <figure>
    <img alt="Figure 1. DataGateway Key Components" height="90%" width="90%" src="/img/data-gateway/image3.png" />
    <figcaption><em>Figure 1. DataGateway Key Components</em></figcaption>
  </figure>
</div>

### API Service

This is the component that manages all users and cluster-facing processes. We integrated this service with the Presto API, which means it appears to be the same as a Presto cluster to a client. It accepts query requests from clients, gets the parsing result and runs authorisation from the SQL Parser and the Auth Framework.

If everything is good to go, the API Service forwards queries to the assigned clusters and continues the entire query process.

### Auth Framework

This handles both authentication and authorisation requests. It stores the ACL of users and communicates with the API Service and the SQL Parser to run the entire authentication process. But why is it a microservice instead of a module in API Service, you ask? It's because we keep evolving the security checks at Grab to ensure that everything is compliant with our security requirements, especially when dealing with data.

We wanted to make it flexible to fulfil ad-hoc requests from the security team without affecting the API Service. Furthermore, there are different authentication methods out there that we might need to deal with (OAuth2, SSO, you name it). The API Service supports multiple authentication frameworks that enable different authentication methods for different users.

### SQL Parser

This is a SQL parsing engine to get schema, tables, and fields by reading SQL statements. Since Presto SQL parsing works differently in each version, we would compile multiple SQL Parsers that are identical to the Presto clusters we run. The SQL Parser becomes the single source of truth.

### Admin UI

This is a UI for Presto administrators to manage clusters and user access, as well as to select an authentication framework, making it easier for the administrators to deal with the entire ecosystem.

## How We Deployed DataGateway Using Kubernetes

In the past couple of years, we’ve had significant growth in workloads from analysts and data scientists. As we were very enthusiastic about Kubernetes, DataGateway was chosen as one of the earliest services for deployment in Kubernetes. DataGateway in Kubernetes is known to be highly available and fully scalable to handle traffic from users and systems.

We also tested the [HPA feature of Kubernetes](https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough), which is a dynamic scaling feature to scale in or out the number of pods based on actual traffic and resource consumption.

<div class="post-image-section">
  <figure>
    <img alt="Figure 2. DataGateway deployment using Kubernetes" height="90%" width="90%" src="/img/data-gateway/image1.png" />
    <figcaption><em>Figure 2. DataGateway deployment using Kubernetes</em></figcaption>
  </figure>
</div>

## Functionality of DataGateway

This section highlights some of the ways we use DataGateway to manage our Presto ecosystem efficiently.

### Restrict Users Based on Schema/Table Level Access

In a setup where a Presto cluster is deployed on [AWS Amazon Elastic MapReduce (EMR)](https://aws.amazon.com/emr) or [Elastic Kubernetes Service (EKS)](https://aws.amazon.com/eks), we configure an [IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html) role and attach it to the EMR or EKS nodes. The IAM role is set to limit the access to S3 storage. However, the IAM only provides bucket-level and file-level control; it doesn't meet our requirements to have schema, table, and column-level ACLs. That’s how DataGateway is found useful in such scenarios.

One of the DataGateway services is an SQL Parser. As previously covered, this is a service that parses and digs out schemas and tables involved in a query. The API service receives the parsing result and checks against the ACL of users, and decides whether to allow or reject the query. This is a remarkable improvement in our security control since we now have another layer to restrict access, on top of the S3 storage. We’ve implemented an SQL-based access control down to table level.

As shown in the Figure 3, user A is trying run a SQL statement `select * from locations.cities`. The SQL Parser reads the statement and tells the API service that user A is trying to read data from the table `cities` in the schema `locations`. Then, the API service checks against the ACL of user A. The service finds that user A has only read access to table `countries` in schema `locations`. Eventually, the API service denies this attempt because user A doesn’t have read access to table `cities` in the schema `locations`.


<div class="post-image-section">
  <figure>
    <img alt="Figure 3. An example of how to check user access to run SQL statements" height="90%" width="90%" src="/img/data-gateway/image5.png" />
    <figcaption><em>Figure 3. An example of how to check user access to run SQL statements</em></figcaption>
  </figure>
</div>

The above flow shows an access denied result because the user doesn’t have the appropriate permissions.

### Seamless User Experience During the EMR Migration

We use AWS EMR to deploy Presto as an SQL query engine since deployment is really easy. However, without DataGateway, any EMR operations such as terminations, new cluster deployment, config changes, and version upgrades, would require quite a bit of user involvement. We would sometimes need users to make changes on their side. For example, request users to change the endpoints to connect to suitable clusters.

With DataGateway, ACLs exist for each of the user accounts. The ACL includes the list of EMR clusters that users are allowed to access. As a Presto access management platform, here the DataGateway redirects user traffics to an appropriate cluster based on the ACL, like a proxy. Users always connect to the same endpoint we offer, which is the DataGateway. To switch over from one cluster to another, we just need to edit the cluster ACL and everything is handled seamlessly.

<div class="post-image-section">
  <figure>
    <img alt="Figure 4. Cluster switching using DataGateway" height="90%" width="90%" src="/img/data-gateway/image4.png" />
    <figcaption><em>Figure 4. Cluster switching using DataGateway</em></figcaption>
  </figure>
</div>

Figure 4 highlights the case when we’re switching EMR from one cluster to another. No changes are required from users.

We executed the migration of our entire Presto platform from an AWS EMR instance to another AWS EMR instance using the same methodology. The migrations were executed with little to no disruption for our users. We were able to move 40 clusters with hundreds of users. They were able to issue millions of queries daily in a few phases over a couple of months.

In most cases, users didn’t have to make any changes on their end, they just continued using Presto as usual while we made the changes in the background.

### Multi-cloud Data Lake/Presto Cluster Maintenance

Recently, we started to build and maintain data lakes not just in one cloud, but two - in AWS and Azure. Since most end-users are AWS-based, and each team has their own AWS sub-account to run their services and workloads, it would be a nightmare to bridge all the connections and access routes between these two clouds from end-to-end, sub-account by sub-account.

Here, the DataGateway plays the role of the multi-cloud gateway. Since all end-users' AWS sub-accounts have peered to DataGateway's network, everything becomes much easier to handle.

For end-users, they retain the same Presto connection profile. The DE team then handles the connection setup from DataGateway to Azure, and also the deployment of Presto clusters in Azure.

When all is set, end-users use the same endpoint to DataGateway. We offer a feature called _Cluster Switch_ that allows users to switch between AWS Presto cluster and Azure Presto Cluster on the fly by filling in parameters on the connection string. This feature allows users to switch to their target Presto cluster without any endpoint changes. The switch works instantly whenever they do the change. That means users can run different queries in different clusters based on their requirements.

This feature has helped the DE team to maintain Presto Cluster easily. We can spin up different Presto clusters for different teams, so that each team has their own query engine to run their queries with dedicated resources.

<div class="post-image-section">
  <figure>
    <img alt="Figure 5. Sub-account connections and Queries" height="75%" width="75%" src="/img/data-gateway/image6.png" />
    <figcaption><em>Figure 5. Sub-account connections and Queries</em></figcaption>
  </figure>
</div>

Figure 5 shows an example of how sub-accounts connect to DataGateway and run queries on resources in different clouds and clusters.

<div class="post-image-section">
  <figure>
    <img alt="Figure 6. Sample scenario without DataGateway" height="90%" width="90%" src="/img/data-gateway/image2.png" />
    <figcaption><em>Figure 6. Sample scenario without DataGateway</em></figcaption>
  </figure>
</div>

Figure 6 shows a scenario of what would happen if DataGatway doesn’t exist. Each of the accounts would have to maintain its own connections, [Virtual Private C](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html)[loud (VPC)](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) peering, and express link to connect to our Presto resources.

## Summary

DataGateway is playing a key role in Grab’s entire Presto ecosystem. It helps us manage user access and cluster selections on a single endpoint, ensuring that everyone is running their Presto queries on the same place. It also helps distribute workload to different types and versions of Presto clusters.

When we started to deploy the DataGateway on Kubernetes, our vision for the Presto ecosystem underwent an epic change as it further motivated us to continuously improve. Since then, we’ve had new ideas on deployment method/pipeline, microservice implementations, scaling strategy, resource control, we even made use of Kubernetes and designed an on-demand, container-based Presto cluster provisioning engine. We’ll share this in another engineering blog, so do stay tuned!.

We also made crucial enhancements on data access control as we extended Presto’s access controls down to the schema/table-level.

In day-to-day operations, especially when we started to implement data lake in multiple clouds, DataGateway solved a lot of implementation issues. DataGateway made it simpler to switch a user's Presto cluster from one cloud to another or allow a user to use a different Presto cluster using parameters. DataGateway allowed us to provide a seamless experience to our users.

Looking forward, we’ve more and more ideas for our Presto ecosystem, such Spark DataGateway or AWS Athena integrations, to keep our data safe at any time and to provide our users with a smoother experience when dealing with data used for analysis or research.


---

<small class="credits">Authored by Vinnson Lee on behalf of the Presto Development Team at Grab - Edwin Law, Qui Hieu Nguyen, Rahul Penti, Wenli Wan, Wang Hui and the Data Engineering Team.</small>

---

## Join Us

Grab is a leading superapp in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across over 400 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today! 
