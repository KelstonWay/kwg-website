import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const resend = new Resend(process.env.RESEND_API_KEY)
const SAMUEL_EMAIL = process.env.SAMUEL_EMAIL ?? 'samuel@kelstonway.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { name, email, business, message } = req.body ?? {}
  if (!name || !email || !message) return res.status(400).json({ error: 'Missing fields' })

  try {
    await resend.emails.send({
      from: 'orders@kelstonway.com',
      to: SAMUEL_EMAIL,
      subject: `Contact Form — ${esc(name)} (${esc(business || 'No business')})`,
      html: `<p><strong>Name:</strong> ${esc(name)}<br/><strong>Email:</strong> ${esc(email)}<br/><strong>Business:</strong> ${esc(business || 'N/A')}</p><p><strong>Message:</strong><br/>${esc(message).replace(/\n/g, '<br/>')}</p>`,
    })
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send message' })
  }
}
