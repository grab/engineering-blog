---
layout: post
id: 2026-06-26-part-2-palana-architecture
title: 'Palana (Part 2): Architecting isolation, identity, and auditability for AI agents'
date: 2026-06-21 00:00:00
authors: [kevin.littlejohn]
categories: [Engineering]
tags: [Security, Artificial Intelligence, Kubernetes, DevSecOps, Platform, Engineering]
comments: true
cover_photo: /img/palana-part-2/banner-image.png
excerpt: "How do you actually build a secure execution environment for artificial intelligence (AI) agents? In Part 2, we dive deep into Palana's architecture. Learn how Grab handles proxy-mediated secrets, large language model (LLM) routing, and strict network access under the hood. We also share our operational learnings on managing agent lifecycles, enforcing strict boundaries, and making useful AI autonomy safe and boring to operate."
---

## Introduction

In [Part 1](https://engineering.grab.com/part-1-palana-for-autonomous-ai-agents), we introduced **Palana**, Grab's Kubernetes-native secure execution platform for autonomous AI agents. We discussed the underlying need for isolated environments and covered its core design principles: treating isolation as the unit of trust, keeping credentials out of agent hands, and mediating all network access. In this second part, we'll dive under the hood into Palana's architecture, look at the agent lifecycle, and share the key lessons we learned from putting this system into production.

## Architecture overview

The core request path looks like this:

<div class="post-image-section"><figure>
  <img src="/img/palana-part-2/palana-architecture.png" alt="" style="width:80%"><figcaption align="middle">Figure 1. Palana architecture overview.</figcaption>
  </figure>
</div>

The agent pod runs in a namespace owned by one user and one agent. It gets default-deny style network policy, domain name system (DNS), access to required platform services, and a persistent `/data` volume. Browser traffic enters through Traefik. LLM traffic goes to the LiteLLM wrapper in the gateway namespace. General Hypertext Transfer Protocol (HTTP) and Hypertext Transfer Protocol Secure (HTTPS) egress goes through the proxy namespace. Secrets are read from Vault only by the component authorized to use them.

The operator is responsible for turning a user request into the concrete Kubernetes shape:

1. The user creates an agent through `pcli` (Palana command-line interface) or the portal.
2. Palana writes a UserAgent or Agent custom resource with the raw user identity.
3. The operator creates the user and agent namespaces, service accounts, role bindings, storage, network policies, and ingress.
4. The user runs a template or container image.
5. Admission webhooks inject proxy environment variables and enforce pod-level restrictions.
6. Logs, policy decisions, and activity signals are emitted to observability systems.

## Agent lifecycle

From a user's perspective, the basic workflow is intentionally small:

```
./pcli login
./pcli create demo
./pcli secrets add demo GRABGPT_API_KEY token=<token>
./pcli run demo --template claudecodeui
```

Behind those commands, Palana provisions an isolated execution environment:

* Namespace: `agent-{sanitized-user}-{agent}`
* Service account: bound only to that namespace
* Storage: an Amazon Elastic File System (EFS)-backed persistent volume claim (PVC) mounted at `/data`
* Ingress: an agent-specific hostname protected by Concedo-backed browser auth
* Egress: forced through platform proxies, except for approved internal platform services
* Secrets: split between agent-readable and proxy-only Vault paths
* Policies: proxy egress, network egress, and optional inter-agent peering rules

The same lifecycle is exposed in the portal for users who prefer a browser user interface (UI).

## How Palana handles identity

Human authentication uses Concedo OpenID Connect (OIDC). `pcli login` performs a browser-based authorization code flow with Proof Key for Code Exchange (PKCE) and stores the resulting identity in an isolated kubeconfig. Browser access to agent UIs is protected by OAuth2-Proxy through Traefik forward auth.

The important detail is that Palana keeps the raw user identity, such as an email address, as the authoritative owner on the custom resource. That raw identity is used for Kubernetes role-based access control (RBAC) subject matching. Sanitized forms are used only where Kubernetes object names, labels, namespaces, or Vault paths require safer strings.

This split prevents a common class of identity bugs: the display-safe or path-safe version of a user ID should not accidentally become the authorization subject.

In the future, we will integrate Palana via SPIFFE (Secure Production Identity Framework for Everyone) and SPIRE (SPIFFE Runtime Environment) with the rest of our service mesh, to provide an agentic identity — a combination of user and agent instance id — that can then be controlled as a subset of a user's capabilities. This gives us a first step into "agents on behalf of users" with cut-down permissions while the wider industry firms up the approaches via Open Authorization (OAuth) and other controls.

## How Palana handles secrets

Palana's Vault layout is designed around least privilege:

```
kv/agents/{user}/{agent}/{secret}
kv/proxy-secrets/{user}/{agent}/{secret}
```

The first path is for secrets the agent is allowed to read through its per-agent Vault role. The second path is for credentials the agent can use only through the proxy. For each proxy-only secret, Palana can create an agent-visible placeholder value. The placeholder is inert unless the request goes through the approved proxy path.

This gives teams a practical migration path. Existing clients can often be configured with a token-looking value, while Palana keeps the real token out of the runtime.

## How Palana handles LLM access

LLM calls go through `litellm-proxy-wrapper`, which sits in front of LiteLLM and GrabGPT. The wrapper derives agent identity from Kubernetes context rather than trusting client-provided headers. It then looks up the per-agent GrabGPT credential in Vault and forwards the request to the correct upstream route.

The agent config uses internal base URLs such as:

```
http://litellm-proxy.gateway:4000/aws/v1
http://litellm-proxy.gateway:4000/unified/v1
```

That design gives us three useful properties:

* Agents do not need raw upstream LLM credentials.
* LLM traffic is attributable to a specific agent.
* Provider routing and credential handling can evolve centrally.

## How Palana handles network access

Network control is split into two layers.

At Layer 3 and Layer 4, Kubernetes NetworkPolicy and Cilium enforce which pods can talk to which namespaces, services, and classless inter-domain routing (CIDR) blocks. Agent namespaces are locked down to the platform paths they need: DNS, Vault, the egress proxy, the LLM gateway, and the Kubernetes application programming interface (API) patterns the platform explicitly supports.

At Layer 7, the proxy policy controls HTTP and HTTPS destinations by host, method, and agent identity. Open Policy Agent (OPA) evaluates per-agent policy. The proxy logs allow and deny decisions in structured form.

This split is deliberate. NetworkPolicy is good at containment. The proxy is good at application-aware decisions and audit. This allows us to be very expressive in the restrictions we place on our agents — by default, they get nothing; if they should have access to an internal service they get only that service, and cannot be used as an entry point to the wider internal environment.

## Observability and operations

Palana treats observability as part of the safety model, not a nice-to-have. The platform emits structured logs for proxy decisions, Git activity, LLM requests, agent lifecycle, and idle-shutdown decisions. Operators can query activity by namespace, user, host, decision, or component.

One example is idle shutdown. Long-running agents are useful, but idle workloads consume cluster resources and expand the surface area that platform teams must monitor. Palana's reaper records the most recent observable activity for each UserAgent. It combines signals from gateway/proxy logs, Git activity, Slack-routed agent messages, and Prometheus network activity. After a configurable idle threshold, it can warn the user and stop the workload while preserving `/data`, RBAC, namespace, and Vault state.

This is a good example of the platform philosophy: stop the compute, keep the state, and make resumption easy.

In addition, as we move into agentic operations, we use the many signals generated by Palana itself to aid our agents. For example, we have an agent that can monitor user workloads and provide advice and assistance if it spots issues — say, an agent is consistently out of memory (OOM), the ops agent can see that and message the user with instructions on how to increase the allocated memory. We don't need to special-case every possible issue; instead we have agents that understand Palana logs and are able to communicate with the users themselves.

## What we learned

### Agent platforms need security controls at the platform layer

Prompt-level guardrails and model policies are useful, but they are not enough. Agents call tools, tools call services, and services use credentials. Palana puts controls where the action crosses a trust boundary: identity, egress, secrets, ingress, Git, and Kubernetes API access.

### The user experience matters as much as the control

If the secure path requires every team to learn Terraform, Vault policy syntax, Kubernetes RBAC, and proxy configuration before they can try an agent, teams will work around it. Palana uses `pcli`, templates, and the portal to make the safe path the easy path.

### Separating "can read a credential" from "can cause a credentialed request" is powerful

Proxy-only secrets are one of the highest-leverage design choices. They let agents perform authenticated work without turning the agent filesystem, logs, process environment, or prompt context into a credential store.

### A namespace boundary is simple, but it compounds

Per-agent namespaces give us a consistent place to apply RBAC, storage, network policy, logging labels, resource quotas, and lifecycle controls. The pattern is easy to reason about during incidents: identify the namespace, identify the owner, inspect the policy, and isolate if needed.

### Long-running agents need lifecycle management

Once agents persist for days or weeks, "run a container" becomes an incomplete product. Users need resume semantics. Operators need idle cleanup. Security teams need audit history. Platform teams need a way to rotate credentials, update images, and stop workloads externally.

## What's next

Palana is increasingly becoming a substrate for larger autonomous systems rather than only a place to run individual agents. Emerging patterns include:

* Supervisor systems that route work to a pool of scoped agents.
* Slack-native agents that wake up, handle a task, and scale back down.
* Remote development environments backed by persistent cloud state.
* Agent swarms where each worker has a separate namespace and credential scope.
* Operational agents that investigate platform health and propose or apply small fixes under policy.
* Security experiments around supply chain monitoring, token rotation, transport layer security (TLS) inspection, and automated isolation.

**The north star is not "let every agent do anything"**. It is to make useful autonomy boring to operate: attributable, inspectable, revocable, and recoverable.

## Conclusion

AI agents are most valuable when they can act in real environments. That is also when they become risky. Palana gives Grab a way to keep both sides of that tradeoff in view: teams can move quickly with self-service agent environments, while the platform keeps isolation, identity, secrets, network access, and auditability as defaults.

We expect the underlying tools and models to keep changing. The platform primitives are more durable. Agents will vary, but they will still need a place to run, a way to authenticate, a boundary around their actions, and a record of what happened.

That is the role Palana is designed to play.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://grb.to/gebpalana2) today!
