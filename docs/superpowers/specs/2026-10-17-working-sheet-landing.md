# Working Sheet landing — spec

Source of truth: Paper file "Personal website — Refined design system", page **Personal Landing — Working Sheet**
(https://app.paper.design/file/01M5482GHXH0PQB3DY2BYWG3DY/p-8-1). Artboards: Desktop · 1440, Tablet · 768,
Mobile · 390, each in light and dark, plus "Working Sheet — Design notes".

Snapshots of the light artboards (Paper JSX, inline styles, tokens as `var(--…)`) live in `paper/`:
`desktop-1440.jsx`, `tablet-768.jsx`, `mobile-390.jsx`. Use them for exact spacing, sizes and copy. If Paper and the
snapshot disagree, Paper wins — re-export with `get_jsx`.

## Design notes (transcribed from Paper, 2026-10-17)

**01 System.** White canvas; black lead-ins and actions; continuation gray only for large statement endings (≥24px).
Body copy uses secondary gray. Text links use cobalt. Inter content and mono labels use the shared tokens.

**02 Responsive.** 1440: centered 1120px content, split hero. 768: 32px gutters and stacked hero. 390: 20px gutters,
stacked content, form-only illustration. Keep content within 1120px above 1024px; center the project illustration
as the viewport grows.

**03 Interaction.** "Explore my work" scrolls to selected work. Contact opens email. Projects are an accordion:
CV Peers is open on load, one project open at a time. The title and +/− control form one button (`aria-expanded`,
`aria-controls` → preview panel); the domain link is a separate sibling that opens the live site. On tablet and
mobile, the domain link sits under the description. At least 44px targets and the white-gap/cobalt focus ring.
Respect reduced motion for anchor scrolling.

**04 Delivery.** Light and dark at desktop, tablet, mobile. Experience uses a plain section label, no subtitle; each
role keeps a one-line summary. Approved headline, contact copy and technology list retained. Stephen Beratung and
The Curator's Path need preview artwork for their open state.

**05 Dark mode.** Tokens: canvas `#0A0A0A`, surface `#151515`, text `#F5F5F5`, body `#B0B0B0`, continuation
`#8A8A8A`, links `#70AEFF`, rules `#303030`. Primary actions invert to off-white (`#F5F5F5`) with dark text
(`#0A0A0A`). Product artwork keeps its original appearance. Follow the system preference on first visit; remember an
explicit selection. Accessible labels: "Switch to dark mode" / "Switch to light mode". Focus: 2px canvas gap + 2px
accent ring.

**06 Motion.** Reinforce reading order. Sheet frame and crop marks stay still.
- Arrival: eyebrow and headline once, opacity 0→1 + 12px upward settle, 420ms ease-out. Intro +80ms; actions +80ms
  more. Content visible by default without JavaScript.
- Scroll: each section enters once at ~15% visible: opacity 0→1, translateY 8px→0, 360ms ease-out. Stagger heading
  and first content row by 60ms; cap total stagger at 120ms. Experience rows do not animate separately.
- Projects & links: opening reveals the preview with height + opacity over 240ms ease-out; closing collapses over
  180ms. The + rotates into − with the same timing. Focus stays on the control. Text links gain an underline in
  180ms. Focus ring appears immediately; never wait for an animation.
- Theme & navigation: theme crossfades colors and borders over 180ms; layout, artwork and scroll stay fixed.
  Native smooth anchor scrolling. Theme control label switches between "Dark" and "Light".
- Reduced motion: show everything immediately, no transforms or stagger, previews open/close instantly, theme
  switches without crossfade, anchor jumps are instant. No parallax, looping decoration, or animation in previews.

## Decisions made in conversation

- Hero stays exactly as designed.
- CV Peers preview: export the Paper artwork as images (not rebuilt in HTML).
- Stephen Beratung preview: export from the Paper file "Stephen Beratung" (page Landing Concept).
- The Curator's Path preview: screenshot of the live site (staging.tamasstephen.com).
- Mono font: keep self-hosted IBM Plex Mono in place of Paper Mono (not web-licensed).
