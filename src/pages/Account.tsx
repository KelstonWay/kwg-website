import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { addToCart } from '../lib/cart'
import type { WholesaleOrder, WholesaleOrderItem } from '../lib/types'

export default function Account() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-outline animate-spin">progress_activity</span>
      </div>
    )
  }

  if (user) {
    return <AccountDashboard />
  }

  return <AccountLogin />
}

function AccountLogin() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/account`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-5">
        <div className="max-w-md w-full text-center">
          <span className="material-symbols-outlined text-4xl text-primary mb-4 block">mark_email_read</span>
          <h1 className="font-['Newsreader'] text-headline-lg text-on-surface mb-3">Check your email</h1>
          <p className="font-body-md text-on-surface-variant">
            We sent a sign-in link to <strong>{email}</strong>. Click it to access your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <div className="max-w-md w-full">
        <span className="font-label-caps text-label-caps text-secondary mb-3 block">ACCOUNT</span>
        <h1 className="font-['Newsreader'] text-headline-xl text-on-surface mb-2">Sign in</h1>
        <p className="font-body-md text-on-surface-variant mb-8">
          Enter your email and we'll send you a sign-in link. No password needed.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full px-4 py-3 border border-outline-variant rounded-sm font-body-md text-on-surface bg-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="font-body-md text-sm text-error">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary text-on-primary font-button text-button rounded-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send sign-in link'}
          </button>
        </form>
      </div>
    </div>
  )
}

function ReorderButton({ orderId }: { orderId: string }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  async function handleReorder(e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(true)
    setNotice(null)

    const { data: items } = await supabase
      .from('wholesale_order_items')
      .select('plant_id, plant_name, plant_size, plant_sku, qty_requested, unit_price, release_item_id')
      .eq('order_id', orderId)

    if (!items?.length) { setLoading(false); return }

    const { data: release } = await supabase
      .from('availability_releases')
      .select('id')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (!release) { setLoading(false); navigate('/availability'); return }

    const plantIds = items.map((i: any) => i.plant_id)
    const { data: currentItems } = await supabase
      .from('availability_release_items')
      .select('id, plant_id, unit_price, qty_available')
      .eq('release_id', release.id)
      .in('plant_id', plantIds)
      .gt('qty_available', 0)

    const availableByPlantId = Object.fromEntries(
      (currentItems ?? []).map((ci: any) => [ci.plant_id, ci])
    )

    let added = 0
    let skipped = 0

    for (const item of items as WholesaleOrderItem[]) {
      const current = availableByPlantId[item.plant_id]
      if (!current) { skipped++; continue }

      addToCart({
        id: current.id,
        plant_id: item.plant_id,
        plant_name: item.plant_name,
        plant_sku: item.plant_sku,
        plant_size: item.plant_size,
        unit_price: current.unit_price ?? item.unit_price,
        qty: item.qty_requested,
        photo_url: null,
        release_item_id: current.id,
      })
      window.dispatchEvent(new Event('cart-updated'))
      added++
    }

    setLoading(false)

    if (skipped > 0 && added === 0) {
      setNotice('None of these items are currently in stock.')
    } else if (skipped > 0) {
      setNotice(`${skipped} item${skipped > 1 ? 's' : ''} no longer in stock and weren't added.`)
      navigate('/order')
    } else {
      navigate('/order')
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={handleReorder}
        disabled={loading}
        className="px-4 py-2 border border-outline-variant font-button text-button text-sm text-on-surface-variant rounded-sm hover:border-primary hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '...' : 'Reorder'}
      </button>
      {notice && (
        <p className="font-body-md text-xs text-on-surface-variant max-w-[200px] text-right">{notice}</p>
      )}
    </div>
  )
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-700 bg-amber-100',
  confirmed: 'text-primary bg-primary/10',
  invoiced: 'text-secondary bg-secondary-container',
}

function OrderRow({ order, onNavigate }: { order: WholesaleOrder; onNavigate: () => void }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-5 bg-surface-container-low border border-outline-variant/30 rounded-sm cursor-pointer hover:border-outline-variant transition-all"
      onClick={onNavigate}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-['Newsreader'] italic text-on-surface">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className={`font-label-caps text-label-caps px-2.5 py-0.5 rounded-full uppercase text-[10px] ${STATUS_STYLES[order.status] ?? 'text-on-surface-variant bg-surface-container'}`}>
            {order.status}
          </span>
        </div>
        <p className="font-body-md text-sm text-on-surface-variant mt-0.5">
          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          {order.total_units != null && ` · ${order.total_units.toLocaleString()} units`}
        </p>
      </div>
      <div className="flex items-center gap-4 sm:gap-6">
        {order.total_price != null && (
          <span className="font-['Newsreader'] text-lg text-on-surface">
            ${order.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        )}
        <ReorderButton orderId={order.id} />
        <span className="material-symbols-outlined text-on-surface-variant text-xl hidden sm:block">chevron_right</span>
      </div>
    </div>
  )
}

function AccountDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<WholesaleOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('wholesale_orders')
        .select('id, created_at, business_name, contact_name, email, phone, notes, status, total_units, total_price')
        .order('created_at', { ascending: false })
      if (data) setOrders(data as WholesaleOrder[])
      setLoading(false)
    }
    load()
  }, [])

  const businessName = orders[0]?.business_name ?? user?.email ?? ''

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined text-4xl text-outline animate-spin">progress_activity</span>
      </div>
    )
  }

  return (
    <div className="px-5 md:px-20 py-16 max-w-4xl mx-auto">
      <span className="font-label-caps text-label-caps text-secondary mb-3 block">YOUR ACCOUNT</span>
      <h1 className="font-['Newsreader'] text-headline-xl text-on-surface mb-10">
        Welcome back{businessName ? `, ${businessName}` : ''}.
      </h1>

      <h2 className="font-['Newsreader'] italic text-headline-md text-on-surface border-b border-outline-variant pb-4 mb-6">
        Order History
      </h2>

      {orders.length === 0 ? (
        <p className="font-body-md text-on-surface-variant py-8">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderRow key={order.id} order={order} onNavigate={() => navigate(`/order/${order.id}`)} />
          ))}
        </div>
      )}

      <button
        onClick={signOut}
        className="mt-16 font-body-md text-sm text-on-surface-variant hover:text-on-surface transition-colors underline underline-offset-2"
      >
        Sign out
      </button>
    </div>
  )
}
