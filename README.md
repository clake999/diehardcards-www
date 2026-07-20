# DieHardCards Website

## Overview

This repository contains the public marketing website for [diehard.cards](https://diehard.cards). It is intentionally lightweight and deploys from GitHub through Cloudflare Workers Static Assets.

The public site remains static HTML and CSS. A small Cloudflare Worker handles the contact form at `POST /api/contact`; no submission database is used.

## Technology

- HTML5 and CSS3
- Dependency-free browser JavaScript
- Cloudflare Workers Static Assets
- Cloudflare Turnstile
- SendGrid v3 Mail Send API
- GitHub source control and Cloudflare automatic deployments

There is no frontend framework, package-managed application, or build pipeline.

## Repository Structure

```text
src/
├── contact.mjs            # Pure validation, escaping, and email formatting
└── index.js               # Worker routing, Turnstile, and SendGrid integration

tests/
└── contact.test.mjs       # Dependency-free Node tests

public/
├── .well-known/security.txt
├── assets/
│   ├── css/styles.css
│   ├── js/contact-form.js
│   ├── icons/
│   └── images/
├── security/index.html
└── index.html

.dev.vars.example
wrangler.jsonc
```

## Contact Form

The form uses this request path:

```text
Browser form
   ↓ POST /api/contact
Cloudflare Worker
   ↓ Turnstile Siteverify
Strict validation and anti-abuse checks
   ↓ SendGrid v3 Mail Send
hello@diehard.cards
```

`GET /api/contact/config` returns only the public Turnstile site key needed for build-free widget rendering. Static files remain asset-first; only `/api/*` is configured to invoke the Worker first.

The Worker does not persist submissions. It does not log names, email addresses, messages, Turnstile tokens, or upstream response bodies.

### Required bindings

Secrets configured in Cloudflare, never committed:

- `TURNSTILE_SECRET_KEY`
- `SENDGRID_API_KEY`

Non-secret variables:

- `TURNSTILE_SITE_KEY`
- `CONTACT_TO_EMAIL` — production value: `hello@diehard.cards`
- `CONTACT_FROM_EMAIL` — production value: `no-reply@diehard.cards`

The SendGrid From address must be an authenticated sender or belong to an authenticated domain. The submitted visitor email is used only as `reply_to`, never as the From address or recipient.

## Local Development

Node.js is sufficient; no package installation is required. Wrangler may be invoked through `npx`:

```bash
cp .dev.vars.example .dev.vars
```

Edit the ignored `.dev.vars` file and replace the SendGrid placeholder with a restricted development key. The example contains Cloudflare's documented always-pass Turnstile test site key and matching test secret. Those test credentials must never be used in production.

Start the complete Worker and static-assets preview:

```bash
npx wrangler dev
```

Open the local URL printed by Wrangler, normally `http://localhost:8787`.

A Python static server can still preview HTML and CSS, but it cannot execute `/api/contact` or provide the Turnstile configuration endpoint. Use Wrangler for all form testing.

Run the dependency-free tests:

```bash
node --experimental-default-type=module --test tests/contact.test.mjs
```

## Security Controls

Contact submissions are protected by:

- Server-side Turnstile verification, including production hostname matching
- Same-origin `Origin` validation
- A hidden honeypot
- A three-second minimum completion time and two-hour maximum form age
- A 16 KiB request-body limit
- Strict content-type and JSON parsing
- Length, format, control-character, and interest-allowlist validation
- Fixed server-controlled SendGrid recipient and sender
- HTML escaping before email rendering
- `no-store` and `nosniff` API response headers

These controls do not claim to provide durable rate limiting. A Cloudflare Rate Limiting rule can later be applied specifically to `/api/contact` for additional edge protection.

## Production Setup and Deployment

Before enabling the form in production:

1. Create a Turnstile widget restricted to `diehard.cards` and, if used, `www.diehard.cards`.
2. Replace the `TURNSTILE_SITE_KEY` placeholder in `wrangler.jsonc` with the public production site key.
3. Authenticate `diehard.cards` in SendGrid or verify the configured From address.
4. Create a restricted SendGrid API key with only Mail Send permission.
5. Allow the GitHub-to-Cloudflare deployment to publish the Worker and static assets.
6. In the Cloudflare dashboard, open the production Worker settings and add encrypted secrets named `TURNSTILE_SECRET_KEY` and `SENDGRID_API_KEY`.
7. Confirm the three non-secret variables match the intended production values.
8. If secrets were added after the initial deployment, publish the resulting Worker settings/version as required by the dashboard workflow.

Do not put either secret into `wrangler.jsonc`, `.dev.vars.example`, HTML, browser JavaScript, repository settings visible to clients, or Git history.

### Manual test checklist

- Load `/` and confirm the Turnstile widget appears.
- Submit each allowed Interest option with valid data.
- Confirm success is announced and the form and widget reset.
- Confirm the notification reaches `hello@diehard.cards` with plain-text and HTML parts.
- Confirm Reply uses the visitor's validated address.
- Verify empty required fields and malformed email addresses are blocked.
- Verify an overlong message is blocked.
- Verify a filled honeypot, missing/expired Turnstile token, too-fast submission, cross-origin request, malformed JSON, wrong content type, and oversized body are rejected.
- Verify SendGrid failure produces only the generic browser message.
- Verify `/`, `/security/`, images, icons, and other static assets still bypass Worker-first execution.
- Review Turnstile Analytics and Worker error metrics without adding personal-data logging.

## Branding

Production assets under `public/assets/` use the approved DieHardCards logo and responsive derivatives. Do not modify the source logo or generated icon assets.

## Security Policy

The existing responsible disclosure policy remains at [`public/security/index.html`](public/security/index.html), with the standard [`security.txt`](public/.well-known/security.txt) contact. Security reports can be sent to `security@diehard.cards`.

## License

This project is proprietary. All source code, documentation, branding, logos, and other repository content are covered by the existing [LICENSE](LICENSE).

Copyright © 2026 Chris Lake. All rights reserved.
