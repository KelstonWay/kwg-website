import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

function CreateAccountPrompt({ email }: { email?: string }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({ email: email ?? '', password })
    if (error) { setError(error.message); setLoading(false); return }
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="mt-12 mx-auto max-w-md bg-surface-container-low border border-outline-variant/40 rounded-sm p-8 text-left relative">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {done ? (
        <div className="text-center py-2">
          <span className="material-symbols-outlined text-3xl text-primary mb-3 block">check_circle</span>
          <p className="font-['Newsreader'] text-lg text-on-surface mb-1">Account created.</p>
          <p className="font-body-md text-sm text-on-surface-variant">Check your email to confirm, then <Link to="/account" className="text-primary hover:underline">sign in</Link>.</p>
        </div>
      ) : (
        <>
          <h2 className="font-['Newsreader'] text-xl text-on-surface mb-2">Save your account</h2>
          <p className="font-body-md text-sm text-on-surface-variant mb-5">
            Create an account to reorder with one tap, track your order status, and reach our team faster.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {email && (
              <div className="px-4 py-2.5 bg-surface border border-outline-variant/50 rounded-sm font-body-md text-sm text-on-surface-variant">
                {email}
              </div>
            )}
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Choose a password"
              className="w-full px-4 py-2.5 border border-outline-variant rounded-sm font-body-md text-sm text-on-surface bg-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
            />
            {error && <p className="font-body-md text-sm text-error">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-on-primary font-button text-button rounded-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>
        </>
      )}
    </div>
  )
}

export default function OrderConfirmed() {
  const { user } = useAuth()
  const { state } = useLocation() as { state: { orderId?: string; email?: string } | null }
  const ref = state?.orderId?.slice(0, 8).toUpperCase() ?? '—'

  return (
    <div className="px-8 md:px-32 py-section-padding max-w-3xl mx-auto text-center">
      <span className="material-symbols-outlined text-5xl text-primary mb-6 block">check_circle</span>
      <span className="font-label-caps text-label-caps text-primary mb-6 block">Order Confirmed</span>
      <h1 className="font-['Newsreader'] text-display-lg text-on-background mb-8 italic">
        Thank you for your order.
      </h1>
      <p className="font-body-lg text-on-surface-variant mb-4">
        Your order is being reviewed. We'll reach out with your invoice within 1 business day.
      </p>
      {state?.email && (
        <p className="font-body-md text-on-surface-variant mb-8">
          A confirmation has been sent to <strong>{state.email}</strong>.
        </p>
      )}
      <div className="inline-block px-6 py-3 bg-surface-container-low border border-outline-variant rounded-full font-label-caps text-label-caps tracking-widest text-primary mb-16">
        Order Reference: #{ref}
      </div>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link
          to="/availability"
          className="px-8 py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300"
        >
          Browse More
        </Link>
        <Link
          to="/"
          className="px-8 py-4 border border-secondary text-secondary font-button text-button rounded-sm hover:bg-secondary-container/20 transition-all duration-300"
        >
          Back to Home
        </Link>
      </div>

      {!user && <CreateAccountPrompt email={state?.email} />}
    </div>
  )
}
