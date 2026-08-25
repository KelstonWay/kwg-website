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

  const { name, email, business, message } = req.body ?? {}
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' })

  try {
    await send({
      from: 'orders@kelstonway.com',
      to: TEAM_EMAIL,
      // Notification is from orders@ to orders@, so without this a reply would go
      // back to the shared mailbox instead of the person who wrote in.
      ...(EMAIL_RE.test(String(email)) ? { replyTo: String(email) } : {}),
      subject: `Contact Form — ${esc(name)} (${esc(business || 'No business')})`,
      html: `<p><strong>Name:</strong> ${esc(name)}<br/><strong>Email:</strong> ${esc(email)}<br/><strong>Business:</strong> ${esc(business || 'N/A')}</p><p><strong>Message:</strong><br/>${esc(message).replace(/\n/g, '<br/>')}</p>`,
    })
    return res.status(200).json({ ok: true })
  } catch (emailErr) {
    console.error('Contact form send failed for', String(email), emailErr)
    return res.status(500).json({ error: 'Failed to send message' })
  }
}
