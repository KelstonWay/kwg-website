# Mobile Polish — Design Spec
**Date:** 2026-05-13
**Scope:** kwg-website mobile UI fixes across Home, Order pages

---

## Problems Being Fixed

Six issues reported from mobile review:

1. Hero section photos look weird on mobile — floating absolute-positioned images in a 260px container
2. "Available Now" strip cards are too tall (aspect-[4/5]) and stack vertically
3. "Available Now" should scroll horizontally, not stack
4. Order page item rows overflow on mobile — qty/price/total squish into the plant name
5. Unlimited pinch-zoom on the order/review pages feels wrong
6. iOS auto-zoom triggers on form inputs (font-size < 16px)

---

## Changes

### 1. Hero — single photo on mobile (`Home.tsx` lines 77–84)
- Pill image (`hero2.webp`) gets `hidden md:block` — hidden on mobile
- Arch container: remove absolute positioning for mobile. On mobile: `relative w-full h-[240px]`, full-width, arch shape preserved, `object-cover`
- On `md:` and up: restore current absolute layout (no change to desktop)

### 2. Available Now — card size
- Change card image ratio from `aspect-[4/5]` to `aspect-[3/4]` — slightly shorter
- Reduce caption text sizes marginally (already small, minimal change)

### 3. Available Now — horizontal scroll on mobile
- On mobile: `flex overflow-x-auto gap-4 snap-x snap-mandatory pb-2` — horizontal scrollable row
- Each card: `flex-shrink-0 w-40` (160px wide)
- On `md:`: `grid grid-cols-3 gap-6` — unchanged desktop layout
- Add `-mx-5 px-5` to extend scroll edge-to-edge without clipping

### 4. Order page item rows — stacked mobile layout (`Order.tsx` lines 87–110)
- On mobile: two-row layout per item
  - Row 1: photo thumbnail + plant name + size/sku (flex, items-start)
  - Row 2: qty input + unit price label + line total + delete button (flex, items-center, gap-3)
- On `lg:`: restore current single flat row (no desktop change)
- Reduce outer padding on mobile: `px-5 md:px-8 lg:px-32` (currently `px-8`)

### 5. Zoom lock (`index.html`)
- Add `maximum-scale=1.0, user-scalable=no` to viewport meta
- Prevents free pinch-zoom across the whole site

### 6. Input font size — iOS zoom prevention (`Order.tsx`, `CartDrawer.tsx`)
- All `<input>` and `<textarea>`: change `text-sm` → `text-base` (16px)
- iOS auto-zooms on focus when font-size < 16px — this stops it

---

## Files Changed
- `index.html` — viewport meta
- `src/pages/Home.tsx` — hero layout, available-now strip
- `src/pages/Order.tsx` — item row layout, padding, input font size
- `src/components/CartDrawer.tsx` — input font size

## Out of Scope
- Desktop layout changes (none)
- Nav, footer, other pages
- Any Supabase or API changes
