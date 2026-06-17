import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { AvailabilityItem } from '../lib/types'
import { useCart } from '../contexts/CartContext'

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
  const { addToCart, clearCart } = useCart()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: release } = await supabase
        .from('availability_releases')
        .select('id, published_at')
        .eq('status', 'current')
        .not('published_at', 'is', null)
        .order('published_at', { ascending: false })
        .limit(1)
        .single()
      if (!release) {
        setLoading(false)
        return
      }
      setPublishedAt(release.published_at)

      const { data } = await supabase
        .from('availability_release_items')
        .select('*, plants(name, sku, size, type)')
        .eq('release_id', release.id)
        .eq('website_visible', true)
        .gt('qty_available', 0)
      if (data)
        setItems(
          data.map((i) => ({
            ...i,
            plant_name: i.plants?.name ?? '',
            plant_sku: i.plants?.sku ?? '',
            plant_size: i.plants?.size ?? '',
            plant_type: i.plants?.type ?? null,
            tray_count: i.tray_count ?? 1,
          })) as AvailabilityItem[]
        )
      setLoading(false)
    }
    load()
  }, [])

  const uniqueTypes = [
    'All',
    ...Array.from(new Set(items.map((i) => i.plant_type).filter(Boolean) as string[])).sort(),
  ]
  const uniqueSizes = [
    'All',
    ...Array.from(new Set(items.map((i) => i.plant_size).filter(Boolean))).sort(),
  ]
  const uniqueTrays = [
    'All',
    ...Array.from(new Set(items.map((i) => i.tray_count)))
      .sort((a, b) => a - b)
      .map(String),
  ]

  const filtered = (() => {
    let list = items
    if (typeFilter !== 'All') list = list.filter((i) => i.plant_type === typeFilter)
    if (sizeFilter !== 'All') list = list.filter((i) => i.plant_size === sizeFilter)
    if (trayFilter !== 'All') list = list.filter((i) => String(i.tray_count) === trayFilter)
    if (search.trim())
      list = list.filter(
        (i) =>
          i.plant_name.toLowerCase().includes(search.toLowerCase()) ||
          i.plant_sku.toLowerCase().includes(search.toLowerCase())
      )
    if (sortField) {
      list = [...list].sort((a, b) => {
        let av: string | number = 0,
          bv: string | number = 0
        if (sortField === 'name') {
          av = a.plant_name
          bv = b.plant_name
        }
        if (sortField === 'size') {
          av = a.plant_size
          bv = b.plant_size
        }
        if (sortField === 'qty') {
          av = a.qty_available
          bv = b.qty_available
        }
        if (sortField === 'price') {
          av = a.unit_price ?? 0
          bv = b.unit_price ?? 0
        }
        if (av < bv) return sortDir === 'asc' ? -1 : 1
        if (av > bv) return sortDir === 'asc' ? 1 : -1
        return 0
      })
    }
    return list
  })()

  const orderLines = items.filter((i) => {
    const q = parseInt(qtys[i.id] ?? '')
    return q > 0 && i.unit_price
  })
  const totalUnits = orderLines.reduce((s, i) => s + (parseInt(qtys[i.id]) || 0), 0)
  const totalPrice = orderLines.reduce(
    (s, i) => s + (parseInt(qtys[i.id]) || 0) * (i.unit_price ?? 0),
    0
  )

  async function downloadExcel() {
    const XLSX = await import('xlsx')
    const rows = filtered.map((i) => ({
      'Item #': i.plant_sku,
      'Plant Name': i.plant_name,
      Size: i.plant_size,
      'Plants / Tray': i.tray_count,
      'Qty Available': i.qty_available,
      'Price / Tray':
        i.unit_price != null ? parseFloat(i.unit_price.toFixed(2)) : '',
      'Order Qty': '',
      Notes: i.notes ?? '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    ws['!cols'] = [12, 32, 12, 16, 16, 16, 20, 30].map((wch) => ({ wch }))
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Availability')
    XLSX.writeFile(wb, `kelston-way-availability-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  async function handleImportExcel(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      let XLSX: typeof import('xlsx')
      try {
        XLSX = await import('xlsx')
      } catch {
        alert(
          'Could not load the Excel reader. Please try refreshing the page and importing again.'
        )
        return
      }

      let rows: Record<string, unknown>[]
      try {
        const buf = await file.arrayBuffer()
        const wb = XLSX.read(new Uint8Array(buf), { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
      } catch {
        alert("Could not read the file. Please make sure you're uploading an Excel (.xlsx) file.")
        return
      }

      if (rows.length === 0) {
        alert('The file appears to be empty. Please use the template downloaded from this page.')
        return
      }

      // Flexible column detection — Excel sometimes renames headers slightly
      const sampleKeys = Object.keys(rows[0])
      const skuKey = sampleKeys.find((k) => k.toLowerCase().includes('item')) ?? 'Item #'
      const qtyKey =
        sampleKeys.find((k) => {
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
          items.find((i) => i.plant_sku === rawSku) ??
          items.find((i) => i.plant_name.toLowerCase() === rawSku.toLowerCase())

        if (item && item.unit_price) matched.push({ item, qty })
      }

      if (matched.length === 0) {
        const detail =
          rowsWithQty > 0
            ? `Found ${rowsWithQty} row(s) with quantities but none matched available products.\nDetected columns: "${skuKey}" and "${qtyKey}".\nMake sure you're using the template downloaded from this page.`
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
          tray_price: item.unit_price!,
          qty,
          photo_url: item.photo_url,
          release_item_id: item.id,
        })
      })
      navigate('/order')
    } catch (err) {
      console.error('Import failed:', err)
      alert(
        'Something went wrong while importing. Please try again or contact samuel@kelstonway.com.'
      )
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  function handleSort(field: 'name' | 'size' | 'qty' | 'price') {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  function handleReviewOrder() {
    clearCart()
    orderLines.forEach((item) => {
      addToCart({
        id: crypto.randomUUID(),
        plant_id: item.plant_id,
        plant_name: item.plant_name,
        plant_sku: item.plant_sku,
        plant_size: item.plant_size,
        unit_price: item.unit_price!,
        tray_count: item.tray_count,
        tray_price: item.unit_price!,
        qty: parseInt(qtys[item.id]),
        photo_url: item.photo_url,
        release_item_id: item.id,
      })
    })
    navigate('/order')
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-8"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt=""
            className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
          />
          <button className="absolute right-6 top-6 text-white" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
      )}

      {/* Item card modal */}
      {selected && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div className="absolute inset-0 bg-black/50" />
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Photo */}
            {selected.photo_url ? (
              <div
                className="mb-4 aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl"
                onClick={() => setLightbox(selected.photo_url!)}
              >
                <img
                  src={selected.photo_url}
                  alt={selected.plant_name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="mb-5 flex aspect-[4/3] w-full items-center justify-center rounded-xl bg-surface-container">
                <span className="material-symbols-outlined text-5xl text-outline">eco</span>
              </div>
            )}

            {/* Name + grade */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="font-['Newsreader'] text-2xl italic leading-tight text-primary">
                {selected.plant_name}
              </h2>
              {selected.grade && (
                <span
                  className={`mt-1 flex-shrink-0 rounded-full px-2 py-1 font-label-caps text-[10px] ${
                    selected.grade === 1
                      ? 'bg-primary-fixed text-on-primary-fixed-variant'
                      : selected.grade === 2
                        ? 'bg-secondary-container text-on-secondary-container'
                        : 'bg-error-container text-error'
                  }`}
                >
                  {selected.grade === 1
                    ? 'Can Hold'
                    : selected.grade === 2
                      ? 'Ship Soon'
                      : 'Critical'}
                </span>
              )}
            </div>

            {/* Stats row */}
            <div className="mb-4 flex gap-4">
              {selected.plant_size && (
                <div>
                  <p className="mb-0.5 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Size
                  </p>
                  <p className="font-body-md text-sm text-on-surface">{selected.plant_size}</p>
                </div>
              )}
              <div>
                <p className="mb-0.5 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Available
                </p>
                <p className="font-body-md text-sm font-semibold text-on-surface">
                  {selected.qty_available.toLocaleString()}
                </p>
              </div>
              {selected.unit_price && (
                <div>
                  <p className="mb-0.5 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Price / Tray
                  </p>
                  <p className="font-body-md text-sm font-semibold text-on-surface">
                    ${selected.unit_price.toFixed(2)}
                  </p>
                </div>
              )}
              {selected.tray_count > 1 && (
                <div>
                  <p className="mb-0.5 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Plants / Tray
                  </p>
                  <p className="font-body-md text-sm font-semibold text-on-surface">
                    {selected.tray_count}
                  </p>
                </div>
              )}
              {selected.plant_sku && (
                <div>
                  <p className="mb-0.5 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                    Item #
                  </p>
                  <p className="font-body-md text-sm text-on-surface-variant">
                    {selected.plant_sku}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {selected.notes && (
              <div className="rounded-xl bg-surface-container-low px-4 py-3">
                <p className="mb-1 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
                  Notes
                </p>
                <p className="font-body-md text-sm leading-relaxed text-on-surface">
                  {selected.notes}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 transition-colors hover:bg-surface-container"
            >
              <span className="material-symbols-outlined text-xl text-on-surface-variant">
                close
              </span>
            </button>
          </div>
        </div>
      )}

      <div className={`px-4 py-8 md:px-32 md:py-12 ${orderMode ? 'pb-32' : ''}`}>
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="mb-1 block font-label-caps text-label-caps text-secondary">
              LIVE AVAILABILITY
            </span>
            <h1 className="font-['Newsreader'] text-2xl text-on-surface md:text-headline-xl">
              Current Stock
            </h1>
            {publishedAt && (
              <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                Updated{' '}
                {new Date(publishedAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!orderMode ? (
              <button
                onClick={() => setOrderMode(true)}
                className="flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-button text-button text-on-primary transition-all hover:bg-primary-container"
              >
                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                Make an Order
              </button>
            ) : (
              <button
                onClick={() => {
                  setOrderMode(false)
                  setQtys({})
                }}
                className="flex items-center gap-2 rounded-sm border border-outline-variant px-5 py-2.5 font-button text-button text-on-surface-variant transition-all hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order mode banner */}
        {orderMode && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-fixed/60 px-5 py-3">
            <span className="material-symbols-outlined text-lg text-primary">edit_note</span>
            <p className="font-body-md text-sm text-on-surface">
              Enter the number of trays you'd like for each item. Tap a photo to see it larger. When
              ready, hit <span className="font-semibold">Review Order</span> below.
            </p>
          </div>
        )}

        {/* Filter + search bar */}
        <div className="mb-4 flex flex-col gap-2.5 rounded-xl border border-outline-variant/50 bg-white p-3">
          {/* Row 1: search + count */}
          <div className="flex items-center gap-3">
            <div className="relative flex-shrink-0">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Search plants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border-none bg-surface-container-low py-1.5 pl-9 pr-3 font-body-md text-sm focus:outline-none focus:ring-1 focus:ring-primary sm:w-52"
              />
            </div>
            <div className="ml-auto flex-shrink-0 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
              {filtered.length} of {items.length}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-outline-variant/30" />

          {/* Filter chip rows */}
          <div className="flex flex-col gap-2">
            {/* Type */}
            {uniqueTypes.length > 2 && (
              <div className="scrollbar-none flex items-center gap-2 overflow-x-auto">
                <span className="w-8 flex-shrink-0 font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant">
                  Type
                </span>
                <div className="flex flex-nowrap gap-1.5">
                  {uniqueTypes.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTypeFilter(t)}
                      className={`flex-shrink-0 rounded-full px-3 py-1 font-button text-button text-xs transition-all ${
                        typeFilter === t
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary'
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
              <div className="scrollbar-none flex items-center gap-2 overflow-x-auto">
                <span className="w-8 flex-shrink-0 font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant">
                  Size
                </span>
                <div className="flex flex-nowrap gap-1.5">
                  {uniqueSizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSizeFilter(s)}
                      className={`flex-shrink-0 rounded-full px-3 py-1 font-button text-button text-xs transition-all ${
                        sizeFilter === s
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary'
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
              <div className="scrollbar-none flex items-center gap-2 overflow-x-auto">
                <span className="w-8 flex-shrink-0 font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant">
                  Unit
                </span>
                <div className="flex flex-nowrap gap-1.5">
                  {uniqueTrays.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTrayFilter(t)}
                      className={`flex-shrink-0 rounded-full px-3 py-1 font-button text-button text-xs transition-all ${
                        trayFilter === t
                          ? 'bg-primary text-on-primary'
                          : 'border border-outline-variant text-on-surface-variant hover:border-primary'
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
              <div className="scrollbar-none flex flex-nowrap gap-1.5 overflow-x-auto">
                {uniqueSizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSizeFilter(s)}
                    className={`flex-shrink-0 rounded-full px-3 py-1 font-button text-button text-xs transition-all ${
                      sizeFilter === s
                        ? 'bg-primary text-on-primary'
                        : 'border border-outline-variant text-on-surface-variant hover:border-primary'
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
        <div className="mb-4 flex flex-col justify-between gap-3 rounded-xl border border-secondary/20 bg-secondary/5 px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined mt-0.5 text-xl text-secondary">
              table_view
            </span>
            <div>
              <p className="font-button text-sm text-on-surface">Another way to order — Excel</p>
              <p className="font-body-md text-xs text-on-surface-variant">
                Download our order template, fill in your quantities, and upload it here. Great for
                large orders.
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              onClick={downloadExcel}
              className="flex items-center gap-1.5 rounded-sm border border-secondary/40 px-4 py-2 font-button text-button text-xs text-secondary transition-colors hover:bg-secondary/5"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Template
            </button>
            <label
              className={`flex cursor-pointer items-center gap-1.5 rounded-sm bg-secondary px-4 py-2 font-button text-button text-xs text-on-secondary transition-opacity hover:opacity-90 ${importing ? 'pointer-events-none opacity-60' : ''}`}
            >
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
          <div className="py-24 text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-outline">
              progress_activity
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-24 text-center font-body-md text-on-surface-variant">
            No items available right now.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-1 text-left">
              <thead>
                <tr className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant">
                  <th className="w-14 pb-2 pl-4"></th>
                  <SortTh
                    field="name"
                    label="Plant"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                  />
                  <th className="hidden pb-2 font-semibold md:table-cell">Item #</th>
                  <SortTh
                    field="size"
                    label="Size"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="hidden md:table-cell"
                  />
                  <SortTh
                    field="qty"
                    label="Avail"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="hidden text-right md:table-cell"
                  />
                  <SortTh
                    field="price"
                    label="Price"
                    sortField={sortField}
                    sortDir={sortDir}
                    onSort={handleSort}
                    className="text-right"
                  />
                  {orderMode && (
                    <th className="w-24 pb-2 pr-4 text-center font-semibold">Qty Order</th>
                  )}
                  {!orderMode && <th className="w-6 pb-2 pr-4"></th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const qty = qtys[item.id] ?? ''
                  const isSelected = parseInt(qty) > 0
                  return (
                    <tr
                      key={item.id}
                      onClick={() => !orderMode && setSelected(item)}
                      className={`group bg-white shadow-sm ${
                        !orderMode ? 'cursor-pointer' : 'cursor-default'
                      } ${isSelected ? 'ring-1 ring-primary/30' : ''}`}
                    >
                      {/* Photo */}
                      <td className="w-14 rounded-l-xl py-2 pl-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (item.photo_url) setSelected(item)
                          }}
                          disabled={!item.photo_url}
                          className={`relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container ${item.photo_url ? 'cursor-zoom-in' : 'cursor-default'}`}
                        >
                          {item.photo_url ? (
                            <>
                              <img
                                src={item.photo_url}
                                alt={item.plant_name}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
                                <span className="material-symbols-outlined text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                                  zoom_in
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="material-symbols-outlined flex h-full w-full items-center justify-center text-xl text-outline">
                              eco
                            </span>
                          )}
                        </button>
                      </td>

                      {/* Plant name + grade */}
                      <td className="py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-['Newsreader'] text-base italic text-primary md:text-lg">
                            {item.plant_name}
                          </span>
                          {item.grade && (
                            <span
                              className={`rounded-full px-2 py-0.5 font-label-caps text-[10px] ${
                                item.grade === 1
                                  ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                  : item.grade === 2
                                    ? 'bg-secondary-container text-on-secondary-container'
                                    : 'bg-error-container text-error'
                              }`}
                            >
                              {item.grade === 1
                                ? 'Can Hold'
                                : item.grade === 2
                                  ? 'Ship Soon'
                                  : 'Critical'}
                            </span>
                          )}
                        </div>
                        {/* Mobile secondary info */}
                        <div className="mt-0.5 flex flex-wrap gap-2 md:hidden">
                          <span className="font-body-md text-xs text-on-surface-variant">
                            {item.plant_sku}
                          </span>
                          <span className="font-body-md text-xs text-on-surface-variant">
                            {item.plant_size}
                          </span>
                          <span className="font-body-md text-xs text-on-surface-variant">
                            {item.qty_available} trays available
                          </span>
                        </div>
                      </td>

                      <td className="hidden py-2 font-body-md text-sm text-on-surface-variant md:table-cell">
                        {item.plant_sku}
                      </td>
                      <td className="hidden py-2 font-label-caps text-xs text-on-surface-variant md:table-cell">
                        {item.plant_size}
                      </td>
                      <td className="hidden py-2 text-right md:table-cell">
                        <span className="font-body-md font-semibold text-on-surface">
                          {item.qty_available.toLocaleString()}
                        </span>
                        {item.tray_count > 1 && (
                          <p className="font-body-md text-[10px] text-on-surface-variant">
                            {item.tray_count}/tray
                          </p>
                        )}
                      </td>
                      <td className="py-2 text-right font-body-md text-sm font-medium text-on-surface">
                        {item.unit_price
                          ? orderMode
                            ? `$${item.unit_price.toFixed(2)}/tray (${item.tray_count}-count)`
                            : `$${item.unit_price.toFixed(2)}/tray`
                          : '—'}
                      </td>

                      {orderMode ? (
                        <td className="rounded-r-xl py-2 pr-4 text-center">
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={qty}
                            disabled={!item.unit_price}
                            onChange={(e) =>
                              setQtys((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            className={`w-20 rounded-lg border px-2 py-1.5 text-center font-body-md text-sm transition-colors focus:outline-none disabled:opacity-30 ${
                              parseInt(qty) > item.qty_available
                                ? 'border-amber-400 bg-secondary-fixed/40 font-semibold text-amber-800'
                                : isSelected
                                  ? 'border-primary bg-primary-fixed/30 font-semibold text-primary'
                                  : 'border-outline-variant focus:border-primary'
                            }`}
                          />
                          {parseInt(qty) > item.qty_available && (
                            <div className="mt-1 flex items-center justify-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-amber-600">
                                warning
                              </span>
                              <span className="font-label-caps text-[9px] leading-tight text-amber-700">
                                Exceeds stock
                              </span>
                            </div>
                          )}
                        </td>
                      ) : (
                        <td className="rounded-r-xl py-2 pr-4 text-right">
                          <span className="material-symbols-outlined text-lg text-outline-variant transition-colors group-hover:text-primary">
                            chevron_right
                          </span>
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
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ${
            orderLines.length > 0 ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {items.some((i) => parseInt(qtys[i.id] ?? '') > i.qty_available) && (
            <div className="flex items-center gap-2 bg-secondary-fixed px-4 py-2 text-on-secondary-fixed md:px-32">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              <p className="font-body-md text-xs">
                Some quantities exceed available stock — we'll reach out to confirm before
                fulfilling.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between bg-primary px-4 py-4 text-on-primary shadow-2xl md:px-32">
            <div className="flex items-center gap-6">
              <div>
                <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-primary/70">
                  Your Order
                </p>
                <p className="font-body-md font-semibold">
                  {orderLines.length} {orderLines.length === 1 ? 'item' : 'items'} ·{' '}
                  {totalUnits.toLocaleString()} trays
                </p>
              </div>
              <div className="hidden h-8 w-px bg-on-primary/20 md:block" />
              <div className="hidden md:block">
                <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-primary/70">
                  Estimated Total
                </p>
                <p className="font-['Newsreader'] text-xl">
                  ${totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
            <button
              onClick={handleReviewOrder}
              className="flex items-center gap-2 rounded-sm bg-on-primary px-6 py-3 font-button text-button text-primary transition-all hover:bg-primary-fixed"
            >
              Review Order <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function SortTh({
  field,
  label,
  sortField,
  sortDir,
  onSort,
  className = '',
}: {
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
        className={`flex items-center gap-0.5 font-label-caps text-label-caps uppercase tracking-widest transition-colors hover:text-on-surface ${isRight ? 'ml-auto' : ''}`}
      >
        {label}
        <span
          className={`material-symbols-outlined text-[14px] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}
        >
          {active && sortDir === 'desc' ? 'arrow_downward' : 'arrow_upward'}
        </span>
      </button>
    </th>
  )
}
