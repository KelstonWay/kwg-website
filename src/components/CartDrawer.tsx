import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateQty, removeFromCart, cartTotal } from '../lib/cart'
import type { CartItem } from '../lib/types'

interface Props {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: Props) {
  const [items, setItems] = useState<CartItem[]>(getCart())
  const navigate = useNavigate()

  useEffect(() => {
    const refresh = () => setItems(getCart())
    window.addEventListener('cart-updated', refresh)
    return () => window.removeEventListener('cart-updated', refresh)
  }, [])

  function handleQty(releaseItemId: string, qty: number) {
    updateQty(releaseItemId, qty)
    setItems(getCart())
    window.dispatchEvent(new Event('cart-updated'))
  }

  function handleRemove(releaseItemId: string) {
    removeFromCart(releaseItemId)
    setItems(getCart())
    window.dispatchEvent(new Event('cart-updated'))
  }

  const total = cartTotal()
  const totalUnits = items.reduce((s, i) => s + i.qty, 0)

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />}
      <div
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 px-6 py-5">
          <h2 className="font-['Newsreader'] text-xl text-on-surface">Your Order</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 transition-colors hover:bg-surface-container"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center font-body-md text-on-surface-variant">No items yet.</p>
          ) : (
            items.map((item) => (
              <div
                key={item.release_item_id}
                className="flex items-start gap-4 border-b border-outline-variant/20 py-4"
              >
                {item.photo_url && (
                  <div className="organic-shape-1 h-20 w-16 flex-shrink-0 overflow-hidden bg-surface-container">
                    <img
                      src={item.photo_url}
                      alt={item.plant_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-['Newsreader'] italic text-on-surface">
                    {item.plant_name}
                  </p>
                  <p className="font-body-md text-sm text-on-surface-variant">{item.plant_size}</p>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        handleQty(item.release_item_id, parseInt(e.target.value) || 1)
                      }
                      className="w-16 rounded border border-outline-variant px-2 py-1 text-center font-body-md text-base focus:border-primary focus:outline-none"
                    />
                    <span className="font-body-md text-sm text-on-surface-variant">
                      × ${(item.tray_price ?? item.unit_price).toFixed(2)}/tray (
                      {item.tray_count ?? 1}-count)
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="font-body-md font-medium text-on-surface">
                    ${(item.qty * (item.tray_price ?? item.unit_price)).toFixed(2)}
                  </p>
                  <button
                    onClick={() => handleRemove(item.release_item_id)}
                    className="mt-1 font-button text-xs text-error hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t border-outline-variant/30 px-6 py-5">
            <div className="flex justify-between font-body-md text-sm text-on-surface-variant">
              <span>Total trays</span>
              <span>{totalUnits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-['Newsreader'] text-lg text-on-surface">
              <span>Estimated total</span>
              <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={() => {
                onClose()
                navigate('/order')
              }}
              className="w-full rounded-sm bg-primary py-4 font-button text-button text-on-primary transition-all duration-300 hover:bg-primary-container"
            >
              Review Order
            </button>
          </div>
        )}
      </div>
    </>
  )
}
