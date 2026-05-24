import { useState, useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import ErrorBanner from '../components/ErrorBanner'
import { parseError } from '../lib/parse-error'

function CreateAccountPrompt({
  email,
  orderId,
  claimToken,
}: {
  email?: string
  orderId?: string
  claimToken?: string
}) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [orderLinked, setOrderLinked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError(null)

    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: email ?? '',
      password,
    })
    if (signUpErr) {
      setError(parseError(signUpErr))
      setLoading(false)
      return
    }

    // Link this order to the new account using the claim token
    const token = signUpData.session?.access_token
    const resolvedClaimToken =
      claimToken ?? (orderId ? sessionStorage.getItem(`kwg_claim_${orderId}`) : null)

    let linked = false
    if (token && orderId && resolvedClaimToken) {
      try {
        const claimRes = await fetch('/api/claim-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId, claimToken: resolvedClaimToken }),
        })
        if (claimRes.ok) {
          sessionStorage.removeItem(`kwg_claim_${orderId}`)
          linked = true
        }
      } catch {
        // Non-fatal — order still placed, just not linked
      }
    }

    setOrderLinked(linked)
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="relative mx-auto mt-12 max-w-md rounded-sm border border-outline-variant/40 bg-surface-container-low p-8 text-left">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-4 text-on-surface-variant hover:text-on-surface"
        aria-label="Dismiss"
      >
        <span className="material-symbols-outlined text-xl">close</span>
      </button>

      {done ? (
        <div className="py-2 text-center">
          <span className="material-symbols-outlined mb-3 block text-3xl text-primary">
            check_circle
          </span>
          <p className="mb-1 font-['Newsreader'] text-lg text-on-surface">Account created.</p>
          <p className="font-body-md text-sm text-on-surface-variant">
            {orderLinked ? (
              <Link to="/account" className="text-primary hover:underline">
                Sign in to view your order history.
              </Link>
            ) : (
              <>
                Account created.{' '}
                <Link to="/account" className="text-primary hover:underline">
                  Sign in
                </Link>{' '}
                to manage future orders.
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          <h2 className="mb-2 font-['Newsreader'] text-xl text-on-surface">Save your account</h2>
          <p className="mb-5 font-body-md text-sm text-on-surface-variant">
            Create an account to reorder with one tap, track your order status, and reach our team
            faster.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {email && (
              <div className="rounded-sm border border-outline-variant/50 bg-surface px-4 py-2.5 font-body-md text-sm text-on-surface-variant">
                {email}
              </div>
            )}
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              className="w-full rounded-sm border border-outline-variant bg-surface px-4 py-2.5 font-body-md text-sm text-on-surface transition-colors placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none"
            />
            {error && <ErrorBanner message={error} />}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-sm bg-primary py-3 font-button text-button text-on-primary transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
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
  const { state } = useLocation() as {
    state: { orderId?: string; claimToken?: string; email?: string } | null
  }
  const ref = state?.orderId?.slice(0, 8).toUpperCase() ?? '—'

  // Resolve claim token from state or sessionStorage fallback
  const [claimToken, setClaimToken] = useState<string | undefined>(state?.claimToken)
  useEffect(() => {
    if (!claimToken && state?.orderId) {
      const stored = sessionStorage.getItem(`kwg_claim_${state.orderId}`)
      if (stored) setClaimToken(stored)
    }
  }, [claimToken, state?.orderId])

  return (
    <div className="mx-auto max-w-3xl px-8 py-section-padding text-center md:px-32">
      <span className="material-symbols-outlined mb-6 block text-5xl text-primary">
        check_circle
      </span>
      <span className="mb-6 block font-label-caps text-label-caps text-primary">
        Order Confirmed
      </span>
      <h1 className="mb-8 font-['Newsreader'] text-display-lg italic text-on-background">
        Thank you for your order.
      </h1>
      <p className="mb-4 font-body-lg text-on-surface-variant">
        Your order is being reviewed. We'll reach out with your invoice within 1 business day.
      </p>
      {state?.email && (
        <p className="mb-8 font-body-md text-on-surface-variant">
          A confirmation has been sent to <strong>{state.email}</strong>.
        </p>
      )}
      <div className="mb-16 inline-block rounded-full border border-outline-variant bg-surface-container-low px-6 py-3 font-label-caps text-label-caps tracking-widest text-primary">
        Order Reference: #{ref}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/availability"
          className="rounded-sm bg-primary px-8 py-4 font-button text-button text-on-primary transition-all duration-300 hover:bg-primary-container"
        >
          Browse More
        </Link>
        <Link
          to="/"
          className="rounded-sm border border-secondary px-8 py-4 font-button text-button text-secondary transition-all duration-300 hover:bg-secondary-container/20"
        >
          Back to Home
        </Link>
      </div>

      {!user && (
        <CreateAccountPrompt
          email={state?.email}
          orderId={state?.orderId}
          claimToken={claimToken}
        />
      )}
    </div>
  )
}
