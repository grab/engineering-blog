# Join us boilerplate

Every `_posts/*.md` file must end with the canonical **Join us** section below.

## Detection

1. Parse the post body (content below the closing `---` of front matter).
2. Search for a level-2 heading that matches `## Join us` (exact text, case-sensitive).
3. Treat these as **missing**:
   - No `## Join us` heading
   - Variant headings such as `## Join Us`, `## Join our team`, or `### Join us`
4. If `## Join us` exists but the paragraphs differ from the canonical copy, report **non-canonical Join us section** and replace with the boilerplate below when applying fixes.

## Placement

- The section must be the **last content** in the file (ignoring trailing blank lines).
- Precede it with a single blank line after the previous section.
- Do not insert content after the Join us section.

## Canonical boilerplate

Copy this block verbatim when adding or replacing the section:

```markdown

## Join us

Grab is Southeast Asia's leading superapp, serving over 900 cities across eight countries (Cambodia, Indonesia, Malaysia, Myanmar, the Philippines, Singapore, Thailand, and Vietnam). Through a single platform, millions of users access mobility, delivery, and digital financial services, including ride-hailing, food delivery, payments, lending, and digital banking via GXS Bank and GXBank. Founded in 2012, Grab's mission is to drive Southeast Asia forward by creating economic empowerment for everyone while delivering sustainable financial performance and positive social impact.

Powered by technology and driven by heart, our mission is to drive Southeast Asia forward by creating economic empowerment for everyone. If this mission speaks to you, [join our team](https://www.grab.careers/en/) today!
```

## PR/legal note

The boilerplate contains approved corporate copy (market footprint, GXS Bank, GXBank, careers link). Do not edit this text during grammar/tone or PR/legal passes unless PR/legal explicitly requests a boilerplate update.
