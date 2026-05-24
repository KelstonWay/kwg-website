import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { WholesaleOrder } from '../lib/types'
import { ReorderButton } from './Account'

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

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-100',
  confirmed: 'text-primary bg-primary/10',
  invoiced: 'text-secondary bg-secondary-container',
}

export default function AccountOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, loading: authLoading } = useAuth()

  const [order, setOrder] = useState<WholesaleOrder | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (authLoading || !user || !id) return

    async function load() {
      const { data: o } = await supabase
        .from('wholesale_orders')
        .select(
          'id, created_at, business_name, contact_name, email, phone, notes, status, total_units, total_price, user_id'
        )
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single()

      if (!o) {
        setNotFound(true)
        setLoading(false)
        return
      }

      const { data: its } = await supabase
        .from('wholesale_order_items')
        .select('id, plant_name, plant_size, plant_sku, qty_requested, unit_price, tray_count, tray_price, line_total')
        .eq('order_id', id!)

      setOrder(o as WholesaleOrder)
      setItems((its ?? []) as OrderItem[])
      setLoading(false)
    }

    load()
  }, [id, user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined animate-spin text-4xl text-outline">
          progress_activity
        </span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="px-8 py-32 text-center md:px-32">
        <p className="mb-4 font-body-md text-on-surface-variant">Sign in to view your orders.</p>
        <Link to="/account" className="text-primary hover:underline">
          Go to account
        </Link>
      </div>
    )
  }

  if (notFound || !order) {
    return (
      <div className="px-8 py-32 text-center md:px-32">
        <h2 className="mb-4 font-['Newsreader'] text-headline-md text-on-surface">
          Order not found.
        </h2>
        <Link to="/account" className="font-body-md text-sm text-primary hover:underline">
          Back to your account
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-8 py-16 md:px-32">
      <Link
        to="/account"
        className="mb-8 flex items-center gap-1 font-body-md text-sm text-on-surface-variant hover:text-on-surface"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Order history
      </Link>

      <span className="mb-3 block font-label-caps text-label-caps text-secondary">
        ORDER DETAILS
      </span>
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <h1 className="font-['Newsreader'] text-headline-xl text-on-surface">
          #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span
          className={`rounded-full px-3 py-1 font-label-caps text-label-caps uppercase ${STATUS_STYLES[order.status] ?? 'bg-surface-container text-on-surface-variant'}`}
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

      <div className="mb-12 flex items-center justify-between border-t border-outline-variant pt-6">
        <ReorderButton orderId={order.id} />
        <div className="text-right">
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">
            {order.total_units?.toLocaleString()} total trays
          </p>
          <p className="font-['Newsreader'] text-2xl text-on-surface">
            ${order.total_price?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}
