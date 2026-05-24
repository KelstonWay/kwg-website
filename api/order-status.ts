import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase env vars')
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, token } = req.body ?? {}
  if (!orderId || !token) return res.status(400).json({ error: 'Missing fields' })

  // Validate confirm_token — must match, must not be null (cleared after confirmation), within 7 days
  const { data: order } = await supabase
    .from('wholesale_orders')
    .select(
      'id, created_at, business_name, contact_name, email, phone, notes, status, total_units, total_price, confirm_token'
    )
    .eq('id', orderId)
    .eq('confirm_token', token)
    .not('confirm_token', 'is', null)
    .single()

  if (!order) return res.status(403).json({ error: 'Invalid or expired link' })

  const ageMs = Date.now() - new Date(order.created_at).getTime()
  if (ageMs > SEVEN_DAYS_MS) return res.status(403).json({ error: 'Link expired' })

  const { data: items } = await supabase
    .from('wholesale_order_items')
    .select('id, plant_name, plant_size, plant_sku, qty_requested, unit_price, tray_count, tray_price, line_total')
    .eq('order_id', orderId)

  const { confirm_token: _removed, ...orderWithoutToken } = order
  return res.status(200).json({ order: orderWithoutToken, items: items ?? [] })
}
