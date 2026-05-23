# Buyer Account System — Design Spec
**Date:** 2026-05-23  
**Project:** kwg-website (kelstonway.com)  
**Status:** Approved — v2 (Codex review applied)

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

Add columns (all nullable, preserving existing guest orders):
- `user_id uuid` FK → auth.users `ON DELETE SET NULL` — if a buyer's auth account is deleted, their orders remain with `user_id = null` (history preserved, FK constraint does not block user deletion)
- `claim_token uuid` — server-generated one-time token for post-order account linking; cleared after use
- `address_street text`
- `address_city text`
- `address_state char(2)`
- `address_zip text`

Address columns are immutable per-order snapshots — they never change after insert. Profile edits do not affect past order addresses.

### RLS policies

**buyer_profiles:**
- SELECT: `USING (user_id = auth.uid())`
- INSERT: `WITH CHECK (user_id = auth.uid())`
- UPDATE: `USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid())`
- `user_id` is immutable after insert — enforce via trigger that raises an error if `NEW.user_id <> OLD.user_id`

**wholesale_orders:**
- SELECT (buyers): `user_id = auth.uid()` — scopes account dashboard and order detail to the current user
- SELECT (order status/confirmation pages): via `/api/order-status` server endpoint using service key + `confirm_token` validation. No direct client SELECT by bare order ID for unauthenticated users.
- INSERT: **none** — all inserts go through `/api/submit-order` using the service role key, which bypasses RLS. No direct client writes.
- No UPDATE/DELETE for buyers

**wholesale_order_items:**
- SELECT (authenticated buyers): `exists (select 1 from wholesale_orders o where o.id = order_id and o.user_id = auth.uid())`
- SELECT (order status page): via `/api/order-status` server endpoint (service key) — not direct client access
- No INSERT/UPDATE/DELETE for buyers (items inserted server-side via service key)

**Impact on existing order confirmation flow:** `OrderStatus.tsx` is Samuel's admin confirmation page (reached via the emailed confirm link). Buyers never see this page — they see `/order-confirmed` immediately after submitting. `OrderStatus.tsx` must be migrated to call `POST /api/order-status` with `{ orderId, token }` in the JSON body (never in the URL). The page reads the token from the URL once, immediately strips it from browser history via `window.history.replaceState`, then calls the POST endpoint. This endpoint is admin-facing (returns full order + items for Samuel's review) and is not exposed to buyer account flows.

### Security model

`user_id` is stamped on an order only at two points:

1. **Order submitted while logged in:** `/api/submit-order` reads the Supabase Bearer token from the `Authorization` header, verifies it server-side via `supabase.auth.getUser(token)`, and stamps the verified `auth.uid()`. Never accepts `user_id` from the request body. Order header, items, address columns, user stamp, and claim token are all created inside a single Postgres RPC (`create_wholesale_order`) so the insert is truly atomic — no partial states possible. The RPC is called with the service key. Service key absence causes request failure at startup, not anon fallback. The RPC is not idempotent by design — the client must not retry on timeout without user confirmation, as duplicate orders could result. Network retries should be handled at the UI layer (show error, prompt buyer to check their email before resubmitting).

2. **Post-order account creation:** `/api/claim-order` RPC validates: `claim_token` matches the order row, `user_id is null`, order was created within the last 2 hours. On success, stamps `user_id` and clears `claim_token` atomically. Order ID alone is never sufficient to claim.

No email-based back-claiming. No retroactive linking. Someone who signs up with another person's email sees zero history — nothing links to their `user_id`.

### Order history limit

Dashboard query fetches a maximum of **50 orders** (`.limit(50)`). Data is never deleted — the limit is display-only. If a buyer has more than 50 orders in the future, pagination can be added then.

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

`/api/submit-order` generates a `claim_token` UUID and returns it alongside `orderId` in the response. Both are passed via router state to `/order-confirmed` AND persisted to `sessionStorage` keyed as `kwg_claim_${orderId}` immediately after submit — this survives page refresh within the same browser tab. `CreateAccountPrompt` reads the claim credential from router state first, falling back to `sessionStorage`. After successful signup it calls `POST /api/claim-order` with `{ orderId, claimToken }`, then clears the `sessionStorage` entry. The token is cleared server-side after use and expires after 2 hours.

---

## Section 3 — Auth Flow

### Signup

Email + password. Instant account — no email confirmation link. Disable email confirmations in Supabase dashboard (Auth → Settings → "Enable email confirmations" off).

### Password reset

Existing magic link reset — no changes. `AccountLogin` already implements `supabase.auth.resetPasswordForEmail` and the `PasswordForm` redirect. This flow remains intact.

**Known limitation:** An adversary who signs up with someone else's email address could have that email owner reset the password and take the account. In this B2B context (known wholesale buyers, no open signup promotion), this risk is accepted. The damage is limited — the real email owner would only see orders the bad actor placed while logged in. No guest orders are affected. OTP-gated reset can be added later if this becomes a real concern.

### Verification

None. Signup is instant — email + password. Supabase email confirmations disabled. Security comes from the order-linking model (Section 1), not email ownership.

### Existing components — no changes

`AuthContext`, `AccountLogin` (sign in / sign up / reset modes), Nav logged-in indicator — all already correct. No modifications needed.

---

## Section 4 — Account Dashboard & Order Detail

### Dashboard (existing, two fixes)

`AccountDashboard` already renders order history and reorder. Changes:
1. Add `.limit(50)` to the orders query (display cap, not data deletion)
2. Add explicit `.eq('user_id', user.id)` filter to the query as defense-in-depth alongside RLS. Do not rely on RLS alone — if a migration deploys before policies are live, a filter-only query prevents tenant data exposure.

**Deploy sequencing:** Enable RLS policies on `wholesale_orders` and `wholesale_order_items` before deploying any code that adds account-linked order routes or shows order history to authenticated users.

### Order detail — new route `/account/order/:id`

Full-page buyer-facing order detail. Accessible from dashboard order row click (currently navigates to `/order/:id` — update to `/account/order/:id`).

**Fetches:**
- `wholesale_orders` row with explicit `.eq('id', orderId).eq('user_id', user.id)` filter (defense-in-depth alongside RLS). If the row returns empty, render a 404-style "Order not found" — never expose whether the order exists. Address read from the immutable order snapshot, not the profile.
- `wholesale_order_items` for that order (plant_name, plant_size, plant_sku, qty_requested, unit_price) — fetched only after the parent order row is confirmed to belong to the current user, using `.eq('order_id', orderId)` alongside RLS. Items are never fetched if the parent order lookup returns empty.

**Displays:**
- Order reference (#XXXXXXXX), date, status badge
- Delivery address (from order snapshot)
- Items list: plant name, size, qty, unit price, line total
- Order total
- Reorder button (existing `ReorderButton` component)

### Profile editing

New "Edit profile" section on AccountDashboard (below order history). Same fields as order form. Saves directly to `buyer_profiles` via upsert. No separate route — inline on the account page.

---

## New API Routes

### `POST /api/order-status`

Replaces direct client-side Supabase read in `OrderStatus.tsx`. Uses service key.

**Request body:** `{ orderId: string, token: string }` — token in POST body, never in URL.  
**Validates:** `confirm_token` matches the order row AND order was created within 7 days. Token is cleared on order confirmation (existing `/api/confirm-order` already handles this).  
**Returns:** full order row + items — this is Samuel's admin confirmation page, not a buyer-facing endpoint. The confirm token is only emailed to Samuel, so full order data is appropriate here.  
**No auth required** — confirm token is the credential. Token is stripped from browser URL before the API call via `window.history.replaceState`.  
**Token lifecycle:** valid for 7 days from order creation OR until order is confirmed (whichever comes first). `/api/confirm-order` must explicitly set `confirm_token = null` on the order row after a successful confirmation — this is a required change to the existing endpoint. After token clearance, the status page is no longer accessible via token; authenticated buyers use the account dashboard instead.

### `POST /api/claim-order`

Links a guest order to a newly created account. Called by `CreateAccountPrompt` after successful signup.

**Request body:** `{ orderId: string, claimToken: string }`  
**Auth:** requires valid Bearer token (user must be signed in)  
**Server validates:**
- Bearer token → verified `auth.uid()`
- Order row: `id = orderId`, `claim_token = claimToken`, `user_id is null`, `created_at > now() - interval '2 hours'`
- Updates atomically: `SET user_id = auth.uid(), claim_token = null`

**Never:** accepts `user_id` from request body, claims by email, claims orders already linked.

---

## What's Already Built (no changes)

- `AuthContext` — Supabase auth, session, signOut
- `AccountLogin` — sign in / sign up / reset (three modes, one component)
- `AccountDashboard` — order history, reorder button, password change
- `CreateAccountPrompt` on `/order-confirmed` — post-order account creation UI (needs claim-order call wired in)
- `ReorderButton` — checks current availability, adds to cart
- Nav logged-in indicator
- `ErrorBanner` + `parseError` — error handling

---

## Out of Scope

- Multiple users per business account
- Billing vs. shipping addresses
- Wholesale approval gate before account access
- Email-based order claiming
- Pagination beyond 50 orders (add later if needed)
- Admin view of buyer accounts on the website (managed in kwg-structure)
