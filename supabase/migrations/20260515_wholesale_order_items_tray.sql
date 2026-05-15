ALTER TABLE wholesale_order_items
  ADD COLUMN IF NOT EXISTS tray_count INTEGER,
  ADD COLUMN IF NOT EXISTS tray_price NUMERIC(10, 2);
