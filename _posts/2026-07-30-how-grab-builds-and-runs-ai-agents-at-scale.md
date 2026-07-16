---
layout: post
id: 2026-07-30-how-grab-builds-and-runs-ai-agents-at-scale
title: 'Agent platform (Part 1): How we help Grab build and run AI agents at scale'
date: 2026-07-30 00:00:10
authors: [kendrick.tan, jeffery.lean, yisheng.tay]
categories: [Engineering, Design]
tags: [Engineering, Generative AI, LLM, Experiment, Machine Learning]
comments: true
cover_photo: /img/how-grab-builds-and-run-ai-at-scale/part-1-banner.png
excerpt: "How Grab builds and runs AI agents at scale explains how Grab turned repeated operational pain points into reusable platform primitives that help teams build, test, and run agents faster and more safely. It shows why the hard part of agent development isn’t the reasoning loop itself, but everything around it from auth, secrets, environment config, observability, evals, MCP integration, and service-to-service connectivity."
---

## Part 1: From one support bot to a framework

At Grab, AI agents have evolved from interesting team prototypes into production services used every day by millions of merchants, drivers, and consumers. Today, more than 500 services run on our internal agent framework, over 50 Model Context Protocol (MCP) servers are registered on our remote MCP framework, and a single Large Language Model (LLM) gateway fronts every model call across the company, handling billions of tokens each month.

None of this was designed up front. It began as the plumbing behind **one** internal support bot, which then expanded because the same problems kept resurfacing for every team trying to ship an agent. This series tells the story of what the platform eventually became. This part 1 focuses on the beginning: the architecture of our AI support bot, the specific pain points we hit while scaling and iterating on it, and how each of those failures became a core building block in the framework we now call **LLM-Kit**.

## The bot that started it

Imagine you have a question for the **Technical Infrastructure (Tech Infra)** team - the engineers who run the cloud platforms, databases, developer tooling, and AI infrastructure behind Grab’s ecosystem. Instead of immediately paging an on-call engineer, a bot first triages the request, checks the team’s documentation, runbooks, and past Slack threads, and tries to answer directly in the thread. If it still cannot resolve the issue, it routes the ticket to the right human, with the relevant context already attached.

That is what we built with the Tech Infra Support Bot.

In the first half of 2023, Tech Infra handled thousands of support tickets, many of them repeated questions that had already been answered somewhere internally. Before LLMs, the bot’s role was mainly operational. Performing tasks like helping track acknowledgments and response times for on-call engineers. With the arrival of GPT-4-32k, we evolved it into a GPT-powered Level-0 support layer that could answer documented questions before a human needed to be paged.

The first production version was a Go service organized around two planes:

- **A reasoning plane**. At Level-0, it was a single-agent loop. It takes the user’s question, decides which tools to call, executes those calls, feeds the results back into the prompt, and returns an answer. The default model at the time was gpt-4.1; today, we have evolved to Opus 4.8.

- **A tool plane**. The tools provided the bot’s core working context. Retrieval flowed through Glean, which covered Confluence, 
[TechDocs](https://engineering.grab.com/techdocs-at-grab-cultivating-a-culture-of-quality-documentation), internal drives, and Jira. Other tools handled log search through Kibana, GitLab runbook and file access, Slack conversation search, and a small set of Hypertext Transfer Protocol (HTTP) plugins. In the first version, tools and prompts were defined in per-channel JavaScript Object Notation (JSON) configs and resolved at request time. As models became more capable, we later standardized the tool set across channels.

A trimmed version of that tool config looked like this:

```json
"agent_plugins": [
  {"name": "glean_search",        "type": "common", "metadata": {"wiki_space_collection": ["..."]}},
  {"name": "runbook_search",      "type": "common"},
  {"name": "gitlab_runbook_reader","type": "common"},
  {"name": "gitlab_read_file","type": "common"},
  {"name": "kibana_log_search",   "type": "common", "metadata": {"index": "k8s*"}},
  {"name": "slack_conversation_tool", "type": "common"}
]
```

It worked, but it taught us, the hard way, why a demo agent is not a production agent.

## What it takes to scale and improve quickly

As we worked on improving the agent, we kept running into the same kinds of friction. Over time, those pain points formed clear patterns, and they were the same ones we saw other teams run into as well.

- **Hope is not an evaluation strategy**. The bot had a base prompt, and each Slack channel could configure its own prompt, tools, and documentation filters. But the workflow was essentially - configure it, ship it, and hope it reduced toil. There were no real evaluations, just optimism that it would work.

- **Fast model and provider switching is essential**. The AI landscape moves incredibly fast: a new state-of-the-art (SOTA) model appears on Tuesday, and a highly efficient open-source alternative shows up on Thursday. Switching providers should not feel like open-heart surgery. A unified Software Development Kit (SDK) and an [LLM API gateway](https://engineering.grab.com/grab-ai-gateway) remove the need to refactor payload schemas, rewrite error handling, or integrate each provider from scratch. If moving from OpenAI to Anthropic, or routing to an open-source model endpoint, takes more than a few config changes, technical debt is already slowing you down.

- **Observability cannot be an afterthought**. When an answer was wrong, figuring out "why" meant grepping logs across three separate systems: the agent workflow, the tool calls, and the model call. There was no shared trace tying them together. That level of friction is survivable for an internal tool; it is unacceptable for a customer-facing agent.

- **Everything around the agent took longer than the agent itself**. Auth (OIDC), secrets management (Vault), per-environment config, vector database integration, LLM tracing, health probes, and metrics were not agent-specific problems. However, they all had to be solved before anything could be shipped. The reasoning loop took a whole afternoon. The production wrapper took two weeks.

The pattern was clear: the hard part of building an agent was not the agent itself, but everything around it that had to be in place before it could safely run in front of users. So we began pulling those shared components out of the bot and consolidating them into a unified framework.

## Extracting the framework: LLM-Kit

LLM-Kit emerged when we stopped solving these problems service by service and started solving them once, centrally. It is intentionally not a new agent abstraction or a Domain-Specific Language (DSL). Instead, it is a curated set of integrations and scaffolding built around Grab’s existing infrastructure, pipelines, secret management, and observability. Just as importantly, we chose to build a framework rather than a heavy centralized platform. In a space evolving this quickly, a platform would have locked teams into rigid assumptions that would soon become outdated. A framework let us meet developers where they already were: standardizing the plumbing while preserving the freedom to iterate quickly. Looking back, that was the right first choice. Each part of LLM-Kit is a direct response to one of the failures described above.

We first wrote about LLM-Kit’s structure and code architecture in a [2024 blog post](https://engineering.grab.com/supercharging-llm-application-development-with-llm-kit). Two years and a few hundred agents later, the overall *shape* is still recognizable, but almost every underlying layer has changed. Poetry was replaced by `uv`; we standardized on the OpenTelemetry stack; LangChain evolved into LangGraph and Deep Agents; and some tools moved onto our MCP framework.

**It starts with a template**. The entry point is a user interface (UI) form. An engineer fills in an application name and a few details, and gets back a GitLab repository with the production wrapper already assembled. Under the hood the template stamps out a full FastAPI service:

```
{{ app_name }}/
├── app/
│   ├── server.py              # FastAPI app factory: mounts routes + middleware, boots OTel + statsd
│   ├── agents/
│   │   ├── simple_react_agent.py   # a single-agent LangGraph ReAct loop (agent <-> tools)
│   │   ├── mcp_react_agent.py      # the same loop, but tools are pulled from remote MCP servers
│   │   └── simple_react_agent.png  # auto-exported graph diagram (generated in dev)
│   ├── routes/
│   │   ├── api.py             # router aggregator
│   │   ├── health_check.py    # liveness/readiness probe
│   │   ├── oidc.py            # OIDC login/callback (skipped in proxy-auth mode)
│   │   └── evalshub_eval.py   # runs ROUGE / BLEU / LLM-as-judge evals on the agent
│   ├── core/config.py         # AppConfig (pydantic-settings) + INI/secret parsing
│   ├── tools/word_length_tool.py   # an example tool to copy from
│   ├── utils/prompts.py       # prompt/message assembly helpers
│   └── storage/connection.py  # Postgres + pgvector engine and connection pooling
├── {{ app_name }}sdk/         # a generated, typed client SDK (protobuf) other services import
├── configs/
│   ├── dev.ini / stg.ini / prd.ini   # one config per environment
│   └── secret.ini.example     # secret template; real values resolve from Vault at deploy
├── databases/postgresql/      # SQL migrations (pgvector extension bootstrapped for you)
├── scripts/
│   ├── db.py / db.sh          # migration runner
│   └── gunicorn_conf.py       # production server/worker config
├── tests/
│   ├── unit_tests/            # starter unit tests (e.g. the health check)
│   └── evalshub_evaluation/   # golden test cases the eval route runs against
├── Dockerfile                 # multi-stage, distroless
├── Makefile                   # setup / run / test / lint targets
├── pyproject.toml             # uv build backend + pinned deps
└── .pre-commit-config.yaml
```

Three things are worth pulling out of that tree:

- **`app/agents/` is the part you actually own**. You get two working agents to fork from rather than a blank file: `simple_react_agent.py` is a single-agent LangGraph ReAct loop, and `mcp_react_agent.py` is the same loop wired to pull its tools from remote MCP servers. Both compile to a LangGraph `StateGraph` with a retry policy and a 30-second per-step timeout, and in dev the graph is auto-exported as a diagram. This is a real step up from the bare LangChain agent initialization we scaffolded in 2024.

- **`app/routes/evalshub_eval.py` ships evals on day one**. The template comes with an endpoint that runs Recall-Oriented Understudy for Gisting Evaluation (ROUGE), Bilingual Evaluation Understudy (BLEU), and LLM-as-judge evaluators over a set of golden test cases in `tests/evalshub_evaluation/`. The thing we most wished the support bot had which we mentioned in the first pain point, is now in the box before a builder writes a line of their own logic.

- **Everything else is the production wrapper**. `core/config.py`, `storage/`, `configs/`, `databases/`, `scripts/`, the distroless `Dockerfile`, and the `pyproject.toml` (now `uv`, not the Poetry we used in 2024) are the auth, secrets, persistence, packaging, and deploy plumbing that every service needs and that no team should have to write from scratch.

The day-one wiring that used to take two weeks or more now takes about an hour. The rest of this section is what "pre-wired" means, layer by layer.

**Config and secrets are solved once**. Apps declare environment configs as initialization (INI) files with secret interpolation, so secrets resolve from [Vault](https://www.hashicorp.com/en/products/vault?utm_source=google&utm_channel_bucket=paid&utm_medium=sem&utm_campaign=core_apac_multi_eng_x_all_sem-gg_x_all_all_all_br&utm_content=hashicorp%20vault-190017550690-Brand_Vault_SLM-802491325140&gad_source=1&gad_campaignid=23699376650&gbraid=0AAAAAC15ru8puHsQth55S3GvC2N6lMusm&gclid=CjwKCAjwgO7RBhBKEiwAZNP85mSwHd8Tvwt_6i6a869Bwuqqws3tcto-4Fb4c3XHD-LL2Um0fARKyxoCrVgQAvD_BwE) at boot, and a single `secret.ini.example` is enough to run any LLM-Kit app locally:

```
[CONFIG]
GRABGPT_API_KEY=${SECRET:GRABGPT_API_KEY}
OTEL_EXPORTER_OTLP_ENDPOINT=<otel-collector-endpoint>
POSTGRES_POOL_RECYCLE=1800
```

**Model access behind one resolver**. Every model call goes through the GrabGPT Gateway, which is OpenAI-compatible. LLM-Kit's job is just to resolve the right endpoint (per environment, and per data tier) and inject the key so application code never hard-codes a provider again:

```py
from openai import OpenAI
from llm_kit.grabgpt import resolve_grabgpt_base_url, resolve_grabgpt_api_key

client = OpenAI(
    base_url=resolve_grabgpt_base_url("prd", "public"),  # provider chosen centrally
    api_key=resolve_grabgpt_api_key(),
)
```

That one indirection is what later lets a platform team change which provider serves a model, configure fallback routing, set budgets, and manage cost attribution, without a single application touching its code. Part 2 covers what lives behind that gateway.

**Tracing wired in, not bolted on**. A single instrumentor auto-instruments FastAPI, outbound HTTP, LangChain, and MCP, and stamps every span with Kubernetes resource attributes (pod, namespace, image, service version). Structured logs auto-inject the trace and span IDs, so logs and traces correlate in Grafana/Kibana for free:

```py
exporter = OTLPSpanExporter(endpoint=app_config.otel_exporter_otlp_endpoint)
OTELInstrumentor(exporter=exporter, excluded_urls=["health_check"]).instrument_app(app)
```

The **three systems, no shared trace** problem turns into **one end-to-end trace** across every LLM call, tool call, and retrieval step.

**Tools can be exposed through MCP servers built on our MCP framework**. Instead of hardwiring a large set of tool functions inside the agent process, the agent connects to MCP servers and discovers their tools at runtime. That means adding a new capability can be as simple as registering an MCP server, rather than redeploying the agent.

```py
client = MultiServerMCPClient({
    "mcp-gitlab-remote": {
        "transport": "streamable_http",
        "url": "<remote-mcp-gitlab-endpoint>/mcp/",
        "headers": {"Authorization": "Bearer <token>"},
    }
})
tools = await client.get_tools()   # schema negotiated, no redeploy
```

An agent is just another service in the ecosystem, with gRPC on both sides. Most of Grab’s backend communicates over gRPC, and agents are rarely standalone; other services call them, and they in turn call other internal services. The template is designed to support both directions.

On the *serving* side, the scaffold includes a Protocol Buffers (protobuf) contract (`{{ app_name }}sdk/.../{{ app_name }}.proto`, with a sample `Hello` remote procedure call (RPC)) and a generated, typed client SDK package that other teams `import` to call your agent without hand-writing HTTP. `make gen-proto` regenerates the Python stubs from the `.proto`, and a `gen-proto-check` Continuous Integration (CI) step fails the build if the committed stubs drift from the contract. A gRPC server runs alongside FastAPI (default port `8087`, multi-worker-safe via `SO_REUSEPORT`) and ships a standard gRPC health service out of the box:

```shell
$ grpcurl -plaintext localhost:8087 grpc.health.v1.Health/Check
```

On the *calling* side, LLM-Kit ships a channel provider so an agent never hardcodes an address. The auto provider tries Istio, then Consul, then a static fallback, health-checks the channel it selects, and runs a background monitor that re-selects after a few consecutive failures:

```py
from llm_kit.grpc.channel_providers.auto import (
    AutoGrpcChannelProvider, AutoGrpcChannelProviderConfig,
)

provider = AutoGrpcChannelProvider(logger, AutoGrpcChannelProviderConfig(
    client_name="my-agent",
    service_key="some-internal-service",   # resolved via Istio / Consul
    enable_istio=True, enable_consul=True,
))
channel = provider.get_channel()           # first healthy channel, auto-reselected on failure
stub = SomeServiceStub(channel)
```

This is the less glamorous side of being **production-ready**. Before an agent can deliver value, it needs to both accept calls from and make calls to the rest of the company’s services using the same transport the broader system already relies on. 

## What's next

LLM-Kit solved *building and shipping* one agent. At 500 agents, the problems were no longer framework problems. They were platform problems: who can change which model everyone calls, how one team safely reuses another team's tools, and how you know an agent got *better* and not just *different* after a prompt change. We built three answers for that layer: the GrabGPT Gateway, a remote MCP framework, and an evals platform. Part 2 starts with the gateway — one endpoint, five providers, and what it takes to make "swap the model" a configuration change instead of an incident.

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
