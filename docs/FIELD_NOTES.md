# Field Notes Editorial Guide

## Purpose

Field Notes is the numbered recurring series inside Cardboard Dispatches. It is
the place for engineering journals, collector observations, product diaries,
cardboard archaeology, and thoughtful hobby essays. A Field Note should record
something learned, noticed, built, questioned, or better understood.

Field Notes are personal records, not corporate announcements.

## Voice

Write with calm curiosity and specific observation. Sound like a collector or
builder opening a notebook, not a brand publishing a campaign.

- Prefer first-hand detail over broad claims.
- Explain why something matters before describing how impressive it is.
- Admit uncertainty, limitations, and work still in progress.
- Treat cards, collectors, and source material with respect.
- Use “we” only for work DieHardCards is actually doing.

Avoid launch language, hype, invented urgency, generic thought leadership, and
claims that cannot be supported.

## Writing style

- Use a direct title and an optional reflective subtitle.
- Keep paragraphs short enough to read comfortably.
- Use descriptive section headings when an article needs structure.
- Use one or two callouts only when they add context.
- Define specialist terms in plain language.
- Distinguish current capability, active development, and future direction.
- End with an earned observation rather than a sales pitch.

## Length

Most Field Notes should be 600–1,400 words, or roughly a 3–7 minute read. A
specific shorter note is better than an inflated one. Longer pieces should earn
their length with evidence, narrative, or useful detail.

Estimate reading time manually using roughly 200–250 words per minute, then
round to a whole minute.

## Categories

Use one primary category:

- Hans
- OCR
- Catalog Intelligence
- Collector Stories
- Cardboard Archaeology
- Market Intelligence
- Interesting Cards
- Engineering
- Behind the Build
- Lessons Learned

Add a new category only when several future notes would naturally belong to it.

## Naming and numbering

Field Note numbers are assigned manually and never reused:

- FIELD NOTE 001
- FIELD NOTE 002
- FIELD NOTE 003

Display numbers with three digits. The archive identifier follows
`DHC-FN-XXX`, so Field Note 012 uses `DHC-FN-012`.

Directory URLs use a durable descriptive slug, not the number:

`public/dispatches/introducing-hans/index.html`

The visible number expresses series order. The slug remains meaningful if an
editorial sequence changes before publication.

Revision starts at `1.0`. Correcting a meaningful factual or structural issue
after publication increments it to `1.1`; small typographical fixes do not
need a revision change.

## Reusable article structure

Every Field Note includes:

1. Breadcrumb back to Cardboard Dispatches
2. Archive identifier and revision
3. FIELD NOTE XXX stamp
4. Title
5. Optional subtitle
6. Publication date, reading time, category, and series ledger
7. Article body
8. Author signature
9. Previous, Return to Dispatches, and Next navigation

Optional components:

- pull quote
- image with caption
- callout labeled Observation, Behind the Build, Collector Takeaway,
  Engineering Note, or Artifact

Use [field-note-template.html](field-note-template.html) as the blank source and
Field Note 001 as the fully written reference.

## Publishing workflow

1. Identify the next unused number from the Dispatches index.
2. Copy `docs/field-note-template.html` into a new post directory:

   ```bash
   mkdir -p public/dispatches/your-field-note-slug
   cp docs/field-note-template.html public/dispatches/your-field-note-slug/index.html
   ```

3. Replace every uppercase placeholder in the copied file.
4. Remove unused optional subtitle, quote, image, or callout blocks.
5. Write the article and verify the reading-time estimate.
6. Update previous/next navigation in both the new note and the preceding note.
7. Add the newest note first to `public/dispatches/index.html`.
8. Update the existing homepage teaser only if the new note should be featured.
9. Add the canonical URL and publication date to `public/sitemap.xml`.
10. Add the newest item first to `public/dispatches/feed.xml` and update its
    `lastBuildDate`.
11. Preview with `npx wrangler dev`.
12. Check the article at desktop and narrow widths, then run:

    ```bash
    git diff --check
    node --test tests/contact.test.mjs
    ```

13. Review the complete diff before committing and pushing through the normal
    repository workflow.

## Editorial principles

- Publish only when there is something specific to say.
- Verify every factual assertion.
- Never invent prices, sales, announcements, users, partnerships, performance
  numbers, testimonials, or dates.
- Respect privacy and omit internal routes, local addresses, credentials, test
  identities, private collection details, and operational instructions.
- Explain evidence and uncertainty, especially for identification and market
  topics.
- Do not present prototypes or planned work as available products.
- Use owned or properly licensed images with meaningful alt text and captions.
- Preserve one `h1`, logical heading order, semantic dates, useful links, and
  keyboard navigation.
- Keep every note readable without JavaScript.

## Good future topics

- What a card back contributes to identification
- Why checklist provenance matters
- A difficult OCR match and what the evidence actually showed
- What “verified by collector” means in DHC
- The anatomy of a useful market comp
- A set detail uncovered during catalog cleanup
- Lessons from making reflective cards easier to photograph
- The story of an ordinary card with unusual collector meaning
- What changed after a Hans prototype capture session
- Why an honest confidence label is more useful than false certainty
