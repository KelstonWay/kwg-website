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
      {open && <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-xl flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center px-6 py-5 border-b border-outline-variant/30">
          <h2 className="font-['Newsreader'] text-xl text-on-surface">Your Order</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <p className="font-body-md text-on-surface-variant text-center py-12">No items yet.</p>
          ) : items.map(item => (
            <div key={item.release_item_id} className="flex gap-4 items-start py-4 border-b border-outline-variant/20">
              {item.photo_url && (
                <div className="w-16 h-20 organic-shape-1 overflow-hidden flex-shrink-0 bg-surface-container">
                  <img src={item.photo_url} alt={item.plant_name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-['Newsreader'] italic text-on-surface truncate">{item.plant_name}</p>
                <p className="font-body-md text-sm text-on-surface-variant">{item.plant_size}</p>
                <div className="flex items-center gap-3 mt-2">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => handleQty(item.release_item_id, parseInt(e.target.value) || 1)}
                    className="w-16 border border-outline-variant rounded px-2 py-1 text-base font-body-md text-center focus:outline-none focus:border-primary"
                  />
                  <span className="font-body-md text-sm text-on-surface-variant">
                    × ${(item.tray_price ?? item.unit_price).toFixed(2)}/tray ({item.tray_count ?? 1}-count)
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-body-md font-medium text-on-surface">${(item.qty * (item.tray_price ?? item.unit_price)).toFixed(2)}</p>
                <button onClick={() => handleRemove(item.release_item_id)} className="text-error text-xs mt-1 hover:underline font-button">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-outline-variant/30 space-y-4">
            <div className="flex justify-between font-body-md text-on-surface-variant text-sm">
              <span>Total trays</span>
              <span>{totalUnits.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-['Newsreader'] text-lg text-on-surface">
              <span>Estimated total</span>
              <span>${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <button
              onClick={() => { onClose(); navigate('/order') }}
              className="w-full py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300"
            >
              Review Order
            </button>
          </div>
        )}
      </div>
    </>
  )
}
