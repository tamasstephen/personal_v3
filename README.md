# Tamás Stephen — personal website

Static portfolio at [tamasstephen.com](https://tamasstephen.com), implemented from the approved [Paper personal concept](https://app.paper.design/file/01M4XB2E2YCYH424NA05SD1F5W/p-4-0) and refined **Structure → Clarity** animation.

## Run locally

Requires Node.js 22.13+ and Python 3.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. No application framework or production JavaScript dependencies are required.

You can also open `index.html` directly. It loads the included `motion.bundle.js` as a regular deferred script so the animation works without a server. Regenerate that file with `npm run bundle` after editing either motion source; the dev and build commands do this automatically.

## Checks and build

```sh
npm test
npm run lint
npm run typecheck
npm run test:browser
npm run build
```

Browser checks use installed Google Chrome through Playwright. They cover 1440, 1280, 768, 390, and 320px layouts, navigation, reduced motion, preference changes, keyboard entry, missing observer APIs, and JavaScript-disabled rendering. Build output goes to `dist/`. The existing deploy command remains available; implementation does not publish the site.

## Design and content

- `index.html`: semantic page, original projects, tools, experience, links, and SEO metadata.
- `styles.css`: Paper typography, white editorial layout, cobalt accents, dark toolkit section, and responsive layouts.
- `motion.css`: scoped CSS artwork with the refined smaller action, teal thumbnail, amber indicator, and tinted glass.
- `motion-model.mjs`: pure, tested 3.6-second choreography.
- `motion.js`: viewport entry playback, sizing, fine-pointer exploration, and motion preferences.
- `motion.bundle.js`: generated browser script for both direct-file examples and the production site; edit the source files above, then rebuild.

Inter is self-hosted in WOFF2 format under the included SIL Open Font License. The existing IBM Plex Mono provides the monospace labels in place of Paper's canvas font. The visual is made from HTML and CSS rather than a video or image download.

## Motion behaviour

1. **0–750ms:** construction grid draws in.
2. **650–2450ms:** navigation, typography, accent, work, and action layers assemble.
3. **1750–2800ms:** the finished surface appears.
4. **2800–3450ms:** a cobalt highlight sweeps through; the composition then holds.

Playback runs once when the visual enters the viewport. Fine-pointer hover gently separates layers; pointer movement tilts the object by up to four degrees. Touch devices retain normal page scrolling. Reduced motion shows the completed composition immediately and disables exploration. Changing the preference during playback also completes the scene. Without JavaScript or observer APIs, the completed artwork and all content remain usable.

The animation frame delta is capped at 64ms to avoid a sudden jump after a backgrounded tab. Only the visual changes: the page content remains in normal document flow and is available independently of animation.
