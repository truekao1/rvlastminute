# RVLastMinute

A small, fast, static directory of **RV rental dealers and depots** for people who need a vehicle **this weekend** or on a constrained trip. The site publishes **pickup hours** and **one-way** flags only when the operator’s own page says so, and points readers to peer-to-peer platforms for **live inventory**.

Brand name: **RVLastMinute**. The public URL in `src/_data/site.js` is `https://truekao1.github.io/rvlastminute`. The Eleventy path prefix is derived from that URL. Do not put a personal name on the site.

This is an independent directory, not an RV rental company, dealer, or booking marketplace.

## Where it lives

Project path: `/workspace/sites/rvlastminute`

Built files go to `dist/` and are published to GitHub Pages by `.github/workflows/pages.yml` on every push to `main`.

## How to build

```bash
npm install
npm run build        # writes dist/
npm start            # local preview
npm run check        # validates city JSON, builds, checks internal links and JSON-LD
```

The public base URL, contact mailbox, and affiliate links are all in one file: `src/_data/site.js`. Affiliate `url` values stay empty until a program issues a tracked link. Templates then fall back to each company’s public website and must not present that fallback as an affiliate URL. Individual depot pages are always plain public links.

## Data schema

Add a city by adding one file: `data/cities/<st>-<city>.json` (for example `data/cities/ca-los-angeles.json`). The nightly research checklist is in `scripts/new-city.md`. A starter file is in `scripts/city.template.json`.

Rules:

- Never invent a depot, hour, one-way policy, fee, phone, or flag.
- Every fact needs a public source URL and a `lastChecked` date.
- Record published hours for each day. Use `Not published` for a missing day; do not invent “Closed.” Use `Closed` only when the operator publishes it. Put the current season in the day fields and both seasons in `hours.notes` when the operator publishes seasonal tables.
- `oneWay` is true only when the operator’s public page says one-way rentals are offered, including this city or a network that includes this depot.
- `weekendHours` is true when Saturday or Sunday is published as open, including by appointment.
- `petFriendly` and `delivery` are true only when that operator’s page says so.
- Do not cache live inventory or current rental rates. If a price is quoted, label it “as listed on &lt;date&gt;.” Deep-link the operator’s page.
- If a site is down or a detail is unclear, leave the listing or the detail out.

## Launch content

- Home page
- Guide: “Need an RV this weekend? How to find a last-minute RV rental” (depot hours, one-way flags, and live inventory on peer-to-peer platforms)
- Los Angeles, CA — 8 verified dealers and depots (Cruise America, El Monte RV, Road Bear RV, Travellers Autobarn, Indie Campers, Native Campervans, roadsurfer, and RV Pirates), last checked November 18, 2026, with a Carson, Hawthorne, Inglewood, Santa Fe Springs, Agoura Hills, and Sun Valley focus
- Denver, CO — 9 verified dealers and depots (Cruise America, El Monte RV, Road Bear RV, Native Campervans, Indie Campers, VanCraft, roadsurfer, Titus Adventure Company, and Trailhead RV Rentals), last checked November 18, 2026, with a Frederick, Commerce City, Aurora, and northeast Denver focus

Denver is the second launch metro because official operator pages treat it as a high-demand gateway: Native Campervans’ Denver page says the company started there in 2015, and Cruise America’s Denver page says rental demand spikes around major events and recommends booking early. El Monte RV and Road Bear RV publish the same Commerce City street address on separate official pages; both are listed, with that shared address noted.

## Affiliate programs

Application drafts (not sent) live in `AFFILIATES.md`. Program pages with first-party terms:

- RVshare (primary): https://rvshare.com/affiliates
- Outdoorsy (secondary): a partner or API program exists, but no official page with a published commission was verified on November 18, 2026. Do not invent a rate.

Cruise America, El Monte RV, Road Bear RV, and local fleet links are plain public links, not affiliate offers.

## Stack

Eleventy 3 builds plain HTML, CSS, and a small vanilla JS filter into `dist/`. Pages are mobile-first, with unique titles and meta descriptions, canonical URLs, Open Graph tags, `sitemap.xml`, `robots.txt`, breadcrumbs, an affiliate disclosure, and JSON-LD (`WebSite` / `ItemList` on the home page; `CollectionPage` + `ItemList` + `LocalBusiness`, `FAQPage`, and `BreadcrumbList` on city pages; `Article` and `FAQPage` on the guide).
