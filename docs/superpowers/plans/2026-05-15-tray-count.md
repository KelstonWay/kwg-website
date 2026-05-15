# Tray Count / Unit of Measure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tray-based ordering to the KWG wholesale system — price is per each, sales are in trays, tray count defaults per SKU and can be overridden per count session.

**Architecture:** `plants.tray_count` (integer, default 1) is set per SKU in PlantForm. When a count session is published, the grower-confirmed `tray_count` is written directly to `availability_release_items.tray_count` (not nullable — always locked in at publish time). The website reads this column to compute `tray_price = unit_price × tray_count` everywhere. All ordering UI switches from eaches to trays. The server re-prices server-side to prevent client-side manipulation.

**Tech Stack:** React 19 + TypeScript, Supabase (kelston-way project `wuemcpptmjmvtzaciezq`), Vercel serverless functions, two repos: `kwg-availability` (counting PWA) and `kwg-website` (buyer-facing site).

**Key invariants:**
- `qty_available` = trays (confirmed by operator)
- `unit_price` = price per each (single plant)
- `tray_price = unit_price × tray_count` — computed everywhere, never stored
- `tray_count` on release items is always populated at publish time (no nullable fallback needed)

---

## File Map

| File | Change |
|------|--------|
| Supabase migration | Add `plants.tray_count`, `availability_release_items.tray_count` |
| `kwg-availability/src/lib/types.ts` | Add `tray_count` to `Plant` and `AvailabilityReleaseItem` |
| `kwg-availability/src/lib/draft.ts` | Add `tray_count: number` to `DraftItem` |
| `kwg-availability/src/pages/PlantForm.tsx` | Add tray_count input field |
| `kwg-availability/src/pages/AddToCount.tsx` | Show tray count, allow override in qty step, pass to draft |
| `kwg-availability/src/pages/CountSession.tsx` | Write `tray_count` to publish rows |
| `kwg-website/src/lib/types.ts` | Add `tray_count` to `AvailabilityItem`, `tray_count`+`tray_price` to `CartItem`, `tray_count` to `WholesaleOrderItem` |
| `kwg-website/src/lib/cart.ts` | `cartTotal()` uses `tray_price` |
| `kwg-website/src/pages/Availability.tsx` | Query includes `tray_count`, calculations + display in trays |
| `kwg-website/src/pages/Order.tsx` | Labels, calculations, totals in trays |
| `kwg-website/api/submit-order.ts` | Server re-prices with `tray_count`, stores `tray_count` on order items |

---

## Task 1: Database Migration

**Files:**
- Create: `kwg-website/supabase/migrations/20260515_tray_count.sql` (reference only — apply via Supabase MCP)

- [ ] **Step 1: Apply migration**

Run via Supabase MCP (`mcp__claude_ai_Supabase__apply_migration`, project `wuemcpptmjmvtzaciezq`):

```sql
-- Add tray_count to plants (default 1 = individual plants, no tray grouping)
ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS tray_count INTEGER NOT NULL DEFAULT 1;

-- Add tray_count to release items (locked in at publish time)
ALTER TABLE availability_release_items
  ADD COLUMN IF NOT EXISTS tray_count INTEGER NOT NULL DEFAULT 1;
```

- [ ] **Step 2: Verify columns exist**

Run via Supabase MCP:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name IN ('plants', 'availability_release_items')
  AND column_name = 'tray_count'
ORDER BY table_name;
```
Expected: 2 rows, both `integer`, both default `1`.

- [ ] **Step 3: Commit migration file**

```bash
mkdir -p /home/samuel/kwg-website/supabase/migrations
cat > /home/samuel/kwg-website/supabase/migrations/20260515_tray_count.sql << 'EOF'
ALTER TABLE plants
  ADD COLUMN IF NOT EXISTS tray_count INTEGER NOT NULL DEFAULT 1;

ALTER TABLE availability_release_items
  ADD COLUMN IF NOT EXISTS tray_count INTEGER NOT NULL DEFAULT 1;
EOF
git -C /home/samuel/kwg-website add supabase/migrations/20260515_tray_count.sql
git -C /home/samuel/kwg-website commit -m "chore: add tray_count migration"
```

---

## Task 2: kwg-availability — Types

**Files:**
- Modify: `kwg-availability/src/lib/types.ts`

- [ ] **Step 1: Add `tray_count` to `Plant` interface**

In `/home/samuel/kwg-availability/src/lib/types.ts`, add after `unit_price`:

```typescript
export interface Plant {
  id: string
  sku: string
  name: string
  type: string | null
  genus: string | null
  tag: string | null
  variety: string | null
  size: string | null
  unit_price: number | null
  tray_count: number        // ← add this line
  photo_url: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}
```

- [ ] **Step 2: Add `tray_count` to `AvailabilityReleaseItem` interface**

Add after `unit_price`:

```typescript
export interface AvailabilityReleaseItem {
  id: string
  release_id: string
  plant_id: string
  qty_available: number
  unit_price: number | null
  tray_count: number        // ← add this line
  notes: string | null
  photo_url: string | null
  grade: number | null
  is_cover: boolean
  website_visible: boolean
  created_at: string
  plant?: Plant
}
```

- [ ] **Step 3: Commit**

```bash
git -C /home/samuel/kwg-availability add src/lib/types.ts
git -C /home/samuel/kwg-availability commit -m "feat: add tray_count to Plant and AvailabilityReleaseItem types"
```

---

## Task 3: kwg-availability — DraftItem

**Files:**
- Modify: `kwg-availability/src/lib/draft.ts`

- [ ] **Step 1: Add `tray_count` to `DraftItem`**

Add after `unit_price`:

```typescript
export interface DraftItem {
  id: string
  plant_id: string
  plant_name: string
  plant_sku: string
  plant_size: string
  qty: number
  unit_price: number | null
  tray_count: number        // ← add this line (from plant default, overridable in qty step)
  notes: string
  has_photo: boolean
  photo_url: string | null
  grade: 1 | 2 | 3 | null
  plant_tag: string | null
  added_at: string
}
```

- [ ] **Step 2: Commit**

```bash
git -C /home/samuel/kwg-availability add src/lib/draft.ts
git -C /home/samuel/kwg-availability commit -m "feat: add tray_count to DraftItem"
```

---

## Task 4: kwg-availability — PlantForm

**Files:**
- Modify: `kwg-availability/src/pages/PlantForm.tsx`

- [ ] **Step 1: Add `tray_count` to form state**

Find the `useState` for the form (it has fields like `sku`, `name`, `type`, `variety`, `size`, `unit_price`, `notes`). Add `tray_count`:

```typescript
const [trayCount, setTrayCount] = useState<string>(plant?.tray_count?.toString() ?? '1')
```

- [ ] **Step 2: Add input field to the form UI**

Add a `tray_count` number input. Place it adjacent to the `size` or `unit_price` field — somewhere logical in the form layout. Label it "TRAY COUNT":

```tsx
<div>
  <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1">
    TRAY COUNT
  </label>
  <input
    type="number"
    min="1"
    value={trayCount}
    onChange={e => setTrayCount(e.target.value)}
    className="w-full border border-outline-variant rounded px-3 py-2 font-body-md focus:outline-none focus:border-primary"
    placeholder="1"
  />
  <p className="text-xs text-on-surface-variant mt-1">Plants per tray/flat for this SKU</p>
</div>
```

- [ ] **Step 3: Include `tray_count` in insert and update payloads**

Find the Supabase `.insert({...})` and `.update({...})` calls. Add:

```typescript
tray_count: parseInt(trayCount, 10) || 1,
```

- [ ] **Step 4: TypeScript check**

```bash
cd /home/samuel/kwg-availability && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git -C /home/samuel/kwg-availability add src/pages/PlantForm.tsx
git -C /home/samuel/kwg-availability commit -m "feat: add tray_count field to PlantForm"
```

---

## Task 5: kwg-availability — AddToCount

**Files:**
- Modify: `kwg-availability/src/pages/AddToCount.tsx`

- [ ] **Step 1: Add `trayCount` state**

After the existing state declarations near the top, add:

```typescript
const [trayCount, setTrayCount] = useState<number>(1)
```

- [ ] **Step 2: Set tray count from plant when plant is selected**

In `handleSelectPlant`:

```typescript
function handleSelectPlant(plant: Plant) {
  setSelectedPlant(plant)
  setPrice(plant.unit_price?.toString() ?? '')
  setTrayCount(plant.tray_count ?? 1)   // ← add this line
  setStep('qty')
}
```

- [ ] **Step 3: Add tray count override input in the qty step UI**

Find the qty step JSX (the step rendered when `step === 'qty'`). After the unit price input and before the Save button, add:

```tsx
<div className="mt-4">
  <label className="font-label-caps text-[11px] text-on-surface-variant uppercase block mb-1">
    Tray Count
  </label>
  <div className="flex items-center gap-3">
    <input
      type="number"
      min="1"
      value={trayCount}
      onChange={e => setTrayCount(parseInt(e.target.value, 10) || 1)}
      className="w-20 border border-outline-variant rounded px-3 py-2 font-body-md text-center focus:outline-none focus:border-primary"
    />
    <span className="font-body-md text-sm text-on-surface-variant">
      plants/tray · tray total ${((parseFloat(price || '0') || 0) * trayCount).toFixed(2)}
    </span>
  </div>
</div>
```

- [ ] **Step 4: Pass `tray_count` to `addDraftItem`**

In `handleAddAnother` (the function that calls `addDraftItem`), add `tray_count: trayCount` to the item object:

```typescript
addDraftItem(session, {
  plant_id: selectedPlant.id,
  plant_name: selectedPlant.name,
  plant_sku: selectedPlant.sku,
  plant_size: selectedPlant.size ?? '',
  plant_tag: selectedPlant.tag ?? null,
  qty: finalQty,
  unit_price: price ? parseFloat(price) : null,
  tray_count: trayCount,      // ← add this line
  notes: makeSeparate && separateNote ? separateNote : notes,
  has_photo: !!photoBlob,
  photo_url: null,
  grade,
}, itemId)
```

- [ ] **Step 5: Reset tray count in `resetForm`**

```typescript
function resetForm() {
  setStep('photo')
  setPhotoDataUrl(null)
  setPhotoBlob(null)
  setSelectedPlant(null)
  setSearch('')
  setQtyText('0')
  setPrice('')
  setTrayCount(1)          // ← add this line
  setNotes('')
  setGrade(null)
  setMakeSeparate(false)
  setSeparateNote('')
  setShowCalc(false)
  resetCalc()
  setPhotoKey(k => k + 1)
}
```

- [ ] **Step 6: Add `tray_count` to Quick Create plant insert**

In `handleQuickCreate`, find the `.insert({...})` call and add:

```typescript
tray_count: 1,
```

- [ ] **Step 7: Add `tray_count` to Append Save insert**

In `handleAppendSave`, find the `supabase.from('availability_release_items').insert({...})` call and add:

```typescript
tray_count: trayCount,
```

Also ensure `trayCount` state is used/set in the append flow — the plant selection handler already sets it in Step 2.

- [ ] **Step 8: TypeScript check**

```bash
cd /home/samuel/kwg-availability && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git -C /home/samuel/kwg-availability add src/pages/AddToCount.tsx
git -C /home/samuel/kwg-availability commit -m "feat: tray count in AddToCount — pre-fill from plant, allow override"
```

---

## Task 6: kwg-availability — CountSession Publish

**Files:**
- Modify: `kwg-availability/src/pages/CountSession.tsx`

- [ ] **Step 1: Add `tray_count` to publish rows**

In `handlePublish`, find the `rows` array construction (around line 184). Add `tray_count`:

```typescript
const rows = itemsWithUrls.map((item) => {
  const tag = item.plant_tag ?? null
  const website_visible =
    tag !== null
      ? selectedTags.has(tag)
      : selectedTags.has('__untagged__')
  return {
    release_id: release.id,
    plant_id: item.plant_id,
    qty_available: item.qty,
    unit_price: item.unit_price,
    tray_count: item.tray_count,    // ← add this line
    notes: item.notes || null,
    photo_url: item.photo_url || null,
    grade: item.grade ?? null,
    is_cover: coverSet.has(item.id),
    website_visible,
  }
})
```

- [ ] **Step 2: TypeScript check**

```bash
cd /home/samuel/kwg-availability && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /home/samuel/kwg-availability add src/pages/CountSession.tsx
git -C /home/samuel/kwg-availability commit -m "feat: write tray_count to release items on publish"
```

---

## Task 7: kwg-website — Types

**Files:**
- Modify: `kwg-website/src/lib/types.ts`

- [ ] **Step 1: Add `tray_count` to `AvailabilityItem`**

Find the `AvailabilityItem` interface. Add `tray_count: number` after `unit_price`:

```typescript
export interface AvailabilityItem {
  id: string
  plant_id: string
  plant_name: string
  plant_sku: string
  plant_size: string
  qty_available: number
  unit_price: number
  tray_count: number        // ← add
  photo_url: string | null
  grade: number | null
  release_id: string
  notes: string | null
}
```

- [ ] **Step 2: Add `tray_count` and `tray_price` to `CartItem`**

```typescript
export interface CartItem {
  id: string
  plant_id: string
  plant_name: string
  plant_sku: string
  plant_size: string
  unit_price: number
  tray_count: number        // ← add
  tray_price: number        // ← add (= unit_price × tray_count, computed at add-to-cart time)
  qty: number               // quantity in trays
  photo_url: string | null
  release_item_id: string
}
```

- [ ] **Step 3: Add `tray_count` to `WholesaleOrderItem` (if it exists)**

If there is a `WholesaleOrderItem` interface in types.ts, add `tray_count: number`. This ensures order records capture the tray count for historical accuracy.

- [ ] **Step 4: Commit**

```bash
git -C /home/samuel/kwg-website add src/lib/types.ts
git -C /home/samuel/kwg-website commit -m "feat: add tray_count/tray_price to website types"
```

---

## Task 8: kwg-website — cart.ts

**Files:**
- Modify: `kwg-website/src/lib/cart.ts`

- [ ] **Step 1: Update `cartTotal()` to use `tray_price`**

Find `cartTotal()`. Change:

```typescript
// before
export function cartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.qty * i.unit_price, 0)
}
```

To:

```typescript
export function cartTotal(): number {
  return getCart().reduce((sum, i) => sum + i.qty * i.tray_price, 0)
}
```

- [ ] **Step 2: Verify `cartCount()` is already in trays**

`cartCount()` does `sum + i.qty`. Since `qty` is now in trays, this is correct — just confirm the label elsewhere says "trays". No code change needed.

- [ ] **Step 3: Commit**

```bash
git -C /home/samuel/kwg-website add src/lib/cart.ts
git -C /home/samuel/kwg-website commit -m "feat: cart total uses tray_price"
```

---

## Task 9: kwg-website — Availability.tsx

**Files:**
- Modify: `kwg-website/src/pages/Availability.tsx`

This is the largest change. Work through it section by section.

- [ ] **Step 1: Update Supabase query to fetch `tray_count`**

Find the `.select('*, plants(name, sku, size)')` call. Change to:

```typescript
.select('*, plants(name, sku, size)')
```
→ No change needed for release items — `tray_count` is now a direct column on `availability_release_items`, so `*` already includes it. Confirm that `tray_count` is present in the fetched data by checking that TypeScript doesn't complain after the type update.

- [ ] **Step 2: Map fetched data to include `tray_count`**

Find where fetched items are mapped to `AvailabilityItem` objects. Ensure `tray_count` is included:

```typescript
const mapped: AvailabilityItem = {
  id: item.id,
  plant_id: item.plant_id,
  plant_name: item.plants.name,
  plant_sku: item.plants.sku,
  plant_size: item.plants.size ?? '',
  qty_available: item.qty_available,
  unit_price: item.unit_price ?? 0,
  tray_count: item.tray_count ?? 1,    // ← add
  photo_url: item.photo_url,
  grade: item.grade,
  release_id: item.release_id,
  notes: item.notes,
}
```

- [ ] **Step 3: Update per-row price display**

Find where `unit_price` is displayed per item in order mode. Change to show tray price:

Before (approximate):
```tsx
<span>${item.unit_price.toFixed(2)}/ea</span>
```

After:
```tsx
<span>${(item.unit_price * item.tray_count).toFixed(2)}/tray ({item.tray_count}-count)</span>
```

- [ ] **Step 4: Update `totalPrice` calculation**

Find `totalPrice` in the order mode logic. Change from per-each to per-tray:

```typescript
// before
const totalPrice = Object.entries(orderQtys).reduce((sum, [id, qty]) => {
  const item = items.find(i => i.id === id)
  return sum + (item ? qty * item.unit_price : 0)
}, 0)

// after
const totalPrice = Object.entries(orderQtys).reduce((sum, [id, qty]) => {
  const item = items.find(i => i.id === id)
  return sum + (item ? qty * item.unit_price * item.tray_count : 0)
}, 0)
```

- [ ] **Step 5: Update qty input max validation**

The `max` attribute on qty inputs should reference `qty_available` directly (it's already in trays):

```tsx
<input
  type="number"
  min="0"
  max={item.qty_available}
  ...
/>
```

No change needed if it already uses `item.qty_available` as max.

- [ ] **Step 6: Update `handleReviewOrder` to pass tray fields to cart**

Find `handleReviewOrder` (or equivalent function that adds items to cart). Add `tray_count` and `tray_price`:

```typescript
function handleReviewOrder() {
  Object.entries(orderQtys).forEach(([releaseItemId, qty]) => {
    if (qty <= 0) return
    const item = items.find(i => i.id === releaseItemId)
    if (!item) return
    addToCart({
      id: item.id,
      plant_id: item.plant_id,
      plant_name: item.plant_name,
      plant_sku: item.plant_sku,
      plant_size: item.plant_size,
      unit_price: item.unit_price,
      tray_count: item.tray_count,                         // ← add
      tray_price: item.unit_price * item.tray_count,       // ← add
      qty,
      photo_url: item.photo_url,
      release_item_id: item.id,
    })
  })
  navigate('/order')
}
```

- [ ] **Step 7: Update order mode banner text**

Find the text "Enter the quantity you'd like for each item" (or similar). Change to reference trays:

```tsx
<p>Enter the number of trays you'd like for each item.</p>
```

- [ ] **Step 8: Update sticky order bar label**

Find `{totalUnits} units` in the sticky bar. Change to:

```tsx
{totalUnits} trays
```

And rename the variable from `totalUnits` to `totalTrays` for clarity.

- [ ] **Step 9: Update qty_available display**

Find where available quantity is shown per item (e.g., "48 available"). Add "trays":

```tsx
<span>{item.qty_available} trays available</span>
```

- [ ] **Step 10: Update CSV download**

In `downloadCSV()`, update the "Unit Price" column to show tray price, and add a tray count column:

```typescript
// Find the header row and add Tray Count, update Unit Price label
const header = ['Plant Name', 'Item #', 'Size', 'Qty Available (trays)', 'Tray Count', 'Tray Price', 'Unit Price (each)', 'Notes']

// Find the data row construction and add:
item.tray_count,
(item.unit_price * item.tray_count).toFixed(2),
item.unit_price.toFixed(2),
```

- [ ] **Step 11: TypeScript check**

```bash
cd /home/samuel/kwg-website && npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 12: Commit**

```bash
git -C /home/samuel/kwg-website add src/pages/Availability.tsx
git -C /home/samuel/kwg-website commit -m "feat: tray-based ordering in Availability — display, quantities, and cart"
```

---

## Task 10: kwg-website — Order.tsx

**Files:**
- Modify: `kwg-website/src/pages/Order.tsx`

- [ ] **Step 1: Update price display per line item**

Find `× ${item.unit_price.toFixed(2)}`. Change to show tray price with label:

```tsx
<span className="font-body-md text-sm text-on-surface-variant">
  × ${item.tray_price.toFixed(2)}/tray ({item.tray_count}-count)
</span>
```

- [ ] **Step 2: Update line total calculation**

Find `item.qty * item.unit_price`. Change to:

```typescript
item.qty * item.tray_price
```

- [ ] **Step 3: Update "total units" label**

Find `{totalUnits.toLocaleString()} total units`. Change to:

```tsx
{totalUnits.toLocaleString()} total trays
```

- [ ] **Step 4: TypeScript check**

```bash
cd /home/samuel/kwg-website && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git -C /home/samuel/kwg-website add src/pages/Order.tsx
git -C /home/samuel/kwg-website commit -m "feat: Order page shows tray price and tray totals"
```

---

## Task 11: kwg-website — submit-order.ts (server-side)

**Files:**
- Modify: `kwg-website/api/submit-order.ts`

- [ ] **Step 1: Update Supabase query to fetch `tray_count`**

Find the `.select('id, unit_price, qty_available, plant_id, plants(name, sku, size)')` call. Add `tray_count`:

```typescript
.select('id, unit_price, tray_count, qty_available, plant_id, plants(name, sku, size)')
```

- [ ] **Step 2: Compute tray price in `orderLines` map**

Find the `orderLines` array construction. Update to compute tray price:

```typescript
const orderLines = items
  .map((i: any) => {
    const ri = riMap[i.release_item_id]
    if (!ri) return null
    const qty = Math.max(1, Math.floor(Number(i.qty) || 1))
    const unitPrice = ri.unit_price ?? 0
    const trayCount = ri.tray_count ?? 1          // ← add
    const trayPrice = unitPrice * trayCount        // ← add
    return {
      release_item_id: i.release_item_id,
      plant_id: ri.plant_id,
      plant_name: ri.plants?.name ?? '',
      plant_sku: ri.plants?.sku ?? '',
      plant_size: ri.plants?.size ?? '',
      unit_price: unitPrice,
      tray_count: trayCount,                       // ← add
      tray_price: trayPrice,                       // ← add
      qty_requested: qty,
      line_total: trayPrice * qty,                 // ← was: unitPrice * qty
    }
  })
  .filter(Boolean) as any[]
```

- [ ] **Step 3: Update `totalUnits` and `totalPrice` variables**

These follow after `orderLines`. `totalUnits` now means total trays:

```typescript
const totalTrays = orderLines.reduce((s, i) => s + i.qty_requested, 0)   // was: totalUnits
const totalPrice = orderLines.reduce((s, i) => s + i.line_total, 0)
```

Update the `wholesale_orders` insert:

```typescript
await supabase.from('wholesale_orders').insert({
  ...
  total_units: totalTrays,    // field name stays same, semantics = trays now
  total_price: totalPrice,
})
```

- [ ] **Step 4: Add `tray_count` to `wholesale_order_items` insert**

```typescript
await supabase.from('wholesale_order_items').insert(
  orderLines.map(l => ({ order_id: order.id, ...l }))
)
```

This already spreads the whole `orderLines` object, so `tray_count` and `tray_price` are included. But `wholesale_order_items` table may not have these columns yet — check.

Run via Supabase MCP:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'wholesale_order_items';
```

If `tray_count` and `tray_price` columns don't exist, apply:
```sql
ALTER TABLE wholesale_order_items
  ADD COLUMN IF NOT EXISTS tray_count INTEGER,
  ADD COLUMN IF NOT EXISTS tray_price NUMERIC(10, 2);
```

- [ ] **Step 5: Update email HTML**

In the email `itemsHtml` template, update to show tray price instead of unit price:

```typescript
const itemsHtml = orderLines
  .map(i => `<tr>
    <td>${esc(i.plant_name)}</td>
    <td>${esc(i.plant_size)}</td>
    <td>${i.qty_requested} trays (${i.tray_count}-count)</td>
    <td>$${i.tray_price.toFixed(2)}/tray</td>
    <td>$${i.line_total.toFixed(2)}</td>
  </tr>`)
  .join('')
```

Update the email summary line:

```typescript
`<strong>Total: ${totalTrays} trays / $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>`
```

- [ ] **Step 6: TypeScript check**

```bash
cd /home/samuel/kwg-website && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git -C /home/samuel/kwg-website add api/submit-order.ts
git -C /home/samuel/kwg-website commit -m "feat: server re-prices with tray_count, records tray_count on order items"
```

---

## Task 12: End-to-End Smoke Test

Before deploying, verify the full flow manually.

- [ ] **Step 1: Start kwg-availability dev server**

```bash
cd /home/samuel/kwg-availability && npm run dev
```

Open http://localhost:5173. Log in as `samuel@kelstonway.com` / `KWG2026`.

- [ ] **Step 2: Verify PlantForm shows tray_count field**

Navigate to a plant in PlantForm. Confirm "TRAY COUNT" input is visible and populated (should show `1` for existing plants).

Edit a test plant (SKU 10000001–10000010), set tray_count to 6. Save.

- [ ] **Step 3: Verify AddToCount shows tray count**

Start a count session. Select the plant you just edited. In the qty step, confirm the tray count shows `6` and the tray total price is computed correctly.

Change the tray count to 4 (override). Save to draft.

- [ ] **Step 4: Start kwg-website dev server**

```bash
cd /home/samuel/kwg-website && npm run dev
```

Open http://localhost:5174 (or whatever Vite assigns).

- [ ] **Step 5: Publish count and check Availability page**

In kwg-availability: publish the count session.

In kwg-website: navigate to /availability. Confirm:
- "6 trays available" (or the published qty)
- Price shows as tray price with count label (e.g., "$35.88/tray (6-count)")
- Qty input is labeled in trays

- [ ] **Step 6: Add to cart and check Order page**

Enter qty 2, click Review Order. On /order:
- Confirm price shows `× $35.88/tray (6-count)`
- Confirm line total = `2 × $35.88 = $71.76`
- Confirm footer shows "2 total trays"

- [ ] **Step 7: Confirm cart total**

Estimated Total in the cart should match sum of `qty × tray_price` for all items.

---

## Task 13: Deploy

- [ ] **Step 1: Deploy kwg-availability**

```bash
cd /home/samuel/kwg-availability && mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```

- [ ] **Step 2: Deploy kwg-website**

```bash
cd /home/samuel/kwg-website && mv .git .git_backup && npx vercel --prod --yes && mv .git_backup .git
```

- [ ] **Step 3: Smoke test production**

Open https://kelstonway.com/availability and verify tray pricing and quantities show correctly.

---

## Self-Review Checklist

- [x] DB migration covers both tables
- [x] `tray_count` flows from PlantForm → plants table → AddToCount → DraftItem → CountSession publish → release_items → Availability.tsx → CartItem → Order.tsx → submit-order.ts → wholesale_order_items
- [x] `tray_price` is computed everywhere from `unit_price × tray_count`, never stored (except as convenience on order items)
- [x] Server re-prices from DB — client qty in trays, server resolves tray_count and recomputes line totals
- [x] `qty_available` stays in trays, no conversion needed anywhere
- [x] CSV export updated with tray fields
- [x] Email notification updated to show trays
- [x] All TypeScript checks happen before commit in each task
- [x] AppendSave flow in AddToCount (direct publish to existing release) also passes tray_count
- [x] Quick Create plant form defaults to tray_count = 1
- [x] wholesale_order_items may need schema update — covered in Task 11 Step 4
