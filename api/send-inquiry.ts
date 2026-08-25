import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const resend = new Resend(process.env.RESEND_API_KEY)
// Where buyer mail and order alerts land. orders@ is a shared mailbox, so Samuel and
// Titus both see it (Samuel, 2026-08-25). Deliberately does not fall back to the old
// SAMUEL_EMAIL var — that would quietly route buyer mail to one person again.
const TEAM_EMAIL = process.env.TEAM_EMAIL?.trim() || 'orders@kelstonway.com'

// Resend resolves API and network failures as { data: null, error } instead of
// throwing, so an unchecked send reports success even when nothing was delivered
// (Codex review, 2026-08-25). Everything goes through here so a failure is real.
async function send(opts: Parameters<typeof resend.emails.send>[0]) {
  const { error } = await resend.emails.send(opts)
  if (error) throw new Error(`Resend: ${error.message ?? JSON.stringify(error)}`)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Validate rather than just gating replyTo: a malformed address would otherwise
  // either drop the reply header silently or make Resend reject the whole
  // notification, losing the inquiry (Codex review, 2026-08-25).
  const address = String(req.body?.email ?? '').trim()
  if (!address) return res.status(400).json({ error: 'Missing email' })
  if (address.length > 254 || !EMAIL_RE.test(address)) {
    return res.status(400).json({ error: 'Invalid email' })
  }

  try {
    await send({
      from: 'orders@kelstonway.com',
      to: TEAM_EMAIL,
      // Same reason as the contact form: reply should reach the person asking.
      replyTo: address,
      subject: `Wholesale Inquiry — ${address}`,
      html: `<p>New wholesale inquiry from: <strong>${esc(address)}</strong></p>`,
    })
    return res.status(200).json({ ok: true })
  } catch (emailErr) {
    console.error('Inquiry notification failed for', address, emailErr)
    return res.status(500).json({ error: 'Failed to send' })
  }
}
