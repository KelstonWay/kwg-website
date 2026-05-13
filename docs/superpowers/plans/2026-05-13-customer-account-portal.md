# Customer Account Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/account` page where wholesale customers sign in via magic link and view their order history with reorder capability.

**Architecture:** Supabase magic link auth added to the existing React site. A new `AuthContext` wraps the app and exposes auth state. A single `/account` page renders a login form when logged out and a full order dashboard when logged in. Orders are linked to accounts by email — no schema changes required, just new RLS policies.

**Tech Stack:** React 19 + TypeScript, Supabase Auth (`signInWithOtp`), React Router v6, Tailwind v3, existing `supabase` client in `src/lib/supabase.ts`.

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/contexts/AuthContext.tsx` | **Create** | Auth state (user, session, signOut), listens to `onAuthStateChange` |
| `src/pages/Account.tsx` | **Create** | Login form + logged-in dashboard |
| `src/lib/types.ts` | **Modify** | Add `WholesaleOrderItem` type |
| `src/App.tsx` | **Modify** | Wrap with `AuthProvider`, add `/account` route |
| `src/components/Nav.tsx` | **Modify** | Add Account icon link |
| Supabase dashboard | **Config** | 2 RLS policies + Auth redirect URL whitelist |

---

## Task 1: Supabase RLS Policies + Auth Config

**Files:** Supabase dashboard only — no code changes.

- [ ] **Step 1: Add RLS policy for authenticated users on `wholesale_orders`**

Go to Supabase dashboard → kelston-way project (`wuemcpptmjmvtzaciezq`) → SQL Editor. Run:

```sql
create policy "users_own_orders"
on wholesale_orders
for select
to authenticated
using (email = auth.email());
```

- [ ] **Step 2: Add RLS policy for authenticated users on `wholesale_order_items`**

```sql
create policy "users_own_order_items"
on wholesale_order_items
for select
to authenticated
using (
  order_id in (
    select id from wholesale_orders where email = auth.email()
  )
);
```

- [ ] **Step 3: Whitelist the redirect URL in Supabase Auth**

Supabase dashboard → Authentication → URL Configuration:
- Set **Site URL** to `https://kelstonway.com` (if not already set)
- Under **Redirect URLs**, add: `https://kelstonway.com/account`
- Also add `http://localhost:5173/account` for local dev

This is required for magic link emails to redirect back correctly.

- [ ] **Step 4: Verify existing public policies are untouched**

Run this and confirm both rows still exist:

```sql
select policyname, roles, cmd
from pg_policies
where tablename in ('wholesale_orders', 'wholesale_order_items')
order by tablename, policyname;
```

Expected: existing anon SELECT policies still present alongside new authenticated ones.

---

## Task 2: AuthContext

**Files:**
- Create: `src/contexts/AuthContext.tsx`

- [ ] **Step 1: Create the context file**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthContextValue {
  user: User | null
  session: Session | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  session: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

- [ ] **Step 2: Verify the file compiles**

```bash
cd /home/samuel/kwg-website && npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/contexts/AuthContext.tsx
git commit -m "feat: add AuthContext for Supabase magic link auth"
```

---

## Task 3: Wire AuthContext + `/account` Route into App

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add `WholesaleOrderItem` type to `src/lib/types.ts`**

Add after the existing `WholesaleOrder` interface:

```ts
export interface WholesaleOrderItem {
  id: string
  order_id: string
  plant_name: string
  plant_sku: string
  plant_size: string
  plant_id: string
  unit_price: number
  qty_requested: number
  line_total: number
  release_item_id: string
}
```

- [ ] **Step 2: Update `src/App.tsx`**

Replace the entire file with:

```tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './contexts/AuthContext'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Home from './pages/Home'
import Availability from './pages/Availability'
import Order from './pages/Order'
import OrderConfirmed from './pages/OrderConfirmed'
import OrderStatus from './pages/OrderStatus'
import OurStory from './pages/OurStory'
import Contact from './pages/Contact'
import Account from './pages/Account'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
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
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
```

- [ ] **Step 3: Verify it compiles (Account.tsx doesn't exist yet — expect one error)**

```bash
npx tsc --noEmit 2>&1 | grep -v "Account"
```

Expected: no errors except the missing Account module.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/lib/types.ts
git commit -m "feat: wire AuthProvider and /account route into app"
```

---

## Task 4: Account Page — Login State

**Files:**
- Create: `src/pages/Account.tsx` (login view only — dashboard added in Task 5)

Before building: scan Stitch templates in `/mnt/c/Users/Samue/OneDrive - Kelston Way Greenhouse/Our Brand/templates/` for a contact or simple-form template to fork. If none fits, build from existing page patterns (e.g. `Contact.tsx`).

- [ ] **Step 1: Create `src/pages/Account.tsx` with login state**

```tsx
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export default function Account() {
  const { user } = useAuth()

  if (user) {
    return <AccountDashboard />
  }

  return <AccountLogin />
}

function AccountLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-4 block">mark_email_read</span>
          <h1 className="font-['Newsreader'] text-headline-lg text-on-surface mb-3">Check your email</h1>
          <p className="font-body-md text-on-surface-variant">
            We sent a sign-in link to <strong>{email}</strong>. Click it to access your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <span className="font-label-caps text-label-caps text-secondary mb-3 block">ACCOUNT</span>
        <h1 className="font-['Newsreader'] text-headline-xl text-on-surface mb-2">Sign in</h1>
        <p className="font-body-md text-on-surface-variant mb-8">
          Enter your email and we'll send you a sign-in link. No password needed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full px-4 py-3 border border-outline-variant rounded-sm font-body-md text-on-surface bg-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="font-body-md text-sm text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-on-primary font-button text-button rounded-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send sign-in link'}
          </button>
        </form>
      </div>
    </div>
  )
}

function AccountDashboard() {
  return (
    <div className="px-5 md:px-20 py-16 max-w-4xl mx-auto">
      <p className="font-body-md text-on-surface-variant">Loading orders…</p>
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify login page renders**

```bash
npm run dev
```

Open `http://localhost:5173/account`. Expected: overline "ACCOUNT", heading "Sign in", email input, button.

- [ ] **Step 3: Test magic link send (requires Resend to be live)**

Enter a real email and submit. Expected: "Check your email" confirmation screen. Check inbox — magic link email should arrive from `orders@kelstonway.com`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Account.tsx
git commit -m "feat: account page login state with magic link"
```

---

## Task 5: Account Dashboard — Order History

**Files:**
- Modify: `src/pages/Account.tsx` — replace `AccountDashboard` stub with full implementation

- [ ] **Step 1: Replace `AccountDashboard` in `src/pages/Account.tsx`**

Replace the stub `AccountDashboard` function with:

```tsx
function AccountDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<WholesaleOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('wholesale_orders')
        .select('id, created_at, business_name, contact_name, email, phone, notes, status, total_units, total_price')
        .order('created_at', { ascending: false })
      if (data) setOrders(data as WholesaleOrder[])
      setLoading(false)
    }
    load()
  }, [])

  const businessName = orders[0]?.business_name ?? user?.email ?? ''

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-outline animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="px-5 md:px-20 py-16 max-w-4xl mx-auto">
      <span className="font-label-caps text-label-caps text-secondary mb-3 block">YOUR ACCOUNT</span>
      <h1 className="font-['Newsreader'] text-headline-xl text-on-surface mb-10">
        Welcome back{businessName ? `, ${businessName}` : ''}.
      </h1>

      <h2 className="font-['Newsreader'] italic text-headline-md text-on-surface border-b border-outline-variant pb-4 mb-6">
        Order History
      </h2>

      {orders.length === 0 ? (
        <p className="font-body-md text-on-surface-variant py-8">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderRow key={order.id} order={order} onNavigate={() => navigate(`/order/${order.id}`)} />
          ))}
        </div>
      )}

      <button
        onClick={signOut}
        className="mt-16 font-body-md text-sm text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-2"
      >
        Sign out
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Add `OrderRow` component and update imports at the top of the file**

Replace the existing imports at the top of `src/pages/Account.tsx` with (adds `useEffect`, `useNavigate`, `addToCart`, and types):

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { addToCart } from '../lib/cart'
import type { WholesaleOrder, WholesaleOrderItem } from '../lib/types'
```

Add the `OrderRow` component before `AccountDashboard`:

```tsx
const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-100',
  confirmed: 'text-primary bg-primary/10',
  invoiced: 'text-secondary bg-secondary-container',
}

function OrderRow({ order, onNavigate }: { order: WholesaleOrder; onNavigate: () => void }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 bg-surface-container-low border border-outline-variant/30 rounded-sm cursor-pointer hover:border-outline-variant transition-all"
      onClick={onNavigate}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-['Newsreader'] italic text-on-surface">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className={`font-label-caps text-label-caps px-2.5 py-0.5 rounded-full uppercase text-[10px] ${STATUS_STYLES[order.status] ?? 'text-on-surface-variant bg-surface-container'}`}>
            {order.status}
          </span>
        </div>
        <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {order.total_units != null && ` · ${order.total_units.toLocaleString()} units`}
        </p>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        {order.total_price != null && (
          <span className="font-['Newsreader'] text-lg text-on-surface">
            ${order.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        )}
        <ReorderButton orderId={order.id} />
        <span className="material-symbols-outlined text-on-surface-variant text-xl hidden sm:block">chevron_right</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Add `ReorderButton` stub (full implementation in Task 6)**

Add before `OrderRow`:

```tsx
function ReorderButton({ orderId }: { orderId: string }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); /* Task 6 */ }}
      className="px-4 py-2 border border-outline-variant font-button text-button text-sm text-on-surface-variant rounded-sm hover:border-primary hover:text-primary transition-all"
    >
      Reorder
    </button>
  )
}
```

- [ ] **Step 4: Verify dashboard renders after signing in**

With dev server running, click the magic link from Task 4 Step 3. Expected: redirect to `/account`, order list appears with past orders.

Verify on mobile (Chrome DevTools → iPhone SE): rows stack vertically, status badge and ref # on same line, price + reorder on next line.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Account.tsx
git commit -m "feat: account dashboard with order history list"
```

---

## Task 6: Reorder Button

**Files:**
- Modify: `src/pages/Account.tsx` — replace `ReorderButton` stub

- [ ] **Step 1: Replace `ReorderButton` stub with full implementation**

```tsx
function ReorderButton({ orderId }: { orderId: string }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)


  async function handleReorder(e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(true)
    setNotice(null)

    // Fetch past order items
    const { data: items } = await supabase
      .from('wholesale_order_items')
      .select('plant_id, plant_name, plant_size, plant_sku, qty_requested, unit_price, release_item_id')
      .eq('order_id', orderId)

    if (!items?.length) { setLoading(false); return }

    // Fetch latest release
    const { data: release } = await supabase
      .from('availability_releases')
      .select('id')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (!release) { setLoading(false); navigate('/availability'); return }

    // Find matching release items by plant_id
    const plantIds = items.map((i: any) => i.plant_id)
    const { data: currentItems } = await supabase
      .from('availability_release_items')
      .select('id, plant_id, unit_price, qty_available')
      .eq('release_id', release.id)
      .in('plant_id', plantIds)
      .gt('qty_available', 0)

    const availableByPlantId = Object.fromEntries(
      (currentItems ?? []).map((ci: any) => [ci.plant_id, ci])
    )

    let added = 0
    let skipped = 0

    for (const item of items as WholesaleOrderItem[]) {
      const current = availableByPlantId[item.plant_id]
      if (!current) { skipped++; continue }

      addToCart({
        id: current.id,
        plant_id: item.plant_id,
        plant_name: item.plant_name,
        plant_sku: item.plant_sku,
        plant_size: item.plant_size,
        unit_price: current.unit_price ?? item.unit_price,
        qty: item.qty_requested,
        photo_url: null,
        release_item_id: current.id,
      })
      window.dispatchEvent(new Event('cart-updated'))
      added++
    }

    setLoading(false)

    if (skipped > 0 && added === 0) {
      setNotice('None of these items are currently in stock.')
    } else if (skipped > 0) {
      setNotice(`${skipped} item${skipped > 1 ? 's' : ''} no longer in stock and weren't added.`)
      navigate('/order')
    } else {
      navigate('/order')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleReorder}
        disabled={loading}
        className="px-4 py-2 border border-outline-variant font-button text-button text-sm text-on-surface-variant rounded-sm hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '...' : 'Reorder'}
      </button>
      {notice && (
        <p className="font-body-md text-xs text-on-surface-variant max-w-[200px] text-right">{notice}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Test reorder with an order that has items**

On the dashboard, click Reorder on a past order. Expected:
- Navigates to `/order`
- Cart shows the items from that order
- Cart count badge in Nav updates

- [ ] **Step 3: Test reorder when items are out of stock**

If no current release or items are unavailable, expected: notice text appears below the Reorder button, user stays on `/account`.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Account.tsx
git commit -m "feat: reorder button — adds past order items to cart from latest release"
```

---

## Task 7: Nav Account Link

**Files:**
- Modify: `src/components/Nav.tsx`

- [ ] **Step 1: Add Account icon to Nav**

In `src/components/Nav.tsx`, add this import at the top:

```tsx
import { useAuth } from '../contexts/AuthContext'
```

Inside the `Nav` function, add:

```tsx
const { user } = useAuth()
```

In the desktop nav links section, add `{ to: '/account', label: 'Account' }` to `NAV_LINKS`:

```tsx
const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/availability', label: 'Availability' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
  { to: '/account', label: 'Account' },
]
```

In the right side of the header (next to the cart button), add an account icon button before the shopping bag:

```tsx
<Link
  to="/account"
  className="hover:bg-surface-container transition-all duration-300 p-2.5 rounded-full relative"
  aria-label="Account"
>
  <span className="material-symbols-outlined text-on-surface-variant">
    {user ? 'account_circle' : 'person'}
  </span>
  {user && (
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
  )}
</Link>
```

Also add `{ to: '/account', label: 'Account' }` to the mobile menu's `NAV_LINKS` (same array, already handles mobile).

- [ ] **Step 2: Verify nav on desktop and mobile**

With dev server running:
- Desktop: "Account" link appears in nav. When logged in, icon has a green dot indicator.
- Mobile: open hamburger menu, "Account" link appears in list.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: add Account link to nav with logged-in indicator"
```

---

## Task 8: End-to-End Test + Deploy

- [ ] **Step 1: Full flow test on desktop**

1. Open `http://localhost:5173/account` — verify login form renders
2. Enter your email → submit → verify "Check your email" screen
3. Click magic link in email → verify redirect to `/account` with dashboard
4. Verify past orders appear with correct status badges and totals
5. Click an order row → verify navigates to `/order/:id`
6. Click Reorder on an order → verify cart populates, navigates to `/order`
7. Sign out → verify returns to login state

- [ ] **Step 2: Mobile test**

Chrome DevTools → iPhone SE (375px). Verify:
- Login form: full-width input and button, centered
- Dashboard: order rows stack vertically, ref+status on one line, price+reorder on next
- Reorder button tappable without accidentally triggering row navigation

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Add `.superpowers/` to `.gitignore`**

```bash
echo ".superpowers/" >> /home/samuel/kwg-website/.gitignore
git add .gitignore
git commit -m "chore: ignore .superpowers brainstorm files"
```

- [ ] **Step 5: Deploy**

```bash
mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```

- [ ] **Step 6: Smoke test on production**

Open `https://kelstonway.com/account`. Full flow: sign in → dashboard → reorder.
