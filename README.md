# Salameh Yasin — Portfolio

Static site. No build step, no dependencies. Open `index.html` or drop the folder
on any static host (GitHub Pages, Netlify, Cloudflare Pages).

```bash
python3 -m http.server 4173
```

## Structure

| File | Screen |
|---|---|
| `index.html` | Home — hero, stat band, three pillars, proof, two-lane timeline, logo wall, CTA |
| `about.html` | The two rails + full vertical timeline, credentials, languages |
| `developer.html` | Pillar 01 — teal accent. Progression strip, stack, role cards, project slots |
| `management.html` | Pillar 02 — graphite accent. Amman/Aqaba map, ownership panels, competencies |
| `consulting.html` | Pillar 03 — copper accent. Proof panel, tabbed services, engagement model, form |
| `experience.html` | Filterable archive of all 13 records |
| `contact.html` | Split form + direct details + slot picker |
| `assets/css/style.css` | Whole design system in one file, tokenised at `:root` |
| `assets/js/main.js` | Motion + interaction. No dependencies |

## Design system

Editorial consulting report crossed with a developer's notebook — per the build
brief, deliberately *not* a dark-mode neon tech portfolio.

- Paper `#FAF7F2` · raised `#FCFBF9` · ink `#14110F` · muted `#6B6560` · rule `#E2DBD1`
- Pillar coding: Developer **teal** `#0F5257` · Management **graphite** `#3A3A38` · Consulting **copper** `#B4530A`
- Instrument Serif (display) · Inter (body) · JetBrains Mono (metadata)
- Accent colours appear on rules, numerals and hover states only — never as a background wash

Pillar accents are set per page with `<body data-accent="teal|graphite|copper">`,
which reassigns `--accent`. Nothing else needs to change.

## Where the inspiration landed

- **Hero** follows freelancer.com's structure — decisive headline, dual CTA
  (primary + recruiter path), visual anchor at right, trust marquee and big
  numbers immediately below the fold.
- **Services** follows vardot.com's tabbed pattern — the eight service lines are
  grouped into three tabs by what the client is trying to do, rather than being
  dumped as a flat eight-card grid.

## Animation

All motion respects `prefers-reduced-motion` and degrades to static. Includes:
scroll progress hairline, nav shrink, headline mask reveal, portrait parallax
with a drawn offset rule, stat count-up, section rule draws, card hover rules,
paused-on-hover logo marquees, SVG rail draw-in with staggered nodes, a vertical
spine that fills with scroll, animated tab indicator, filter transitions, and a
radial glow on the CTA band.

## Before this goes live

Blocking (from the build brief, §12):

1. **Portrait** — drop a 1600px+ image at `assets/img/portrait.jpg`. Until then a
   typographic placeholder renders automatically. Nothing else to change.
2. **CV PDF** — drop at `assets/Salameh-Yasin-CV.pdf` to activate the download button.
3. **Testimonials** — two to four, with permission. Slots are built and styled on
   `index.html` and `consulting.html`.
4. **PMP / Agile / Scrum certificate numbers** and verification links. Currently
   stated as claimed, without evidence, on `about.html`.
5. **What has he shipped in the last three years?** The developer stack is
   evidenced only to 2016. It is currently framed as "engineering foundation"
   (past tense, deliberately). If he is still shipping, that page should change.
6. **Is he taking clients right now?** The whole CTA strategy assumes yes.
7. **Named projects** — three to six, with a measurable result. Slots wait on
   `developer.html`.
8. **Engagement rates / lengths** — `consulting.html` says "to be confirmed".

Also worth fixing regardless of the site: his LinkedIn headline reads
"Tranformation" and "Business Enterprers". Both are live and public right now.

## Form handling

Both forms compose a `mailto:` to `salameh.yasin@yahoo.com` — no backend, and the
UI says so rather than faking a success state. To collect submissions properly,
point the `submit` handler in `assets/js/main.js` at a form endpoint.

## Content provenance

Every claim on the site traces to the LinkedIn profile export. Note that USAID,
UNHCR, Arab Potash and the Prime Ministry were **training clients delivered
through MLC in 2007–2008**, not employers — the logo wall labels them
"Trained teams at" for exactly this reason. Keep that distinction.
