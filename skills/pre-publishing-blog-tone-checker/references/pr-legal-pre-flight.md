# PR and legal pre-flight

Use this reference **after** metadata validation and grammar/tone editing on a `_posts/*.md` file.

This is a **preflight review**, not legal approval. Never claim a draft is cleared by PR or legal. When evidence or permission is missing, flag the item, propose a safer rewrite, or recommend removal.

**Default behavior:** report findings and suggested fixes. Do **not** redact metrics, names, or images in the file unless the user explicitly asks you to apply PR/legal edits.

---

## How to scan a post

Work through the file in this order:

### 1. Build a disclosure inventory

Extract every item below from front matter **and** body:

| Item type | Where to look |
|-----------|---------------|
| Images | `cover_photo` in front matter; `![alt](path)`; `<img ... src="...">` |
| Metrics | Prose, bullet lists, tables, figure captions, chart labels |
| Internal names | Service codenames, unreleased products, team-only tool names |
| Architecture detail | Diagrams, config snippets, capacity numbers, cluster topology |
| People | Named employees, researchers, customers, partners |
| Quotes | Blockquotes, attributed speech, interview excerpts |
| Markets & geography | Country, city, or region-specific results |
| Vendors & counterparties | Third-party products, partnerships, customers |
| Incidents & risk | Outages, breaches, vulnerabilities, failures |
| Comparative claims | Superlatives, benchmarks vs competitors, “first”, “only”, “best” |

### 2. Inspect every image

For each image path (`cover_photo`, Markdown image, or HTML `<img>`):

1. Note the file path under `img/`.
2. Read the **alt text**, **caption**, and **surrounding paragraph** — they often disclose what the image hides.
3. Assume screenshots of dashboards, admin UIs, internal tools, tickets, logs, Slack, email, or production metrics are **confidential until proven otherwise**.
4. Check whether prose describes visible fields (URLs, IDs, emails, workspace names, tokens, PII).

Flag when:

- The image is a raw internal screenshot without a stated sanitization note.
- Alt text or caption names internal systems, exact metrics, or identifiable users.
- The same information appears in both prose and a quote screenshot (redundant disclosure risk).
- `cover_photo` or inline images show unreleased UI, real customer data, or competitor comparisons.

**Preferred fixes:** replace with a sanitized diagram, synthetic/mock data, or a cropped/redacted asset; add a caption such as “Illustrative example; data is synthetic.”

### 3. Inspect tables and figures

For Markdown tables and “Fig N.” references:

- Treat every numeric cell as a metric requiring source and scope.
- Flag tables that reproduce internal dashboard columns (QPS, conversion %, revenue, headcount by team).
- Flag figure captions that include false precision (`3.57%`, `12 live streams`) when a rounded, scoped claim would teach the same lesson.

### 4. Apply the gates below

Do not skip a gate because the content is technically accurate.

### 5. Propose the least-disclosing fix

For each issue, give: **risky excerpt** → **gate** → **suggested rewrite or action** → **clearance needed** (if any).

---

## Must-pass gates

### Confidentiality and competitive detail

- Include only the architecture, workflow, capacity, configuration, or operational detail needed to teach the reader.
- Require documented approval or evidence that the same detail is already public.
- Generalize exact scale, throughput, capacity, benchmark, percentile, adoption, and productivity figures when precision is unnecessary.

**Must avoid:** unique implementation detail competitors could exploit, internal tool configuration, exact workflow capacity, granular market comparisons, dashboard extracts, or language that reveals operating strengths or weaknesses.

**Markdown signals:** internal codenames in backticks; “our dashboard shows”; architecture diagrams with service names not known publicly; config dumps outside fenced examples clearly marked as illustrative.

### Metrics and claims

- Record the source, owner, as-of date, population, geography, and scope for every number.
- Scope claims precisely. Prefer “more than 10”, “millions of lines”, or “more than 3%” when exact figures add no teaching value.
- Substantiate superlatives, comparisons, user counts, download counts, and performance claims.
- A prior-public citation must support the **same fact, name, and level of detail** — not merely a related topic.

**Must avoid:** unsourced numbers, false precision, repeated metrics, vague denominators, internal-only results, claims broader than their evidence.

**Markdown signals:** `%`, `x faster`, `N million`, `QPS`, `p99`, `YoY`, tables of KPIs, “we improved X by Y%”.

### Internal names, vendors, and counterparties

- Use a generic functional description unless the internal name is already publicly disclosed and current use is approved.
- Mention a vendor only when necessary and factual; avoid implied endorsement or disparagement.
- Obtain explicit permission before naming a non-public counterparty, partnership, participant, or customer.

**Must avoid:** unreleased project codenames, unnecessary vendor comparisons, single-market or single-partner callouts, names implying a commercial relationship without consent.

**Markdown signals:** capitalized internal product names (e.g. in-house platforms), “built by team X”, named third-party pilots.

### Screenshots, examples, and privacy

- Prefer mockups, diagrams, or synthetic sample data.
- If an image is essential, verify every visible field is masked: internal URLs, IDs, tickets, emails, account data, workspace names, tokens, identifying timestamps, personal data.
- State clearly when data is anonymized, redacted, synthetic, or illustrative.
- Check privacy obligations (including GDPR and PDPA) before using user or employee data.

**Must avoid:** unreviewed screenshots, real dashboard data, identifiable user journeys, credentials, “sample” data with unclear origin.

**Image checklist (per asset):**

```text
[ ] Not a raw production screenshot OR sanitization is documented in caption
[ ] No visible PII, credentials, or internal URLs
[ ] Alt text does not disclose confidential detail
[ ] Caption states synthetic/redacted if applicable
[ ] cover_photo meets the same bar as inline images
```

### Incidents, risk, and reputation

- Label hypothetical scenarios explicitly and early.
- Describe limitations accurately and constructively: explain the scaling challenge, safeguard, or improvement.
- Use neutral, professional language.

**Must avoid:** wording read as a real undisclosed incident, sensational failure angles, “buggy”, “unreliable”, glib jokes, puffery (“impressive”, “groundbreaking”), misrepresenting Grab’s footprint or operations.

### Quotes and attribution

- Obtain written permission for participant, researcher, employee, customer, or partner quotes.
- Verify approved wording, name, title, and attribution.
- Use either the quotation or a screenshot containing it, not both, unless both are necessary.

**Must avoid:** unattributed quotes, identifiable anecdotes without consent, redundant quote screenshots.

### Promotional and reputational copy

- Replace subjective adjectives with evidence.
- Avoid language that sounds like marketing copy rather than engineering writing.

**Must avoid:** “impressive”, “revolutionary”, “best-in-class”, “seamless”, unsubstantiated “we’re excited to share”.

*Note:* Grammar, spelling, and sentence-case rules live in `grammar-tone-writing-quality.md`. This gate covers **claims and reputation risk** only.

---

## Red-flag patterns

Search the post (including alt text and table cells) for patterns like:

| Pattern | Typical risk |
|---------|----------------|
| Exact percentages with two+ decimal places | False precision; may be internal-only |
| Named country/region + metric | Market-specific disclosure |
| Screenshot + numeric claim in adjacent paragraph | Dashboard leak |
| “First in Southeast Asia” / “only platform that” | Unsubstantiated superlative |
| Customer or bank name | Counterparty consent |
| Employee full name + quote | Attribution permission |
| Realistic user IDs, phone numbers, emails in examples | Privacy |
| Unreleased codename in heading or image path | Confidentiality |
| “Before/after” production metrics | Competitive + internal |

---

## Suggested fix format

For each issue, output:

```text
SEVERITY: blocker | recommend
LOCATION: <line, section, image path, or table>
GATE: <gate name>
RISKY TEXT: "<short quote>"
RISK: <one sentence>
SUGGESTED FIX: "<replacement wording or action>"
CLEARANCE: <owner/evidence needed, or "none if generalized">
```

**Severity guide:**

- **blocker** — likely confidential data, PII, unapproved quote/counterparty, or material claim with no evidence path; do not publish without resolution.
- **recommend** — safer wording or image treatment exists; author should consider before submit to PR/legal.

---

## Safe rewrite pattern

Instead of:

> Our 12 live streams improved conversion by 3.57% in Country X, as shown in this internal dashboard.

Prefer:

> Across more than 10 production streams, the approach improved the measured outcome by more than 3%.

Then require: metric owner and approved source; remove country comparison unless essential; replace dashboard with a sanitized diagram or synthetic example.

Instead of:

> ![Redis CPU](/img/post/redis-prod-dashboard.png)

Prefer:

> ![Illustrative CPU trend (synthetic data)](/img/post/redis-cpu-sanitized.png)

With caption: *Figure 1. Illustrative CPU utilisation; values are synthetic and axes are normalized.*

---

## Required review report

Return this after the PR/legal pass:

```text
PR/LEGAL VERDICT: PASS | PASS WITH CHANGES | BLOCK

disclosure inventory:
  - metrics: <list with status: public | approved | generalize | remove | unknown>
  - internal names: <list with status>
  - images: <path + status>
  - people/quotes: <list with status>
  - vendors/counterparties: <list with status>
  - incidents/markets: <list with status>

blockers: <count>
  <SEVERITY / LOCATION / GATE / RISKY TEXT / SUGGESTED FIX / CLEARANCE>

recommended edits: <count>
  <same format>

clearance questions:
  - <exact permission or evidence needed + likely owner>

gate checklist:
  - confidentiality: pass | fail | not evidenced
  - metrics and claims: pass | fail | not evidenced
  - internal names and vendors: pass | fail | not evidenced
  - screenshots and privacy: pass | fail | not evidenced
  - incidents and reputation: pass | fail | not evidenced
  - quotes and attribution: pass | fail | not evidenced
  - promotional copy: pass | fail | not evidenced
```

**Verdict rules:**

- **BLOCK** — any blocker-severity item remains.
- **PASS WITH CHANGES** — no blockers; one or more recommended edits should be applied before PR/legal submit.
- **PASS** — every applicable gate is evidenced or not triggered.

---

## Final rule

Accuracy is necessary but not sufficient. If a detail is not necessary, prior-public, approved, sourced, consented, and safely presented, **generalize it or remove it**.
