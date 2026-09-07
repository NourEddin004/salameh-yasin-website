# Salameh Yasin — Portfolio

Static site. No build step, no dependencies. Open `index.html` or drop the folder
on any static host (GitHub Pages, Netlify, Cloudflare Pages).

```bash
python3 -m http.server 4173
```

## Structure

| File | Screen |
|---|---|
| `index.html` | Home — freelancer.com replica hero, three pillars, proof, two-lane timeline, logo wall, CTA |
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

- **Hero (`index.html`) is a pixel replica of the freelancer.com hero**, measured
  off the live page at a 1440px viewport. Every reference value is documented in
  a comment block at the top of the hero section in `style.css`, so any change
  can be checked against the original. Verified element-by-element: headline
  block, sub-line, buttons, stat box, logo marquee, the 32px vertical text strip
  and both 266x343 tile columns all land at the reference coordinates.
  - It keeps freelancer's own palette (`#12151B` ground, `#E60278` pink,
    `#29B2FE` numerals) rather than the paper/copper system used by the other six
    pages. **This is a deliberate instruction, not an oversight** — see the note
    at the bottom of this file.
  - The photography is replaced by placeholder tiles that keep the original's
    scroll animation (40s, columns running in opposite directions).
  - The client logo strip keeps its slot and its 20s left-scroll, carrying the
    organisations Salameh has worked for, set as wordmarks since no logo files
    exist for them.
  - The navbar is unchanged structurally; it just rides transparent over the dark
    hero and takes its normal paper treatment once the hero scrolls past.
- **Services** follows vardot.com's tabbed pattern — the eight service lines are
  grouped into three tabs by what the client is trying to do, rather than being
  dumped as a flat eight-card grid.

## Animation

All motion respects `prefers-reduced-motion` and degrades to static. Includes:
scroll progress hairline, nav shrink and dark/paper hand-off, headline mask
reveals, the hero's opposed-direction tile columns and vertical text strip,
stat count-up, section rule draws, card hover rules,
paused-on-hover logo marquees, SVG rail draw-in with staggered nodes, a vertical
spine that fills with scroll, animated tab indicator, filter transitions, and a
radial glow on the CTA band.

## Before this goes live

Blocking (from the build brief, §12):

1. **Hero imagery** — the two scrolling columns are placeholder tiles. Swap each
   `.fl-tile` for an `<img>` at 266x343 once real photography exists (project
   shots, cohort/campus photos, a portrait). The scroll animation needs no change.
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


## Open question: the home page palette

The hero on `index.html` uses freelancer.com's dark palette, as requested. The
other six pages use the warm paper / copper editorial system from the build
brief. Right now the site changes character between the home page and everything
else.

Two ways to resolve it, whichever is wanted:

1. **Recolour the hero** to the paper/copper tokens. The layout stays pixel-exact;
   only the six colour values in the `.fl-hero` block change. Roughly a ten-minute
   job.
2. **Carry the dark treatment through the whole site.** A much larger change — it
   means re-tokenising every page and revisiting the brief's typography, since the
   brief argues explicitly against a dark "tech portfolio" look for a senior
   consultant.
