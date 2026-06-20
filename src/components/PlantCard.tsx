import { useState } from 'react'
import type { AvailabilityItem } from '../lib/types'
import { useCart } from '../contexts/CartContext'

interface Props {
  item: AvailabilityItem
  onAdd?: () => void
  shape?: 'arch' | 'pill' | 'organic1' | 'organic2' | 'organic3'
}

const FALLBACK =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA3XIsmkUsPEfR9VrUUChek-XAE6qAAe83_yA9-mHx6jydlsusyFBmCAt2iURD4graOxOo4FbO8ePezw6qcB6btDKGrcy9W7vUsbFBnoZkXU-CUGzL--9mwk-cN4YVevjm7mcxywDK3u6ZRlFsvhRw-Xj02yOu5dVh1YweY-z6BWfbiZ0KIbBo8Vzx_g5nDJ-iisrXjV4B2B264x3foEVOCYJyFaJtFlrb_h0-4uTpqfUTqUs82TcevMvnWk6YC0pj6i7KTJauAhfyj'

const shapeClass: Record<string, string> = {
  arch: 'shape-arch',
  pill: 'shape-pill',
  organic1: 'organic-shape-1',
  organic2: 'organic-shape-2',
  organic3: 'organic-shape-3',
}

export default function PlantCard({ item, onAdd, shape = 'arch' }: Props) {
  const [added, setAdded] = useState(false)
  const { addToCart } = useCart()

  function handleAdd() {
    if (!item.unit_price) return
    addToCart({
      id: crypto.randomUUID(),
      plant_id: item.plant_id,
      plant_name: item.plant_name,
      plant_sku: item.plant_sku,
      plant_size: item.plant_size,
      unit_price: item.unit_price,
      tray_count: item.tray_count,
      tray_price: item.unit_price,
      qty: 1,
      qty_available: item.qty_available,
      photo_url: item.photo_url,
      release_item_id: item.id,
    })
    setAdded(true)
    onAdd?.()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group cursor-pointer">
      <div
        className={`aspect-[4/5] overflow-hidden ${shapeClass[shape]} mb-6 border border-outline-variant/10 bg-white transition-transform duration-500 group-hover:-translate-y-2`}
      >
        <img
          src={item.photo_url ?? FALLBACK}
          alt={item.plant_name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="space-y-3 px-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-['Newsreader'] text-xl italic text-on-surface transition-colors group-hover:text-primary">
              {item.plant_name}
            </h3>
            <p className="mt-0.5 font-body-md text-sm text-on-surface-variant">
              {item.plant_size && <span>{item.plant_size} · </span>}
              {item.plant_sku}
            </p>
          </div>
          {item.unit_price && (
            <span className="whitespace-nowrap rounded-full bg-secondary-fixed px-3 py-1 font-label-caps text-label-caps text-on-secondary-fixed-variant">
              ${item.unit_price.toFixed(2)}/tray
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body-md text-sm text-on-surface-variant">
            {item.qty_available} trays available
          </span>
          {item.grade && (
            <span
              className={`rounded-full px-2 py-0.5 font-label-caps text-xs ${
                item.grade === 1
                  ? 'bg-primary/15 text-primary'
                  : item.grade === 2
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-error-container text-error'
              }`}
            >
              {item.grade === 1 ? 'Can Hold' : item.grade === 2 ? 'Ship Soon' : 'Critical'}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={!item.unit_price}
          className="w-full rounded-sm bg-primary py-3 font-button text-button text-on-primary transition-all duration-300 hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-40"
        >
          {added ? 'Added to Order' : 'Add to Order'}
        </button>
      </div>
    </div>
  )
}
