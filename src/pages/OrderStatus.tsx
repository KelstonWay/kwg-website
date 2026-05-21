import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { WholesaleOrder } from '../lib/types'

interface OrderItem {
  id: string
  plant_name: string
  plant_size: string
  plant_sku: string
  qty_requested: number
  unit_price: number
  tray_count: number | null
  tray_price: number | null
  line_total: number
}

export default function OrderStatus() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [order, setOrder] = useState<WholesaleOrder | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!id) return
      // Never select confirm_token — server verifies it
      const { data: o } = await supabase
        .from('wholesale_orders')
        .select(
          'id, created_at, business_name, contact_name, email, phone, notes, status, total_units, total_price'
        )
        .eq('id', id)
        .single()
      const { data: its } = await supabase
        .from('wholesale_order_items')
        .select('*')
        .eq('order_id', id)
      if (o) setOrder(o as WholesaleOrder)
      if (its) setItems(its as OrderItem[])
      setLoading(false)
    }
    load()
  }, [id])

  async function handleConfirm() {
    if (!order || !token) return
    setConfirming(true)
    setError(null)

    const res = await fetch('/api/confirm-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId: order.id, token }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Failed to confirm order. Please try again.')
      setConfirming(false)
      return
    }

    setOrder((o) => (o ? { ...o, status: 'confirmed' } : o))
    setConfirmed(true)
    setConfirming(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined animate-spin text-4xl text-outline">
          progress_activity
        </span>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="px-8 py-32 text-center md:px-32">
        <h2 className="font-['Newsreader'] text-headline-md text-on-surface">Order not found.</h2>
      </div>
    )
  }

  const statusColor =
    order.status === 'confirmed'
      ? 'text-primary bg-primary/10'
      : order.status === 'invoiced'
        ? 'text-secondary bg-secondary-container'
        : 'text-amber-700 bg-amber-100'

  return (
    <div className="mx-auto max-w-4xl px-8 py-16 md:px-32">
      <span className="mb-3 block font-label-caps text-label-caps text-secondary">
        ORDER DETAILS
      </span>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-['Newsreader'] text-headline-xl text-on-surface">
          #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span
          className={`rounded-full px-3 py-1 font-label-caps text-label-caps uppercase ${statusColor}`}
        >
          {order.status}
        </span>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-8 rounded-sm border border-outline-variant/30 bg-surface-container-low p-8 md:grid-cols-2">
        <div>
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">Business</p>
          <p className="font-body-md text-on-surface">{order.business_name}</p>
        </div>
        <div>
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">Contact</p>
          <p className="font-body-md text-on-surface">{order.contact_name}</p>
        </div>
        <div>
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">Email</p>
          <p className="font-body-md text-on-surface">{order.email}</p>
        </div>
        <div>
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">Placed</p>
          <p className="font-body-md text-on-surface">
            {new Date(order.created_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
        {order.notes && (
          <div className="md:col-span-2">
            <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">Notes</p>
            <p className="font-body-md text-on-surface">{order.notes}</p>
          </div>
        )}
      </div>

      <h2 className="mb-6 border-b border-outline-variant pb-4 font-['Newsreader'] text-headline-md italic">
        Items Ordered
      </h2>
      <div className="mb-8 space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 border-b border-outline-variant/20 py-3"
          >
            <div className="flex-1">
              <p className="font-['Newsreader'] italic text-on-surface">{item.plant_name}</p>
              <p className="font-body-md text-sm text-on-surface-variant">
                {item.plant_size} · {item.plant_sku}
              </p>
            </div>
            <span className="font-body-md text-on-surface-variant">
              {item.qty_requested} trays × ${(item.tray_price ?? item.unit_price).toFixed(2)}/tray
              {item.tray_count && item.tray_count > 1 ? ` (${item.tray_count}-count)` : ''}
            </span>
            <span className="font-body-md font-medium text-on-surface">
              ${item.line_total.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mb-12 flex justify-end">
        <div className="text-right">
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">
            {order.total_units?.toLocaleString()} total trays
          </p>
          <p className="font-['Newsreader'] text-2xl text-on-surface">
            ${order.total_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {token && order.status === 'pending' && (
        <div className="rounded-sm border border-primary/30 bg-primary/5 p-8">
          <h3 className="mb-3 font-['Newsreader'] text-xl text-on-surface">Confirm This Order</h3>
          <p className="mb-6 font-body-md text-on-surface-variant">
            Confirming will update the order status to confirmed and send a notification to{' '}
            {order.email}.
          </p>
          {error && <p className="mb-4 font-body-md text-sm text-error">{error}</p>}
          {confirmed ? (
            <p className="font-body-md font-medium text-primary">
              ✓ Order confirmed. Confirmation sent to customer.
            </p>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={confirming}
              className="rounded-sm bg-primary px-8 py-4 font-button text-button text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirming ? 'Confirming...' : 'Confirm Order'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
