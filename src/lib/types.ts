export interface AvailabilityItem {
  id: string
  plant_id: string
  plant_name: string
  plant_sku: string
  plant_size: string
  qty_available: number
  unit_price: number | null
  photo_url: string | null
  grade: 1 | 2 | 3 | null
  release_id: string
  notes: string | null
}

export interface CartItem {
  id: string
  plant_id: string
  plant_name: string
  plant_sku: string
  plant_size: string
  unit_price: number
  qty: number
  photo_url: string | null
  release_item_id: string
}

export interface WholesaleOrder {
  id: string
  created_at: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'invoiced'
  total_units: number | null
  total_price: number | null
  confirm_token: string
}

export interface CurrentRelease {
  id: string
  published_at: string
  items: AvailabilityItem[]
}
