# Customer Account Portal — Design Spec
_2026-05-13_

## Overview

Add a `/account` page to kwg-website so wholesale customers can sign in, view their order history, and reorder past items. Auth via Supabase magic link (passwordless). No invoice totals, no payment tracking — order visibility only.

---

## Auth

- **Method:** Supabase magic link (`signInWithOtp({ email })`)
- **Session:** Persistent via localStorage with auto-refresh. Customer signs in once, stays logged in across visits on the same device/browser.
- **Linking:** Orders are matched by email — any past order placed with the same email appears automatically. No explicit account creation step.

---

## Pages

### `/account` (two states)

**Logged out:**
- Email input + "Send sign-in link" button
- On submit: calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: 'https://kelstonway.com/account' } })`
- Shows confirmation message: "Check your email — we sent you a sign-in link."

**Logged in — Dashboard:**
- Greeting: "Welcome back, [business name from most recent order]"
- Order list (most recent first):
  - Ref # (first 8 chars, uppercase)
  - Date placed
  - Status badge (pending / confirmed / invoiced)
  - Total units + total price
  - "Reorder" button → adds items to cart, navigates to `/order`
  - Row click → navigates to `/order/:id`
- Sign out link (small, bottom of page)

No invoice total. No "what you owe" summary.

---

## Data

No schema changes required. Orders already store `email`, `status`, `total_units`, `total_price`, `created_at`.

**New RLS policy** on `wholesale_orders`:
```sql
create policy "Users can view their own orders"
on wholesale_orders for select
to authenticated
using (email = auth.email());
```

Same policy needed on `wholesale_order_items` for order detail (already readable publicly by ID — leave that untouched so the confirm token link still works for Samuel).

---

## Reorder Flow

1. Customer clicks "Reorder" on a past order
2. App fetches `wholesale_order_items` for that order
3. Cross-references the latest published `availability_release` to find matching `plant_id` entries still in stock (same release query used by `/availability`)
4. Adds available items to localStorage cart (`kwg_cart`)
5. Navigates to `/order`
6. If some items are no longer available, shows a brief notice: "X items from this order are no longer in stock and weren't added."

---

## Auth Context

New `AuthContext` (`src/contexts/AuthContext.tsx`):
- Wraps app in `App.tsx`
- Exposes `user`, `session`, `signOut`
- Listens to `supabase.auth.onAuthStateChange`

---

## UI

- Matches KWG brand: Newsreader headings, Manrope body, primary `#4c614c`, secondary `#6e5b42`
- Fork closest Stitch template from OneDrive before building — do not build from scratch
- Mobile-first: order list stacks to single column, status badge + ref # on one line, total + reorder on next
- Status badges use existing color scheme from `OrderStatus.tsx`

---

## What's Not In Scope

- Password reset / email change
- Profile editing
- Invoice totals or outstanding balance tracking
- Admin order management (Samuel uses `/order/:id?token=...` for that)
- Multi-device session sync

---

## Success Criteria

1. Customer can enter email and receive a magic link
2. After clicking link, they land on `/account` logged in
3. All past orders with matching email are listed
4. Clicking an order opens `/order/:id` with full detail
5. Reorder adds available items to cart and navigates to `/order`
6. Session persists across browser visits without re-signing in
7. Page is fully functional on mobile
