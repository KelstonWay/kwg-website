import { useState } from 'react'
import ErrorBanner from '../components/ErrorBanner'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', business: '', message: '' })
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)

    try {
      const res = await fetch('/api/send-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setSent(true)
    } catch {
      setError('Something went wrong. Please email us directly at samuel@kelstonway.com')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="px-5 py-20 md:px-32">
      <div className="mx-auto max-w-2xl">
        <span className="mb-4 block font-label-caps text-label-caps text-secondary">
          GET IN TOUCH
        </span>
        <h1 className="mb-4 font-['Newsreader'] text-headline-xl text-on-surface">Contact Us</h1>
        <p className="mb-12 font-body-lg text-on-surface-variant">
          Questions about wholesale pricing, availability, or delivery? We'd love to hear from you.
        </p>

        {sent ? (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined mb-4 block text-5xl text-primary">
              mark_email_read
            </span>
            <h2 className="mb-3 font-['Newsreader'] text-headline-md text-on-surface">
              Message sent!
            </h2>
            <p className="font-body-md text-on-surface-variant">
              We'll get back to you within 1 business day.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  YOUR NAME *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  BUSINESS NAME
                </label>
                <input
                  value={form.business}
                  onChange={(e) => setForm((f) => ({ ...f, business: e.target.value }))}
                  className="w-full rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                  placeholder="Optional"
                />
              </div>
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
                MESSAGE *
              </label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full resize-none rounded border border-outline-variant px-4 py-3 font-body-md transition-colors focus:border-primary focus:outline-none"
                placeholder="Tell us what you're looking for..."
              />
            </div>
            {error && <ErrorBanner message={error} />}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-sm bg-primary py-4 font-button text-button text-on-primary transition-all duration-300 hover:bg-primary-container disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 border-t border-outline-variant/30 pt-12 md:grid-cols-2">
          <div>
            <span className="material-symbols-outlined mb-3 block text-2xl text-primary">mail</span>
            <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">EMAIL</p>
            <a
              href="mailto:samuel@kelstonway.com"
              className="font-body-md text-on-surface transition-colors hover:text-primary"
            >
              samuel@kelstonway.com
            </a>
          </div>
          <div>
            <span className="material-symbols-outlined mb-3 block text-2xl text-primary">
              location_on
            </span>
            <p className="mb-1 font-label-caps text-label-caps text-on-surface-variant">LOCATION</p>
            <p className="font-body-md text-on-surface">Oglesby, Coryell County, Texas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
