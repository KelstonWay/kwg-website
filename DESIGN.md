---
version: alpha
name: Kelston Way Greenhouse
description: Premium B2B wholesale greenhouse — Sage & Earth design system
colors:
  primary: "#4c614c"
  primary-light: "#b6cdb2"
  primary-container: "#657a63"
  on-primary: "#ffffff"
  secondary: "#6e5b42"
  secondary-container: "#f6dcbb"
  on-secondary: "#ffffff"
  tertiary: "#545f4f"
  tertiary-container: "#6c7866"
  on-tertiary: "#ffffff"
  surface: "#f9f9f9"
  surface-container: "#eeeeee"
  surface-container-low: "#f3f3f3"
  on-surface: "#1a1c1c"
  on-surface-variant: "#434842"
  outline: "#747871"
  outline-variant: "#c3c8bf"
  error: "#ba1a1a"
  background: "#f9f9f9"
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 64px
    fontWeight: 300
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  headline-xl:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: 400
    lineHeight: "1.2"
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: 400
    lineHeight: "1.3"
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: 400
    lineHeight: "1.6"
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: 400
    lineHeight: "1.6"
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: 600
    lineHeight: "1.2"
    letterSpacing: "0.1em"
  button:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: 500
    lineHeight: "1"
    letterSpacing: "0.05em"
rounded:
  sm: 4px
  lg: 8px
  xl: 12px
  full: 9999px
spacing:
  gutter: 24px
  element-gap: 32px
  section-padding: 120px
  container-max: 1280px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
    typography: "{typography.button}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: "12px 32px"
    typography: "{typography.button}"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "40px"
  badge-in-season:
    backgroundColor: "#dce6d9"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    typography: "{typography.label-caps}"
  label-caps:
    textColor: "{colors.secondary}"
    typography: "{typography.label-caps}"
---

## Overview

Kelston Way is a premium B2B wholesale greenhouse serving garden centers and landscape professionals in Texas and the Southwest. The design language is **Botanical Minimalism** — earthy, restrained, and authoritative. It should feel like a high-end seed catalog or a premium agricultural trade publication: serious, beautiful, and built for professionals.

The palette is rooted in sage greens and warm earth tones pulled directly from the Texas Hill Country landscape. Nothing is decorative without purpose. Every component earns its presence.

## Colors

The palette is called **Sage & Earth**.

- **Primary (`#4c614c`):** Deep sage — the signature brand color. Used for primary actions, headings, and brand moments. Botanical, rooted, trustworthy.
- **Secondary (`#6e5b42`):** Warm mahogany/earth — used for secondary actions, label-caps, and outline elements. The earth beneath the sage.
- **Tertiary (`#545f4f`):** A slightly cooler sage for supporting surfaces and tertiary containers.
- **Surface (`#f9f9f9`):** Near-white warm base. Never pure white — the warmth keeps it organic.
- **Stone-50/100:** Alternating section backgrounds use `stone-50` and `stone-100` to create gentle depth without harsh contrast.
- **On-surface (`#1a1c1c`):** Deep near-black for body text. Warm, not cold.
- **On-surface-variant (`#434842`):** Secondary text — used for captions, body copy in supporting roles.
- **Outline-variant (`#c3c8bf`):** Borders and dividers. Light, botanical, not clinical.

Do not introduce blues, purples, or high-chroma colors. The brand lives entirely in the green-brown axis.

## Typography

Two typefaces only:

- **Newsreader** (serif) — all headings and display text. Use italic for accent moments (hero spans, pulled quotes). Conveys heritage, quality, and craft.
- **Manrope** (sans-serif) — all body text, UI labels, buttons, captions. Clean, modern, professional.

Headlines should feel editorial. Body should feel clear and efficient. Never mix roles — Manrope never appears at heading scale, Newsreader never appears at body scale.

`label-caps` is always uppercase, tracked at 0.1em, 12px Manrope 600. Used to introduce sections, label metadata, and create visual hierarchy above headings. Always use `text-secondary` for label-caps.

## Layout

The site uses a 12-column grid at desktop with 24px gutters. Content is constrained to 1280px max-width with 128px (px-32) horizontal padding on desktop, 20px (px-5) on mobile.

Sections alternate between `bg-stone-50`, `bg-stone-100`, and white to create rhythm without using color as a crutch. The sage green appears as an accent, never as a background.

Key layout patterns:
- **Arch + pill overlay:** Two overlapping shapes (arch on top-left, pill on bottom-right or bottom-left) used for editorial photo compositions on Home hero and Our Story. The arch is ~75% width, ~350–400px tall. The pill is ~50% width, ~250–300px tall. They partially overlap.
- **Bento grid:** 4-column, 2-row grid on Home. Left two columns span 2 rows (tall hero image). Right side has 2 photo/info cards stacked plus 2 solid-color info tiles.
- **Dual bento (Our Story):** Simple 2-column, 1-row grid at 600px height with gradient text overlays on photos.

## Elevation & Depth

Depth is achieved through layering and shape overlap, not shadows. The arch+pill composition creates visual depth through z-index and overlap, not drop shadows.

When hover states need depth, use subtle scale transforms (`group-hover:scale-105`) with a long duration (`duration-700`). Never jump or bounce.

Glass panel overlays use a semi-transparent white/surface blur effect (`glass-panel` class) for hover states on bento cards.

## Shapes

Two distinctive shape classes are used in the layout — do not deviate:

- **`shape-arch`:** A shape with a fully rounded top (like an arch or tombstone). Used for primary photo frames.
- **`shape-pill`:** Fully rounded on all sides (pill/stadium). Used for secondary photo overlays.

Both shapes use `overflow-hidden` so images are cropped to the shape. Always pair `object-cover` with these.

Borders on shaped photo frames: `border border-outline-variant/20 shadow-sm` — very subtle, not decorative.

## Components

### Buttons
- **Primary:** Sage green (`bg-primary text-on-primary`), 4px radius, 12–16px top/bottom padding, 24–32px left/right. No icons by default.
- **Outline:** Transparent with `border border-secondary text-secondary`. Same sizing. Converts to hover with `hover:bg-secondary-container/20`.
- Both use `rounded-sm` (4px) — not rounded, not pill. Slightly architectural.
- Button text: Manrope 500, 14px, `tracking-widest` uppercase for inline text links only.

### Cards (Services section)
White background, `border border-outline-variant/30`, `p-10`. Heading in Newsreader 2xl. Body in Manrope `text-on-surface-variant`. Footer CTA as text link with bottom border — no button component.

### Label-caps
Always `font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-4`. Used above every major section heading. Do not use for decorative purposes.

### Photo shapes
See Shapes section. Never use circular crops — the arch and pill are the only allowed shapes.

### Bento tiles (solid color)
Two tiles in the bento grid use solid brand colors with centered text and a Material Symbol icon:
- Secondary container tile: `bg-secondary-container text-on-secondary-container`
- Primary tile: `bg-primary text-on-primary` with a small CTA text link

## Photography

Photos should feel lush, close, and intentional. The brand photographs plants, not infrastructure.

**Preferred:** Dense field-of-flowers shots that fill the frame, top-down foliage patterns, and macro close-ups with botanical detail. Warm, natural light.

**Avoid:** Hand/person-centered shots, outdoor scenes that don't read as greenhouse, anything with visible branding or signage, flat or overexposed images.

For arch shapes (tall, portrait crop): use photos with clear vertical interest — looking up through flowers, or dense foliage that reads at any crop.

For pill shapes (smaller overlay): use centered subjects — a single flower, a tight foliage pattern, or a macro detail.

For the tall bento column (landscape photo cropped tall): use images with a clear center subject — greenhouse rows work well when the center lane is the strongest part.

For wide short bento slots: top-down foliage patterns (calathea, aglaonema) fill any crop and maintain visual interest.

## Do's and Don'ts

**Do:**
- Use Newsreader italic for accent words within headlines (`<span className="italic text-primary">`)
- Alternate section backgrounds: stone-50 and stone-100
- Use `shape-arch` and `shape-pill` for all editorial photo compositions
- Keep label-caps in secondary (mahogany) color
- Use 4px border radius on all interactive elements

**Don't:**
- Don't use pure white (#ffffff) as a page background — use surface (#f9f9f9)
- Don't use pill or circular crops for large hero images — arch only
- Don't use bold on Newsreader headings — weight 400 or 300 only
- Don't introduce any color outside the Sage & Earth palette
- Don't add drop shadows to photo frames — use subtle border + outline-variant
- Don't use the hand/person photo — product and plant photography only
