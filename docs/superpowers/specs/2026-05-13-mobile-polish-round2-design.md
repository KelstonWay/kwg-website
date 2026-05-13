# Mobile Polish Round 2 — Design Spec
**Date:** 2026-05-13

## Changes

### 1. Hero — rounded square, full image visible
- Remove `shape-arch` from the mobile hero container
- Add `rounded-xl` instead
- Change `object-bottom` → `object-center` so full greenhouse structure shows
- File: `src/pages/Home.tsx` mobile hero div (line ~79)

### 2. Availability section heading — compact on mobile
- Remove the "Current Availability" overline span on mobile (`md:block hidden` or remove entirely since it's small/redundant)
- Change h2 text to "Available Now" on mobile, "What We Have This Week" on desktop
- Or simplest: just change the heading to "Available Now" everywhere and drop the overline label
- Remove the "Full Availability →" header link on mobile (replaced by View More card)
- File: `src/pages/Home.tsx` availability strip header div

### 3. View More — 4th tile in horizontal scroll
- On mobile: append a 4th `<Link to="/availability">` tile at the end of the scroll with "View more →" as a tap target
- Style: same w-40 flex-shrink-0 snap-start width as the plant cards, but visual style is a CTA tile (primary-colored or outlined, centered text + arrow)
- On desktop (md: grid): the 4th tile is hidden (`md:hidden`) — desktop keeps the 3-col grid with the existing header link
- File: `src/pages/Home.tsx` availability strip

### 4. Floating email button — new component
- New file: `src/components/FloatingContact.tsx`
- Fixed position: `bottom-6 right-6`, z-50
- Renders a circle button with Material Symbols `mail` icon
- `href="mailto:samuel@kelstonway.com"` — opens mail client
- Hidden on `/order`, `/order/confirmed`, `/order/:id` routes (use `useLocation` to check pathname)
- Rendered in `src/App.tsx` (or wherever the router wraps pages)

## Files Changed
- `src/pages/Home.tsx` — hero shape, heading, View More tile
- `src/components/FloatingContact.tsx` — new
- `src/App.tsx` — render FloatingContact
