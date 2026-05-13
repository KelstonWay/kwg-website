# Mobile Polish Round 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Four quick mobile UX improvements: rounded hero image, compact availability heading, "View more" scroll tile, and a floating email contact button.

**Architecture:** All changes are in existing React/Tailwind files. FloatingContact is a new 20-line component. No new routes, no API changes, no Supabase changes.

**Tech Stack:** React 19 + Vite + TypeScript + Tailwind v3. `react-router-dom` for `useLocation` in FloatingContact.

---

## Files

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Hero: remove arch shape, add rounded-xl + object-center. Heading: remove overline, change to "Available Now". Add View More tile. |
| `src/components/FloatingContact.tsx` | New — fixed bottom-right email button, hidden on /order routes |
| `src/App.tsx` | Import + render FloatingContact |

---

## Task 1: Hero — rounded square, full image visible

**Files:**
- Modify: `src/pages/Home.tsx` (~line 79)

- [ ] **Step 1: Update the mobile hero div**

Find the mobile hero div in `src/pages/Home.tsx` (inside the `md:hidden` block):
```jsx
<div className="md:hidden relative h-[240px] shape-arch overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
  <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-bottom" fetchPriority="high" loading="eager" />
</div>
```

Replace with:
```jsx
<div className="md:hidden relative h-[240px] rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm bg-stone-200">
  <img src={HERO_IMG} alt="Kelston Way greenhouse interior" className="w-full h-full object-cover object-center" fetchPriority="high" loading="eager" />
</div>
```

Two changes: `shape-arch` → `rounded-xl`, `object-bottom` → `object-center`.

- [ ] **Step 2: Verify diff**

Run `git diff src/pages/Home.tsx`. Only two class names should differ in that one div. Nothing else.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "fix(mobile): hero rounded square + centered image"
```

---

## Task 2: Availability heading + View More tile

**Files:**
- Modify: `src/pages/Home.tsx` (availability strip section, ~lines 117–155)

- [ ] **Step 1: Simplify the section header**

Find the header block inside the availability strip section:
```jsx
<div className="flex justify-between items-center mb-8">
  <div>
    <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest block mb-1">Current Availability</span>
    <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">What We Have This Week</h2>
  </div>
  <Link to="/availability" className="font-button text-button text-primary flex items-center gap-2 group flex-shrink-0 ml-8">
    Full Availability <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
  </Link>
</div>
```

Replace with:
```jsx
<div className="flex justify-between items-center mb-8">
  <h2 className="font-['Newsreader'] text-headline-xl text-on-surface">Available Now</h2>
  <Link to="/availability" className="font-button text-button text-primary flex items-center gap-2 group flex-shrink-0 ml-8 hidden md:flex">
    Full Availability <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
  </Link>
</div>
```

Changes: remove the overline span + wrapper div, flatten to just h2. Add `hidden md:flex` to the Full Availability link so it only shows on desktop (mobile uses the View More tile instead).

- [ ] **Step 2: Add View More tile to the scroll container**

Find the closing of the `preview.map(...)` block inside the scroll container. It looks like:
```jsx
          ))}
        </div>
```

Insert the View More tile between the closing `)}` of the map and the closing `</div>` of the scroll container:
```jsx
          ))}
          {/* View more tile — mobile only, sits at end of scroll */}
          <Link
            to="/availability"
            className="md:hidden flex-shrink-0 w-40 snap-start aspect-[3/4] flex flex-col items-center justify-center rounded-sm border border-outline-variant/30 bg-surface-container text-primary hover:bg-primary-fixed/10 transition-colors"
          >
            <span className="material-symbols-outlined text-3xl mb-2">arrow_forward</span>
            <span className="font-button text-sm">View more</span>
          </Link>
        </div>
```

Note: `style={{ aspectRatio: '3/4' }}` matches the plant cards' `aspect-[3/4]` height so the tile is the same size.

- [ ] **Step 3: Verify diff**

Run `git diff src/pages/Home.tsx`. Confirm:
- Header simplified to h2 only, Full Availability link has `hidden md:flex`
- View More tile added at end of scroll map
- Nothing else changed

- [ ] **Step 4: Commit**

```bash
git add src/pages/Home.tsx
git commit -m "fix(mobile): compact availability heading + View More scroll tile"
```

---

## Task 3: Floating email contact button

**Files:**
- Create: `src/components/FloatingContact.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create FloatingContact component**

Create `/home/samuel/kwg-website/src/components/FloatingContact.tsx`:
```tsx
import { useLocation } from 'react-router-dom'

const HIDDEN_PATHS = ['/order', '/order/confirmed']

export default function FloatingContact() {
  const { pathname } = useLocation()

  if (HIDDEN_PATHS.some(p => pathname.startsWith(p))) return null

  return (
    <a
      href="mailto:samuel@kelstonway.com"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center hover:bg-primary-container transition-colors"
      aria-label="Email us"
    >
      <span className="material-symbols-outlined text-2xl">mail</span>
    </a>
  )
}
```

`HIDDEN_PATHS.some(p => pathname.startsWith(p))` covers `/order`, `/order/confirmed`, and `/order/:id` with one check.

- [ ] **Step 2: Add FloatingContact to App.tsx**

In `src/App.tsx`, add the import at the top with the other component imports:
```tsx
import FloatingContact from './components/FloatingContact'
```

Then inside the return, add `<FloatingContact />` between `</main>` and `<Footer />`:
```tsx
          </main>
          <FloatingContact />
          <Footer />
```

The full App.tsx return should look like:
```tsx
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-background text-on-background flex flex-col">
          <Nav />
          <main className="flex-1 pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/availability" element={<Availability />} />
              <Route path="/order" element={<Order />} />
              <Route path="/order/confirmed" element={<OrderConfirmed />} />
              <Route path="/order/:id" element={<OrderStatus />} />
              <Route path="/our-story" element={<OurStory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/account" element={<Account />} />
            </Routes>
          </main>
          <FloatingContact />
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
```

- [ ] **Step 3: Verify**

Run `git diff src/App.tsx` — confirm only the import and one `<FloatingContact />` line added. No other changes.

- [ ] **Step 4: Commit**

```bash
git add src/components/FloatingContact.tsx src/App.tsx
git commit -m "feat: floating email contact button, hidden on order pages"
```

---

## Task 4: Deploy

- [ ] **Step 1: Deploy to production**

```bash
mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```

- [ ] **Step 2: Verify on mobile**

Open kelstonway.com on iPhone. Check:
- Hero image shows full greenhouse with rounded corners, no arch clip
- "Available Now" heading is one clean line above the scroll strip
- Scrolling the strip shows plant cards then a "View more →" tile at the end
- Floating green circle with mail icon visible bottom-right
- Tapping the floating button opens mail app with samuel@kelstonway.com
- On /order page, floating button does NOT appear
