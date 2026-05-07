import type { VercelRequest, VercelResponse } from '@vercel/node'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const SAMUEL_EMAIL = process.env.SAMUEL_EMAIL ?? 'samuel@kelstonway.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { email } = req.body ?? {}
  if (!email) return res.status(400).json({ error: 'Missing email' })

  try {
    await resend.emails.send({
      from: 'orders@kelstonway.com',
      to: SAMUEL_EMAIL,
      subject: `Wholesale Access Request — ${email}`,
      html: `<p>New wholesale inquiry from: <strong>${email}</strong></p>`,
    })
    return res.status(200).json({ ok: true })
  } catch {
    return res.status(500).json({ error: 'Failed to send' })
  }
}
