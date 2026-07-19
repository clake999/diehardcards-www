# DieHardCards Website

## Overview

This repository contains the public marketing website for the DieHardCards platform at [diehard.cards](https://diehard.cards). The site is static, hosted on Cloudflare, deployed from GitHub, and intentionally lightweight so it can be maintained and shipped independently from the main DieHardCards application.

## Technology

- HTML5
- CSS3
- Cloudflare Worker Static Assets
- GitHub source control
- Cloudflare automatic deployments

The site uses no application framework, client-side library, or build system.

## Repository Structure

```text
public/
├── .well-known/
│   └── security.txt
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── icons/
│   │   ├── favicon and touch icons
│   │   └── manifest icons
│   └── images/
│       └── DieHardCards logo assets
├── security/
│   └── index.html
├── index.html
├── favicon.svg
├── robots.txt
├── site.webmanifest
└── sitemap.xml

LICENSE
README.md
wrangler.jsonc
```

Cloudflare serves the contents of `public/` as the website's static assets.

## Branding

Production web assets live under [`public/assets/`](public/assets/). The website uses the official DieHardCards branding, including the approved transparent logo and its responsive raster derivatives. Favicon, Apple Touch Icon, and manifest icon assets are generated from the approved logo and live under [`public/assets/icons/`](public/assets/icons/).

## Security

The website currently includes:

- A standard [`security.txt`](public/.well-known/security.txt) security contact
- A [responsible disclosure page](public/security/index.html)
- HTTPS
- Cloudflare edge protection
- Cloudflare Bot Fight Mode

Security reports can be sent to `security@diehard.cards`.

## Development

From the repository root, start a local static server:

```bash
python3 -m http.server 8000 --directory public
```

Then open [http://localhost:8000](http://localhost:8000).

## Deployment

The production deployment flow is:

```text
GitHub
   ↓
Cloudflare
   ↓
diehard.cards
```

Every push to the `main` branch automatically deploys the contents of `public/` through Cloudflare Worker Static Assets.

## License

This project is proprietary. All source code, documentation, branding, logos, and other repository content are covered by the existing [LICENSE](LICENSE). Public visibility does not grant permission to copy, modify, distribute, or reuse the project.

Copyright © 2026 Chris Lake. All rights reserved.

## Future Ideas

- About page
- Privacy Policy
- Terms of Service
- Product screenshots
- Hans hardware page
- Blog / Updates
