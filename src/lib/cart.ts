import type { CartItem } from './types'

const KEY = 'kwg_cart'

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveCart(items: CartItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function addToCart(item: CartItem): void {
  const cart = getCart()
  const existing = cart.find((i) => i.release_item_id === item.release_item_id)
  if (existing) {
    existing.qty += item.qty
    saveCart(cart)
  } else {
    saveCart([...cart, item])
  }
}

export function updateQty(releaseItemId: string, qty: number): void {
  const cart = getCart()
  if (qty <= 0) {
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
