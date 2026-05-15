import { useState } from 'react'
import type { AvailabilityItem } from '../lib/types'
import { addToCart } from '../lib/cart'

interface Props {
  item: AvailabilityItem
  onAdd?: () => void
  shape?: 'arch' | 'pill' | 'organic1' | 'organic2' | 'organic3'
}

const FALLBACK = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3XIsmkUsPEfR9VrUUChek-XAE6qAAe83_yA9-mHx6jydlsusyFBmCAt2iURD4graOxOo4FbO8ePezw6qcB6btDKGrcy9W7vUsbFBnoZkXU-CUGzL--9mwk-cN4YVevjm7mcxywDK3u6ZRlFsvhRw-Xj02yOu5dVh1YweY-z6BWfbiZ0KIbBo8Vzx_g5nDJ-iisrXjV4B2B264x3foEVOCYJyFaJtFlrb_h0-4uTpqfUTqUs82TcevMvnWk6YC0pj6i7KTJauAhfyj'

const shapeClass: Record<string, string> = {
  arch: 'shape-arch',
  pill: 'shape-pill',
  organic1: 'organic-shape-1',
  organic2: 'organic-shape-2',
  organic3: 'organic-shape-3',
}

export default function PlantCard({ item, onAdd, shape = 'arch' }: Props) {
  const [added, setAdded] = useState(false)

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
      tray_price: item.unit_price * item.tray_count,
      qty: 1,
      photo_url: item.photo_url,
      release_item_id: item.id,
    })
    window.dispatchEvent(new Event('cart-updated'))
    setAdded(true)
    onAdd?.()
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group cursor-pointer">
      <div className={`aspect-[4/5] overflow-hidden ${shapeClass[shape]} border border-outline-variant/10 mb-6 bg-white transition-transform duration-500 group-hover:-translate-y-2`}>
        <img
          src={item.photo_url ?? FALLBACK}
          alt={item.plant_name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="px-2 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-['Newsreader'] italic text-xl text-on-surface group-hover:text-primary transition-colors">
              {item.plant_name}
            </h3>
            <p className="font-body-md text-on-surface-variant text-sm mt-0.5">
              {item.plant_size && <span>{item.plant_size} · </span>}
              {item.plant_sku}
            </p>
          </div>
          {item.unit_price && (
            <span className="font-label-caps text-label-caps text-on-secondary-fixed-variant bg-secondary-fixed px-3 py-1 rounded-full whitespace-nowrap">
              ${item.unit_price.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body-md text-sm text-on-surface-variant">
            {item.qty_available} available
          </span>
          {item.grade && (
            <span className={`font-label-caps text-xs px-2 py-0.5 rounded-full ${
              item.grade === 1 ? 'bg-primary/15 text-primary' :
              item.grade === 2 ? 'bg-amber-100 text-amber-700' :
              'bg-error-container text-error'
            }`}>
              {item.grade === 1 ? 'Can Hold' : item.grade === 2 ? 'Ship Soon' : 'Critical'}
            </span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={!item.unit_price}
          className="w-full py-3 bg-primary text-on-primary font-button text-button rounded-sm hover:bg-primary-container transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {added ? 'Added to Order' : 'Add to Order'}
        </button>
      </div>
    </div>
  )
}
