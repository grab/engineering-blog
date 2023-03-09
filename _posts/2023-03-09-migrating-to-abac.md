---
layout: post
id: 2023-03-09-migrating-to-abac
title: Migrating from Role to Attribute-based Access Control
date: 2023-03-09 01:23:05
authors: [minhkhoi-nguyen]
categories: [Engineering, Security]
tags: [Engineering, Access control, Security]
comments: true
cover_photo: /img/migrating-to-abac/cover.jpg
excerpt: "To ensure our consumers continue to be well-protected, we need to ensure our data access measures are compliant with evolving security standards. With more services and resources to manage, it becomes increasingly difficult to maintain a frictionless process. Read to find out how we solve this by migrating from role to attribute-based access control."
---

Grab has always regarded security as one of our top priorities; this is especially important for data platform teams. We need to control access to data and resources in order to protect our consumers and ensure compliance with various, continuously evolving security standards.

Additionally, we want to keep the process convenient, simple, and easily scalable for teams. However, as Grab continues to grow, we have more services and resources to manage and it becomes increasingly difficult to keep the process frictionless. That’s why we decided to move from Role-Based Access Control (RBAC) to Attribute-Based Access Control (ABAC) for our Kafka Control Plane (KCP).

In this article, you will learn how Grab’s streaming data platform team (Coban) deleted manual role and permission management of hundreds of roles and resources, and reduced operational overhead of requesting or approving permissions to zero by moving from RBAC to ABAC.

## Introduction

Kafka is widely used across Grab teams as a streaming platform. For decentralised Kafka resource (e.g. topic) management, teams have the right to create, update, or delete based on their needs. As the data platform team, we implemented a KCP to ensure that these operations are only performed by authorised parties, especially on multi-tenant Kafka clusters.

For internal access management, Grab uses its own Identity and Access Management (IAM) service, based on RBAC, to support authentication and authorisation processes:

*   **Authentication** verifies the identity of a user or service, for example, if the provided token is valid or expired.
*   **Authorisation** determines their access rights, for example, whether users can only update and/or delete their own Kafka topics.

In RBAC, roles, permissions, actions, resources, and the relationships between them need to be defined in the IAM service. They are used to determine whether a user can access a certain resource.

In the following example, we can see how IAM concepts come together. The `Coban engineer` role belongs to the `Engineering-coban` group and has permission to update the topic's retention. Any engineer added to the `Engineering-coban` group will also be able to update the topic's retention.

<div class="post-image-section"><figure>
  <img src="/img/migrating-to-abac/image5.png" alt="" style="width:60%"><figcaption align="middle"></figcaption>
  </figure>
</div>

Following the same concept, each team using the KCP has its own roles, permissions, and resources created in the system. However, there are some disadvantages to this approach:

*   It leads to a significant growth in the number of access control artifacts both platform and user teams need to manage, and increased time and effort to debug access control issues. We start off by finding which group the engineer belongs to and locating the group that should be used for KCP, and then trace to role and permissions.
*   All group membership access requests of new joiners need to be reviewed and approved by their direct managers. This leads to a lot of backlog as new joiners might have multiple groups to join and managers might not be able to review them timely. In some cases, roles need to be re-applied or renewed every 90 days, which further adds to the delay.
*   Group memberships are not updated to reflect active members in the team, leaving some engineers with access they don’t need and others with access they should have but don’t.

## Solution

With ABAC, access management becomes a lot easier. Any new joiner to a specific team gets the same access rights as everyone on that team – no need for manual approval from a manager. However, for ABAC to work, we need these components in place:

*   User attributes: Who is the subject (actor) of a request?
*   Resource attributes: Which object (resource) does the actor want to deal with?
*   Evaluation engine: How do we decide if the actor is allowed to perform the action on the resource?

**User attributes**

All users have certain attributes depending on the department or team they belong to. This data is then stored and synced automatically with the human resource management system (HRMS) tool, which acts as a source of truth for Grab-wide data, every time a user switches teams, roles, or leaves the company.

**Resource attributes**

Resource provisioning is an authenticated operation. This means that KCP knows who sent the requests and what each request/action is about. Similarly, resource attributes can be derived from their creators. For new resource provisioning, it is possible to capture the resource tags and store them after authentication. For existing resources, a major challenge was the need to backfill the tagging and ensure a seamless transition from the user’s perspective. In the past, all resource provisioning operations were done by a centralised platform team and most of the existing resource attributes are still under platform team's ownership.

**Evaluation engine**

We chose to use [Open Policy Agent](https://www.openpolicyagent.org/) (OPA) as our policy evaluation engine mainly for its wide community support, applicable feature set, and extensibility to other tools and platforms in our system. This is also currently used by our team for [Kafka authorisation](/zero-trust-with-kafka). The policies are written in [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/), the default language supported by OPA.

## Architecture and implementation

With ABAC, the access control process looks like this:

<div class="post-image-section"><figure>
  <img src="/img/migrating-to-abac/image6.png" alt="" style="width:60%"><figcaption align="middle"></figcaption>
  </figure>
</div>

#### User attributes

<div class="post-image-section"><figure>
  <img src="/img/migrating-to-abac/image4.png" alt="" style="width:60%"><figcaption align="middle"></figcaption>
  </figure>
</div>

Authentication is handled by the IAM service. In the `/generate_token` call, a user requests an authentication token from KCP before calling an authenticated endpoint. KCP then calls IAM to generate a token and returns it to the user.

In the `/create_topic` call, the user includes the generated token in the request header. KCP takes the token and verifies the token validity with IAM. User attributes are then extracted from the token payload for later use in request authorisation.

Some of the common attributes we use for our policy are `user identifier`, `department code`, and `team code`, which provide details like a user’s department and work scope.

When it comes to data governance and central platform and identity teams, one of the major challenges was standardising the set of attributes to be used for clear and consistent ABAC policies across platforms so that their lifecycle and changes could be governed. This was an important shift in the mental model for attribute management over the RBAC model.

#### Resource attributes

For newly created resources, attributes will be derived from user attributes that are captured during the authentication process.

<div class="post-image-section"><figure>
  <img src="/img/migrating-to-abac/image3.png" alt="" style="width:60%"><figcaption align="middle"></figcaption>
  </figure>
</div>

Previously with RBAC, existing resources did not have the required attributes. Since migrating to ABAC, the implementation has tagged newly created resources and ensured that their attributes are up to standard. IAM was also still doing the actual authorisation using RBAC.

It is also important to note that we collaborated with data governance teams to backfill Kafka resource ownership. Having accurate ownership of resources like data lake or Kafka topics enabled us to move toward a self-service model and remove bottlenecks from centralised platform teams.

After identifying most of the resource ownership, we started switching over to ABAC. The transition was smooth and had no impact on user experience. The remaining unidentified resources were tagged to `lost-and-found` and could be reclaimed by service teams when they needed permission to manage them.

#### Open Policy Agent

The most common question when implementing the policy is “how do you define ownership by attributes?”. With respect to the principle of least privilege, each policy must be sufficiently strict to limit access to only the relevant parties. In the end, we aligned as an organisation on defining ownership by department and team.

We created a simple example below to demonstrate how to define a policy:

```
package authz

import future.keywords

default allow = false

allow if {
        input.endpoint == "updateTopic"
        is_owner(input.resource_attributes)
}

is_owner(md) if {
        md.department == input.user_attributes.department
        md.team == input.user_attributes.team
}
```

In this example, we start with denying access to everyone. If the `updateTopic` endpoint is called and the department and team attributes between user and resource are matched, access is allowed.

With a similar scenario, we would need 1 role, 1 action, 1 resource, and 1 mapping (a.k.a permission) between action and resource. We will need to keep adding resources and permissions when we have new resources created. Compared to the policy above, no other changes are required.

With ABAC, there are no further setup or access requests needed when a user changes teams. The user will be tagged to different attributes, automatically granted access to the new team’s resources, and excluded from the previous team’s resources.

Another consideration we had was making sure that the policy is well-written and transparent in terms of change history. We decided to include this as part of our application code so every change is accounted for in the unit test and review process.

#### Authorisation

The last part of the ABAC process is authorisation logic. We added the logic to the middleware so that we could make a call to OPA for authorisation.

<div class="post-image-section"><figure>
  <img src="/img/migrating-to-abac/image2.png" alt="" style="width:60%"><figcaption align="middle"></figcaption>
  </figure>
</div>

To ensure token validity after authentication, KCP extracts user attributes from the token payload and fetches resource attributes from the resource store. It combines the request metadata such as method and endpoint, along with the user and resource attributes into an OPA request. OPA then evaluates the request based on the redefined policy above and returns a response.

## Auditability

For ABAC authorisation, there are two key areas of consideration:

*   Who made changes to the policy, who deployed, and when the change was made
*   Who accessed what resource and when

We manage policies in a dedicated GitLab repository and changes are submitted via merge requests. Based on the commit history, we can easily tell who made changes, reviewed, approved, and deployed the policy. 

<div class="post-image-section"><figure>
  <img src="/img/migrating-to-abac/image1.png" alt="" style="width:80%"><figcaption align="middle"></figcaption>
  </figure>
</div>

For resource access, OPA produces a decision log containing user attributes, resource attributes, and the authorisation decision for every call it serves. The log is kept for five days in Kibana for debugging purposes, then moved to S3 where it is kept for 28 days.

## Impact

The move to ABAC authorisation has improved our controls as compared to the previous RBAC model, with the biggest impact being fewer resources to manage. Some other benefits include:

*   Optimised resource allocation: Discarded over 200 roles, 200 permissions, and almost 3000 unused resources from IAM services, simplifying our debugging process. Now, we can simply check the user and resource attributes as needed.
*   Simplified resource management: In the three months we have been using ABAC, about 600 resources have been added without any increase in complexity for authorisation, which is significantly lesser than the RBAC model.
*   Reduction in delays and waiting time: Engineers no longer have to wait for approval for KCP access.
*   Better governance over resource ownership and costs: ABAC allowed us to have a standardised and accurate tagging system of almost 3000 resources.

## Learnings

Although ABAC does provide significant improvements over RBAC, it comes with its own caveats:

*   It needs a reliable and comprehensive attribute tagging system to function properly. This only became possible after roughly three months of identifying and tagging the ownership of existing resources by both automated and manual methods.
*   Tags should be kept up to date with the company’s growth. Teams could lose access to their resources if they are wrongly tagged. It needs a mechanism to keep up with changes, or people will unexpectedly lose access when user and resource attributes are changed.

## What’s next?

*   To keep up with organisational growth, KCP needs to start listening to the IAM stream, which is where all IAM changes are published. This will allow KCP to regularly update user attributes and refresh resource attributes when restructuring occurs, allowing authorisation to be done with the right data.
*   Constant collaboration with HR to ensure that we maintain sufficient user attributes (no extra unused information) that remain clean so ABAC works as expected.

## References

*   [OPA](https://www.openpolicyagent.org/)
*   [Rego](https://www.openpolicyagent.org/docs/latest/policy-language/)
*   [Zero trust with Kafka](/zero-trust-with-kafka)

# Join us

Grab is the leading superapp platform in Southeast Asia, providing everyday services that matter to consumers. More than just a ride-hailing and food delivery app, Grab offers a wide range of on-demand services in the region, including mobility, food, package and grocery delivery services, mobile payments, and financial services across 428 cities in eight countries.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grab.careers/) today!
