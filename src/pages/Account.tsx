import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

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

function AccountDashboard() {
  return (
    <div className="px-5 md:px-20 py-16 max-w-4xl mx-auto">
      <p className="font-body-md text-on-surface-variant">Loading orders…</p>
    </div>
  )
}
