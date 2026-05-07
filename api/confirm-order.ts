import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const supabase = createClient(
  process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY ?? process.env.VITE_SUPABASE_ANON_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, token } = req.body ?? {}
  if (!orderId || !token) return res.status(400).json({ error: 'Missing fields' })

  // Verify token server-side — both id AND confirm_token must match
  const { data: order } = await supabase
    .from('wholesale_orders')
    .select('id, email, contact_name, status')
    .eq('id', orderId)
    .eq('confirm_token', token)
    .single()

  if (!order) return res.status(403).json({ error: 'Invalid or expired link' })
  if (order.status !== 'pending') return res.status(409).json({ error: 'Order already confirmed' })

  const { error: updateErr } = await supabase
    .from('wholesale_orders')
    .update({ status: 'confirmed' })
    .eq('id', orderId)

  if (updateErr) return res.status(500).json({ error: 'Failed to confirm order' })

  try {
    await resend.emails.send({
      from: 'orders@kelstonway.com',
      to: order.email,
      subject: 'Your Kelston Way Order is Confirmed',
      html: `<h2>Order Confirmed</h2><p>Hi ${esc(order.contact_name)},</p><p>Your wholesale order has been confirmed. We'll be in touch shortly with your invoice.</p><p>Order ref: <strong>${order.id.slice(0, 8).toUpperCase()}</strong></p><p>— Kelston Way Greenhouse</p>`,
    })
  } catch { /* email failure is non-fatal */ }

  return res.status(200).json({ ok: true })
}
