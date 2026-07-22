# DieHardCards Website

## Overview

This repository contains the public marketing website for [diehard.cards](https://diehard.cards). It is intentionally lightweight and deploys from GitHub through Cloudflare Workers Static Assets.

The public site remains static HTML and CSS. A small Cloudflare Worker handles the contact form at `POST /api/contact`; no submission database is used.

Website Alpha 1.1 contact form functionality is complete and deployed at [https://diehard.cards](https://diehard.cards). End-to-end production delivery to `hello@diehard.cards` was successfully verified on July 21, 2026.

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
├── dispatches/             # Static Cardboard Dispatches index, RSS, and posts
└── index.html

.dev.vars.example
wrangler.jsonc
```

Instructions for publishing a static editorial post are in
[`docs/CARDBOARD_DISPATCHES.md`](docs/CARDBOARD_DISPATCHES.md).

## Contact Form

The form uses this request path:

```text
Browser
   ↓ POST /api/contact
Cloudflare Worker
   ↓ Turnstile Siteverify
Server-side validation and anti-abuse controls
   ↓ SendGrid v3 Mail Send
hello@diehard.cards
```

Before submission, the frontend calls `GET /api/contact/config`. This endpoint returns the public `TURNSTILE_SITE_KEY` so the browser can render the Turnstile widget without a build step. It does not return secrets or the email configuration. Static files remain asset-first; only `/api/*` is configured to invoke the Worker first.

The Worker sends accepted submissions directly to SendGrid. The application uses no database for contact submissions and does not store them. It also does not log names, email addresses, messages, Turnstile tokens, or upstream response bodies.

### Required bindings

Secrets configured in Cloudflare, never committed:

- `TURNSTILE_SECRET_KEY`
- `SENDGRID_API_KEY`

Public, non-secret configuration in `wrangler.jsonc`:

- `TURNSTILE_SITE_KEY` — the production site key is intentionally public and is supplied to the frontend by the config endpoint
- `CONTACT_TO_EMAIL` — production value: `hello@diehard.cards`
- `CONTACT_FROM_EMAIL` — production value: `no-reply@diehard.cards`

The SendGrid From address must be an authenticated sender or belong to an authenticated domain. The submitted visitor email is used only as `reply_to`, never as the From address or recipient.

## Local Development

Node.js and npm (including `npx`) are required; no project package installation is required. Create the ignored local variable file:

```bash
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars` and replace the SendGrid placeholder with a restricted development key. The example contains Cloudflare's documented always-pass Turnstile test site key and matching test secret. Those test credentials must never be used in production.

Cloudflare's always-pass test credentials can make Siteverify return the synthetic hostname `example.com`. The Worker accepts that Siteverify hostname only when the incoming Worker request hostname is exactly `localhost` or `127.0.0.1`. This is a local-test-specific hostname rule. Production validation remains exact: the incoming hostname must be `diehard.cards` or `www.diehard.cards`, and the Siteverify hostname must match it.

Start the complete Worker and static-assets preview:

```bash
npx wrangler dev
```

Open the local URL printed by Wrangler, normally `http://localhost:8787`.

A Python static server can still preview HTML and CSS, but it cannot execute `/api/contact` or provide the Turnstile configuration endpoint. Use Wrangler for all form testing.

Run the dependency-free tests:

```bash
node --test tests/contact.test.mjs
```

## Security Controls

Contact submissions are protected by:

- Server-side Turnstile verification, including production hostname matching
- Exact production hostname validation restricted to `diehard.cards` and `www.diehard.cards`
- Same-origin `Origin` validation
- A hidden honeypot
- A three-second minimum completion time and two-hour maximum form age
- A 16 KiB request-body limit
- An `application/json` content-type requirement and strict JSON parsing
- Name, email, message, token, timestamp, control-character, and interest-allowlist validation; messages are limited to 2,000 characters
- Fixed server-controlled SendGrid recipient and sender
- HTML escaping before email rendering
- Generic client-facing rejection messages for validation and suspected abuse
- `no-store` and `nosniff` API response headers
- No application database or storage of contact submissions
- Production secrets stored as encrypted Cloudflare Worker secrets, not in Git

These controls do not claim to provide durable rate limiting. A Cloudflare Rate Limiting rule can later be applied specifically to `/api/contact` for additional edge protection.

## Production Configuration and Deployment

The production form uses a real Cloudflare Turnstile widget in Managed mode. Its allowed hostnames are exactly `diehard.cards` and `www.diehard.cards`. The production configuration and verification procedure is:

1. Create a Cloudflare Turnstile widget and select Managed mode.
2. Add `diehard.cards` and `www.diehard.cards` as the widget's allowed hostnames.
3. Put the public production `TURNSTILE_SITE_KEY` in `wrangler.jsonc`, alongside the non-secret recipient and sender variables.
4. Authenticate the sender in SendGrid and create a restricted SendGrid API key with Mail Send permission.
5. Add `TURNSTILE_SECRET_KEY` and `SENDGRID_API_KEY` as encrypted Cloudflare Worker secrets.
6. Deploy the Worker and static assets through the existing GitHub-to-Cloudflare workflow.
7. Perform a real form submission at `https://diehard.cards` using the production Turnstile widget.
8. Confirm the message is delivered to `hello@diehard.cards` from `DieHardCards Website <no-reply@diehard.cards>` and that replies use the submitted address.

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

## Verification Record

The Alpha 1.1 contact form has been verified in both local and production environments.

Local verification:

- Automated test suite: 10 passed, 0 failed.
- End-to-end submission returned HTTP `201 Created`.
- Email delivery succeeded.

Production verification completed July 21, 2026:

- The production Turnstile widget loaded successfully.
- A real production form submission succeeded.
- The resulting email was delivered to `hello@diehard.cards`.
- The delivered message included the selected interest, message, submission timestamp, and Cloudflare country metadata; country enrichment returned `US` in the verified submission.

## Branding

Production assets under `public/assets/` use the approved DieHardCards logo and responsive derivatives. Do not modify the source logo or generated icon assets.

## Security Policy

The existing responsible disclosure policy remains at [`public/security/index.html`](public/security/index.html), with the standard [`security.txt`](public/.well-known/security.txt) contact. Security reports can be sent to `security@diehard.cards`.

## License

This project is proprietary. All source code, documentation, branding, logos, and other repository content are covered by the existing [LICENSE](LICENSE).

Copyright © 2026 Chris Lake. All rights reserved.
