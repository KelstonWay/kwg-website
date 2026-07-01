import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// AI-695 (AI-614 Track 3): validate an order-edit confirm link and return the
// proposed change for rendering. Read-only — the buyer acts via
// /api/order-edit-action. Mirrors order-status.ts: token validated server-side
// with the service role, 7-day expiry, no anon table access.

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase env vars')
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface ProposedLine {
  line_id: string | null
  plant_id: string | null
  line_type: 'standard' | 'substitution' | 'credit' | 'fee'
  description: string
  approved_qty: number
  unit_price: number
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, token } = req.body ?? {}
  if (!orderId || !token) return res.status(400).json({ error: 'Missing fields' })
  if (!UUID_RE.test(orderId) || !UUID_RE.test(token)) {
    return res.status(400).json({ error: 'Invalid link' })
  }

  // Token + order_id + still-pending must all match (token is nulled on resolve)
  const { data: request } = await supabase
    .from('order_edit_requests')
    .select('id, note, proposed, created_at')
    .eq('order_id', orderId)
    .eq('confirm_token', token)
    .eq('status', 'pending')
    .maybeSingle()

  if (!request) {
    return res.status(403).json({ error: 'This confirmation link is no longer active.' })
  }
  const ageMs = Date.now() - new Date(request.created_at).getTime()
  if (ageMs > SEVEN_DAYS_MS) {
    return res.status(403).json({ error: 'This confirmation link has expired.' })
  }

  const { data: order } = await supabase
    .from('orders')
    .select('id, order_number, buyer_id, org_id')
    .eq('id', orderId)
    .maybeSingle()
  if (!order) return res.status(403).json({ error: 'This confirmation link is no longer active.' })

  const { data: buyer } = await supabase
    .from('buyers')
    .select('name')
    .eq('id', order.buyer_id)
    .eq('org_id', order.org_id)
    .maybeSingle()

  // Enrich product lines with sku/size for display (description already carries the name)
  const lines: ProposedLine[] = (request.proposed?.lines ?? []) as ProposedLine[]
  const plantIds = [...new Set(lines.map((l) => l.plant_id).filter((p): p is string => !!p))]
  const plantById = new Map<string, { sku: string | null; size: string | null }>()
  if (plantIds.length > 0) {
    const { data: plants } = await supabase
      .from('plants')
      .select('id, sku, size')
      .in('id', plantIds)
    for (const p of plants ?? []) plantById.set(p.id, { sku: p.sku, size: p.size })
  }

  return res.status(200).json({
    orderNumber: order.order_number,
    buyerName: buyer?.name ?? null,
    note: request.note,
    lines: lines.map((l) => ({
      lineType: l.line_type,
      description: l.description,
      qty: l.approved_qty,
      unitPrice: l.unit_price,
      sku: l.plant_id ? (plantById.get(l.plant_id)?.sku ?? null) : null,
      size: l.plant_id ? (plantById.get(l.plant_id)?.size ?? null) : null,
    })),
  })
}
