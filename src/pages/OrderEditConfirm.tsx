import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import ErrorBanner from '../components/ErrorBanner'

// AI-695 (AI-614 Track 3): public buyer page for a proposed order change.
// Read-only render of the proposed order + operator note; the buyer can Accept,
// Reject, or send a message back. All writes go through /api/order-edit-action
// (token RPCs) — this page never touches the database.

interface ProposedLine {
  lineType: 'standard' | 'substitution' | 'credit' | 'fee'
  description: string
  qty: number
  unitPrice: number
  sku: string | null
  size: string | null
}

interface EditRequestView {
  orderNumber: string
  buyerName: string | null
  note: string | null
  lines: ProposedLine[]
}

type Resolution = 'accept' | 'reject' | null

export default function OrderEditConfirm() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const urlToken = searchParams.get('token')

  const [view, setView] = useState<EditRequestView | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [inactive, setInactive] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState<'accept' | 'reject' | 'message' | null>(null)
  const [resolved, setResolved] = useState<Resolution>(null)
  const [messageSent, setMessageSent] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id || !urlToken) {
        setInactive('This confirmation link is incomplete. Please use the link from your email.')
        setLoading(false)
        return
      }
      try {
        const res = await fetch('/api/order-edit-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, token: urlToken }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          setInactive(data.error ?? 'This confirmation link is no longer active.')
          return
        }
        const data = await res.json()
        setToken(urlToken)
        // Strip the token from the URL once validated (same pattern as OrderStatus)
        window.history.replaceState({}, '', `/order/${id}/confirm`)
        setView(data as EditRequestView)
      } catch {
        setInactive('We could not load this confirmation right now. Please try again shortly.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, urlToken])

  async function act(action: 'accept' | 'reject' | 'message') {
    if (!id || !token) return
    setBusy(action)
    setError(null)
    try {
      const res = await fetch('/api/order-edit-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: id, token, action, message: message.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      if (action === 'message') {
        setMessageSent(true)
        setMessage('')
      } else {
        setResolved(action)
      }
    } catch {
      setError('We could not reach the server. Please check your connection and try again.')
    } finally {
      setBusy(null)
    }
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

  if (inactive) {
    return (
      <div className="px-8 py-32 text-center md:px-32">
        <h2 className="mb-4 font-['Newsreader'] text-headline-md text-on-surface">{inactive}</h2>
        <p className="font-body-md text-on-surface-variant">
          If you have a question about your order, reply to the email or contact us directly.
        </p>
      </div>
    )
  }

  if (!view) return null

  if (resolved) {
    return (
      <div className="px-8 py-32 text-center md:px-32">
        <span className="material-symbols-outlined mb-4 text-5xl text-primary">
          {resolved === 'accept' ? 'check_circle' : 'cancel'}
        </span>
        <h2 className="mb-4 font-['Newsreader'] text-headline-md text-on-surface">
          {resolved === 'accept'
            ? 'Change accepted — your order has been updated.'
            : 'Change declined — your order stays as it was.'}
        </h2>
        <p className="font-body-md text-on-surface-variant">
          {resolved === 'accept'
            ? `Order #${view.orderNumber} now reflects the change below. A confirmation email is on its way.`
            : `Order #${view.orderNumber} was not changed. We've let the team know.`}
        </p>
      </div>
    )
  }

  const total = view.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0)

  return (
    <div className="mx-auto max-w-4xl px-8 py-16 md:px-32">
      <span className="mb-3 block font-label-caps text-label-caps text-secondary">
        PROPOSED ORDER CHANGE
      </span>
      <div className="mb-2 flex flex-wrap items-center gap-4">
        <h1 className="font-['Newsreader'] text-headline-xl text-on-surface">
          Order #{view.orderNumber}
        </h1>
        <span className="rounded-full bg-amber-100 px-3 py-1 font-label-caps text-label-caps uppercase text-amber-700">
          awaiting your confirmation
        </span>
      </div>
      {view.buyerName && (
        <p className="mb-8 font-body-md text-on-surface-variant">For {view.buyerName}</p>
      )}

      <p className="mb-8 font-body-md text-on-surface">
        Kelston Way has proposed a change to this order. Review the updated order below, then
        accept or decline it. Nothing changes until you accept.
      </p>

      {view.note && (
        <div className="mb-8 rounded-sm border-l-4 border-primary bg-primary/5 p-6">
          <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">
            Note from Kelston Way
          </p>
          <p className="font-body-md text-on-surface">{view.note}</p>
        </div>
      )}

      <h2 className="mb-6 border-b border-outline-variant pb-4 font-['Newsreader'] text-headline-md italic">
        Your Order, As Proposed
      </h2>
      <div className="mb-8 space-y-4">
        {view.lines.map((line, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-outline-variant/20 py-3">
            <div className="flex-1">
              <p className="font-['Newsreader'] italic text-on-surface">{line.description}</p>
              <p className="font-body-md text-sm text-on-surface-variant">
                {line.lineType === 'credit'
                  ? 'Credit'
                  : line.lineType === 'fee'
                    ? 'Fee'
                    : [line.size, line.sku].filter(Boolean).join(' · ')}
              </p>
            </div>
            <span className="font-body-md text-on-surface-variant">
              {line.qty} × ${line.unitPrice.toFixed(2)}
            </span>
            <span className="font-body-md font-medium text-on-surface">
              ${(line.qty * line.unitPrice).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mb-12 flex justify-end">
        <p className="font-['Newsreader'] text-2xl text-on-surface">
          ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {error && <ErrorBanner message={error} className="mb-6" />}

      <div className="mb-10 flex flex-wrap gap-4">
        <button
          onClick={() => act('accept')}
          disabled={busy !== null}
          className="rounded-sm bg-primary px-8 py-4 font-button text-button text-on-primary transition-all hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'accept' ? 'Accepting...' : 'Accept This Change'}
        </button>
        <button
          onClick={() => act('reject')}
          disabled={busy !== null}
          className="rounded-sm border border-outline px-8 py-4 font-button text-button text-on-surface transition-all hover:bg-surface-container disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'reject' ? 'Declining...' : 'Decline — Keep My Order As-Is'}
        </button>
      </div>

      <div className="rounded-sm border border-outline-variant/30 bg-surface-container-low p-8">
        <h3 className="mb-3 font-['Newsreader'] text-xl text-on-surface">Send Us a Message</h3>
        <p className="mb-4 font-body-md text-on-surface-variant">
          Questions about this change? Add a message — it goes straight to the team. You can still
          accept or decline afterward.
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Type your message..."
          className="mb-4 w-full rounded-sm border border-outline-variant bg-surface p-4 font-body-md text-on-surface focus:border-primary focus:outline-none"
        />
        {messageSent && (
          <p className="mb-4 font-body-md font-medium text-primary">
            ✓ Message sent. We&apos;ll be in touch.
          </p>
        )}
        <button
          onClick={() => act('message')}
          disabled={busy !== null || message.trim().length === 0}
          className="rounded-sm border border-primary px-6 py-3 font-button text-button text-primary transition-all hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy === 'message' ? 'Sending...' : 'Send Message'}
        </button>
      </div>
    </div>
  )
}
