import { useState } from 'react'

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
    <div className="px-5 md:px-32 py-20">
      <div className="max-w-2xl mx-auto">
        <span className="font-label-caps text-label-caps text-secondary mb-4 block">GET IN TOUCH</span>
        <h1 className="font-['Newsreader'] text-headline-xl text-on-surface mb-4">Contact Us</h1>
        <p className="font-body-lg text-on-surface-variant mb-12">
          Questions about wholesale pricing, availability, or delivery? We'd love to hear from you.
        </p>

        {sent ? (
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-5xl text-primary mb-4 block">mark_email_read</span>
            <h2 className="font-['Newsreader'] text-headline-md text-on-surface mb-3">Message sent!</h2>
            <p className="font-body-md text-on-surface-variant">We'll get back to you within 1 business day.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">YOUR NAME *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">BUSINESS NAME</label>
                <input
                  value={form.business}
                  onChange={e => setForm(f => ({ ...f, business: e.target.value }))}
                  className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors"
                  placeholder="Optional"
                />
              </div>
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
              <label className="font-label-caps text-label-caps text-on-surface-variant block mb-2">MESSAGE *</label>
              <textarea
                required
                rows={5}
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                className="w-full border border-outline-variant rounded px-4 py-3 font-body-md focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="Tell us what you're looking for..."
              />
            </div>
            {error && <p className="text-error font-body-md text-sm">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-4 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300 disabled:opacity-60"
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        )}

        <div className="mt-16 pt-12 border-t border-outline-variant/30 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <span className="material-symbols-outlined text-primary text-2xl mb-3 block">mail</span>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">EMAIL</p>
            <a href="mailto:samuel@kelstonway.com" className="font-body-md text-on-surface hover:text-primary transition-colors">
              samuel@kelstonway.com
            </a>
          </div>
          <div>
            <span className="material-symbols-outlined text-primary text-2xl mb-3 block">location_on</span>
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-1">LOCATION</p>
            <p className="font-body-md text-on-surface">Oglesby, Coryell County, Texas</p>
          </div>
        </div>
      </div>
    </div>
  )
}
