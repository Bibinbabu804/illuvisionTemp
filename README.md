# Illuvision — Phase 01 frontend

Next.js 16 (App Router, JavaScript). Frontend only — no backend, database or API.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## Structure

| Path | What it holds |
| --- | --- |
| `app/` | Routes: `/`, `/screens`, `/screens/[slug]`, `/advertise`, `/contact`, `/privacy`, `/terms`, `sitemap.xml`, `robots.txt`. `/home` redirects to `/`. |
| `app/globals.css` | Design system tokens (colour, type, spacing, motion), buttons, forms, reveal animations, breakpoints. |
| `app/home/HomeBanner.jsx` | Homepage hero. |
| `components/layout` | Header (sticky + mobile menu), footer, logo, brand intro. |
| `components/home` | Homepage sections. |
| `components/products` | Product card, category card, listing/filter, gallery, purchase panel. |
| `components/advertise` | Ad intro, network map (lazy-loaded), budget planner, how-it-works, enquiry section. |
| `components/forms/EnquiryForm.jsx` | Shared advertising / product quote / contact form. |
| `data/` | **All content lives here**, separate from UI: `site.js` (company info, feature flags, FAQs), `catalog.js`, `network.js`, `planner.js`, `media.js`. |
| `lib/` | Analytics (`track`), enquiry submit + validation, SEO helpers, planner session store, image loader. |
| `components/motion` | Smooth scroll (Lenis), cursor follower, magnetic buttons, parallax, scroll-filled text, velocity marquee, lazy background video. |
| `public/videos` | Supplied clips from `assets/videos` (served copies) + poster frames. Mapped in `data/media.js` → `videos`. |
| `assets/images/STOCK_IMAGES.md` | List of temporary stock photos and how to replace them. |

## Sample content and pending integrations

- **Products, categories and map locations are sample data** (flagged `sample: true` / `isSample`). The UI labels them; sample product pages are `noindex` and excluded from the sitemap; no Product schema is emitted for them.
- **Forms run in preview mode** — they validate and confirm on screen but send nothing. Set `NEXT_PUBLIC_ENQUIRY_ENDPOINT` to an existing form service (JSON POST) to connect them.
- **Planner** collects a brief only; `plannerRules` in `data/planner.js` is `null` until rates and rules are approved.
- **Analytics**: `lib/analytics.js` pushes events to `window.dataLayer` / `gtag` if a provider is added.
- **Site URL** for canonical/OG/sitemap: set `NEXT_PUBLIC_SITE_URL`.
- Feature flags in `data/site.js`: `networkParticipation`, `publicPricing`, `checkout`, `about`.

## Motion & performance notes

- **Lenis** smooths mouse/trackpad scrolling only; touch devices keep native scrolling. Nested scroll areas use `data-lenis-prevent`. Off for reduced motion.
- **Motion** (`motion/react`) drives scroll-linked effects with transforms/opacity only. Pinned horizontal products run at ≥1024px only; tablets/phones get a native swipe row.
- Videos are muted, loop, load only near the viewport and pause off-screen. Phones get the portrait clip in the hero.
- **To do before launch:** the clips are 3–6 MB each at 720p H.264. Re-encode (e.g. 720p, CRF 28, no audio, plus a WebM/AV1 version) to cut weight by roughly half or more.
