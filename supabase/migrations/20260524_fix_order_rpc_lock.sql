-- Replace create_wholesale_order RPC to atomically reserve inventory.
-- Uses a conditional UPDATE (not SELECT FOR UPDATE) — the UPDATE itself is
-- atomic in PostgreSQL so concurrent calls serialize naturally, and the
-- WHERE qty_available >= v_qty_requested guard is the single source of truth.

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
  v_item_id       uuid;
  v_qty_requested integer;
  v_updated       integer;
BEGIN
  -- Atomically reserve inventory for each item.
  -- Items are processed in release_item_id order so concurrent orders with
  -- overlapping carts always acquire row locks in the same sequence,
  -- preventing deadlocks under peak traffic.
  FOR v_item IN
    SELECT value FROM jsonb_array_elements(p_items) AS t(value)
    ORDER BY (value->>'release_item_id')
  LOOP
    v_item_id       := (v_item->>'release_item_id')::uuid;
    v_qty_requested := (v_item->>'qty_requested')::integer;

    UPDATE public.availability_release_items
    SET qty_available = qty_available - v_qty_requested
    WHERE id = v_item_id
      AND qty_available >= v_qty_requested;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    IF v_updated = 0 THEN
      RAISE EXCEPTION 'oversold:%', v_item_id;
    END IF;
  END LOOP;

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

  FOR v_item IN
    SELECT value FROM jsonb_array_elements(p_items) AS t(value)
    ORDER BY (value->>'release_item_id')
  LOOP
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
