import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { addToCart } from '../lib/cart'
import type { WholesaleOrder, WholesaleOrderItem } from '../lib/types'

function SetNewPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setDone(true)
    setLoading(false)
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <span className="material-symbols-outlined mb-4 block text-4xl text-primary">
            check_circle
          </span>
          <h1 className="text-headline-lg mb-3 font-['Newsreader'] text-on-surface">
            Password set.
          </h1>
          <p className="font-body-md text-on-surface-variant">
            You're signed in.{' '}
            <Link to="/account" className="text-primary hover:underline">
              Go to your account
            </Link>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        <span className="mb-3 block font-label-caps text-label-caps text-secondary">ACCOUNT</span>
        <h1 className="mb-8 font-['Newsreader'] text-headline-xl text-on-surface">
          Set a new password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
          />
          {error && <p className="font-body-md text-sm text-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-primary py-3.5 font-button text-button text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Set password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function Account() {
  const { user, loading, resettingPassword } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-outlined animate-spin text-4xl text-outline">
          progress_activity
        </span>
      </div>
    )
  }

  if (resettingPassword) return <SetNewPassword />
  if (user) return <AccountDashboard />
  return <AccountLogin />
}

function AccountLogin() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (mode === 'signin') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      }
    } else if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setDone(true)
      setLoading(false)
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/account`,
      })
      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }
      setDone(true)
      setLoading(false)
    }
  }

  function switchMode(next: 'signin' | 'signup' | 'reset') {
    setMode(next)
    setError(null)
    setPassword('')
    setDone(false)
  }

  if (done && mode === 'signup') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <span className="material-symbols-outlined mb-4 block text-4xl text-primary">
            mark_email_read
          </span>
          <h1 className="text-headline-lg mb-3 font-['Newsreader'] text-on-surface">
            Check your email
          </h1>
          <p className="font-body-md text-on-surface-variant">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your
            account.
          </p>
        </div>
      </div>
    )
  }

  if (done && mode === 'reset') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <span className="material-symbols-outlined mb-4 block text-4xl text-primary">
            mark_email_read
          </span>
          <h1 className="text-headline-lg mb-3 font-['Newsreader'] text-on-surface">
            Check your email
          </h1>
          <p className="mb-4 font-body-md text-on-surface-variant">
            We sent a password reset link to <strong>{email}</strong>. Click it to set a new
            password.
          </p>
          <button
            onClick={() => switchMode('signin')}
            className="font-button text-sm text-primary hover:underline"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-5">
      <div className="w-full max-w-md">
        <span className="mb-3 block font-label-caps text-label-caps text-secondary">ACCOUNT</span>
        <h1 className="mb-8 font-['Newsreader'] text-headline-xl text-on-surface">
          {mode === 'signin' ? 'Sign in' : mode === 'signup' ? 'Create account' : 'Reset password'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourbusiness.com"
              className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            />
          </div>
          {mode !== 'reset' && (
            <div>
              <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-3 font-body-md text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
              />
            </div>
          )}

          {error && <p className="font-body-md text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-sm bg-primary py-3.5 font-button text-button text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? '...'
              : mode === 'signin'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Send reset link'}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          {mode === 'signin' && (
            <>
              <p className="font-body-md text-sm text-on-surface-variant">
                Don't have an account?{' '}
                <button
                  onClick={() => switchMode('signup')}
                  className="text-primary hover:underline"
                >
                  Create one
                </button>
              </p>
              <p className="font-body-md text-sm text-on-surface-variant">
                Forgot your password?{' '}
                <button
                  onClick={() => switchMode('reset')}
                  className="text-primary hover:underline"
                >
                  Reset it
                </button>
              </p>
            </>
          )}
          {(mode === 'signup' || mode === 'reset') && (
            <p className="font-body-md text-sm text-on-surface-variant">
              <button onClick={() => switchMode('signin')} className="text-primary hover:underline">
                Back to sign in
              </button>
            </p>
          )}
        </div>
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
      .select(
        'plant_id, plant_name, plant_size, plant_sku, qty_requested, unit_price, release_item_id'
      )
      .eq('order_id', orderId)

    if (!items?.length) {
      setLoading(false)
      return
    }

    const { data: release } = await supabase
      .from('availability_releases')
      .select('id')
      .order('published_at', { ascending: false })
      .limit(1)
      .single()

    if (!release) {
      setLoading(false)
      navigate('/availability')
      return
    }

    const typedItems = items as WholesaleOrderItem[]
    const plantIds = typedItems.map((i) => i.plant_id)
    const { data: currentItems } = await supabase
      .from('availability_release_items')
      .select('id, plant_id, unit_price, tray_count, qty_available')
      .eq('release_id', release.id)
      .in('plant_id', plantIds)
      .gt('qty_available', 0)

    type CurrentItem = {
      id: string
      plant_id: string
      unit_price: number
      tray_count: number
      qty_available: number
    }
    const availableByPlantId = Object.fromEntries(
      ((currentItems as CurrentItem[]) ?? []).map((ci) => [ci.plant_id, ci])
    )

    let added = 0
    let skipped = 0

    for (const item of typedItems) {
      const current = availableByPlantId[item.plant_id]
      if (!current) {
        skipped++
        continue
      }

      const trayCount = current.tray_count ?? 1
      addToCart({
        id: current.id,
        plant_id: item.plant_id,
        plant_name: item.plant_name,
        plant_sku: item.plant_sku,
        plant_size: item.plant_size,
        unit_price: current.unit_price ?? item.unit_price,
        tray_count: trayCount,
        tray_price: (current.unit_price ?? item.unit_price) * trayCount,
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
        className="rounded-sm border border-outline-variant px-4 py-2 font-button text-button text-sm text-on-surface-variant transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '...' : 'Reorder'}
      </button>
      {notice && (
        <p className="max-w-[200px] text-right font-body-md text-xs text-on-surface-variant">
          {notice}
        </p>
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
      className="flex cursor-pointer flex-col gap-3 rounded-sm border border-outline-variant/30 bg-surface-container-low p-5 transition-all hover:border-outline-variant sm:flex-row sm:items-center sm:gap-6"
      onClick={onNavigate}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-['Newsreader'] italic text-on-surface">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span
            className={`rounded-full px-2.5 py-0.5 font-label-caps text-[10px] text-label-caps uppercase ${STATUS_STYLES[order.status] ?? 'bg-surface-container text-on-surface-variant'}`}
          >
            {order.status}
          </span>
        </div>
        <p className="mt-0.5 font-body-md text-sm text-on-surface-variant">
          {new Date(order.created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
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
        <span className="material-symbols-outlined hidden text-xl text-on-surface-variant sm:block">
          chevron_right
        </span>
      </div>
    </div>
  )
}

function SetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setSaving(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setSaving(false)
      return
    }
    setDone(true)
    setSaving(false)
    setPassword('')
    setConfirm('')
  }

  if (done) return <p className="font-body-md text-sm text-primary">Password updated.</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-3">
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
      />
      <input
        type="password"
        required
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="Confirm password"
        className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
      />
      {error && <p className="font-body-md text-sm text-error">{error}</p>}
      <button
        type="submit"
        disabled={saving}
        className="rounded-sm bg-primary px-6 py-2.5 font-button text-sm text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save password'}
      </button>
    </form>
  )
}

function AccountDashboard() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<WholesaleOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [showSetPassword, setShowSetPassword] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('wholesale_orders')
        .select(
          'id, created_at, business_name, contact_name, email, phone, notes, status, total_units, total_price'
        )
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
        <span className="material-symbols-outlined animate-spin text-4xl text-outline">
          progress_activity
        </span>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:px-20">
      <span className="mb-3 block font-label-caps text-label-caps text-secondary">
        YOUR ACCOUNT
      </span>
      <h1 className="mb-10 font-['Newsreader'] text-headline-xl text-on-surface">
        Welcome back{businessName ? `, ${businessName}` : ''}.
      </h1>

      <h2 className="mb-6 border-b border-outline-variant pb-4 font-['Newsreader'] text-headline-md italic text-on-surface">
        Order History
      </h2>

      {orders.length === 0 ? (
        <p className="py-8 font-body-md text-on-surface-variant">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onNavigate={() => navigate(`/order/${order.id}`)}
            />
          ))}
        </div>
      )}

      <div className="mt-16 border-t border-outline-variant/30 pt-8">
        <button
          onClick={() => setShowSetPassword((v) => !v)}
          className="mb-4 block font-body-md text-sm text-on-surface-variant underline underline-offset-2 transition-colors hover:text-on-surface"
        >
          {showSetPassword ? 'Cancel' : 'Set / change password'}
        </button>
        {showSetPassword && (
          <div className="mb-6">
            <SetPasswordForm />
          </div>
        )}
        <button
          onClick={signOut}
          className="font-body-md text-sm text-on-surface-variant underline underline-offset-2 transition-colors hover:text-on-surface"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
