-- Harden create_wholesale_order: the atomic inventory decrement now also requires the
-- release row to still be website_visible. Migration 20260620_release_item_dedup_by_plant
-- introduces soft-hiding (website_visible=false) of superseded rows. Without this guard,
-- a buyer who loaded the page before a republish could place an order against a row that
-- was just hidden/replaced, selling stale inventory. The guard makes that decrement match
-- zero rows, raising the existing 'oversold:%' error the API already handles.
--
-- Only the decrement WHERE clause changed; the rest is identical to
-- 20260527_atomic_order_submissions.sql.

create or replace function public.create_wholesale_order(
  p_business_name text, p_contact_name text, p_email text, p_phone text, p_notes text,
  p_address_street text, p_address_city text, p_address_state text, p_address_zip text,
  p_user_id uuid, p_total_units integer, p_total_price numeric, p_items jsonb
)
 returns jsonb
 language plpgsql
 set search_path to ''
as $function$
declare
  v_order_id      uuid;
  v_claim_token   uuid;
  v_confirm_token uuid;
  v_item          jsonb;
  v_item_id       uuid;
  v_qty_requested integer;
  v_updated       integer;
  v_org           uuid;
  v_org_count     integer;
  v_resolved      integer;
  v_item_count    integer;
begin
  -- Resolve every item's org up front and require exactly one. This both rejects malformed
  -- or stale payloads and lets us serialize against approve_submission_tag's republish using
  -- the SAME advisory key (hashtext(org)). approve_submission_tag recomputes
  -- qty_available = raw_count - open reservations from a statement snapshot; without sharing
  -- this lock a checkout could decrement between that snapshot and the publish write, and the
  -- publish would clobber the decrement (re-adding sold trays).
  v_item_count := jsonb_array_length(p_items);
  if coalesce(v_item_count, 0) = 0 then
    raise exception 'order has no items';
  end if;

  select count(*), count(distinct r.org_id), min(r.org_id)
    into v_resolved, v_org_count, v_org
  from public.availability_release_items ari
  join public.availability_releases r on r.id = ari.release_id
  join jsonb_array_elements(p_items) as t(value)
       on ari.id = (value->>'release_item_id')::uuid;

  if v_resolved <> v_item_count then
    raise exception 'order references an unknown release item';
  end if;
  if v_org_count <> 1 then
    raise exception 'order spans multiple orgs';
  end if;
  perform pg_advisory_xact_lock(hashtext(v_org::text));

  for v_item in
    select value from jsonb_array_elements(p_items) as t(value)
    order by (value->>'release_item_id')
  loop
    v_item_id       := (v_item->>'release_item_id')::uuid;
    v_qty_requested := (v_item->>'qty_requested')::integer;

    update public.availability_release_items
    set qty_available = qty_available - v_qty_requested
    where id = v_item_id
      and website_visible
      and qty_available >= v_qty_requested;

    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'oversold:%', v_item_id;
    end if;
  end loop;

  v_claim_token   := gen_random_uuid();
  v_confirm_token := gen_random_uuid();

  insert into public.wholesale_orders (
    business_name, contact_name, email, phone, notes,
    address_street, address_city, address_state, address_zip,
    user_id, claim_token, confirm_token, total_units, total_price, status
  ) values (
    p_business_name, p_contact_name, p_email, p_phone, p_notes,
    p_address_street, p_address_city, p_address_state, p_address_zip,
    p_user_id, v_claim_token, v_confirm_token, p_total_units, p_total_price, 'pending'
  )
  returning id into v_order_id;

  for v_item in
    select value from jsonb_array_elements(p_items) as t(value)
    order by (value->>'release_item_id')
  loop
    insert into public.wholesale_order_items (
      order_id, plant_id, plant_name, plant_sku, plant_size,
      unit_price, tray_count, tray_price, qty_requested, line_total, release_item_id
    ) values (
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
  end loop;

  insert into public.order_submissions (
    wholesale_order_id, email_provided, source, status, raw_payload
  ) values (
    v_order_id, p_email, 'website', 'unmatched',
    jsonb_build_object(
      'wholesale_order_id', v_order_id,
      'contact', jsonb_build_object(
        'business_name',  p_business_name,
        'contact_name',   p_contact_name,
        'email',          p_email,
        'phone',          p_phone,
        'notes',          p_notes,
        'address_street', p_address_street,
        'address_city',   p_address_city,
        'address_state',  p_address_state,
        'address_zip',    p_address_zip
      ),
      'items',       p_items,
      'total_units', p_total_units,
      'total_price', p_total_price
    )
  )
  on conflict (wholesale_order_id) where wholesale_order_id is not null do nothing;

  return jsonb_build_object(
    'order_id',      v_order_id,
    'claim_token',   v_claim_token,
    'confirm_token', v_confirm_token
  );
end;
$function$;
