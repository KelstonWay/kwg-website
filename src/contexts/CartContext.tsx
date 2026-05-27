import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import {
  getCart,
  addToCart as cartAdd,
  updateQty as cartUpdateQty,
  removeFromCart as cartRemove,
  clearCart as cartClear,
} from '../lib/cart'
import type { CartItem } from '../lib/types'

interface CartContextValue {
  items: CartItem[]
  total: number
  varietyCount: number
  addToCart: (item: CartItem) => void
  updateQty: (releaseItemId: string, qty: number) => void
  removeFromCart: (releaseItemId: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => getCart())

  const refresh = useCallback(() => setItems(getCart()), [])

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'kwg_cart') refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const addToCart = useCallback(
    (item: CartItem) => {
      cartAdd(item)
      refresh()
    },
    [refresh]
  )

  const updateQty = useCallback(
    (releaseItemId: string, qty: number) => {
      cartUpdateQty(releaseItemId, qty)
      refresh()
    },
    [refresh]
  )

  const removeFromCart = useCallback(
    (releaseItemId: string) => {
      cartRemove(releaseItemId)
      refresh()
    },
    [refresh]
  )

  const clearCart = useCallback(() => {
    cartClear()
    refresh()
  }, [refresh])

  return (
    <CartContext.Provider
      value={{
        items,
        total: items.reduce((s, i) => s + i.qty * i.tray_price, 0),
        varietyCount: items.length,
        addToCart,
        updateQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside CartProvider')
  return ctx
}
