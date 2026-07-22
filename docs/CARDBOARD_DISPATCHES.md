# Publishing Cardboard Dispatches

Cardboard Dispatches is intentionally static and Git-managed. Each article is a
complete HTML document served by Cloudflare static assets. There is no CMS,
database, build command, package dependency, or client-side rendering.

## Publish a Field Note

Field Notes are the numbered recurring series within Cardboard Dispatches. Use
the detailed [Field Notes editorial guide](FIELD_NOTES.md) and its blank
[article template](field-note-template.html) for new posts.

1. Copy the blank Field Note template:

   ```bash
   mkdir -p public/dispatches/your-post-slug
   cp docs/field-note-template.html public/dispatches/your-post-slug/index.html
   ```

2. In the copied `index.html`, update every clearly identifiable article value:

   - document title
   - meta description
   - canonical URL
   - Open Graph title, description, URL, and article publication date
   - Twitter title and description
   - breadcrumb label
   - visible category, heading, and semantic `<time datetime="YYYY-MM-DD">`
   - article body

   Keep the existing site image metadata unless a truthful, repository-owned
   article image is added later. Preserve the shared header, footer, skip link,
   stylesheet, icons, and RSS discovery link.

3. Add the newest article first in `public/dispatches/index.html`.

4. Add the page URL and truthful `lastmod` date to `public/sitemap.xml`.

5. Add the newest item first in `public/dispatches/feed.xml`, then update the
   channel's `lastBuildDate`. RSS dates use RFC 822 format.

6. Preview the full static site and nested route:

   ```bash
   npx wrangler dev
   ```

   Check `/dispatches/` and `/dispatches/your-post-slug/` at the local URL
   Wrangler prints.

7. Run the repository checks:

   ```bash
   git diff --check
   node --test tests/contact.test.mjs
   ```

8. Review the diff, then commit and push through the normal repository workflow.

## Editorial guardrails

- Publish only sourced or directly observed facts.
- Do not invent sales, prices, announcements, partnerships, testimonials, or
  release dates.
- Distinguish current capabilities from private-alpha work and future direction.
- Do not include private routes, local addresses, infrastructure details,
  credentials, test identities, or personal data.
- Use one `<h1>`, a logical heading order, meaningful link names, and semantic
  `<article>` and `<time>` elements.
- Keep prose readable without JavaScript and avoid third-party embeds or
  tracking.

The blank template preserves metadata, article structure, shared navigation,
optional editorial components, and previous/next links. Field Note 001 is the
fully written reference implementation.
