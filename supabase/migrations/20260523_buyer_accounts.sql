-- Buyer account system: buyer_profiles table, wholesale_orders new columns,
-- RLS policies, create_wholesale_order RPC with both claim_token and confirm_token.

-- ── wholesale_orders: new columns ────────────────────────────────────────────

ALTER TABLE public.wholesale_orders
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS claim_token uuid,
  ADD COLUMN IF NOT EXISTS confirm_token uuid,
  ADD COLUMN IF NOT EXISTS address_street text,
  ADD COLUMN IF NOT EXISTS address_city text,
  ADD COLUMN IF NOT EXISTS address_state text,
  ADD COLUMN IF NOT EXISTS address_zip text;

ALTER TABLE public.wholesale_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wholesale_order_items ENABLE ROW LEVEL SECURITY;

-- ── buyer_profiles ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.buyer_profiles (
  user_id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name  text NOT NULL,
  contact_name   text NOT NULL,
  email          text NOT NULL,
  phone          text,
  address_street text,
  address_city   text,
  address_state  text,
  address_zip    text,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.buyer_profiles TO authenticated;

ALTER TABLE public.buyer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "buyers_select_own_profile" ON public.buyer_profiles;
CREATE POLICY "buyers_select_own_profile" ON public.buyer_profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "buyers_insert_own_profile" ON public.buyer_profiles;
CREATE POLICY "buyers_insert_own_profile" ON public.buyer_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "buyers_update_own_profile" ON public.buyer_profiles;
CREATE POLICY "buyers_update_own_profile" ON public.buyer_profiles
  FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS buyer_profiles_updated_at ON public.buyer_profiles;
CREATE TRIGGER buyer_profiles_updated_at
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Prevent user_id from being changed after insert
CREATE OR REPLACE FUNCTION public.prevent_user_id_change()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.user_id <> OLD.user_id THEN
    RAISE EXCEPTION 'user_id is immutable';
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS buyer_profiles_immutable_user_id ON public.buyer_profiles;
CREATE TRIGGER buyer_profiles_immutable_user_id
  BEFORE UPDATE ON public.buyer_profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_user_id_change();

-- ── wholesale_orders: RLS ─────────────────────────────────────────────────────

DROP POLICY IF EXISTS "public read orders" ON public.wholesale_orders;
DROP POLICY IF EXISTS "users_own_orders" ON public.wholesale_orders;
DROP POLICY IF EXISTS "buyers_select_own_orders" ON public.wholesale_orders;
CREATE POLICY "buyers_select_own_orders" ON public.wholesale_orders
  FOR SELECT USING (user_id = auth.uid());

-- ── wholesale_order_items: RLS ────────────────────────────────────────────────

DROP POLICY IF EXISTS "public read order items" ON public.wholesale_order_items;
DROP POLICY IF EXISTS "users_own_order_items" ON public.wholesale_order_items;
DROP POLICY IF EXISTS "buyers_select_own_order_items" ON public.wholesale_order_items;
CREATE POLICY "buyers_select_own_order_items" ON public.wholesale_order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.wholesale_orders o
      WHERE o.id = wholesale_order_items.order_id
        AND o.user_id = auth.uid()
    )
  );

-- ── create_wholesale_order RPC ────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.create_wholesale_order(
  p_business_name text, p_contact_name text, p_email text,
  p_phone text, p_notes text,
  p_address_street text, p_address_city text, p_address_state text, p_address_zip text,
  p_user_id uuid, p_total_units integer, p_total_price numeric, p_items jsonb
) RETURNS jsonb LANGUAGE plpgsql SECURITY INVOKER AS $function$
DECLARE
  v_order_id      uuid;
  v_claim_token   uuid;
  v_confirm_token uuid;
  v_item          jsonb;
BEGIN
  v_claim_token   := gen_random_uuid();
  v_confirm_token := gen_random_uuid();

  INSERT INTO public.wholesale_orders (
    business_name, contact_name, email, phone, notes,
    address_street, address_city, address_state, address_zip,
    user_id, claim_token, confirm_token, total_units, total_price, status
  ) VALUES (
    p_business_name, p_contact_name, p_email, p_phone, p_notes,
    p_address_street, p_address_city, p_address_state, p_address_zip,
    p_user_id, v_claim_token, v_confirm_token, p_total_units, p_total_price, 'pending'
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.wholesale_order_items (
      order_id, plant_id, plant_name, plant_sku, plant_size,
      unit_price, tray_count, tray_price, qty_requested, line_total, release_item_id
    ) VALUES (
      v_order_id,
      (v_item->>'plant_id')::uuid,
      v_item->>'plant_name',
      v_item->>'plant_sku',
      v_item->>'plant_size',
      (v_item->>'unit_price')::numeric,
      (v_item->>'tray_count')::integer,
      (v_item->>'tray_price')::numeric,
      (v_item->>'qty_requested')::integer,
      (v_item->>'line_total')::numeric,
      (v_item->>'release_item_id')::uuid
    );
  END LOOP;

  RETURN jsonb_build_object(
    'order_id',      v_order_id,
    'claim_token',   v_claim_token,
    'confirm_token', v_confirm_token
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.create_wholesale_order(text,text,text,text,text,text,text,text,text,uuid,integer,numeric,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_wholesale_order(text,text,text,text,text,text,text,text,text,uuid,integer,numeric,jsonb) TO service_role;
