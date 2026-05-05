import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AvailabilityItem } from '../lib/types'
import { addToCart } from '../lib/cart'
import CartDrawer from '../components/CartDrawer'

const FILTERS = ['All', 'Aroids', 'Succulents', 'Ferns', 'Trees', 'Hoyas']

export default function Availability() {
  const [items, setItems] = useState<AvailabilityItem[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [added, setAdded] = useState<string | null>(null)

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
        .select('*, plants(name, sku, size)')
        .eq('release_id', release.id)
        .gt('qty_available', 0)
      if (data) setItems(data.map((i: any) => ({
        ...i,
        plant_name: i.plants?.name ?? '',
        plant_sku: i.plants?.sku ?? '',
        plant_size: i.plants?.size ?? '',
      })) as AvailabilityItem[])
      setLoading(false)
    }
    load()
  }, [])

  function handleAdd(item: AvailabilityItem) {
    if (!item.unit_price) return
    addToCart({
      id: crypto.randomUUID(),
      plant_id: item.plant_id,
      plant_name: item.plant_name,
      plant_sku: item.plant_sku,
      plant_size: item.plant_size,
      unit_price: item.unit_price,
      qty: 1,
      photo_url: item.photo_url,
      release_item_id: item.id,
    })
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(item.id)
    setDrawerOpen(true)
    setTimeout(() => setAdded(null), 2000)
  }

  const filtered = filter === 'All'
    ? items
    : items.filter(i => i.plant_name.toLowerCase().includes(filter.toLowerCase()) || i.plant_sku.toLowerCase().includes(filter.toLowerCase()))

  return (
    <>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-sm shadow-2xl" />
          <button className="absolute top-6 right-6 text-white" onClick={() => setLightbox(null)}>
            <span className="material-symbols-outlined text-3xl">close</span>
          </button>
        </div>
      )}

      <div className="px-8 md:px-32 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-1 block">WHOLESALE CATALOG</span>
            <h1 className="font-['Newsreader'] text-headline-xl text-on-surface">Available for Order</h1>
            {publishedAt && (
              <p className="font-body-md text-on-surface-variant text-sm mt-1">
                Updated {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <a
            href="#"
            onClick={e => e.preventDefault()}
            className="font-button text-button text-primary border border-primary px-5 py-2.5 hover:bg-primary hover:text-on-primary transition-all rounded-sm flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download Full List
          </a>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full font-button text-button transition-all text-sm ${
                filter === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-white border border-outline-variant text-on-surface-variant hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-4xl text-outline animate-spin">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-body-md text-on-surface-variant text-center py-24">No items available right now.</p>
        ) : (
          <div className="border border-outline-variant/40 rounded-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[56px_1fr_80px_80px_100px_80px_140px] gap-4 px-4 py-2.5 bg-surface-container-low border-b border-outline-variant/40">
              <div />
              <span className="font-label-caps text-label-caps text-on-surface-variant">PLANT</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">ITEM #</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">SIZE</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant text-right">QTY AVAIL</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant text-right">PRICE</span>
              <div />
            </div>

            {/* Rows */}
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className={`grid grid-cols-[56px_1fr_auto] md:grid-cols-[56px_1fr_80px_80px_100px_80px_140px] gap-4 items-center px-4 py-3 ${
                  i < filtered.length - 1 ? 'border-b border-outline-variant/30' : ''
                } ${i % 2 === 0 ? 'bg-white' : 'bg-surface-container-low/40'}`}
              >
                {/* Photo thumbnail */}
                <button
                  onClick={() => item.photo_url && setLightbox(item.photo_url)}
                  className={`w-12 h-12 rounded overflow-hidden bg-surface-container flex-shrink-0 ${item.photo_url ? 'cursor-zoom-in' : 'cursor-default'}`}
                  disabled={!item.photo_url}
                  title={item.photo_url ? 'Tap to enlarge' : ''}
                >
                  {item.photo_url ? (
                    <img src={item.photo_url} alt={item.plant_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-outline text-xl w-full h-full flex items-center justify-center">eco</span>
                  )}
                </button>

                {/* Name + grade (mobile shows all info stacked) */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-['Newsreader'] italic text-on-surface text-sm md:text-base">{item.plant_name}</span>
                    {item.grade && (
                      <span className={`font-label-caps text-[10px] px-1.5 py-0.5 rounded-full ${
                        item.grade === 1 ? 'bg-primary/15 text-primary' :
                        item.grade === 2 ? 'bg-amber-100 text-amber-700' :
                        'bg-error-container text-error'
                      }`}>
                        {item.grade === 1 ? 'Can Hold' : item.grade === 2 ? 'Ship Soon' : 'Critical'}
                      </span>
                    )}
                  </div>
                  {/* Mobile-only secondary info */}
                  <div className="flex gap-3 mt-0.5 md:hidden">
                    <span className="font-body-md text-xs text-on-surface-variant">{item.plant_sku}</span>
                    <span className="font-body-md text-xs text-on-surface-variant">{item.plant_size}</span>
                    <span className="font-body-md text-xs text-on-surface-variant">{item.qty_available} avail</span>
                    {item.unit_price && <span className="font-body-md text-xs font-medium text-on-surface">${item.unit_price.toFixed(2)}</span>}
                  </div>
                </div>

                {/* Desktop columns */}
                <span className="hidden md:block font-body-md text-sm text-on-surface-variant">{item.plant_sku}</span>
                <span className="hidden md:block font-body-md text-sm text-on-surface-variant">{item.plant_size}</span>
                <span className="hidden md:block font-body-md text-sm text-on-surface text-right">{item.qty_available.toLocaleString()}</span>
                <span className="hidden md:block font-body-md text-sm font-medium text-on-surface text-right">
                  {item.unit_price ? `$${item.unit_price.toFixed(2)}` : '—'}
                </span>

                {/* Add button */}
                <button
                  onClick={() => handleAdd(item)}
                  disabled={!item.unit_price}
                  className="col-start-3 md:col-auto px-3 py-1.5 bg-primary text-on-primary font-button text-[12px] rounded-sm hover:bg-primary-container transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {added === item.id ? '✓ Added' : 'Add to Order'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
