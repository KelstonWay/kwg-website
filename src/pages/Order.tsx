import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateQty, removeFromCart, cartTotal, clearCart } from '../lib/cart'
import type { CartItem } from '../lib/types'

export default function Order() {
  const [items, setItems] = useState<CartItem[]>(getCart())
  const [form, setForm] = useState({
    business_name: '',
    contact_name: '',
    email: '',
    phone: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) return
    setSubmitting(true)
    setError(null)

    try {
      // Send only IDs + quantities — server re-prices from DB
      const res = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ release_item_id: i.release_item_id, qty: i.qty })),
          contact: form,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit order')

      clearCart()
      window.dispatchEvent(new Event('cart-updated'))
      navigate('/order/confirmed', { state: { orderId: data.orderId, email: data.email } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const total = cartTotal()
  const totalUnits = items.reduce((s, i) => s + i.qty, 0)

  if (items.length === 0) {
    return (
      <div className="px-5 py-32 text-center md:px-8 lg:px-32">
        <span className="material-symbols-outlined mb-6 block text-5xl text-outline">
          shopping_bag
        </span>
        <h2 className="mb-4 font-['Newsreader'] text-headline-md text-on-surface">
          Your order is empty
        </h2>
        <p className="mb-8 font-body-md text-on-surface-variant">
          Browse our current availability to add items.
        </p>
        <a
          href="/availability"
          className="rounded-sm bg-primary px-8 py-4 font-button text-button text-on-primary transition-all hover:bg-primary-container"
        >
          View Availability
        </a>
      </div>
    )
  }

  return (
    <div className="px-5 py-12 md:px-8 md:py-16 lg:px-32">
      <span className="mb-3 block font-label-caps text-label-caps text-secondary">
        WHOLESALE ORDER
      </span>
      <h1 className="mb-12 font-['Newsreader'] text-headline-xl text-on-surface">
        Review Your Order
      </h1>

      <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
        {/* Order table */}
        <div className="lg:col-span-7">
          <h2 className="mb-8 border-b border-outline-variant pb-6 font-['Newsreader'] text-headline-md italic">
            Your Selection
          </h2>
          <div className="space-y-6">
            {items.map((item) => (
              <div key={item.release_item_id} className="border-b border-outline-variant/20 py-4">
                {/* Row 1: photo + name */}
                <div className="mb-3 flex items-start gap-4">
                  {item.photo_url && (
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container">
                      <img
                        src={item.photo_url}
                        alt={item.plant_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-['Newsreader'] italic text-on-surface">{item.plant_name}</p>
                    <p className="font-body-md text-sm text-on-surface-variant">
                      {item.plant_size} · {item.plant_sku}
                    </p>
                  </div>
                </div>
                {/* Row 2: qty + unit price + line total + delete */}
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={(e) => handleQty(item.release_item_id, parseInt(e.target.value) || 1)}
                    className="w-16 rounded border border-outline-variant px-2 py-1.5 text-center font-body-md text-base focus:border-primary focus:outline-none"
                  />
                  <span className="font-body-md text-sm text-on-surface-variant">
                    × ${(item.tray_price ?? item.unit_price).toFixed(2)}/tray (
                    {item.tray_count ?? 1}-count)
                  </span>
                  <span className="ml-auto font-body-md font-medium text-on-surface">
                    ${(item.qty * (item.tray_price ?? item.unit_price)).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleRemove(item.release_item_id)}
                    className="rounded p-1.5 transition-colors hover:bg-error-container"
                  >
                    <span className="material-symbols-outlined text-lg text-error">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-outline-variant pt-6">
            <div className="font-body-md text-on-surface-variant">
              {totalUnits.toLocaleString()} total trays
            </div>
            <div className="text-right">
              <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">
                Estimated Total
              </p>
              <p className="font-['Newsreader'] text-2xl text-on-surface">
                ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Customer form */}
        <div className="lg:col-span-5">
          <h2 className="mb-8 border-b border-outline-variant pb-6 font-['Newsreader'] text-headline-md italic">
            Your Information
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                BUSINESS NAME *
              </label>
              <input
                required
                value={form.business_name}
                onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                className="w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="Your nursery or company"
              />
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                CONTACT NAME *
              </label>
              <input
                required
                value={form.contact_name}
                onChange={(e) => setForm((f) => ({ ...f, contact_name: e.target.value }))}
                className="w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                EMAIL *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="you@yourbusiness.com"
              />
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                PHONE
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                DELIVERY ADDRESS *
              </label>
              <input
                required
                value={form.address_street}
                onChange={(e) => setForm((f) => ({ ...f, address_street: e.target.value }))}
                className="mb-2 w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="Street address"
              />
              <div className="grid grid-cols-6 gap-2">
                <input
                  required
                  value={form.address_city}
                  onChange={(e) => setForm((f) => ({ ...f, address_city: e.target.value }))}
                  className="col-span-3 rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                  placeholder="City"
                />
                <input
                  required
                  value={form.address_state}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      address_state: e.target.value.toUpperCase().slice(0, 2),
                    }))
                  }
                  className="col-span-1 rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                  placeholder="TX"
                  maxLength={2}
                />
                <input
                  required
                  value={form.address_zip}
                  onChange={(e) => setForm((f) => ({ ...f, address_zip: e.target.value }))}
                  className="col-span-2 rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                  placeholder="ZIP"
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                NOTES
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="Delivery preferences, special requests..."
              />
            </div>
            {error && <p className="font-body-md text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-sm bg-primary py-4 font-button text-button text-on-primary transition-all duration-300 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Order for Review'}
            </button>
            <p className="text-center font-body-md text-xs text-on-surface-variant">
              We'll review your order and reach out with an invoice within 1 business day.
            </p>
            <p className="pt-1 text-center font-body-md text-xs text-on-surface-variant">
              Prefer a spreadsheet?{' '}
              <a
                href="/availability"
                className="text-secondary underline underline-offset-2 hover:opacity-80"
              >
                Download the Excel template
              </a>{' '}
              from the availability page.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
