import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { AvailabilityItem } from '../lib/types'
import { clearCart, addToCart } from '../lib/cart'

export default function Availability() {
  const [items, setItems] = useState<AvailabilityItem[]>([])
  const [typeFilter, setTypeFilter] = useState('All')
  const [sizeFilter, setSizeFilter] = useState('All')
  const [trayFilter, setTrayFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [selected, setSelected] = useState<AvailabilityItem | null>(null)
  const [orderMode, setOrderMode] = useState(false)
  const [qtys, setQtys] = useState<Record<string, string>>({})
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'name' | 'size' | 'qty' | 'price' | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [importing, setImporting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: release } = await supabase
        .from('availability_releases')
        .select('id, published_at')
        .order('published_at', { ascending: false })
        .limit(1)
        .single()
      if (!release) { setLoading(false); return }
      setPublishedAt(release.published_at)

      const { data } = await supabase
        .from('availability_release_items')
        .select('*, plants(name, sku, size, type)')
        .eq('release_id', release.id)
        .eq('website_visible', true)
        .gt('qty_available', 0)
      if (data) setItems(data.map((i: any) => ({
        ...i,
        plant_name: i.plants?.name ?? '',
        plant_sku: i.plants?.sku ?? '',
        plant_size: i.plants?.size ?? '',
        plant_type: i.plants?.type ?? null,
        tray_count: i.tray_count ?? 1,
      })) as AvailabilityItem[])
      setLoading(false)
    }
    load()
  }, [])

  const uniqueTypes = ['All', ...Array.from(new Set(items.map(i => i.plant_type).filter(Boolean) as string[])).sort()]
  const uniqueSizes = ['All', ...Array.from(new Set(items.map(i => i.plant_size).filter(Boolean))).sort()]
  const uniqueTrays = ['All', ...Array.from(new Set(items.map(i => i.tray_count))).sort((a, b) => a - b).map(String)]

  const filtered = (() => {
    let list = items
    if (typeFilter !== 'All') list = list.filter(i => i.plant_type === typeFilter)
    if (sizeFilter !== 'All') list = list.filter(i => i.plant_size === sizeFilter)
    if (trayFilter !== 'All') list = list.filter(i => String(i.tray_count) === trayFilter)
    if (search.trim())
      list = list.filter(i => i.plant_name.toLowerCase().includes(search.toLowerCase()) || i.plant_sku.toLowerCase().includes(search.toLowerCase()))
    if (sortField) {
      list = [...list].sort((a, b) => {
        let av: string | number = 0, bv: string | number = 0
        if (sortField === 'name') { av = a.plant_name; bv = b.plant_name }
        if (sortField === 'size') { av = a.plant_size; bv = b.plant_size }
        if (sortField === 'qty') { av = a.qty_available; bv = b.qty_available }
        if (sortField === 'price') { av = a.unit_price ?? 0; bv = b.unit_price ?? 0 }
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return list
  })()

  const orderLines = items.filter(i => {
    const q = parseInt(qtys[i.id] ?? '')
    return q > 0 && i.unit_price
  })
  const totalUnits = orderLines.reduce((s, i) => s + (parseInt(qtys[i.id]) || 0), 0)
  const totalPrice = orderLines.reduce((s, i) => s + (parseInt(qtys[i.id]) || 0) * (i.unit_price ?? 0) * i.tray_count, 0)

  async function downloadExcel() {
    const XLSX = await import('xlsx')
    const rows = filtered.map(i => ({
      'Item #': i.plant_sku,
      'Plant Name': i.plant_name,
      'Size': i.plant_size,
      'Plants / Tray': i.tray_count,
      'Qty Available': i.qty_available,
      'Price / Tray': i.unit_price != null ? parseFloat((i.unit_price * i.tray_count).toFixed(2)) : '',
      'Order Qty': '',
      'Notes': i.notes ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [12, 32, 12, 16, 16, 16, 20, 30].map(wch => ({ wch }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Availability')
    XLSX.writeFile(wb, `kelston-way-availability-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      let XLSX: typeof import('xlsx')
      try {
        XLSX = await import('xlsx')
      } catch {
        alert('Could not load the Excel reader. Please try refreshing the page and importing again.')
        return
      }

      let rows: Record<string, unknown>[]
      try {
        const buf = await file.arrayBuffer()
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
      } catch {
        alert('Could not read the file. Please make sure you\'re uploading an Excel (.xlsx) file.')
        return
      }

      if (rows.length === 0) {
        alert('The file appears to be empty. Please use the template downloaded from this page.')
        return
      }

      // Flexible column detection — Excel sometimes renames headers slightly
      const sampleKeys = Object.keys(rows[0])
      const skuKey = sampleKeys.find(k => k.toLowerCase().includes('item')) ?? 'Item #'
      const qtyKey = sampleKeys.find(k => {
        const lk = k.toLowerCase()
        return lk.includes('order') || (lk.includes('qty') && !lk.includes('avail'))
      }) ?? 'Order Qty'

      const matched: Array<{ item: AvailabilityItem; qty: number }> = []
      let rowsWithQty = 0

      for (const row of rows) {
        const rawSku = String(row[skuKey] ?? '').trim()
        const rawQty = row[qtyKey]
        if (!rawSku) continue
        if (rawQty === '' || rawQty == null) continue

        const qty = parseInt(String(rawQty))
        if (isNaN(qty) || qty <= 0) continue
        rowsWithQty++

        // Match by SKU first, then fall back to plant name
        const item =
          items.find(i => i.plant_sku === rawSku) ??
          items.find(i => i.plant_name.toLowerCase() === rawSku.toLowerCase())

        if (item && item.unit_price) matched.push({ item, qty })
      }

      if (matched.length === 0) {
        const detail = rowsWithQty > 0
          ? `Found ${rowsWithQty} row(s) with quantities but none matched available products.\nDetected columns: "${skuKey}" and "${qtyKey}".\nMake sure you\'re using the template downloaded from this page.`
          : `No quantities were found in the "${qtyKey}" column.\nFill in that column with the number of trays you want, then save and re-upload.`
        alert(`Import failed — ${detail}`)
        return
      }

      clearCart()
      matched.forEach(({ item, qty }) => {
        addToCart({
          id: crypto.randomUUID(),
          plant_id: item.plant_id,
          plant_name: item.plant_name,
          plant_sku: item.plant_sku,
          plant_size: item.plant_size,
          unit_price: item.unit_price!,
          tray_count: item.tray_count,
          tray_price: item.unit_price! * item.tray_count,
          qty,
          photo_url: item.photo_url,
          release_item_id: item.id,
        })
      })
      window.dispatchEvent(new Event('cart-updated'))
      navigate('/order')
    } catch (err) {
      console.error('Import failed:', err)
      alert('Something went wrong while importing. Please try again or contact samuel@kelstonway.com.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  function handleSort(field: 'name' | 'size' | 'qty' | 'price') {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  function handleReviewOrder() {
    clearCart()
    orderLines.forEach(item => {
      addToCart({
        id: crypto.randomUUID(),
        plant_id: item.plant_id,
        plant_name: item.plant_name,
        plant_sku: item.plant_sku,
        plant_size: item.plant_size,
        unit_price: item.unit_price!,
        tray_count: item.tray_count,
        tray_price: item.unit_price! * item.tray_count,
        qty: parseInt(qtys[item.id]),
        photo_url: item.photo_url,
        release_item_id: item.id,
      })
    })
    window.dispatchEvent(new Event('cart-updated'))
    navigate('/order')
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
      )}

      {/* Item card modal */}
      {selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-6" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8"
            onClick={e => e.stopPropagation()}
          >

            {/* Photo */}
            {selected.photo_url ? (
              <div
                className="w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 cursor-zoom-in"
                onClick={() => setLightbox(selected.photo_url!)}
              >
                <img src={selected.photo_url} alt={selected.plant_name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full aspect-[4/3] rounded-xl bg-surface-container flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-5xl text-outline">eco</span>
              </div>
            )}

            {/* Name + grade */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 className="font-['Newsreader'] italic text-2xl text-primary leading-tight">{selected.plant_name}</h2>
              {selected.grade && (
                <span className={`font-label-caps text-[10px] px-2 py-1 rounded-full flex-shrink-0 mt-1 ${
                  selected.grade === 1 ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                  selected.grade === 2 ? 'bg-secondary-container text-on-secondary-container' :
                  'bg-error-container text-error'
                }`}>
                  {selected.grade === 1 ? 'Can Hold' : selected.grade === 2 ? 'Ship Soon' : 'Critical'}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="flex gap-4 mb-4">
              {selected.plant_size && (
                <div>
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Size</p>
                  <p className="font-body-md text-sm text-on-surface">{selected.plant_size}</p>
                </div>
              )}
              <div>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Available</p>
                <p className="font-body-md text-sm font-semibold text-on-surface">{selected.qty_available.toLocaleString()}</p>
              </div>
              {selected.unit_price && (
                <div>
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Unit Price</p>
                  <p className="font-body-md text-sm font-semibold text-on-surface">${selected.unit_price.toFixed(2)}</p>
                </div>
              )}
              {selected.tray_count > 1 && (
                <div>
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Plants / Tray</p>
                  <p className="font-body-md text-sm font-semibold text-on-surface">{selected.tray_count}</p>
                </div>
              )}
              {selected.plant_sku && (
                <div>
                  <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-0.5">Item #</p>
                  <p className="font-body-md text-sm text-on-surface-variant">{selected.plant_sku}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {selected.notes && (
              <div className="bg-surface-container-low rounded-xl px-4 py-3">
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Notes</p>
                <p className="font-body-md text-sm text-on-surface leading-relaxed">{selected.notes}</p>
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">close</span>
            </button>
          </div>
        </div>
      )}

      <div className={`px-4 md:px-32 py-8 md:py-12 ${orderMode ? 'pb-32' : ''}`}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-1 block">LIVE AVAILABILITY</span>
            <h1 className="font-['Newsreader'] text-2xl md:text-headline-xl text-on-surface">Current Stock</h1>
            {publishedAt && (
              <p className="font-body-md text-on-surface-variant text-sm mt-1">
                Updated {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!orderMode ? (
              <button
                onClick={() => setOrderMode(true)}
                className="flex items-center gap-2 font-button text-button bg-primary text-on-primary px-6 py-3 rounded-sm hover:bg-primary-container transition-all"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                Make an Order
              </button>
            ) : (
              <button
                onClick={() => { setOrderMode(false); setQtys({}) }}
                className="flex items-center gap-2 font-button text-button border border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-sm hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order mode banner */}
        {orderMode && (
          <div className="bg-primary-fixed/60 border border-primary/20 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-lg">edit_note</span>
            <p className="font-body-md text-sm text-on-surface">
              Enter the number of trays you'd like for each item. Tap a photo to see it larger. When ready, hit <span className="font-semibold">Review Order</span> below.
            </p>
          </div>
        )}

        {/* Filter + search bar */}
        <div className="bg-white border border-outline-variant/50 rounded-xl p-3 mb-4 flex flex-col gap-2.5">
          {/* Row 1: search + count */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input
                type="text"
                placeholder="Search plants..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-surface-container-low border-none rounded-lg py-1.5 pl-9 pr-3 text-sm font-body-md w-full sm:w-52 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="ml-auto font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest flex-shrink-0">
              {filtered.length} of {items.length}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/30" />

          {/* Filter chip rows */}
          <div className="flex flex-col gap-2">
            {/* Type */}
            {uniqueTypes.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest flex-shrink-0 w-8">Type</span>
                <div className="flex gap-1.5 flex-nowrap">
                  {uniqueTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full font-button text-button transition-all text-xs ${
                        typeFilter === t ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {t === 'All' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {uniqueSizes.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest flex-shrink-0 w-8">Size</span>
                <div className="flex gap-1.5 flex-nowrap">
                  {uniqueSizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSizeFilter(s)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full font-button text-button transition-all text-xs ${
                        sizeFilter === s ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tray count */}
            {uniqueTrays.length > 2 && (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest flex-shrink-0 w-8">Unit</span>
                <div className="flex gap-1.5 flex-nowrap">
                  {uniqueTrays.map(t => (
                    <button
                      key={t}
                      onClick={() => setTrayFilter(t)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full font-button text-button transition-all text-xs ${
                        trayFilter === t ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {t === 'All' ? 'All' : `${t}-count`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Single-row fallback when only one type/size/tray — just show size chips inline */}
            {uniqueTypes.length <= 2 && uniqueSizes.length <= 2 && uniqueTrays.length <= 2 && (
              <div className="flex gap-1.5 flex-nowrap overflow-x-auto scrollbar-none">
                {uniqueSizes.map(s => (
                  <button
                    key={s}
                    onClick={() => setSizeFilter(s)}
                    className={`flex-shrink-0 px-3 py-1 rounded-full font-button text-button transition-all text-xs ${
                      sizeFilter === s ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:border-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Import from Excel callout */}
        <div className="bg-secondary/5 border border-secondary/20 rounded-xl px-5 py-4 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-xl mt-0.5">table_view</span>
            <div>
              <p className="font-button text-sm text-on-surface">Another way to order — Excel</p>
              <p className="font-body-md text-xs text-on-surface-variant">
                Download our order template, fill in your quantities, and upload it here. Great for large orders.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={downloadExcel}
              className="font-button text-button text-xs text-secondary border border-secondary/40 px-4 py-2 rounded-sm hover:bg-secondary/5 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Template
            </button>
            <label className={`font-button text-button text-xs bg-secondary text-on-secondary px-4 py-2 rounded-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer ${importing ? 'opacity-60 pointer-events-none' : ''}`}>
              <span className="material-symbols-outlined text-sm">upload</span>
              {importing ? 'Importing…' : 'Import Order'}
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleImportExcel}
                disabled={importing}
              />
            </label>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-4xl text-outline animate-spin">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-body-md text-on-surface-variant text-center py-24">No items available right now.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-1">
              <thead>
                <tr className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                  <th className="pb-2 pl-4 w-14"></th>
                  <SortTh field="name" label="Plant" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                  <th className="pb-2 hidden md:table-cell font-semibold">Item #</th>
                  <SortTh field="size" label="Size" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell" />
                  <SortTh field="qty" label="Avail" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="hidden md:table-cell text-right" />
                  <SortTh field="price" label="Price" sortField={sortField} sortDir={sortDir} onSort={handleSort} className="text-right" />
                  {orderMode && <th className="pb-2 pr-4 font-semibold text-center w-24">Qty Order</th>}
                  {!orderMode && <th className="pb-2 pr-4 w-6"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const qty = qtys[item.id] ?? ''
                  const isSelected = parseInt(qty) > 0
                  return (
                    <tr
                      key={item.id}
                      onClick={() => !orderMode && setSelected(item)}
                      className={`bg-white shadow-sm group ${
                        !orderMode ? 'cursor-pointer' : 'cursor-default'
                      } ${isSelected ? 'ring-1 ring-primary/30' : ''}`}
                    >
                      {/* Photo */}
                      <td className="py-2 pl-4 rounded-l-xl w-14">
                        <button
                          onClick={e => { e.stopPropagation(); item.photo_url && setSelected(item) }}
                          disabled={!item.photo_url}
                          className={`relative w-10 h-10 overflow-hidden rounded-lg bg-surface-container flex-shrink-0 ${item.photo_url ? 'cursor-zoom-in' : 'cursor-default'}`}
                        >
                          {item.photo_url ? (
                            <>
                              <img src={item.photo_url} alt={item.plant_name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">zoom_in</span>
                              </div>
                            </>
                          ) : (
                            <span className="material-symbols-outlined text-outline text-xl w-full h-full flex items-center justify-center">eco</span>
                          )}
                        </button>
                      </td>

                      {/* Plant name + grade */}
                      <td className="py-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-['Newsreader'] italic text-base md:text-lg text-primary">{item.plant_name}</span>
                          {item.grade && (
                            <span className={`font-label-caps text-[10px] px-2 py-0.5 rounded-full ${
                              item.grade === 1 ? 'bg-primary-fixed text-on-primary-fixed-variant' :
                              item.grade === 2 ? 'bg-secondary-container text-on-secondary-container' :
                              'bg-error-container text-error'
                            }`}>
                              {item.grade === 1 ? 'Can Hold' : item.grade === 2 ? 'Ship Soon' : 'Critical'}
                            </span>
                          )}
                        </div>
                        {/* Mobile secondary info */}
                        <div className="flex gap-2 mt-0.5 md:hidden flex-wrap">
                          <span className="font-body-md text-xs text-on-surface-variant">{item.plant_sku}</span>
                          <span className="font-body-md text-xs text-on-surface-variant">{item.plant_size}</span>
                          <span className="font-body-md text-xs text-on-surface-variant">{item.qty_available} trays available</span>
                        </div>
                      </td>

                      <td className="py-2 font-body-md text-sm text-on-surface-variant hidden md:table-cell">{item.plant_sku}</td>
                      <td className="py-2 font-label-caps text-xs text-on-surface-variant hidden md:table-cell">{item.plant_size}</td>
                      <td className="py-2 text-right hidden md:table-cell">
                        <span className="font-body-md font-semibold text-on-surface">{item.qty_available.toLocaleString()}</span>
                        {item.tray_count > 1 && (
                          <p className="font-body-md text-[10px] text-on-surface-variant">{item.tray_count}/tray</p>
                        )}
                      </td>
                      <td className="py-2 font-body-md text-sm font-medium text-on-surface text-right">
                        {item.unit_price
                          ? orderMode
                            ? `$${(item.unit_price * item.tray_count).toFixed(2)}/tray (${item.tray_count}-count)`
                            : `$${item.unit_price.toFixed(2)}`
                          : '—'}
                      </td>

                      {orderMode ? (
                        <td className="py-2 pr-4 rounded-r-xl text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={qty}
                            disabled={!item.unit_price}
                            onChange={e => setQtys(prev => ({ ...prev, [item.id]: e.target.value }))}
                            className={`w-20 text-center border rounded-lg px-2 py-1.5 text-sm font-body-md focus:outline-none transition-colors disabled:opacity-30 ${
                              parseInt(qty) > item.qty_available
                                ? 'border-amber-400 bg-secondary-fixed/40 text-amber-800 font-semibold'
                                : isSelected
                                ? 'border-primary bg-primary-fixed/30 text-primary font-semibold'
                                : 'border-outline-variant focus:border-primary'
                            }`}
                          />
                          {parseInt(qty) > item.qty_available && (
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <span className="material-symbols-outlined text-amber-600 text-[13px]">warning</span>
                              <span className="font-label-caps text-[9px] text-amber-700 leading-tight">Exceeds stock</span>
                            </div>
                          )}
                        </td>
                      ) : (
                        <td className="py-2 pr-4 rounded-r-xl text-right">
                          <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-lg">chevron_right</span>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sticky order bar — only in order mode */}
      {orderMode && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
          orderLines.length > 0 ? 'translate-y-0' : 'translate-y-full'
        }`}>
          {items.some(i => parseInt(qtys[i.id] ?? '') > i.qty_available) && (
            <div className="bg-secondary-fixed text-on-secondary-fixed px-4 md:px-32 py-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <p className="font-body-md text-xs">Some quantities exceed available stock — we'll reach out to confirm before fulfilling.</p>
            </div>
          )}
          <div className="bg-primary text-on-primary px-4 md:px-32 py-4 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-6">
              <div>
                <p className="font-label-caps text-[10px] text-on-primary/70 uppercase tracking-widest">Your Order</p>
                <p className="font-body-md font-semibold">{orderLines.length} {orderLines.length === 1 ? 'item' : 'items'} · {totalUnits.toLocaleString()} trays</p>
              </div>
              <div className="hidden md:block w-px h-8 bg-on-primary/20" />
              <div className="hidden md:block">
                <p className="font-label-caps text-[10px] text-on-primary/70 uppercase tracking-widest">Estimated Total</p>
                <p className="font-['Newsreader'] text-xl">${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
            <button
              onClick={handleReviewOrder}
              className="flex items-center gap-2 bg-on-primary text-primary font-button text-button px-6 py-3 rounded-sm hover:bg-primary-fixed transition-all"
            >
              Review Order <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function SortTh({ field, label, sortField, sortDir, onSort, className = '' }: {
  field: 'name' | 'size' | 'qty' | 'price'
  label: string
  sortField: string | null
  sortDir: 'asc' | 'desc'
  onSort: (f: 'name' | 'size' | 'qty' | 'price') => void
  className?: string
}) {
  const active = sortField === field
  const isRight = className.includes('text-right')
  return (
    <th className={`pb-2 font-semibold ${className}`}>
      <button
        onClick={() => onSort(field)}
        className={`flex items-center gap-0.5 font-label-caps text-label-caps uppercase tracking-widest hover:text-on-surface transition-colors ${isRight ? 'ml-auto' : ''}`}
      >
        {label}
        <span className={`material-symbols-outlined text-[14px] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
          {active && sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </button>
    </th>
  )
}
