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

// Buyers may request more than the published quantity (2026-07-31, Samuel): an order is a
// request KWG reviews, not a guaranteed reservation. Quantities are NOT clamped to
// qty_available — the UI warns on any line over the published number, and
// create_wholesale_order floors the stock decrement at zero instead of rejecting.
export function addToCart(item: CartItem): void {
  const cart = getCart()
  const existing = cart.find((i) => i.release_item_id === item.release_item_id)
  if (existing) {
    existing.qty = existing.qty + item.qty
    saveCart(cart)
  } else {
    saveCart([...cart, { ...item }])
  }
}

export function updateQty(releaseItemId: string, qty: number): void {
  const cart = getCart()
  const item = cart.find((i) => i.release_item_id === releaseItemId)
  if (qty <= 0 || !item) {
    saveCart(cart.filter((i) => i.release_item_id !== releaseItemId))
  } else {
    saveCart(cart.map((i) => (i.release_item_id === releaseItemId ? { ...i, qty } : i)))
  }
}

export function removeFromCart(releaseItemId: string): void {
  saveCart(getCart().filter((i) => i.release_item_id !== releaseItemId))
}

export function clearCart(): void {
  localStorage.removeItem(KEY)
}
