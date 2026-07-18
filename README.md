# DieHardCards Website

Public landing page for **https://diehard.cards**.

This repository contains the static marketing and landing site for the DieHardCards platform. It is intentionally separate from the main DHC application to allow independent deployment and iteration.

---

## Hosting

The site is deployed using **Cloudflare Workers Static Assets** with **GitHub integration**.

Deployment workflow:

```text
Local Development
        │
        ▼
git commit
        │
        ▼
git push origin main
        │
        ▼
GitHub
        │
        ▼
Cloudflare Build
        │
        ▼
Automatic Deployment
        │
        ▼
https://diehard.cards
```

Every push to the `main` branch automatically triggers a new deployment.

---

## Repository Structure

```
public/
├── index.html
├── assets/
│   └── css/
│       └── styles.css
├── favicon.svg
├── robots.txt
└── sitemap.xml

wrangler.jsonc
README.md
.gitignore
```

---

## Local Development

From the repository root:

```bash
cd public
python3 -m http.server 8000
```

Browse to:

```
http://localhost:8000
```

---

## Production

Primary URL:

```
https://diehard.cards
```

Worker Preview:

```
https://diehardcards-www.clake99.workers.dev
```

---

## SEO

Included:

- favicon
- robots.txt
- sitemap.xml
- canonical URL
- Open Graph metadata
- Twitter Card metadata

---

## Future Enhancements

- Product screenshots
- Early Access signup
- Feature roadmap
- Hans Imaging section
- DHC application launch button (`app.diehard.cards`)
- Privacy Policy
- Terms of Service
- 404 page
- Web App Manifest
- Social sharing image

---

## License

This project is proprietary.

See the [LICENSE](LICENSE) file for details.

Copyright © 2026 Chris Lake.