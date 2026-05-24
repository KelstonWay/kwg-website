import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase env vars')
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.slice(7)
  const { data: userData, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !userData.user) return res.status(401).json({ error: 'Unauthorized' })

  const userId = userData.user.id
  const { orderId, claimToken } = req.body ?? {}
  if (!orderId || !claimToken) return res.status(400).json({ error: 'Missing fields' })

  // Find order: id + claim_token must match, user_id must be null, order within 2 hours
  const { data: order } = await supabase
    .from('wholesale_orders')
    .select('id, user_id, created_at, claim_token, email')
    .eq('id', orderId)
    .eq('claim_token', claimToken)
    .is('user_id', null)
    .single()

  if (!order) return res.status(403).json({ error: 'Invalid or expired claim token' })

  // Authenticated user's email must match the order email (case-insensitive)
  if (userData.user.email?.trim().toLowerCase() !== order.email?.trim().toLowerCase()) {
    return res.status(403).json({ error: 'Email mismatch' })
  }

  const ageMs = Date.now() - new Date(order.created_at).getTime()
  if (ageMs > 2 * 60 * 60 * 1000) {
    return res.status(403).json({ error: 'Claim token expired' })
  }

  const { data: updated, error: updateErr } = await supabase
    .from('wholesale_orders')
    .update({ user_id: userId, claim_token: null })
    .eq('id', orderId)
    .eq('claim_token', claimToken)
    .is('user_id', null)
    .select('id')

  if (updateErr) return res.status(500).json({ error: 'Failed to claim order' })
  if (!updated || updated.length === 0) {
    return res.status(409).json({ error: 'Order already claimed' })
  }

  return res.status(200).json({ ok: true })
}
