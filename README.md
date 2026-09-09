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

White, black and red — red is a primary, not an accent.

- Paper `#FFFFFF` · raised `#FAFAFA` · ink `#0B0B0B` · graphite `#2E2E2E` · muted `#6E6E6E` · rule `#E4E4E4`
- Red `#D42A20` — 5.06:1 on white, and white-on-red is the same, so it is safe
  as text and carries white button labels
- Red on ink `#FF6B5E` — `#D42A20` only reaches 3.89:1 on the ink ground, so
  dark panels use the lighter red instead (7.05:1)
- Instrument Serif (display) · Inter (body) · JetBrains Mono (metadata)

**Measure.** One pair of tokens sets the width of everything: `--wrap: 1440px`
and `--gutter: 12px` (16px below 700px). The nav, every section and the footer
all read them, so content runs 12→1428 at a 1440 viewport and nothing is inset
relative to anything else. The hero and services blocks used to hardcode this;
they now read the tokens too, so there is a single place to change it.

Red runs through four tokens. `--copper` and `--teal` carry the decorative uses
— every eyebrow, section number, tag, chip, step marker, map pin and pillar
reference. `--action` carries interaction — primary buttons, the active services
row, hover, focus, `::selection`, form focus. `--action-dark` covers anything
sitting on an ink panel.

Where it shows: the hero headline sets "Technical" in black over "Capability."
in red, the stat numerals are red, the nav Contact reads red at rest, the CTA
band's button is red, and the experience filters and calendar slots fill red
when active.

Changing `--copper`, `--teal` and `--action` together recolours the whole site.
Setting all three to `var(--ink)` returns it to pure black and white.

### Cache busting

`style.css` and `main.js` are linked with `?v=2`. **Bump that number on every
page whenever either file changes** — without it a browser will happily keep
running an old copy and the site will look half-updated.

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
  order — Development (11), Training (6), Project management (8) — divided by
  hairlines, two tiles per column, 40px mark above the name.

  The vertical rule sits hard against the rail with the whole gutter on the card
  side, and the skill columns stretch to a common height so their dividers line
  up.

### Skill logos

The nine Development marks are the **real full-colour brand logos**, taken from
[devicon](https://devicon.dev) and served from `assets/img/logos/` (56KB total):

| Mark | Colours |
|---|---|
| PHP | `#777BB3` with the wordmark gradient |
| JavaScript | `#F0DB4F` square, `#323330` letters — the true two-tone mark |
| HTML5 | `#E44D26` / `#F16529` shield |
| CSS3 | `#1572B6` / `#33A9DC` shield |
| jQuery | `#0868AC` |
| MySQL | `#00618A` dolphin |
| Magento | `#F26322` |
| Apache | `#BD202E` feather with gradients |
| Linux | full-colour Tux |

They are files rather than inline SVG for one reason: Tux as full-colour SVG is
a 194KB illustration, far too heavy to inline on two pages. It ships as a 96px
PNG (8KB) instead; the other eight stay SVG and scale cleanly.

The marks carry their own colours, so no CSS tints them. **The remaining
sixteen entries have no official logo** — REST APIs, Web security and everything
under Training and Project management are practices, not products. Those stay as
drawn line glyphs in ink.

## Hero tile images

Ten full-colour 3:4 photographs, ~473KB total. The columns are `display:none`
below 1180px, so the images carry `data-src` and `main.js` attaches the real
`src` only when the wide media query matches — small screens download none of
it. That means no hero imagery without JavaScript, which is an acceptable trade
for decorative tiles; the hero's text, stats and CTA are all in the HTML.

## Animation

All motion respects `prefers-reduced-motion` and degrades to static. Includes:
scroll progress hairline, nav shrink and dark/paper hand-off, headline mask
reveals, the hero's opposed-direction tile columns and vertical text strip,
stat count-up, section rule draws, card hover rules,
paused-on-hover logo marquees, SVG rail draw-in with staggered nodes, a vertical
spine that fills with scroll, animated tab indicator, filter transitions, and a
radial glow on the CTA band. Hero tiles lift and scale under the cursor, and
hovering a column pauses its scroll so a photograph can be looked at.

## Before this goes live

Blocking (from the build brief, §12):

1. **Hero imagery is stock, not his.** The ten tiles in `assets/img/hero-*.jpg`
   are Unsplash photographs (free licence, commercial use permitted), in their
   own colours and cropped to 3:4. They are deliberately atmospheric — screens,
   whiteboards, workspaces, a full lecture room — and **not** posed groups, so
   nothing implies these are his cohorts or his classrooms. Replace them with
   real Orange / Upskills / HTU photography when it exists: same filenames, same
   532x686 source, nothing else to change.
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

## Contact dialog

Every "Contact" / "Book a consultation" link still points at `contact.html`, so
it works with JavaScript off and stays a real, linkable, shareable page. With
JavaScript on, `main.js` intercepts the click and opens the same form in a
native `<dialog>` — which brings focus trapping, Esc, backdrop inertness and
scroll locking for free rather than hand-rolled. Modified clicks (cmd/ctrl,
middle button) still open the page in a new tab.

The dialog markup is built in JS rather than pasted into seven files, so there
is one copy to maintain. Its form carries the class `.enquiry-form` and shares
the submit handler with the page form.

## Form handling

Both forms compose a `mailto:` to `salameh.yasin@yahoo.com` — no backend, and the
UI says so rather than faking a success state. To collect submissions properly,
point the `submit` handler in `assets/js/main.js` at a form endpoint. The handler
walks `FormData`, so adding or renaming a field needs no JS change.

Fields: Name, Email, what you are building and the service picker are required;
Organisation is optional and labelled as such. The budget dropdown is gone —
enquiries now say which of the three practices they need instead.

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
