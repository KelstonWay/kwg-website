# Mobile Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix six mobile UX issues on kwg-website — hero layout, available-now strip size and scroll, order page overflow, and pinch-zoom behavior.

**Architecture:** Pure CSS/JSX responsive changes. No new components, no API changes. All fixes use Tailwind responsive prefixes (`md:`) to preserve desktop layout exactly as-is.

**Tech Stack:** React 19 + Tailwind v3 + Vite. No tests exist in this project — verification is manual browser resize.

---

## Files Changed

| File | Change |
|------|--------|
| `index.html` | Add `maximum-scale=1.0, user-scalable=no` to viewport meta |
| `src/pages/Home.tsx` | Hero: show single arch image on mobile, hide pill. Strip: horizontal scroll on mobile |
| `src/pages/Order.tsx` | Item rows: two-row mobile layout. Padding: `px-5` on mobile. Inputs: `text-base` |
| `src/components/CartDrawer.tsx` | Input: `text-base` to prevent iOS auto-zoom |

---

## Task 1: Viewport meta — zoom lock

**Files:**
- Modify: `index.html` (line 6)

- [ ] **Step 1: Update viewport meta tag**

In `index.html`, replace line 6:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```
With:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

- [ ] **Step 2: Verify**

Open site on mobile (or Chrome DevTools → iPhone 14 viewport). Attempt pinch-zoom on the /order page. Expected: page does not zoom.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: lock viewport zoom on mobile"
```

---

## Task 2: Hero section — single photo on mobile

**Files:**
- Modify: `src/pages/Home.tsx` (lines 77–84)

- [ ] **Step 1: Replace the hero image block**

Find the hero image container (currently lines 77–84 in `src/pages/Home.tsx`):
```jsx
<div className="md:col-span-6 relative h-[260px] md:h-[600px] w-full">
  <div className="absolute top-0 right-0 w-3/4 h-[400px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
    <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-bottom" fetchPriority="high" loading="eager" />
  </div>
  <div className="absolute bottom-0 left-0 w-1/2 h-[300px] shape-pill overflow-hidden border border-outline-variant/20 shadow-sm z-20 bg-stone-100">
    <img src={HERO_IMG2} alt="Greenhouse plant detail" className="w-full h-full object-cover" fetchPriority="high" loading="eager" />
  </div>
</div>
```

Replace with:
```jsx
<div className="md:col-span-6 w-full">
  {/* Mobile: single full-width arch image */}
  <div className="md:hidden relative h-[240px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
    <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-bottom" fetchPriority="high" loading="eager" />
  </div>
  {/* Desktop: overlapping arch + pill layout */}
  <div className="hidden md:block relative h-[600px]">
    <div className="absolute top-0 right-0 w-3/4 h-[400px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
      <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-bottom" fetchPriority="high" loading="eager" />
    </div>
    <div className="absolute bottom-0 left-0 w-1/2 h-[300px] shape-pill overflow-hidden border border-outline-variant/20 shadow-sm z-20 bg-stone-100">
      <img src={HERO_IMG2} alt="Greenhouse plant detail" className="w-full h-full object-cover" fetchPriority="high" loading="eager" />
    </div>
  </div>
</div>
```

- [ ] **Step 2: Verify**

DevTools → iPhone 14. Hero should show one clean arch-shaped photo, full-width, ~240px tall. No overlapping pill image. Switch to desktop — original two-photo layout unchanged.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "fix(mobile): single hero photo on mobile, hide pill"
```

---

## Task 3: Available Now strip — horizontal scroll on mobile

**Files:**
- Modify: `src/pages/Home.tsx` (lines 123–144 — the "Live availability strip" section)

- [ ] **Step 1: Replace the grid container and card classes**

Find (currently around line 123):
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {preview.map((item) => (
    <Link key={item.id} to="/availability" className="group cursor-pointer">
      <div className="aspect-[4/5] overflow-hidden rounded-sm border border-outline-variant/10 mb-4 bg-surface-container transition-transform duration-500 group-hover:-translate-y-1">
```

Replace with:
```jsx
<div className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-2 -mx-5 px-5 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
  {preview.map((item) => (
    <Link key={item.id} to="/availability" className="group cursor-pointer flex-shrink-0 w-40 snap-start md:w-auto">
      <div className="aspect-[3/4] overflow-hidden rounded-sm border border-outline-variant/10 mb-3 bg-surface-container transition-transform duration-500 group-hover:-translate-y-1">
```

Note: only the outer div, the Link, and the image container div change. Everything inside (image, caption, price badge) stays identical.

- [ ] **Step 2: Verify**

Mobile: "What We Have This Week" shows a row of 160px-wide cards you can swipe left to see. Cards are shorter (3:4 ratio instead of 4:5). Desktop: unchanged 3-col grid.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "fix(mobile): available-now strip horizontal scroll + smaller cards"
```

---

## Task 4: Order page — mobile item row layout + padding + input font size

**Files:**
- Modify: `src/pages/Order.tsx`

- [ ] **Step 1: Fix outer container padding**

Find line 77:
```jsx
<div className="px-8 md:px-32 py-16">
```
Replace with:
```jsx
<div className="px-5 md:px-8 lg:px-32 py-12 md:py-16">
```

- [ ] **Step 2: Replace item row with two-row mobile layout**

Find the item row (currently lines 87–110):
```jsx
<div key={item.release_item_id} className="flex items-center gap-6 py-4 border-b border-outline-variant/20">
  {item.photo_url && (
    <div className="w-16 h-20 organic-shape-1 overflow-hidden flex-shrink-0 bg-surface-container">
      <img src={item.photo_url} alt={item.plant_name} className="w-full h-full object-cover" />
    </div>
  )}
  <div className="flex-1 min-w-0">
    <p className="font-['Newsreader'] italic text-on-surface">{item.plant_name}</p>
    <p className="font-body-md text-sm text-on-surface-variant">{item.plant_size} · {item.plant_sku}</p>
  </div>
  <div className="flex items-center gap-3 flex-shrink-0">
    <input
      type="number"
      min="1"
      value={item.qty}
      onChange={e => handleQty(item.release_item_id, parseInt(e.target.value) || 1)}
      className="w-20 border border-outline-variant rounded px-2 py-1.5 text-sm font-body-md text-center focus:outline-none focus:border-primary"
    />
    <span className="font-body-md text-sm text-on-surface-variant w-20 text-right">× ${item.unit_price.toFixed(2)}</span>
    <span className="font-body-md font-medium text-on-surface w-20 text-right">${(item.qty * item.unit_price).toFixed(2)}</span>
  </div>
  <button onClick={() => handleRemove(item.release_item_id)} className="p-1.5 hover:bg-error-container rounded transition-colors flex-shrink-0">
    <span className="material-symbols-outlined text-error text-lg">delete</span>
  </button>
</div>
```

Replace with:
```jsx
<div key={item.release_item_id} className="py-4 border-b border-outline-variant/20">
  {/* Row 1: photo + name */}
  <div className="flex items-start gap-4 mb-3">
    {item.photo_url && (
      <div className="w-14 h-[72px] organic-shape-1 overflow-hidden flex-shrink-0 bg-surface-container">
        <img src={item.photo_url} alt={item.plant_name} className="w-full h-full object-cover" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <p className="font-['Newsreader'] italic text-on-surface">{item.plant_name}</p>
      <p className="font-body-md text-sm text-on-surface-variant">{item.plant_size} · {item.plant_sku}</p>
    </div>
  </div>
  {/* Row 2: qty + unit price + line total + delete */}
  <div className="flex items-center gap-3">
    <input
      type="number"
      min="1"
      value={item.qty}
      onChange={e => handleQty(item.release_item_id, parseInt(e.target.value) || 1)}
      className="w-16 border border-outline-variant rounded px-2 py-1.5 text-base font-body-md text-center focus:outline-none focus:border-primary"
    />
    <span className="font-body-md text-sm text-on-surface-variant">× ${item.unit_price.toFixed(2)}</span>
    <span className="font-body-md font-medium text-on-surface ml-auto">${(item.qty * item.unit_price).toFixed(2)}</span>
    <button onClick={() => handleRemove(item.release_item_id)} className="p-1.5 hover:bg-error-container rounded transition-colors">
      <span className="material-symbols-outlined text-error text-lg">delete</span>
    </button>
  </div>
</div>
```

- [ ] **Step 3: Verify**

Mobile: /order page. Each item shows name+photo on top row, qty input + price + total on second row. Nothing overflows. Tapping the qty input does not trigger iOS zoom (text-base = 16px).

- [ ] **Step 4: Commit**

```bash
git add src/pages/Order.tsx
git commit -m "fix(mobile): order page item rows stack on mobile, fix padding + input size"
```

---

## Task 5: CartDrawer — input font size

**Files:**
- Modify: `src/components/CartDrawer.tsx` (line 66)

- [ ] **Step 1: Update input class**

Find (line 66):
```jsx
className="w-16 border border-outline-variant rounded px-2 py-1 text-sm font-body-md text-center focus:outline-none focus:border-primary"
```

Replace `text-sm` with `text-base`:
```jsx
className="w-16 border border-outline-variant rounded px-2 py-1 text-base font-body-md text-center focus:outline-none focus:border-primary"
```

- [ ] **Step 2: Verify**

Mobile: open cart drawer, tap the qty input. iOS should not auto-zoom. Page stays at normal zoom level.

- [ ] **Step 3: Commit**

```bash
git add src/components/CartDrawer.tsx
git commit -m "fix(mobile): cart qty input text-base to prevent iOS auto-zoom"
```

---

## Task 6: Deploy

- [ ] **Step 1: Deploy to production**

```bash
mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```

- [ ] **Step 2: Final mobile check on live site**

Open kelstonway.com on iPhone. Verify:
- Hero shows single arch photo, no weirdness
- "What We Have This Week" is a swipeable horizontal row
- /order items stack cleanly, nothing overflows
- Pinch-zoom does not work
- Tapping form inputs does not trigger auto-zoom
