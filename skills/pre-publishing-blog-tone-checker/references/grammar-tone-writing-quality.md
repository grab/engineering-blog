# Grammar, Tone, and Writing Quality

Use this reference during the **Pre-Publishing Blog Tone Checker** pass on `_posts/*.md` files.

## Sources to honor

- [Blog standards](https://techdocs.grab.com/best-practices/tl-blog-standards/)

## Scope

Edit only the Markdown body of the selected `_posts/*.md` file unless the user approves a wider cleanup. Preserve technical meaning. Do not edit front matter during the prose pass unless the skill's metadata validation step requires a fix.

Do not rewrite:

- Front matter keys or values
- Code blocks, inline code, commands, JSON/YAML examples, or stack traces
- URLs, file paths, API names, product names, package names, table syntax, Hugo shortcodes, or quoted external text

## Determine UK or US English

Use the selected post's majority usage.

1. Extract prose from the `_posts/<filename>.md` body (below front matter).
2. Ignore front matter, code blocks, inline code, URLs, file paths, and proper nouns.
3. Count variant pairs, such as:

| UK | US |
|---|---|
| behaviour | behavior |
| colour | color |
| centre | center |
| metre | meter |
| organise | organize |
| organisation | organization |
| optimise | optimize |
| analyse | analyze |
| authorise | authorize |
| catalogue | catalog |
| licence | license |
| enrol | enroll |
| fulfil | fulfill |
| travelled | traveled |
| cancelling | canceling |

If one variant has at least 60% of variant-specific matches, use that variant for the post. If neither variant wins, preserve existing spelling and ask the user before mass conversion.

Only change words that are ordinary prose. Do not change names, product labels, commands, code, URLs, or quoted material.

## Fix mechanics

Apply these small, safe fixes:

- Replace double spaces between words with one space.
- Remove trailing spaces.
- Replace hard tabs with spaces.
- End sentence-like paragraphs and list items with full stops.
- Add a comma after a clear introductory clause: `After you configure the role, run the command.`
- Add commas around a parenthetic phrase when omission makes the sentence hard to parse.
- Split comma splices into two sentences or add a conjunction.
- Do not use long dashes (em-dashes or en-dashes). Rewrite any sentence that would normally use a long dash to use a comma, period, or separate sentence.
- Do not add full stops to headings, table header cells, fragment labels, UI labels, command snippets, shortcode parameters, or incomplete placeholders.

Grammar basics:

- Use possessives, serial comma, and parenthetic commas correctly.
- Do not use comma splices or sentence fragments (every sentence needs a finite verb).
- Fix dangling participles.

## Headings and titles (sentence case)

Apply **sentence case** to:

- The `title` value in YAML front matter.
- Every Markdown heading in the post body (`##`, `###`, and deeper levels).

### Sentence case rules

- Capitalize the **first word** only, plus proper nouns, acronyms, and product or feature names that are always capitalized.
- Do **not** use title case (capitalizing every major word).

| Wrong (title case) | Correct (sentence case) |
|---|---|
| Why Grab Built A Secure Platform For Autonomous AI Agents | Why Grab built a secure platform for autonomous AI agents |
| How We Reduced Memory And CPU Usage | How we reduced memory and CPU usage |
| The Complete Stream Processing Journey On FlinkSQL | The complete stream processing journey on FlinkSQL |

### Keep capitalized

Do not lower-case:

- Proper nouns: `Grab`, `Palana`, `Kubernetes`, `Singapore`
- Acronyms and initialisms: `API`, `LLM`, `CI/CD`, `FlinkSQL`
- Product, service, or feature names with official casing: `GrabMaps`, `OpenClaw`
- Words that must stay uppercase in code or commands when they appear inside a heading

### Examples

Front matter:

```yaml
title: 'Palana (Part 1): Why Grab built a secure platform for autonomous AI agents'
```

Body headings:

```markdown
## Why isolation is the unit of trust
### How Palana routes egress through a proxy
```

If a heading or `title` uses title case, flag it and propose a sentence-case rewrite.

---

## Acronyms and initialisms

Apply this check to the **post body only**. Do **not** scan or edit YAML front matter (`title`, `excerpt`, `tags`, etc.) for acronym expansion.

### Rule

Every acronym or initialism must be **expanded once on first mention** in the body, using this format:

```text
full term (ACRONYM)
```

After the first expansion, use the acronym alone for the rest of the post.

### Examples (Grab Engineering Blog convention)

| First mention | Later mentions |
|---|---|
| `Structured Query Language (SQL) query` | `SQL query`|
| `artificial intelligence (AI) systems` | `AI systems` |
| `large language model (LLM) judges` | `LLM judges` |
| `application programming interface (API) family` | `API compatibility` |
| `JavaScript Object Notation (JSON)` | `JSON` |
| `evidence identifier (ID)` | `evidence IDs` |

### How to scan

1. Read the body below the closing `---` of front matter.
2. Ignore code blocks, inline code, URLs, file paths, commands, and quoted external text.
3. Walk the prose in reading order. For each acronym or initialism (two or more uppercase letters, including forms like `CI/CD`), check whether it has already been expanded earlier in the body.
4. If not expanded, rewrite the first occurrence to `full term (ACRONYM)` without changing technical meaning.
5. Do not re-expand the same acronym later in the post.

### What counts

- Technical initialisms: `API`, `LLM`, `SQL`, `JSON`, `HTTP`, `MCP`, `GPU`, `CPU`, `ML`, etc.
- Compound uses count on first bare acronym: `evidence ID` → `evidence identifier (ID)` on first mention.

### What to skip

- **Brand and product names** used as proper nouns: `Grab`, `Palana`, `GXS Bank`, `GXBank`, `Kubernetes`.
- **Abbreviations that are not acronyms**: `eval` (evaluation), `config` (configuration).
- **Content inside code blocks, inline code, commands, URLs, and file paths** — leave unchanged.
- **The Join us boilerplate** — do not edit for acronyms during this pass (fixed corporate copy).
- **YAML** — treat as a format name unless the author or user asks to expand it; no Grab blog post currently expands `YAML`, and `YAML Ain't Markup Language` reads awkwardly in prose.

### Report and fix

When reviewing, list each acronym that was missing an expansion and note the line where you fixed it:

```text
ACRONYM EXPANSIONS: SQL (line 16), AI (line 27), LLM (line 27), API (line 41), JSON (line 66)
```

If an acronym is ambiguous or the full form is unclear, flag it and ask the user rather than guessing.

---

# Writing style principles

Three layers shape good prose: stance, cognition, and mechanics. Apply all three when improving tone and readability.

## Stance (Thomas and Turner, classic prose)

Write as if you see something clearly and are turning to an intellectual equal to point it out.

- **Motive is truth.** You write because you have something to show, not to impress.
- **Purpose is presentation.** The reader can verify what you present. You are not arguing or performing.
- **Writer and reader are equals.** The reader is competent and attentive. Do not talk down, hedge, or over-qualify.
- **Occasion is informal.** The tone is conversational, as if speaking to a colleague. Avoid ceremonial or bureaucratic register.
- **The writing is a window, not a subject.** Draw zero attention to the act of writing itself. Never say "this document will explain" or "as mentioned above."
- **Show parallels by juxtaposition.** Place related ideas next to each other and let the reader see the connection. Never announce it with "the same," "similarly," "this mirrors," or "this is just like."

## Cognition (Pinker, The Sense of Style)

**Curse of knowledge.** You know things your reader does not. Before every paragraph, ask: what does the reader already know? Start there. Introduce one new concept at a time. Define terms on first use through context, not parenthetical definitions.

**Chunking.** Working memory holds about four items. If a sentence forces the reader to track more than four new entities, relationships, or qualifications simultaneously, break it apart. Front-load the simple main clause. Let complexity trail behind it in subordinate structures.

## Strunk: composition principles

Condensed from William Strunk Jr., *Elements of Style*.

### One paragraph per topic

Each paragraph is one idea. The beginning signals a new step to the reader. Single sentences should not stand as paragraphs.

### Topic sentence first

Topic sentence at the beginning, middle sentences develop it, final sentence emphasizes or states consequence. Never end with a digression.

### Active voice

| Passive/Weak | Active/Strong |
|---|---|
| There were dead leaves lying on the ground. | Dead leaves covered the ground. |
| The sound of a guitar could be heard. | Somewhere in the house a guitar hummed sleepily. |
| It was not long before he was very sorry that he had said what he had. | He soon repented his words. |
| A survey of this region was made in 1900. | This region was surveyed in 1900. |

Active voice is more direct, bold, and concise. Use passive voice only when the receiver of action is the topic.

### Positive form

| Negative/Evasive | Positive/Direct |
|---|---|
| He was not very often on time. | He usually came late. |
| did not remember | forgot |
| did not pay attention to | ignored |
| not important | trifling |
| did not have much confidence in | distrusted |

Use *not* for denial or antithesis ("Not charity, but simple justice"), never as evasion.

### Specific, concrete language

| Vague | Concrete |
|---|---|
| A period of unfavorable weather set in. | It rained every day for a week. |
| He showed satisfaction as he took possession of his well-earned reward. | He grinned as he pocketed the coin. |

The surest way to hold attention is being specific, definite, and concrete.

### Omit needless words

Every word must tell. Common offenders:

| Wordy | Concise |
|---|---|
| the question as to whether | whether |
| there is no doubt but that | doubtless |
| owing to the fact that | since |
| in spite of the fact that | although |
| he is a man who | he |
| the fact that I had arrived | my arrival |
| the fact that | cut or rephrase |
| in order to | to |
| for the purpose of | to, for |
| in the event that | if |
| at this point in time | now |
| due to the fact that | because |
| in terms of | cut or be specific |
| with regard to | about |

### Parallel construction

| Broken Parallel | Parallel |
|---|---|
| Formerly, science was taught by the textbook method, while now the laboratory method is employed. | Formerly, science was taught by the textbook method; now it is taught by the laboratory method. |
| It was both a long ceremony and very tedious. | The ceremony was both long and tedious. |

Correlatives (both/and, not/but, either/or) must be followed by the same grammatical form.

### Keep related words together

Subject and verb close together. Modifier next to what it modifies. Relative pronoun immediately after its antecedent.

### Emphatic words at end

The beginning of a sentence is the second most emphatic position. The end is first.

## Williams: clarity and grace

Condensed from Joseph M. Williams, *Style: Lessons in Clarity and Grace*.

### Characters as subjects

Every sentence tells a story. Make the main character in that story the grammatical subject.

| Characters buried | Characters as subjects |
|---|---|
| That students retained more information when classroom activities involved student-directed inquiry was one of the key facts revealed by the analysis. | The analysis revealed that students retained more information when classroom activities involved student-directed inquiry. |
| There is a need for further investigation by the team. | The team needs to investigate further. |

Ask: "Who or what is doing something in this sentence?" Make that agent the subject.

### Actions as verbs

Put actions in verb form. Avoid hiding them inside nouns (nominalizations).

| Action hidden in noun | Action as verb |
|---|---|
| The mass spectrometer managed the measurement and identification of the proteins. | The mass spectrometer measured and identified the proteins. |
| make a decision | decide |
| give a presentation | present |
| conduct an investigation | investigate |
| perform an analysis | analyze |
| reach a conclusion | conclude |
| provide assistance | help |

Diagnostic: look for nouns ending in -tion, -sion, -ment, -ness, -ity, -ence, -ance. If the noun was once a verb or adjective, turn it back unless it is the established term for the concept.

### Old before new

Readers expect sentences to start with familiar ("old") ideas and end with unfamiliar ("new") ideas. The end of a sentence is its stress position. Place your most important point at the end.

### Topic strings

A cohesive paragraph keeps the same topic (subject) across consecutive sentences. Run your eye down the subjects of consecutive sentences. If every sentence starts with a different subject, the paragraph will feel scattered.

### Stress position

Never end a sentence on placeholder nouns: something, things, stuff, aspects, factors. Never end on vague pronouns: it, this, that. The stress position demands your most concrete, most specific word.

When introducing a technical term, design the sentence so the term lands at the end, never at the beginning.

### Subject-verb proximity

Keep the main character close to its action. Put the main clause first. Let subordinate detail follow.

### Concision

Also cut: kind of, really, basically, actually, virtually, in a sense, certain, particular, individual, given.

### Coherence

A coherent paragraph:

1. States or implies its point in the first one or two sentences.
2. Makes every following sentence advance that point.
3. Introduces each new concept at the end of its first sentence, then uses it as old information in the next.

If you can delete a sentence without damaging the paragraph's argument, that sentence does not belong.

### Write for the reader, not for your thinking

Revision is reorganizing your text around what the reader needs, not what you needed to figure out.

### Elegance

- Use parallel construction for coordinate ideas.
- Vary sentence length. Follow a long sentence with a short one.
- Read aloud. If you stumble, the reader will too.
- End on strength.

## Pinker: sense of style

Condensed from Steven Pinker's *The Sense of Style*.

### No meta-commentary

The writing is a window. Never narrate the act of writing, reading, or discussing.

| Ban | Why |
|---|---|
| "in this post" / "in this article" | The reader already knows they're reading your text. |
| "as mentioned earlier" | If you need to repeat something, repeat it. |
| "it should be noted that" | Just state the thing. |
| "it is worth mentioning" | If it's worth mentioning, mention it. |
| "let me explain" | Just explain. |

### No hedging

| Ban | Why |
|---|---|
| "it seems like" | Commit or present evidence. |
| "arguably" | Make the argument or don't. |
| "it could be said that" | Say it or don't. |

### Classic prose stance

Write as if you see something clearly and are pointing it out to an equal. Never talk down, hedge, or over-qualify. Place related ideas next to each other and let the reader see the connection.

## AI slop: banned patterns

Patterns derived from corpus analysis (Liang et al. 2024), LinkedIn monitoring, and social media slop detection. Hard bans unless marked otherwise.

### Banned vocabulary

delve, utilize, leverage, streamline, optimize, enhance, facilitate, navigate, landscape, paradigm, robust, comprehensive, innovative, transformative, pivotal, crucial, imperative, foster, bolster, underscore, realm, multifaceted, intricate, nuanced, holistic, synergy, catalyst, cornerstone, testament, tapestry, endeavor, embark, elevate, empower, unpack, dive, journey, passion, excited, thrilled, insightful, groundbreaking, game-changer, cutting-edge, seamless, scalable, actionable, impactful, ecosystem, stakeholder

Replace every instance with a specific, concrete alternative.

### Filler phrases

| Ban | Fix |
|---|---|
| "it's important to note" | Cut. State the thing. |
| "it's worth noting" | Cut. |
| "let's dive in" | Cut. |
| "dive into" | Replace with a specific verb. |
| "in today's rapidly evolving" | Cut. Name the specific change. |
| "at the end of the day" | Cut. |
| "when it comes to" | Cut. Name the subject. |
| "navigate the complexities" | Name the specific difficulty. |
| "unlock the power" | Say what the tool does. |
| "in the realm of" | Cut. Say "in." |
| "it goes without saying" | Then don't say it. |
| "first and foremost" | "First." |
| "last but not least" | Cut. Just state it. |
| "without further ado" | Cut. |
| "a testament to" | Name the cause directly. |
| "paradigm shift" | Name what changed. |
| "holistic approach" | Name the approach. |
| "in conclusion" | Cut. |
| "to summarize" | Cut. |

### Overused transitions

Use one per paragraph at most. Prefer sentence structure to signal relationships.

moreover, furthermore, however, additionally, consequently, nevertheless, therefore, thus, hence, meanwhile, subsequently, likewise, conversely, nonetheless

### Engagement bait

"agree?" "thoughts?" "who else", "hot take", "unpopular opinion", "you won't believe", "stop scrolling", "read that again", "let that sink in", "thrilled to announce", "excited to share", "humbled and honored"

### Thought-leadership slop

"here's the thing", "here's what most people miss", "most people don't realize", "changed my thinking", "the uncomfortable truth", "what surprised me most", "not magic. but real", "not hype"

### Formulaic structures

"lessons I learned", "follow me for", "like and share", "drop a comment", "repost if you agree", "tag someone who", "save this for later", "link in comments", "if you're building in this space", "if this resonates"

### LinkedIn modifiers

"quietly building/winning/dominating/changing/creating/scaling/working", "silently building", "relentlessly building", "obsessively focused", "slowly realizing/becoming"

### Humble-brag framing

"built in a day", "in a weekend", "in just one week", "what excites me most", "it's all open source", "this is what that looks like", "in practice", "imagined and built"

### Manufactured demand

"people asked for more", "got a reaction", "went viral", "blew up", "so here's part", "as promised"

## AI-voice structural tells

**Throat-clearing** — opening phrases that delay the point.

Ban: "What this means is," "In practice," "To be clear," "The key here is," "That said."

Fix: delete the phrase and start with the subject.

**Agency dodging** — verbs that hide who acts.

Ban: "allows," "enables," "ensures," "provides," "serves as."

Fix: make the real agent the subject and give it a real verb.

**Pronoun crutch** — "This + abstract noun" as sentence opener.

Ban: "This constraint," "This approach," "This architecture," "This means that."

Fix: name the thing.

**Echo closers** — restating the paragraph's point in a short final sentence. Cap at once per piece.

**Filler pairs** — padding that adds no meaning.

Ban: "both X and Y" (just "X and Y"), "rather than," ending with "as well," "in order to" (just "to").

---

# Improve prose in blog posts

Apply the principles above inside the post's existing section headings (`## Abstract`, `## Introduction`, `## Background`, etc.). Do not invent new sections unless the user asks.

- Put the main character as the subject.
- Put actions in verbs, not abstract nouns.
- Keep subject and verb close.
- Use active voice unless the receiver of the action is the topic.
- Start sentences with familiar information and end with new information.
- Keep one idea per paragraph.
- Break long sentences into shorter sentences.
- Replace needless phrases: `in order to` -> `to`, `due to the fact that` -> `because`, `has the ability to` -> `can`.
- Replace vague verbs with concrete verbs.
- Avoid meta-commentary and AI-style filler listed above.

For engineering blog posts, keep necessary technical terms. If a term hurts readability but is required, define it once in plain language or add an example instead of deleting it.

Section examples:

- Tighten the `## Abstract` or `## Introduction` opening paragraphs without changing the technical claim.
- Keep numbered steps, diagrams, and code samples intact; edit only surrounding explanation.
- Split an overlong paragraph into two when it tracks more than one idea.
- Preserve existing heading hierarchy; do not flatten `###` subsections into prose.

After editing, scan for and fix:

- Abstract placeholders and banned vocabulary.
- Filler phrases with zero information content.
- Meta-commentary and hedging.
- Weak verbs and nominalizations where the real agent can be the subject.
- Sentences that end on vague pronouns or placeholder nouns.
- Acronyms and initialisms missing a first-use expansion (see **Acronyms and initialisms** above). Apply fixes in the body only; exclude front matter.

## Verification

Work in this order:

1. Apply grammar, tone, spelling, and prose fixes to every in-scope file.
2. Summarize substantive writing-quality changes made.
