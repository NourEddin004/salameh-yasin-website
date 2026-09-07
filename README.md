# Salameh Yasin — Portfolio

Static site. No build step, no dependencies. Open `index.html` or drop the folder
on any static host (GitHub Pages, Netlify, Cloudflare Pages).

```bash
python3 -m http.server 4173
```

## Structure

| File | Screen |
|---|---|
| `index.html` | Home — freelancer.com replica hero, services (wireframe block), proof, logo wall, testimonial, CTA |
| `about.html` | The two rails + full vertical timeline, credentials, languages |
| `developer.html` | Pillar 01 — teal accent. Progression strip, stack, role cards, project slots |
| `management.html` | Pillar 02 — graphite accent. Amman/Aqaba map, ownership panels, competencies |
| `consulting.html` | Pillar 03 — copper accent. Proof panel, tabbed services, engagement model, form |
| `experience.html` | Filterable archive of all 13 records |
| `contact.html` | Split form + direct details + slot picker |
| `assets/css/style.css` | Whole design system in one file, tokenised at `:root` |
| `assets/js/main.js` | Motion + interaction. No dependencies |

## Design system

Black and white.

- Paper `#FFFFFF` · raised `#FAFAFA` · ink `#0B0B0B` · graphite `#2E2E2E` · muted `#6E6E6E` · rule `#E4E4E4`
- Instrument Serif (display) · Inter (body) · JetBrains Mono (metadata)

The accent tokens (`--copper`, `--teal`) still exist but all resolve to ink, so
every accent reference and the per-page `data-accent` pillar coding keeps
working. **Restoring colour is a matter of changing those four values at the top
of `style.css`** — nothing else is hard-coded.

Two consequences of collapsing the accent to ink, both handled: elements that
sat accent-on-ink (the CTA band's button and eyebrow, the contact panel, the
calendar slots, the merged timeline card) invert to paper instead, and the
hero's two-tone headline uses `#8C8C8C` for its second line so the split still
reads.

## Where the inspiration landed

- **Hero (`index.html`) is a pixel replica of the freelancer.com hero**, measured
  off the live page at a 1440px viewport. Every reference value is documented in
  a comment block at the top of the hero section in `style.css`, so any change
  can be checked against the original. Verified element-by-element: headline
  block, sub-line, buttons, stat box, logo marquee, the 32px vertical text strip
  and both 266x343 tile columns all land at the reference coordinates.
  - The **layout** is the replica; the **palette** is this site's own. Freelancer's
    colour roles are mapped onto the tokens at the top of the `.fl-hero` block:
    accent 1 (their pink) becomes copper, accent 2 (their blue numerals) becomes
    teal, the ground becomes paper, hairlines become `--rule`. Changing a token
    changes the hero with it; no hard-coded colours remain.
  - The photography is replaced by placeholder tiles that keep the original's
    scroll animation (40s, columns running in opposite directions).
  - The client logo strip keeps its slot and its 20s left-scroll, carrying the
    organisations Salameh has worked for, set as wordmarks since no logo files
    exist for them.
  - The navbar is unchanged structurally; it just rides transparent over the dark
    hero and takes its normal paper treatment once the hero scrolls past.
- **Services is built to the supplied wireframes** — it leads `index.html` in place of the old three-pillar cards, and the same block also appears on `consulting.html`.
  A numbered rail on the left where the active row takes a fill and a copper bar,
  a hairline, and a two-column grid of six services on the right. Eighteen
  services across three practices:
  1. Development & Digital Transformation
  2. Training & Consultation
  3. Project Management

  Category 02 additionally carries the "What we train" block: three columns in
  order — Development (11), Training (6), Project management (8) — two tiles per
  column, 40px mark above the name.

### Skill logos

Development skills use the **real brand marks** from
[Simple Icons](https://simpleicons.org) (CC0), inlined as SVG — no external
request, no CDN dependency.

Marks sit bare at 40px — no tile, no border — rendered in ink to match the
black-and-white scheme. Each brand's official colour is kept as a comment beside
its rule in `style.css`, so colour can be restored per mark.

Nine of the eleven Development skills are real brand logos: PHP, JavaScript,
HTML5, CSS3, jQuery, MySQL, Magento, Linux, Apache. REST APIs and Web security
have none, and neither does anything under Project management or Training —
those are practices, not products, so no vendor publishes a mark for them. They
use line glyphs drawn to the same optical weight.

If a specific concept should carry a real mark instead (e.g. a Scrum.org or PMI
logo), say which and it can be swapped in.

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


## Palette consistency

Resolved. The hero was briefly on freelancer's dark palette; it now runs on the
site's own tokens, so all seven pages share one colour system. The hero's
geometry was re-verified against the reference after the recolour and is
unchanged.


## Note: the pillar pages

The home page's old "Three ways I work" cards were the only links to
`developer.html` and `management.html`. The services block replaced them, so
those two pages are now reachable only from the footer and the mobile drawer.
If they matter, the simplest fix is a row of three links under the services
block, or adding them to the main nav.

The services block currently appears on both `index.html` and
`consulting.html`, identically. Say the word and it can be dropped from one, or
the consulting page can carry a longer version.


## Navbar

Per the supplied navbar image: wordmark left, four icon links centred
(Development, Managing, Training, Consultation), outlined Contact button right.

`Training` has no page of its own — it points at `index.html#training`, which
opens the Training & Consultation category in the services block and scrolls to
it. The slugs are `#development`, `#training`, `#project-management`.

`About` and `Work` are no longer in the top nav; both are still in the footer
and the mobile drawer.
