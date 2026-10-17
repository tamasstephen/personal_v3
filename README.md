# Tamás Stephen — personal website

Static portfolio at [tamasstephen.com](https://tamasstephen.com), implemented from the Paper [Personal Landing — Working Sheet](https://app.paper.design/file/01M5482GHXH0PQB3DY2BYWG3DY/p-8-1) design (light and dark, 1440 / 768 / 390).

## Run locally

Requires Node.js 22.13+ and Python 3.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. No application framework or production JavaScript dependencies are required.

You can also open `index.html` directly. It loads the included `site.bundle.js` as a regular deferred script. Regenerate that file with `npm run bundle` after editing `site.js` or `site-model.mjs`; the dev and build commands do this automatically.

## Checks and build

```sh
npm test
npm run lint
npm run typecheck
npm run test:browser
npm run build
```

Unit tests (`npm test`) cover the theme and accordion logic. Browser checks use installed Google Chrome through Playwright and cover 1440, 1024, 768, 390, and 320px layouts, the project accordion (mouse, keyboard, rapid switching), theme selection and persistence (including blocked storage), arrival and scroll reveal, reduced motion, missing observer APIs, and JavaScript-disabled rendering. Build output goes to `dist/` (cleaned on every build). The existing deploy command remains available; implementation does not publish the site.

## Design and content

- `index.html`: semantic page, projects, tech stack, experience, links, SEO metadata, and an inline head script that applies the theme before first paint.
- `styles.css`: Working Sheet layout, `light-dark()` color tokens, responsive breakpoints (1024 / 768), accordion, and motion.
- `site-model.mjs`: pure, unit-tested theme resolution and accordion state.
- `site.js`: DOM wiring for the accordion, theme toggle, and scroll reveal.
- `site.bundle.js`: generated browser script; edit the sources above, then rebuild.
- `assets/work/`: project preview artwork. CV Peers and Stephen Beratung are Paper exports; regenerate the Curator's Path screenshot with `node scripts/capture-curators-path.mjs`.

Inter is self-hosted in WOFF2 format under the included SIL Open Font License. The existing IBM Plex Mono provides the monospace labels in place of Paper's canvas font.

## Theme and motion

The theme follows the system preference until the visitor picks one with the Dark/Light control; the choice is stored in `localStorage` (the page still works when storage is blocked). Without JavaScript the system preference still applies through CSS.

Motion follows reading order: the hero settles in once (420ms, 80ms stagger), each section fades up when 15% visible (360ms), and project previews open in 240ms and close in 180ms. The sheet frame and crop marks never move. Reduced motion shows everything immediately, opens previews instantly, and switches theme without a crossfade. Content is visible by default without JavaScript.
