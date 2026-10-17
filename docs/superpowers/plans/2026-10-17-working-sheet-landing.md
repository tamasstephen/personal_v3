# Working Sheet Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current landing (3D "Structure → Clarity" hero, black toolkit card) with the Paper "Working Sheet" design: featured-project accordion, plain tech-stack section, light/dark themes, and quiet directional motion.

**Architecture:** Still a static site: `index.html` + `styles.css` + one small vanilla-JS bundle. Pure logic (theme resolution, accordion state) lives in `site-model.mjs` and is unit-tested with `node --test`. `site.js` wires the DOM and is bundled by esbuild into `site.bundle.js`. The whole motion/clarity stack (`motion.js`, `motion-model.mjs`, `motion.css`, `motion.bundle.js`, `tests/motion.test.mjs`) is deleted.

**Tech Stack:** HTML, CSS (`light-dark()`, subgrid, `color-scheme`), vanilla JS with JSDoc types (`tsc -p jsconfig.json`), esbuild, node:test, Playwright (Chrome), Paper MCP for asset export.

**Spec:** `docs/superpowers/specs/2026-10-17-working-sheet-landing.md` (+ JSX snapshots in `docs/superpowers/specs/paper/`)

## Global Constraints

- Content max width `1120px`, centered. Gutters: `32px` at 768–1023px, `20px` below 768px. Desktop layout from `1024px`.
- Sheet rules (vertical 1px lines) sit `32px` outside content on desktop, `24px` on tablet, `12px` on mobile. Section rules extend to them; crop marks (17×17) center on the rule/section-rule crossing.
- Light tokens: background `#FFFFFF`, surface `#F7F7F7`, text `#000000`, text-secondary `#666666`, border `#EAEAEA`, primary `#0070F3`, continuation `#8A8A8A`, action `#000000`, on-action `#FFFFFF`, action-hover `#262626`.
- Dark tokens: background `#0A0A0A`, surface `#151515`, text `#F5F5F5`, text-secondary `#B0B0B0`, continuation `#8A8A8A`, primary `#70AEFF`, border `#303030`, action `#F5F5F5`, on-action `#0A0A0A`.
- Type scale (px): 12 / 13 / 14 / 16 / 20 / 24 / 32 / 48 / 72. Hero 72/76 bold, tracking `-0.04em`; mobile hero 48/52. Mono labels 12px, tracking `0.08em`, uppercase.
- Radii: control `6px`, panel `8px`. Interactive targets ≥ `44px`.
- Focus ring: `outline: 2px solid var(--color-primary); outline-offset: 2px` — shows immediately, never transitioned.
- Theme storage key: `localStorage['theme']`, values `'light' | 'dark'` only.
- Toggle copy: visible `Dark` / `Light`; `aria-label` `Switch to dark mode` / `Switch to light mode`.
- Copy is verbatim from the Paper snapshots (hero, project descriptions, stack, experience, contact, footer).
- No production JS dependencies. No `any`, no casts; JSDoc types must pass `npm run typecheck`.
- Mono font is the existing self-hosted IBM Plex Mono; sans is the existing Inter variable WOFF2.

## Review Focus

1. **`localStorage` throws or is blocked** (Safari private mode, blocked site data) → page loads, toggle still switches theme for the session, no console error. Test in Task 4.
2. **Rapid project switching** (click Stephen Beratung, then The Curator's Path before the 240ms transition ends) → exactly one panel open, every button's `aria-expanded` matches its panel. Test in Task 3.
3. **JavaScript disabled** → all text visible (no reveal opacity 0), CV Peers preview visible, other panels collapsed, theme toggle not shown, system dark preference still applies. Test in Task 2 (layout) and Task 4 (theme).
4. **Stored choice vs. system preference** → stored `light` beats system dark, and a later system change does not override an explicit choice. Test in Task 4.
5. **Keyboard-only use of the accordion** → Tab reaches each project button, Enter and Space toggle it, focus stays on the button, the domain link is a separate tab stop. Test in Task 3.

---

### Task 1: Project preview assets

**Files:**
- Create: `assets/work/cv-peers-dialog.webp`, `assets/work/cv-peers-page.webp`, `assets/work/stephen-beratung.webp`, `assets/work/curators-path.jpg`
- Create: `scripts/capture-curators-path.mjs`

**Interfaces:**
- Produces: the four files above, used by Task 2. Display sizes: dialog `320×381`, A4 page `250×353`, site cards `560px` wide.

- [ ] **Step 1: Export CV Peers artwork from Paper** — file `01M5482GHXH0PQB3DY2BYWG3DY`, desktop light artboard, frame "CV Peers product preview": export child "Work experience dialog" and child "A4 page" separately, `format: "webp"`, `scale: "2x"`. Exporting the pieces (not the whole panel) lets the panel background follow the theme while the artwork keeps its look.
- [ ] **Step 2: Export Stephen Beratung** — file `01M51K2PQP5EE2STHM6M2GVGH5`, page "Landing Concept" (`p-2-0`), artboard "Stephen Beratung — Laptop Hero · 1280", `format: "webp"`, `scale: "1120w"`.
- [ ] **Step 3: Write `scripts/capture-curators-path.mjs`** — Playwright `chromium.launch({ channel: 'chrome' })`, viewport `1280×800`, `deviceScaleFactor: 1`, goto `https://staging.tamasstephen.com`, wait for `networkidle`, screenshot `{ type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: 1280, height: 800 } }` to `assets/work/curators-path.jpg`. Run it with `node scripts/capture-curators-path.mjs`.
- [ ] **Step 4: Verify** — Run `file assets/work/*`. Expected: three `RIFF … Web/P image` files (dialog 640 px wide, page 500 px wide, SB 1120 px wide) and one `JPEG image data … 1280x800`. Look at each image and confirm it shows the right product with no cut-off UI.
- [ ] **Step 5: Commit**

```bash
git add assets/work scripts/capture-curators-path.mjs
git commit -m "Add project preview artwork for the work accordion"
```

---

### Task 2: Working Sheet markup and layout (light theme, static)

Replaces the page content and styles, removes the clarity animation, and gets the light layout pixel-close at 1440 / 768 / 390. The accordion is static here: CV Peers open, others closed, buttons not wired yet.

**Files:**
- Modify: `index.html` (body rewritten; head keeps SEO/JSON-LD, drops `motion.css`/`motion.bundle.js`)
- Modify: `styles.css` (rewritten)
- Modify: `package.json` (`bundle`, `build` scripts)
- Modify: `tests/site.spec.js` (rewritten)
- Delete: `motion.js`, `motion-model.mjs`, `motion.css`, `motion.bundle.js`, `tests/motion.test.mjs`

**Interfaces:**
- Consumes: Task 1 assets.
- Produces (DOM contract used by Tasks 3–5):
  - `<html class="no-js">` (Task 4's head script swaps it to `js`).
  - Theme button `<button class="theme-toggle" type="button" hidden>Dark</button>` in the nav.
  - Each project: `<article class="project" data-project="cv-peers|stephen-beratung|curators-path" data-open="true|false">` containing `.project-header` with `<h3><button class="project-toggle" aria-expanded aria-controls="panel-{id}">` (index number, title, description, `.project-icon`), a sibling `<a class="project-domain">`, and `<div class="project-panel" id="panel-{id}">`.
  - Sections carry `data-reveal`; hero eyebrow / headline / intro / actions carry `data-arrival="0|1|2"` (headline and eyebrow share `0`).
- [ ] **Step 1: Rewrite `tests/site.spec.js` with failing layout tests**

```js
for (const viewport of [{ width: 1440, height: 1000 }, { width: 1024, height: 768 }, { width: 768, height: 1024 }, { width: 390, height: 844 }, { width: 320, height: 700 }]) {
  test(`working sheet layout at ${viewport.width}px`, async ({ page }) => {
    // h1 text 'I build clear interfaces.'; no horizontal overflow; no page errors
    // 3 .project; only [data-project="cv-peers"] has data-open="true"
    // #panel-cv-peers visible; #panel-stephen-beratung and #panel-curators-path not visible
    // .project-domain hrefs: https://cvpeers.com, https://stephenberatung.at, https://staging.tamasstephen.com
    // 4 experience rows, each with a non-empty summary paragraph
    // email link href 'mailto:hello@tamasstephen.com'
  });
}
test('cv peers mobile preview is form-only', ...)          // 390px: dialog img visible, page img not visible
test('desktop domain link sits beside the title', ...)     // 1440px: domain box top within title row; 768px: domain top > description bottom
test('content is complete without JavaScript', ...)        // javaScriptEnabled:false: every [data-reveal] and [data-arrival] has opacity 1; .theme-toggle hidden; #panel-cv-peers visible
test('skip link and internal anchors', ...)                // keep existing test body
test('explore my work targets selected work', ...)         // click 'Explore my work' → URL ends with #work
```

- [ ] **Step 2: Run to verify failure** — `npm run test:browser`. Expected: FAIL (no `.project` elements, 3D hero still present).
- [ ] **Step 3: Rewrite `index.html` body** from `docs/superpowers/specs/paper/desktop-1440.jsx` order: sheet rules, nav (TS + "Tamás Stephen", Work / Tech stack / Experience / Contact ↗, theme toggle), hero, `#work`, `#stack`, `#experience`, `#contact`, footer with "Back to top ↑" → `#top`. Nav "Contact ↗" links `#contact`; at <1024px the nav shows only "Contact ↗" + toggle (see tablet/mobile snapshots). Images: `width`/`height` attributes set, `loading="lazy"` on all but CV Peers, `decoding="async"`. Alt text:
  - dialog: `CV Peers editor showing the Edit work experience form`
  - page: `Live A4 resume preview updating beside the form`
  - SB: `Stephen Beratung homepage hero`
  - Curator: `The Curator's Path homepage`
  Panel labels (mono, bottom-left, `aria-hidden="true"`): CV Peers `RESUME BUILDER / EDIT / PREVIEW / EXPORT` (from Paper); SB `COUNSELING PRACTICE / TRUST / CLARITY / CONTACT`; Curator `TOUR GUIDE / DISCOVER / DETAILS / BOOK` (the last two are new copy; flag them in the PR description for the owner to confirm).
  Update JSON-LD/meta only if copy changed (the description string stays).
- [ ] **Step 4: Rewrite `styles.css`.** Tokens on `:root` as `light-dark(<light>, <dark>)` pairs using the Global Constraints values, with `color-scheme: light dark` on `:root`, `:root[data-theme="light"] { color-scheme: light }`, `:root[data-theme="dark"] { color-scheme: dark }`. (Dark values go in now so Task 4 only adds the switch.) Layout values come from the three JSX snapshots. Decisions the snapshots don't make:
  - Page padding: `padding-inline: max(var(--gutter), (100% - 1120px) / 2)`; `--gutter` 32px ≥768, 20px below; `--sheet-offset` 32 / 24 / 12px.
  - `.project-header`: grid `48px minmax(0,1fr) 224px 44px` on desktop. `.project-toggle` spans all columns with `grid-template-columns: subgrid`, leaving column 3 empty. `.project-domain` sits in column 3 row 1 with `position: relative; z-index: 1`. Below 1024px: columns `48px minmax(0,1fr) 44px` and the domain goes to row 2, column 2. Below 768px the index column is dropped.
  - `.project-panel`: `display: grid; grid-template-rows: 1fr` when `[data-open="true"]`, `0fr` + `opacity: 0` + `visibility: hidden` when false. Inner wrapper `min-height: 0; overflow: hidden`. Surface box: height 440px (≥768) / 421px (<768), `var(--color-surface)`, 1px border, radius 8px. Artwork sits absolutely positioned per the snapshot (desktop dialog left 250px, top 28px), and the composition centers as the panel grows. SB/Curator: one card 560px wide (max `100% - 48px`), centered, top 28px, radius 6px, shadow `#00000012 0 8px 20px`, clipped by the panel. A4 page `display: none` below 768px.
  - `.project-icon`: 18px plus drawn with two 1.5px bars; the vertical bar is `rotate(90deg)` when open (makes −).
  - Text links: underline via `text-decoration-color` transitioning from transparent, 180ms.
  - `html { scroll-behavior: smooth }` only inside `@media (prefers-reduced-motion: no-preference)` (instant anchor jumps otherwise).
  - Keep the existing `@font-face` blocks; delete all `.clarity-*`, `.toolkit`, `.hero-visual` rules.
- [ ] **Step 5: Update `package.json` scripts** — `bundle`: `esbuild site.js --bundle --format=iife --target=es2022 --outfile=site.bundle.js`; `build`: replace `motion.css`/`motion.bundle.js` with `site.bundle.js`, add `mkdir -p dist/assets/work && cp assets/work/* dist/assets/work/`. Create an empty-but-valid `site.js` (`// wired in Task 3`) so the bundle builds. Delete the five motion files.
- [ ] **Step 6: Run tests** — `npm run test:browser && npm run lint && npm run typecheck && npm run build`. Expected: all PASS, `dist/` contains `assets/work/` and `site.bundle.js`.
- [ ] **Step 7: Visual check against Paper** — `npm run dev`, screenshot full page at 1440, 768 and 390 (`npx playwright screenshot --full-page …`), compare side by side with the Paper artboards via `get_screenshot`. Fix spacing/alignment drift > 4px before committing.
- [ ] **Step 8: Commit**

```bash
git add -A index.html styles.css package.json site.js site.bundle.js tests/site.spec.js
git commit -m "Replace clarity hero with Working Sheet layout to lead with real project work"
```

---

### Task 3: Project accordion behavior

**Files:**
- Create: `site-model.mjs`, `tests/site-model.test.mjs`
- Modify: `site.js`, `styles.css` (transitions), `tests/site.spec.js`

**Interfaces:**
- Consumes: Task 2 DOM contract.
- Produces: `export function getNextOpenProject(currentId: string | null, clickedId: string): string | null` in `site-model.mjs`; `site.js` function `initProjects(root: ParentNode): void`.

- [ ] **Step 1: Write failing unit tests** in `tests/site-model.test.mjs` (node:test + `node:assert/strict`):

```js
test('opens a closed project', () => assert.equal(getNextOpenProject('cv-peers', 'curators-path'), 'curators-path'));
test('closes the open project', () => assert.equal(getNextOpenProject('cv-peers', 'cv-peers'), null));
test('opens from all-closed', () => assert.equal(getNextOpenProject(null, 'stephen-beratung'), 'stephen-beratung'));
```

- [ ] **Step 2: Run** `npm test` → FAIL (module not found).
- [ ] **Step 3: Implement `getNextOpenProject`** in `site-model.mjs`.
- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Add failing browser tests** to `tests/site.spec.js`:

```js
test('opening a project closes the others', ...)   // click SB toggle → SB data-open=true, aria-expanded=true; cv-peers false/false
test('rapid switching leaves exactly one open', ...) // click SB then Curator with no wait → exactly one [data-open="true"] (curators-path); every toggle's aria-expanded === its article's data-open
test('clicking the open project closes it', ...)    // click cv-peers toggle → zero open
test('keyboard toggles and keeps focus', ...)        // focus SB toggle; Enter → open; Space → closed; toggle still focused; Tab → focus moves to SB .project-domain
test('reduced motion opens instantly', ...)          // emulateMedia reducedMotion reduce; computed transition-duration of .project-panel is '0s'
```

- [ ] **Step 6: Run** `npm run test:browser` → new tests FAIL.
- [ ] **Step 7: Implement `initProjects(root)`** in `site.js`: one delegated `click` listener on the `#work` section; derive the current open id from the DOM (`[data-open="true"]`), call `getNextOpenProject`, then write `data-open` + `aria-expanded` for every project in one pass. Call `initProjects(document)` at module top level. Add the CSS transitions: open `grid-template-rows 240ms ease-out, opacity 240ms ease-out, visibility 0s`; closed `180ms ease-out` with `visibility 0s 180ms`; icon bar `transform` with the matching durations; all set to `0s` under `prefers-reduced-motion: reduce`.
- [ ] **Step 8: Run** `npm test && npm run test:browser && npm run typecheck` → PASS.
- [ ] **Step 9: Commit**

```bash
git add site-model.mjs site.js site.bundle.js styles.css tests/site-model.test.mjs tests/site.spec.js
git commit -m "Make selected work an accordion so one project preview is in focus at a time"
```

---

### Task 4: Light/dark theme switching

**Files:**
- Modify: `site-model.mjs`, `tests/site-model.test.mjs`, `site.js`, `index.html` (inline head script, `theme-color` metas), `styles.css` (crossfade), `tests/site.spec.js`

**Interfaces:**
- Consumes: `.theme-toggle`, the `light-dark()` tokens from Task 2.
- Produces in `site-model.mjs`:
  - `/** @typedef {'light' | 'dark'} Theme */`
  - `resolveTheme({ storedTheme, prefersDark }: { storedTheme: unknown, prefersDark: boolean }): Theme`
  - `getOppositeTheme(theme: Theme): Theme`
  - `getToggleLabel(theme: Theme): { text: 'Dark' | 'Light', ariaLabel: string }` (labels describe the *next* theme)
- Produces in `site.js`: `initThemeToggle(button: HTMLButtonElement): void`.

- [ ] **Step 1: Write failing unit tests:**

```js
test('stored dark wins over light system', () => assert.equal(resolveTheme({ storedTheme: 'dark', prefersDark: false }), 'dark'));
test('stored light wins over dark system', () => assert.equal(resolveTheme({ storedTheme: 'light', prefersDark: true }), 'light'));
test('no stored value follows system', () => assert.equal(resolveTheme({ storedTheme: null, prefersDark: true }), 'dark'));
test('invalid stored value follows system', () => assert.equal(resolveTheme({ storedTheme: 'sepia', prefersDark: false }), 'light'));
test('label offers the other theme', () => assert.deepEqual(getToggleLabel('light'), { text: 'Dark', ariaLabel: 'Switch to dark mode' }));
test('label in dark', () => assert.deepEqual(getToggleLabel('dark'), { text: 'Light', ariaLabel: 'Switch to light mode' }));
```

- [ ] **Step 2: Run** `npm test` → FAIL.
- [ ] **Step 3: Implement the three functions.**
- [ ] **Step 4: Run** `npm test` → PASS.
- [ ] **Step 5: Add failing browser tests:**

```js
test('follows system dark on first visit', ...)          // emulateMedia colorScheme dark → html[data-theme="dark"]; body background rgb(10, 10, 10); toggle text 'Light'
test('explicit choice persists across reload', ...)       // click toggle (light→dark), reload → data-theme dark; localStorage.theme === 'dark'
test('stored light beats system dark', ...)               // addInitScript sets localStorage.theme='light'; colorScheme dark → data-theme light
test('system change does not override explicit choice', ...) // choose dark, emulateMedia colorScheme light → still dark
test('works when localStorage throws', ...)               // addInitScript: Object.defineProperty(window,'localStorage',{get(){throw new DOMException('blocked','SecurityError')}}); toggle switches theme; no pageerror
test('no-JS honors system dark', ...)                     // javaScriptEnabled false + colorScheme dark → body background rgb(10, 10, 10); toggle hidden
```

- [ ] **Step 6: Run** `npm run test:browser` → new tests FAIL.
- [ ] **Step 7: Implement.**
  - Inline `<script>` as the first child of `<head>`. It swaps `no-js`→`js` and sets `data-theme` from `localStorage.theme` (inside try/catch) or `matchMedia('(prefers-color-scheme: dark)')`. It has to stay inline and duplicate `resolveTheme`'s rule to avoid a flash of the wrong theme. Comment that the rule mirrors `resolveTheme` in `site-model.mjs`.
  - `initThemeToggle`: removes `hidden`, applies `getToggleLabel` from the current `data-theme`. On click: compute the opposite theme, set `data-theme`, write `localStorage` in try/catch (log `console.warn` with context on failure, don't throw), update the label. No system-change listener: an explicit choice is final, and with no choice the media query in CSS already follows the system.
  - Crossfade: `transition: background-color 180ms, color 180ms, border-color 180ms` on `body` and bordered elements, applied only while `html.theme-transition` is present (add on click, remove after 180ms) so theme load and hover states aren't affected. Disabled under reduced motion.
  - Replace `<meta name="theme-color">` with two metas: `media="(prefers-color-scheme: light)"` `#ffffff` and `media="(prefers-color-scheme: dark)"` `#0a0a0a`.
- [ ] **Step 8: Run** `npm test && npm run test:browser && npm run typecheck && npm run lint` → PASS. Screenshot dark at 1440 and compare with Paper "Working Sheet — Dark Desktop · 1440".
- [ ] **Step 9: Commit**

```bash
git add index.html site-model.mjs site.js site.bundle.js styles.css tests/
git commit -m "Add remembered light/dark theme that defaults to the system preference"
```

---

### Task 5: Arrival and scroll motion, docs

**Files:**
- Modify: `site.js`, `styles.css`, `tests/site.spec.js`, `README.md`

**Interfaces:**
- Consumes: `html.js`, `[data-arrival]`, `[data-reveal]` from Tasks 2 and 4.
- Produces: `site.js` function `initReveal(root: ParentNode): void`.

- [ ] **Step 1: Add failing browser tests:**

```js
test('sections reveal once when scrolled into view', ...) // #experience starts opacity 0 (not .is-visible); scrollIntoView → gets .is-visible; scroll away and back → still .is-visible
test('reduced motion shows everything at once', ...)     // reducedMotion reduce: every [data-reveal] and [data-arrival] has computed opacity 1 and transform 'none' on load
test('missing IntersectionObserver reveals everything', ...) // addInitScript sets IntersectionObserver undefined → every [data-reveal] has .is-visible
test('anchor jump to an unrevealed section shows it', ...)    // click nav 'Experience' → #experience has .is-visible within 1s
```

- [ ] **Step 2: Run** `npm run test:browser` → FAIL.
- [ ] **Step 3: Implement.**
  - CSS, scoped under `.js` and `@media (prefers-reduced-motion: no-preference)` so no-JS and reduced motion never hide content:
    - Arrival: `[data-arrival]` uses `@keyframes arrive` (opacity 0→1, translateY 12px→0), 420ms ease-out, `animation-fill-mode: both`. Delays: `0` → 0ms, `1` → 80ms, `2` → 160ms.
    - Scroll: `[data-reveal]:not(.is-visible) > *` at opacity 0 / translateY 8px. When `.is-visible`, children transition over 360ms ease-out: first child 0ms, second 60ms, the rest 120ms (cap). Experience rows are one child, so they don't stagger.
  - `initReveal`: if `IntersectionObserver` is missing or reduced motion is on, add `.is-visible` to all `[data-reveal]` and return. Otherwise observe with `threshold: 0.15`, add `.is-visible`, and `unobserve` on first intersection.
  - Sheet rules and crop marks get no motion.
- [ ] **Step 4: Run** the full suite: `npm test && npm run test:browser && npm run lint && npm run typecheck && npm run build` → PASS.
- [ ] **Step 5: Update `README.md`**: point the Paper link to `https://app.paper.design/file/01M5482GHXH0PQB3DY2BYWG3DY/p-8-1`; replace the motion file list with `site-model.mjs` (pure theme + accordion logic, unit-tested), `site.js` (DOM wiring: accordion, theme toggle, reveal), `site.bundle.js` (generated), and `assets/work/` (preview artwork, regenerate the Curator screenshot with `node scripts/capture-curators-path.mjs`); update the browser-check summary.
- [ ] **Step 6: Final visual pass** — screenshots at 1440 / 768 / 390 in both themes vs. the six Paper artboards. Also run once with reduced motion to confirm a still page.
- [ ] **Step 7: Commit**

```bash
git add site.js site.bundle.js styles.css tests/site.spec.js README.md
git commit -m "Add quiet arrival and scroll motion that reinforces reading order"
```
