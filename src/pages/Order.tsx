import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCart, updateQty, removeFromCart, cartTotal, clearCart } from '../lib/cart'
import { supabase } from '../lib/supabase'
import type { CartItem } from '../lib/types'

export default function Order() {
  const [items, setItems] = useState<CartItem[]>(getCart())
  const [form, setForm] = useState({ business_name: '', contact_name: '', email: '', phone: '', notes: '' })
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
      const totalUnits = items.reduce((s, i) => s + i.qty, 0)
      const totalPrice = cartTotal()
      const { data: order, error: orderErr } = await supabase
        .from('wholesale_orders')
        .insert({
          business_name: form.business_name,
          contact_name: form.contact_name,
          email: form.email,
          phone: form.phone || null,
          notes: form.notes || null,
          total_units: totalUnits,
          total_price: totalPrice,
        })
        .select('id, confirm_token')
        .single()

      if (orderErr || !order) throw new Error(orderErr?.message ?? 'Failed to create order')

      await supabase.from('wholesale_order_items').insert(
        items.map(i => ({
          order_id: order.id,
          release_item_id: i.release_item_id,
          plant_id: i.plant_id,
          plant_name: i.plant_name,
          plant_sku: i.plant_sku,
          plant_size: i.plant_size,
          unit_price: i.unit_price,
          qty_requested: i.qty,
          line_total: i.qty * i.unit_price,
        }))
      )

      const resendKey = import.meta.env.VITE_RESEND_API_KEY
      const samuelEmail = import.meta.env.VITE_SAMUEL_EMAIL
      const confirmUrl = `https://kelstonway.com/order/${order.id}?token=${order.confirm_token}`
      const itemsHtml = items.map(i =>
        `<tr><td>${i.plant_name}</td><td>${i.plant_size}</td><td>${i.qty}</td><td>$${i.unit_price.toFixed(2)}</td><td>$${(i.qty * i.unit_price).toFixed(2)}</td></tr>`
      ).join('')

      if (resendKey) {
        await Promise.all([
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'orders@kelstonway.com',
              to: form.email,
              subject: 'Order Received — Kelston Way Greenhouse',
              html: `<h2>Thank you, ${form.contact_name}!</h2><p>We've received your wholesale order (ref: <strong>${order.id.slice(0, 8).toUpperCase()}</strong>) and will be in touch within 1 business day.</p><p>— Kelston Way Greenhouse</p>`,
            }),
          }),
          fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'orders@kelstonway.com',
              to: samuelEmail,
              subject: `New Wholesale Order — ${form.business_name} — $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
              html: `<h2>New Order from ${form.business_name}</h2><p><strong>Contact:</strong> ${form.contact_name} &lt;${form.email}&gt;<br/><strong>Phone:</strong> ${form.phone || 'N/A'}<br/><strong>Notes:</strong> ${form.notes || 'N/A'}</p><table border="1" cellpadding="6"><thead><tr><th>Plant</th><th>Size</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table><p><strong>Total: ${totalUnits} units / $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p><p><a href="${confirmUrl}">✅ Confirm This Order</a></p>`,
            }),
          }),
        ])
      }

      clearCart()
      window.dispatchEvent(new Event('cart-updated'))
      navigate('/order/confirmed', { state: { orderId: order.id, email: form.email } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const total = cartTotal()
  const totalUnits = items.reduce((s, i) => s + i.qty, 0)

  if (items.length === 0) {
    return (
      <div className="px-8 md:px-32 py-32 text-center">
        <span className="material-symbols-outlined text-5xl text-outline mb-6 block">shopping_bag</span>
        <h2 className="font-['Newsreader'] text-headline-md text-on-surface mb-4">Your order is empty</h2>
        <p className="font-body-md text-on-surface-variant mb-8">Browse our current availability to add items.</p>
        <a href="/availability" className="px-8 py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all">
          View Availability
        </a>
      </div>
    )
  }

  return (
    <div className="px-8 md:px-32 py-16">
      <span className="font-label-caps text-label-caps text-secondary mb-3 block">WHOLESALE ORDER</span>
      <h1 className="font-['Newsreader'] text-headline-xl text-on-surface mb-12">Review Your Order</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        {/* Order table */}
        <div className="lg:col-span-7">
          <h2 className="font-['Newsreader'] italic text-headline-md border-b border-outline-variant pb-6 mb-8">Your Selection</h2>
          <div className="space-y-6">
            {items.map(item => (
              <div key={item.release_item_id} className="flex items-center gap-6 py-4 border-b border-outline-variant/20">
                {item.photo_url && (
                  <div className="w-16 h-20 organic-shape-1 overflow-hidden flex-shrink-0 bg-surface-container">
                    <img src={item.photo_url} alt={item.plant_name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-['Newsreader'] italic text-on-surface">{item.plant_name}</p>
                  <p className="font-body-md text-sm text-on-surface-variant">{item.plant_size} · {item.plant_sku}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    onChange={e => handleQty(item.release_item_id, parseInt(e.target.value) || 1)}
                    className="w-20 border border-outline-variant rounded px-2 py-1.5 text-sm font-body-md text-center focus:outline-none focus:border-primary"
                  />
                  <span className="font-body-md text-sm text-on-surface-variant w-20 text-right">× ${item.unit_price.toFixed(2)}</span>
                  <span className="font-body-md font-medium text-on-surface w-20 text-right">${(item.qty * item.unit_price).toFixed(2)}</span>
                </div>
                <button onClick={() => handleRemove(item.release_item_id)} className="p-1.5 hover:bg-error-container rounded transition-colors flex-shrink-0">
                  <span className="material-symbols-outlined text-error text-lg">delete</span>
                </button>
              </div>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant flex justify-between items-center">
            <div className="font-body-md text-on-surface-variant">
              {totalUnits.toLocaleString()} total units
            </div>
            <div className="text-right">
              <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">Estimated Total</p>
              <p className="font-['Newsreader'] text-2xl text-on-surface">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Customer form */}
        <div className="lg:col-span-5">
          <h2 className="font-['Newsreader'] italic text-headline-md border-b border-outline-variant pb-6 mb-8">Your Information</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">BUSINESS NAME *</label>
              <input
                required
                value={form.business_name}
                onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors"
                placeholder="Your nursery or company"
              />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">CONTACT NAME *</label>
              <input
                required
                value={form.contact_name}
                onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">EMAIL *</label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors"
                placeholder="you@yourbusiness.com"
              />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">PHONE</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors"
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">NOTES</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Delivery preferences, special requests..."
              />
            </div>
            {error && <p className="text-error font-body-md text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Order for Review'}
            </button>
            <p className="font-body-md text-xs text-on-surface-variant text-center">
              We'll review your order and reach out with an invoice within 1 business day.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
