import type { CartItem } from './types'

const KEY = 'kwg_cart'
const VERSION_KEY = 'kwg_cart_version'
// Bump when CartItem pricing semantics change. v2: unit_price/tray_price are per-tray.
// v3: CartItem carries qty_available; older carts lack it and must be dropped.
// Carts written under an older version store incompatible totals and must be dropped.
const CART_VERSION = '3'

export function getCart(): CartItem[] {
  try {
    if (localStorage.getItem(VERSION_KEY) !== CART_VERSION) {
      localStorage.removeItem(KEY)
      localStorage.setItem(VERSION_KEY, CART_VERSION)
      return []
    }
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(VERSION_KEY, CART_VERSION)
  localStorage.setItem(KEY, JSON.stringify(items))
}

// Inventory uses decrement-on-order: create_wholesale_order hard-rejects any line whose
// qty exceeds availability_release_items.qty_available. Clamp every cart mutation to the
// snapshot carried on the item so the UI can never build an order the server will reject.
export function addToCart(item: CartItem): void {
  const cart = getCart()
  const existing = cart.find((i) => i.release_item_id === item.release_item_id)
  if (existing) {
    existing.qty = Math.min(existing.qty + item.qty, item.qty_available)
    saveCart(cart)
  } else {
    saveCart([...cart, { ...item, qty: Math.min(item.qty, item.qty_available) }])
  }
}

export function updateQty(releaseItemId: string, qty: number): void {
  const cart = getCart()
  const item = cart.find((i) => i.release_item_id === releaseItemId)
  if (qty <= 0 || !item) {
    saveCart(cart.filter((i) => i.release_item_id !== releaseItemId))
  } else {
    const capped = Math.min(qty, item.qty_available)
    saveCart(cart.map((i) => (i.release_item_id === releaseItemId ? { ...i, qty: capped } : i)))
  }
}

export function removeFromCart(releaseItemId: string): void {
  saveCart(getCart().filter((i) => i.release_item_id !== releaseItemId))
}

export function clearCart(): void {
  localStorage.removeItem(KEY)
}
