import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { AvailabilityItem } from '../lib/types'
import PlantCard from '../components/PlantCard'
import CartDrawer from '../components/CartDrawer'

const FILTERS = ['All', 'Aroids', 'Succulents', 'Ferns', 'Trees', 'Hoyas']

const SHAPE_CYCLE = ['arch', 'organic1', 'organic2', 'arch', 'organic3', 'organic1'] as const

export default function Availability() {
  const [items, setItems] = useState<AvailabilityItem[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [publishedAt, setPublishedAt] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

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
        .select('*')
        .eq('release_id', release.id)
        .gt('qty_available', 0)
        .order('plant_name')
      if (data) setItems(data as AvailabilityItem[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'All'
    ? items
    : items.filter(i => i.plant_name.toLowerCase().includes(filter.toLowerCase()) || i.plant_sku.toLowerCase().includes(filter.toLowerCase()))

  return (
    <>
      <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="px-8 md:px-32 py-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="font-label-caps text-label-caps text-secondary mb-3 block">LIVE WHOLESALE CATALOG</span>
            <h1 className="font-['Newsreader'] text-headline-xl text-on-surface">Current Availability</h1>
            {publishedAt && (
              <p className="font-body-md text-on-surface-variant mt-2">
                Updated {new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
          <a
            href="#"
            onClick={e => e.preventDefault()}
            className="font-button text-button text-primary border border-primary px-6 py-3 hover:bg-primary hover:text-on-primary transition-all rounded-sm flex items-center gap-2 w-fit"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Download Full List
          </a>
        </div>

        {/* Filter chips */}
        <div className="flex gap-3 flex-wrap mb-12">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-full font-button text-button transition-all ${
                filter === f
                  ? 'bg-primary text-on-primary'
                  : 'bg-white border border-outline-variant text-on-surface-variant hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="text-center py-24">
            <span className="material-symbols-outlined text-4xl text-outline animate-spin">progress_activity</span>
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-body-lg text-on-surface-variant text-center py-24">No items available right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
            {filtered.map((item, i) => (
              <PlantCard
                key={item.id}
                item={item}
                shape={SHAPE_CYCLE[i % SHAPE_CYCLE.length]}
                onAdd={() => setDrawerOpen(true)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
