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
const SAMUEL_EMAIL = process.env.SAMUEL_EMAIL ?? 'samuel@kelstonway.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items, contact } = req.body ?? {}

  if (!Array.isArray(items) || !items.length || !contact?.business_name || !contact?.contact_name || !contact?.email) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Re-price everything server-side — client only sends IDs + quantities
  const releaseItemIds = items.map((i: any) => String(i.release_item_id))
  const { data: releaseItems, error: riErr } = await supabase
    .from('availability_release_items')
    .select('id, unit_price, tray_count, qty_available, plant_id, plants(name, sku, size)')
    .in('id', releaseItemIds)

  if (riErr || !releaseItems) return res.status(500).json({ error: 'Failed to load items' })

  const riMap = Object.fromEntries(releaseItems.map((r: any) => [r.id, r]))
  const orderLines = items
    .map((i: any) => {
      const ri = riMap[i.release_item_id]
      if (!ri) return null
      const qty = Math.max(1, Math.floor(Number(i.qty) || 1))
      const unitPrice = ri.unit_price ?? 0
      const trayCount = ri.tray_count ?? 1
      const trayPrice = unitPrice * trayCount
      return {
        release_item_id: i.release_item_id,
        plant_id: ri.plant_id,
        plant_name: ri.plants?.name ?? '',
        plant_sku: ri.plants?.sku ?? '',
        plant_size: ri.plants?.size ?? '',
        unit_price: unitPrice,
        tray_count: trayCount,
        tray_price: trayPrice,
        qty_requested: qty,
        line_total: trayPrice * qty,
      }
    })
    .filter(Boolean) as any[]

  if (!orderLines.length) return res.status(400).json({ error: 'No valid items' })

  const totalUnits = orderLines.reduce((s, i) => s + i.qty_requested, 0)
  const totalPrice = orderLines.reduce((s, i) => s + i.line_total, 0)

  const { data: order, error: orderErr } = await supabase
    .from('wholesale_orders')
    .insert({
      business_name: contact.business_name,
      contact_name: contact.contact_name,
      email: contact.email,
      phone: contact.phone || null,
      notes: contact.notes || null,
      total_units: totalUnits,
      total_price: totalPrice,
    })
    .select('id, confirm_token')
    .single()

  if (orderErr || !order) return res.status(500).json({ error: 'Failed to create order' })

  await supabase.from('wholesale_order_items').insert(
    orderLines.map(l => ({ order_id: order.id, ...l }))
  )

  const confirmUrl = `https://kelstonway.com/order/${order.id}?token=${order.confirm_token}`
  const itemsHtml = orderLines
    .map(i => `<tr><td>${esc(i.plant_name)}</td><td>${esc(i.plant_size)}</td><td>${i.qty_requested} trays (${i.tray_count}-count)</td><td>$${i.tray_price.toFixed(2)}/tray</td><td>$${i.line_total.toFixed(2)}</td></tr>`)
    .join('')

  try {
    await Promise.all([
      resend.emails.send({
        from: 'orders@kelstonway.com',
        to: contact.email,
        subject: 'Order Received — Kelston Way Greenhouse',
        html: `<h2>Thank you, ${esc(contact.contact_name)}!</h2><p>We've received your wholesale order (ref: <strong>${order.id.slice(0, 8).toUpperCase()}</strong>) and will be in touch within 1 business day.</p><p>— Kelston Way Greenhouse</p>`,
      }),
      resend.emails.send({
        from: 'orders@kelstonway.com',
        to: SAMUEL_EMAIL,
        subject: `New Wholesale Order — ${esc(contact.business_name)} — $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        html: `<h2>New Order from ${esc(contact.business_name)}</h2><p><strong>Contact:</strong> ${esc(contact.contact_name)} &lt;${esc(contact.email)}&gt;<br/><strong>Phone:</strong> ${esc(contact.phone || 'N/A')}<br/><strong>Notes:</strong> ${esc(contact.notes || 'N/A')}</p><table border="1" cellpadding="6"><thead><tr><th>Plant</th><th>Size</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table><p><strong>Total: ${totalUnits} trays / $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p><p><a href="${confirmUrl}">✅ Confirm This Order</a></p>`,
      }),
    ])
  } catch { /* email failure is non-fatal */ }

  return res.status(200).json({ orderId: order.id, email: contact.email })
}
