import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// AI-695 (AI-614 Track 3): buyer acts on an order-edit confirm link — Accept,
// Reject, or message-back. This route does NO direct table writes: it resolves
// the pending request by (order_id, token) and calls the Track 1 token RPCs
// (accept/reject/message_order_edit_request), which re-assert token + status +
// 7-day expiry and resolve atomically. Mirrors confirm-order.ts.

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) throw new Error('Missing Supabase env vars')
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)

const SAMUEL_EMAIL = process.env.SAMUEL_EMAIL ?? 'samuel@kelstonway.com'
const FROM = 'orders@kelstonway.com'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const MAX_MESSAGE_LEN = 2000

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// The RPCs raise typed-outcome exceptions; surface their buyer-friendly text but
// never leak anything else.
function friendlyRpcError(message: string | undefined): string {
  if (!message) return 'Something went wrong. Please try again.'
  if (message.includes('no longer valid')) return 'This confirmation link is no longer active.'
  if (message.includes('expired')) return 'This confirmation link has expired.'
  if (message.includes('cannot be empty')) return 'Message cannot be empty.'
  // Accept can fail the eligibility gate if the order moved on since the email
  if (
    message.includes('can no longer be edited') ||
    message.includes('can be edited') ||
    message.includes('already invoiced')
  ) {
    return 'This order has already moved forward and can no longer be changed from this link. Please contact us instead.'
  }
  return 'Something went wrong. Please try again.'
}

async function buyerContactEmail(buyerId: string, orgId: string): Promise<string | null> {
  const { data } = await supabase
    .from('buyer_contacts')
    .select('email, is_default_order_contact')
    .eq('buyer_id', buyerId)
    .eq('org_id', orgId)
    .not('email', 'is', null)
    .order('is_default_order_contact', { ascending: false })
    .order('created_at', { ascending: true })
  return data?.[0]?.email ?? null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { orderId, token, action, message } = req.body ?? {}
  if (!orderId || !token || !action) return res.status(400).json({ error: 'Missing fields' })
  if (!UUID_RE.test(orderId) || !UUID_RE.test(token)) {
    return res.status(400).json({ error: 'Invalid link' })
  }
  if (action !== 'accept' && action !== 'reject' && action !== 'message') {
    return res.status(400).json({ error: 'Invalid action' })
  }
  const buyerMessage = typeof message === 'string' ? message.trim().slice(0, MAX_MESSAGE_LEN) : ''
  if (action === 'message' && !buyerMessage) {
    return res.status(400).json({ error: 'Message cannot be empty.' })
  }

  // Resolve the pending request from (order_id, token) — the email link carries no
  // request id. The RPC re-asserts everything atomically; this read only routes.
  const { data: request } = await supabase
    .from('order_edit_requests')
    .select('id')
    .eq('order_id', orderId)
    .eq('confirm_token', token)
    .eq('status', 'pending')
    .maybeSingle()
  if (!request) {
    return res.status(403).json({ error: 'This confirmation link is no longer active.' })
  }

  const rpcName =
    action === 'accept'
      ? 'accept_order_edit_request'
      : action === 'reject'
        ? 'reject_order_edit_request'
        : 'message_order_edit_request'

  // null, not undefined: the RPC params have no SQL defaults, so all three named
  // args must be present in the PostgREST call or the function fails to resolve
  const { error: rpcErr } = await supabase.rpc(rpcName, {
    p_request_id: request.id,
    p_token: token,
    p_buyer_message: buyerMessage.length > 0 ? buyerMessage : null,
  })
  if (rpcErr) return res.status(409).json({ error: friendlyRpcError(rpcErr.message) })

  // Emails are a record, never a gate — failures are non-fatal (confirm-order.ts rule)
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('order_number, buyer_id, org_id')
      .eq('id', orderId)
      .maybeSingle()
    const orderNo = esc(order?.order_number ?? '')
    const msgBlock = buyerMessage
      ? `<blockquote style="border-left:3px solid #4c614c;padding-left:12px;color:#555">${esc(buyerMessage)}</blockquote>`
      : ''

    if (action === 'accept' || action === 'reject') {
      const verdict = action === 'accept' ? 'accepted' : 'rejected'
      await resend.emails.send({
        from: FROM,
        to: SAMUEL_EMAIL,
        subject: `Order #${orderNo} change ${verdict} by the buyer`,
        html: `<p>The buyer <strong>${verdict}</strong> the proposed change to order <strong>#${orderNo}</strong>.</p>${msgBlock}<p>— kelstonway.com</p>`,
      })
      const buyerEmail = order ? await buyerContactEmail(order.buyer_id, order.org_id) : null
      if (buyerEmail) {
        await resend.emails.send({
          from: FROM,
          to: buyerEmail,
          subject:
            action === 'accept'
              ? `Your updated Kelston Way order #${orderNo} is confirmed`
              : `Kelston Way order #${orderNo} — change declined`,
          html:
            action === 'accept'
              ? `<p>Thanks — the change to order <strong>#${orderNo}</strong> has been applied and your order is confirmed.</p><p>— Kelston Way Greenhouse</p>`
              : `<p>You declined the proposed change to order <strong>#${orderNo}</strong>. Your order remains exactly as it was.</p><p>— Kelston Way Greenhouse</p>`,
        })
      }
    } else {
      await resend.emails.send({
        from: FROM,
        to: SAMUEL_EMAIL,
        subject: `Order #${orderNo} — message from the buyer`,
        html: `<p>The buyer sent a message about the pending change to order <strong>#${orderNo}</strong>:</p>${msgBlock}<p>— kelstonway.com</p>`,
      })
    }
  } catch {
    /* email failure is non-fatal */
  }

  return res.status(200).json({ ok: true, result: action })
}
