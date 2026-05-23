# Buyer Account System — Design Spec
**Date:** 2026-05-23  
**Project:** kwg-website (kelstonway.com)  
**Status:** Approved

---

## Overview

Self-serve buyer accounts for kelstonway.com. Logged-in buyers get auto-filled order forms, order history, and reorder. No admin-side changes to kwg-structure — buyers are managed there independently.

---

## Section 1 — Data Layer

### New table: `buyer_profiles`

| column | type | notes |
|--------|------|-------|
| user_id | uuid PK | FK → auth.users, on delete cascade |
| business_name | text not null | |
| contact_name | text not null | |
| email | text not null | |
| phone | text | nullable |
| address_street | text | nullable |
| address_city | text | nullable |
| address_state | char(2) | nullable |
| address_zip | text | nullable |
| updated_at | timestamptz | auto-updated via trigger |

### Migration: `wholesale_orders`

Add column: `user_id uuid nullable` FK → auth.users (no cascade — preserve order history if account deleted).

### RLS policies

**buyer_profiles:**
- SELECT: `user_id = auth.uid()`
- INSERT: `user_id = auth.uid()`
- UPDATE: `user_id = auth.uid()`

**wholesale_orders:**
- SELECT: `user_id = auth.uid()` (buyers see only their own orders)
- INSERT: public (guest orders must still work — no auth required)
- No UPDATE/DELETE for buyers

### Security model

`user_id` is stamped on an order only at two points:
1. Order submitted while logged in (at insert time)
2. Immediately post-order via the CreateAccountPrompt (using the order ID held in router state from that session)

No email-based back-claiming. No retroactive linking. Someone who signs up with another person's email sees zero history — nothing links to their `user_id`.

---

## Section 2 — Order Form Auto-fill + Sign-in Nudge

### Auto-fill (logged in)

On `Order.tsx` mount, fetch `buyer_profiles` for `auth.uid()`. If a profile exists, pre-fill all form fields: business_name, contact_name, email, phone, address_street/city/state/zip. All fields remain editable.

On successful order submit, upsert `buyer_profiles` with the submitted values (keeps profile current automatically).

### Sign-in nudge (not logged in)

One-line banner at the top of the order form:

> "Have an account? **Sign in** to auto-fill your info."

Tapping "Sign in" navigates to `/account`. Not a modal, not a blocker.

### Post-order account creation (guest)

Existing `CreateAccountPrompt` on `/order-confirmed` handles signup. One addition: after successful signup, call a Supabase RPC to stamp `user_id` on the specific order ID from router state. This is the only case where a guest order gets linked to an account.

---

## Section 3 — Auth Flow

### Signup

Email + password. Instant account — no email confirmation link. Disable email confirmations in Supabase dashboard (Auth → Settings → "Enable email confirmations" off).

### Password reset

Keep existing magic link reset. User is locked out anyway, link makes sense. No change to current flow.

### Verification

None at signup. No OTP, no email link. Security comes from the order-linking model (Section 1), not from email ownership.

### Existing components — no changes needed

`AuthContext`, `AccountLogin` (sign in / sign up / reset modes), Nav logged-in indicator — all already built and correct.

---

## Section 4 — Account Dashboard & Order Detail

### Dashboard (existing, one fix)

`AccountDashboard` already renders order history and reorder. Current query loads all orders with no filter — once `user_id` and RLS are in place, the query automatically scopes to the current user. No query change needed.

### Order detail — new route `/account/order/:id`

Full-page buyer-facing order detail. Accessible from the dashboard order row click (currently navigates to `/order/:id` — update to `/account/order/:id`).

**Fetches:**
- `wholesale_orders` row (status, created_at, total_price, total_units, business_name, contact_name, address)
- `wholesale_order_items` for that order (plant_name, plant_size, plant_sku, qty_requested, unit_price)

**Displays:**
- Order reference (#XXXXXXXX), date, status badge
- Items list: plant name, size, qty, unit price, line total
- Order total
- Reorder button (existing `ReorderButton` component)
- RLS ensures buyers can only fetch their own orders

### Profile editing

New "Edit profile" section on AccountDashboard (below order history). Same fields as order form. Saves directly to `buyer_profiles` via upsert. No separate route — inline on the account page.

---

## What's Already Built (no changes)

- `AuthContext` — Supabase auth, session, signOut
- `AccountLogin` — sign in / sign up / reset (three modes, one component)
- `AccountDashboard` — order history, reorder button, password change
- `CreateAccountPrompt` on `/order-confirmed` — post-order account creation UI
- `ReorderButton` — checks current availability, adds to cart
- Nav logged-in indicator
- `ErrorBanner` + `parseError` — error handling

---

## Out of Scope

- Multiple users per business account
- Billing vs. shipping addresses
- Wholesale approval gate before account access
- Email-based order claiming
- Admin view of buyer accounts on the website (managed in kwg-structure)
