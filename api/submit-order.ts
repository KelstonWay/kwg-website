import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import * as XLSX from 'xlsx'

function esc(s: string) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
const resend = new Resend(process.env.RESEND_API_KEY)
const SAMUEL_EMAIL = process.env.SAMUEL_EMAIL ?? 'samuel@kelstonway.com'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { items, contact } = req.body ?? {}

  if (
    !Array.isArray(items) ||
    !items.length ||
    !contact?.business_name ||
    !contact?.contact_name ||
    !contact?.email ||
    !contact?.address_street ||
    !contact?.address_city ||
    !contact?.address_state ||
    !contact?.address_zip
  ) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  // Normalize email so it matches Supabase auth (which lowercases on signup)
  contact.email = contact.email.trim().toLowerCase()

  // Verify caller identity — stamp user_id if authenticated
  let userId: string | null = null
  const authHeader = req.headers.authorization
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const { data: userData } = await supabase.auth.getUser(token)
    userId = userData.user?.id ?? null
  }

  // Fetch the current published release — items not on it are rejected
  const { data: currentRelease, error: releaseErr } = await supabase
    .from('availability_releases')
    .select('id')
    .not('published_at', 'is', null)
    .order('published_at', { ascending: false })
    .limit(1)
    .single()

  if (releaseErr || !currentRelease) return res.status(400).json({ error: 'No active availability release' })

  // Re-price everything server-side — client only sends IDs + quantities
  // Only accept items from the current published release that are visible and have stock
  const releaseItemIds = [...new Set(items.map((i: any) => String(i.release_item_id)))]
  const { data: releaseItems, error: riErr } = await supabase
    .from('availability_release_items')
    .select('id, unit_price, tray_count, qty_available, plant_id, plants(name, sku, size)')
    .in('id', releaseItemIds)
    .eq('release_id', currentRelease.id)
    .eq('website_visible', true)
    .gt('qty_available', 0)

  if (riErr || !releaseItems) return res.status(500).json({ error: 'Failed to load items' })

  // Aggregate duplicate release_item_ids from client, then validate
  const qtyByReleaseItem: Record<string, number> = {}
  for (const i of items) {
    const id = String(i.release_item_id)
    qtyByReleaseItem[id] = (qtyByReleaseItem[id] ?? 0) + Math.max(1, Math.floor(Number(i.qty) || 1))
  }

  const riMap = Object.fromEntries(releaseItems.map((r: any) => [r.id, r]))

  // Validate: reject if any requested item is unavailable or quantity exceeds stock
  const unavailableIds = releaseItemIds.filter((rid) => !riMap[rid])
  if (unavailableIds.length > 0) {
    return res.status(409).json({ error: 'Some items are no longer available', unavailable_ids: unavailableIds })
  }

  const overQuantityIds = releaseItemIds.filter((rid) => {
    const ri = riMap[rid]
    return ri && qtyByReleaseItem[rid] > ri.qty_available
  })
  if (overQuantityIds.length > 0) {
    return res.status(409).json({
      error: 'Requested quantity exceeds available stock for some items',
      over_quantity_ids: overQuantityIds,
    })
  }

  const orderLines = releaseItemIds.map((rid) => {
    const ri = riMap[rid]
    const qty = qtyByReleaseItem[rid]
    const unitPrice = ri.unit_price ?? 0
    const trayCount = ri.tray_count ?? 1
    const trayPrice = unitPrice * trayCount
    return {
      release_item_id: rid,
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

  if (!orderLines.length) return res.status(400).json({ error: 'No valid items' })

  const totalUnits = orderLines.reduce((s: number, i: any) => s + i.qty_requested, 0)
  const totalPrice = orderLines.reduce((s: number, i: any) => s + i.line_total, 0)

  // Atomic insert via RPC — order + items + claim_token in one transaction
  const { data: rpcResult, error: rpcErr } = await supabase.rpc('create_wholesale_order', {
    p_business_name: contact.business_name,
    p_contact_name: contact.contact_name,
    p_email: contact.email,
    p_phone: contact.phone || null,
    p_notes: contact.notes || null,
    p_address_street: contact.address_street,
    p_address_city: contact.address_city,
    p_address_state: contact.address_state,
    p_address_zip: contact.address_zip,
    p_user_id: userId,
    p_total_units: totalUnits,
    p_total_price: totalPrice,
    p_items: orderLines,
  })

  if (rpcErr || !rpcResult) {
    console.error('create_wholesale_order RPC failed:', rpcErr?.message)
    return res.status(500).json({ error: 'Failed to create order' })
  }

  const orderId: string = rpcResult.order_id
  const claimToken: string = rpcResult.claim_token
  const confirmToken: string = rpcResult.confirm_token

  if (typeof orderId !== 'string' || typeof claimToken !== 'string' || typeof confirmToken !== 'string') {
    console.error('create_wholesale_order returned unexpected shape:', rpcResult)
    return res.status(500).json({ error: 'Failed to create order' })
  }

  // Auto-upsert buyer profile from submitted contact data (logged-in orders only)
  if (userId) {
    await supabase.from('buyer_profiles').upsert(
      {
        user_id: userId,
        business_name: contact.business_name,
        contact_name: contact.contact_name,
        email: contact.email,
        phone: contact.phone || null,
        address_street: contact.address_street,
        address_city: contact.address_city,
        address_state: contact.address_state,
        address_zip: contact.address_zip,
      },
      { onConflict: 'user_id' }
    )
  }

  const orderRef = orderId.slice(0, 8).toUpperCase()
  const confirmUrl = `https://kelstonway.com/order/${orderId}?token=${confirmToken}`

  const itemsHtml = orderLines
    .map(
      (i: any) =>
        `<tr><td>${esc(i.plant_name)}</td><td>${esc(i.plant_size)}</td><td>${i.qty_requested} trays (${i.tray_count}-count)</td><td>$${i.tray_price.toFixed(2)}/tray</td><td>$${i.line_total.toFixed(2)}</td></tr>`
    )
    .join('')

  // Build Excel attachment for accounting import
  const wsRows = orderLines.map((i: any) => ({
    Business: contact.business_name,
    Contact: contact.contact_name,
    'Item #': i.plant_sku,
    'Plant Name': i.plant_name,
    Size: i.plant_size,
    'Qty (trays)': i.qty_requested,
    'Plants / Tray': i.tray_count,
    'Price / Tray': parseFloat(i.tray_price.toFixed(2)),
    'Line Total': parseFloat(i.line_total.toFixed(2)),
  }))
  const ws = XLSX.utils.json_to_sheet(wsRows)
  ws['!cols'] = [20, 20, 12, 32, 12, 14, 16, 14, 14].map((wch) => ({ wch }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Order')
  const xlsxBuffer: Buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const xlsxFilename = `kwg-order-${orderRef}-${contact.business_name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30)}.xlsx`

  try {
    await Promise.all([
      resend.emails.send({
        from: 'orders@kelstonway.com',
        to: contact.email,
        subject: 'Order Received — Kelston Way Greenhouse',
        html: `<h2>Thank you, ${esc(contact.contact_name)}!</h2><p>We've received your wholesale order (ref: <strong>${orderRef}</strong>) and will be in touch within 1 business day.</p><p>— Kelston Way Greenhouse</p>`,
      }),
      resend.emails.send({
        from: 'orders@kelstonway.com',
        to: SAMUEL_EMAIL,
        subject: `New Wholesale Order — ${esc(contact.business_name)} — $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        html: `<h2>New Order from ${esc(contact.business_name)}</h2><p><strong>Contact:</strong> ${esc(contact.contact_name)} &lt;${esc(contact.email)}&gt;<br/><strong>Phone:</strong> ${esc(contact.phone || 'N/A')}<br/><strong>Address:</strong> ${esc(contact.address_street)}, ${esc(contact.address_city)}, ${esc(contact.address_state)} ${esc(contact.address_zip)}<br/><strong>Notes:</strong> ${esc(contact.notes || 'N/A')}</p><table border="1" cellpadding="6"><thead><tr><th>Plant</th><th>Size</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table><p><strong>Total: ${totalUnits} trays / $${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong></p><p><a href="${confirmUrl}">✅ Confirm This Order</a></p>`,
        attachments: [{ filename: xlsxFilename, content: xlsxBuffer }],
      }),
    ])
  } catch (emailErr) {
    console.error('Email send failed for order', orderId, emailErr)
  }

  return res.status(200).json({ orderId, claimToken, email: contact.email })
}
