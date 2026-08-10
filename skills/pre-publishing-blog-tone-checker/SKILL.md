---
name: pre-publishing-blog-tone-checker
description: >-
  Pre-publish quality pass for Grab Engineering Blog posts in `_posts/*.md`.
  Validates YAML front matter, ensures the canonical Join us footer, applies
  grammar/tone/spelling fixes via references/grammar-tone-writing-quality.md, then runs a PR/legal pre-flight
  for metrics, images, confidentiality, and reputational risk via
  references/pr-legal-pre-flight.md. Use when reviewing or editing a blog post
  before publish.
disable-model-invocation: true
---

# Pre-Publishing Blog Tone Checker

## Overview

Use this skill before publishing a Grab Engineering Blog post. It runs **four passes** on Markdown files in `_posts/`:

1. **Metadata validation** — confirm every required front-matter field is present and valid.
2. **Join us boilerplate** — confirm the canonical `## Join us` footer exists; add it if missing (`references/join-us-boilerplate.md`).
3. **Prose editing** — apply grammar, tone, spelling, and writing-quality fixes from `references/grammar-tone-writing-quality.md`.
4. **PR/legal pre-flight** — review images, metrics, names, quotes, and claims against `references/pr-legal-pre-flight.md`; **suggest fixes** (do not apply redactions unless the user asks).

Work **one file at a time**. Prefer small, safe edits. Preserve technical meaning. Summarize findings and ask whether to apply changes unless the user already asked you to edit.

## Scope

| In scope | Out of scope |
|----------|--------------|
| `_posts/*.md` front matter validation | Broken link checking |
| Body prose in `_posts/*.md` | Readability scores or lint tooling |
| PR/legal risk review of prose and images | Legal sign-off or formal approval |
| Adding missing authors to `_data/authors.yml` | Renaming post files |
| Adding the canonical `## Join us` footer when missing | Rewriting code blocks, URLs, or quoted text without user approval |
| Drafting missing `excerpt` or `tags` | Auto-redacting content without user confirmation |
| Suggesting safer wording for flagged metrics/names | Editing the Join us boilerplate text without an explicit PR/legal request |

## Workflow

1. **Select files** — the file(s) the user named, or uncommitted `_posts/*.md` changes if they asked for a change-only pass.
2. **Validate metadata** — run every check in [Metadata validation](#metadata-validation). Report failures before editing prose.
3. **Join us boilerplate** — run every check in [Join us boilerplate](#join-us-boilerplate). Add the canonical section if missing.
4. **Grammar and tone pass** — read `references/grammar-tone-writing-quality.md` and edit the Markdown body (and metadata fields only where validation requires fixes). Do not edit the Join us boilerplate text.
5. **PR/legal pre-flight** — read `references/pr-legal-pre-flight.md` and review the **same file** for images, tables, figures, metrics, internal names, quotes, and reputational risk. Produce suggested fixes using the reference report format. **Do not apply PR/legal rewrites automatically** unless the user explicitly requests it.
6. **Verify and report** — use the [Verification report](#verification-report) template.

---

## Metadata validation

Run these checks **before** any prose edits. Treat front matter as the YAML block between the opening and closing `---` at the top of the file.

### Required fields checklist

Every post must include **all** of these keys:

| Field | Required | Validation rules |
|-------|----------|------------------|
| `layout` | Yes | Must be `post`. |
| `id` | Yes | Must exactly match the filename without `.md`. Example: file `2026-06-19-palana-part-1-secure-platform-for-ai-agents.md` → `id: 2026-06-19-palana-part-1-secure-platform-for-ai-agents`. |
| `title` | Yes | Non-empty string in **sentence case** (see `references/grammar-tone-writing-quality.md` → Headings and titles). Use single quotes if the title contains a colon. |
| `date` | Yes | Non-empty publish datetime, e.g. `2026-06-19 00:00:00`. |
| `authors` | Yes | YAML array of author handles, e.g. `[kevin.littlejohn]`. At least one author. |
| `categories` | Yes | YAML array with at least one category, e.g. `[Engineering]`. |
| `tags` | Yes | YAML array with **at least 3** tags relevant to the post content. |
| `comments` | Yes | Boolean: `true` or `false`. |
| `cover_photo` | Yes | Site-root path to the banner image, e.g. `/img/palana-part-1/banner-image.png`. |
| `excerpt` | Yes | Non-empty summary string. If missing or blank, draft one of **300 characters or fewer** that summarizes the post. |

If any required key is missing, report it explicitly:

```text
MISSING METADATA: <filename> is missing required field(s): <field1>, <field2>
```

### Field-specific rules

#### `id` vs filename

- Strip `.md` from the filename and compare to `id` character for character.
- If they differ, flag as an error and propose correcting `id` to match the filename (do not rename the file).

#### `authors`

- Each handle in `authors` must exist as a key in `_data/authors.yml`.
- If a handle is missing, add an entry using this format:

```yaml
adrian.margin:
  name: Adrian Margin
  thumbnail: /img/authors/adrian-margin.png
```

- Use lowercase handle notation (`firstname.lastname`).
- Confirm the author `thumbnail` file exists on disk (see [Image file checks](#image-file-checks)).

#### `categories`

- Each category must exist in `_data/categories.yml` (e.g. `Engineering`, `Data Science`, `Design`, `Product`, `Security`).
- If a category is missing from `_data/categories.yml`, flag it and ask before adding.

#### `tags`

- Minimum **3** tags.
- Tags should be Title Case nouns or short phrases relevant to the article topic.
- Do not invent tags that misrepresent the content.

#### `cover_photo`

- Must be a path starting with `/img/`.
- The file must exist under the repo `img/` directory (see [Image file checks](#image-file-checks)).
- Also subject to PR/legal image review in pass 3 (`references/pr-legal-pre-flight.md`).

#### `excerpt`

- Must be present and non-empty after validation.
- Maximum **300 characters** when you draft or revise it.
- Write a plain-language summary of the whole post, not a marketing tagline.

### Image file checks

Resolve paths by stripping the leading `/` and checking under the repository root:

- `cover_photo: /img/palana-part-1/banner-image.png` → `img/palana-part-1/banner-image.png`
- `thumbnail: /img/authors/adrian-margin.png` → `img/authors/adrian-margin.png`

If **any** referenced cover or author thumbnail file is missing, stop and report:

```text
PLEASE INCLUDE IMAGE FILES
```

List each missing path. Do not invent placeholder images.

### Example front matter

```yaml
---
layout: post
id: 2026-06-19-palana-part-1-secure-platform-for-ai-agents
title: 'Palana (Part 1): Why Grab built a secure platform for autonomous AI agents'
date: 2026-06-19 00:00:00
authors: [kevin.littlejohn]
categories: [Engineering]
tags: [Security, Artificial Intelligence, Kubernetes, DevSecOps, Platform, Engineering]
comments: true
cover_photo: /img/palana-part-1/banner-image.png
excerpt: "AI agents are becoming autonomous workloads with new security risks. Part 1 explains why Grab built Palana, a Kubernetes-native platform for running agents safely with isolation, controlled egress, and auditability."
---
```

---

## Join us boilerplate

Run immediately after metadata validation. See `references/join-us-boilerplate.md` for the canonical copy.

1. Search the post body for a `## Join us` heading (exact match).
2. If **missing**, append the canonical boilerplate from the reference to the **end** of the file, preceded by one blank line after the previous section.
3. If **present but non-canonical** (different wording, wrong link, or extra content after the section), report it and replace with the canonical boilerplate when applying fixes.
4. Do not modify the boilerplate text during grammar/tone or PR/legal passes.

Report when the section was added or replaced:

```text
JOIN US BOILERPLATE: missing — added | present — ok | present — replaced with canonical copy
```

---

## Prose editing (pass 3)

After metadata passes (or after reporting metadata gaps the user asked you to fix), edit the post body using `references/grammar-tone-writing-quality.md`.

### What to improve

#### Grammar and mechanics

- Fix obvious grammar, punctuation, and sentence-structure issues.
- Apply **sentence case** to the metadata `title` and all Markdown headings per `references/grammar-tone-writing-quality.md` → Headings and titles.
- Replace double spaces, trailing spaces, and hard tabs.
- End sentence-like paragraphs and list items with full stops where appropriate.
- Add commas where grammar is clear.
- Split comma splices into two sentences or add a conjunction.
- Do not add full stops to headings, table header cells, fragment labels, UI labels, command snippets, or incomplete placeholders.

#### Tone and style

- Write in clear, direct, colleague-to-colleague engineering blog prose.
- Prefer active voice, concrete verbs, and one idea per paragraph.
- Remove hedging, meta-commentary, filler phrases, and AI-style slop listed in the reference.
- Preserve the post's section structure unless the user asks for reorganization.

#### Spelling consistency

- Determine whether the post mostly uses UK or US English.
- Normalize inconsistent spelling to match that majority.
- Do not change names, product labels, commands, code, URLs, or quoted material.

### What not to change during prose editing

Do not rewrite:

- Front matter keys or values **except** when fixing metadata issues found in the validation pass (missing `excerpt`, wrong `id`, etc.).
- Code blocks, inline code, commands, JSON/YAML examples, or stack traces.
- URLs, file paths, API names, product names, package names, table syntax, or quoted external text.
- Filenames or post slug (`id` / filename) unless correcting a metadata mismatch.
- The **Join us** boilerplate section (fixed corporate copy).

---

## PR/legal pre-flight (pass 4)

Run **after** the grammar and tone pass on the same `_posts/*.md` file.

1. Read `references/pr-legal-pre-flight.md` in full.
2. Build a disclosure inventory (metrics, images, internal names, people, vendors, incidents).
3. Inspect every image: `cover_photo`, `![...]()`, and `<img>` tags — including alt text, captions, and surrounding prose.
4. Inspect tables and figure references for unsourced or over-precise metrics.
5. Apply every gate in the reference. Flag issues as **blocker** or **recommend**.
6. Output the PR/legal review report from the reference. For each issue, include **suggested fix** wording.
7. Ask the user whether to apply suggested PR/legal edits. Do not redact or remove content silently.

---

## Verification report

After all passes, report:

```text
files checked: <list>

--- pass 1: metadata ---
metadata status: pass | fail
missing or invalid metadata: <list or "none">
image file errors: <list or "none">
authors added to _data/authors.yml: <list or "none">
excerpt drafted or revised: <yes/no>
tags added or revised: <yes/no>

--- pass 2: join us ---
join us boilerplate: missing — added | present — ok | present — replaced with canonical copy

--- pass 3: grammar and tone ---
grammar and mechanics fixes applied: <summary>
tone and style improvements applied: <summary>
UK/US spelling normalization applied: <yes/no and variant>
sentence case fixes (title/headings): <summary or "none">

--- pass 4: PR/legal ---
PR/LEGAL VERDICT: PASS | PASS WITH CHANGES | BLOCK
blockers: <count + details per pr-legal-pre-flight.md format>
recommended edits: <count + details>
clearance questions: <list or "none">
gate checklist: <from pr-legal-pre-flight.md>

--- overall ---
items intentionally left unchanged: <front matter (except metadata fixes), links, code, quoted text, PR/legal redactions pending user approval>
next step: <ask user to apply PR/legal fixes | ready for PR/legal submit | resolve blockers first>
```

If metadata failed, list every missing or invalid field before prose and PR/legal findings.
