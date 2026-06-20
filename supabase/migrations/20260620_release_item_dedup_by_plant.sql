-- Dedup availability_release_items by plant within a release, and make
-- approve_submission_tag idempotent: a recount UPDATES the plant's existing
-- release row in place (preserving the row id that open orders point at via
-- wholesale_order_items.release_item_id) instead of inserting a second row.
--
-- Root cause being fixed: the prior upsert keyed on (release_id, source_submission_id).
-- A recount produces a new count_submission id, so it inserted a NEW row for the same
-- plant, leaving the old row visible -> the storefront showed the plant twice.
-- It also reset qty_available to the raw recount, wiping the order-time decrements.
--
-- New model: one visible release row per (release_id, plant_id). On recount we keep
-- the existing row and set qty_available = fresh_count - open_reservations, where
-- open reservations are summed from wholesale_order_items.release_item_id for orders
-- that are not cancelled. This keeps decrement-on-order intact and prevents a recount
-- from re-adding already-sold trays.

begin;

-- 0) Serialize this one-time cleanup against live checkout (create_wholesale_order) and
--    publish (approve_submission_tag), which both take pg_advisory_xact_lock(hashtext(org)).
--    Without this, a checkout decrement landing between the fold statement's snapshot and its
--    write could be overwritten, re-adding sold trays during the migration. Apply the guarded
--    order RPC migration (20260620_order_rpc_visible_guard.sql) BEFORE this one so live orders
--    actually contend on the lock. Locks are xact-scoped and release at commit.
do $$
declare o uuid;
begin
  for o in
    select distinct rel.org_id
    from public.availability_release_items ari
    join public.availability_releases rel on rel.id = ari.release_id
    where ari.website_visible
  loop
    perform pg_advisory_xact_lock(hashtext(o::text));
  end loop;
end $$;

-- 1) One-time cleanup of existing duplicate visible rows.
--
--    The canonical row we keep per (release_id, plant_id) is computed once into a temp
--    table so every later step (repoint, fold, hide) uses the SAME pick. We prefer a row
--    referenced by a non-cancelled order, else the earliest-created row.
--
--    Raw inventory is taken from the immutable count source (count_submissions.qty via
--    the freshest row's source_submission_id), NOT from qty_available -- qty_available is
--    already decrement-on-order, so reading it as a raw count and subtracting reservations
--    again would double-subtract. We subtract reservations only when a true raw count is
--    available; for legacy rows with no source we keep their qty_available as-is.

-- Pick one canonical row per duplicate (release_id, plant_id) group, once.
create temp table dedup_canonical on commit drop as
with visible as (
  select id, release_id, plant_id, created_at
  from public.availability_release_items
  where website_visible
),
dups as (
  select release_id, plant_id
  from visible group by release_id, plant_id having count(*) > 1
),
ordered as (
  select distinct on (v.release_id, v.plant_id)
         v.id as keep_id, v.release_id, v.plant_id
  from visible v
  join dups d on d.release_id = v.release_id and d.plant_id = v.plant_id
  left join (
    select distinct woi.release_item_id
    from public.wholesale_order_items woi
    join public.wholesale_orders wo on wo.id = woi.order_id
    where wo.status not in ('cancelled')
  ) o on o.release_item_id = v.id
  order by v.release_id, v.plant_id,
           (o.release_item_id is not null) desc,  -- order-referenced rows first
           v.created_at asc                        -- then earliest
)
select keep_id, release_id, plant_id from ordered;

-- Repoint every non-cancelled order line on a soon-to-be-hidden duplicate row onto the
-- canonical row, so no reservation is orphaned once the duplicate is hidden.
update public.wholesale_order_items woi
set release_item_id = c.keep_id
from public.availability_release_items dup
join dedup_canonical c on c.release_id = dup.release_id and c.plant_id = dup.plant_id
where woi.release_item_id = dup.id
  and dup.id <> c.keep_id
  and exists (
    select 1 from public.wholesale_orders wo
    where wo.id = woi.order_id and wo.status not in ('cancelled')
  );

-- Fold the freshest raw count minus consolidated open reservations into the canonical row.
-- Note: we deliberately do NOT copy the freshest row's source_submission_id onto the keep
-- row. The keep row keeps its own. Adopting the freshest dup's source id while that dup row
-- still exists would violate the retained (release_id, source_submission_id) partial unique
-- and abort the migration. source_submission_id is informational post-migration, so the
-- keep row's existing value is fine; the next recount's in-place upsert will refresh it.
with freshest as (
  select distinct on (ari.release_id, ari.plant_id)
         ari.release_id, ari.plant_id,
         cs.qty as raw_qty,  -- immutable raw count (nullable for legacy rows w/o source)
         ari.unit_price, ari.notes, ari.photo_url, ari.grade, ari.tray_count
  from public.availability_release_items ari
  join dedup_canonical c on c.release_id = ari.release_id and c.plant_id = ari.plant_id
  left join public.count_submissions cs on cs.id = ari.source_submission_id
  where ari.website_visible
  order by ari.release_id, ari.plant_id, ari.created_at desc
),
reserved as (
  select c.keep_id,
         coalesce(sum(woi.qty_requested), 0) as qty
  from dedup_canonical c
  join public.wholesale_order_items woi on woi.release_item_id = c.keep_id
  join public.wholesale_orders wo on wo.id = woi.order_id
  where wo.status not in ('cancelled')
  group by c.keep_id
)
update public.availability_release_items ari
set qty_available = case
      when f.raw_qty is not null then greatest(f.raw_qty - coalesce(r.qty, 0), 0)
      else ari.qty_available  -- legacy row, no raw count: leave its decremented balance
    end,
    unit_price = f.unit_price,
    notes      = f.notes,
    photo_url  = coalesce(f.photo_url, ari.photo_url),
    grade      = f.grade,
    tray_count = f.tray_count
from dedup_canonical c
join freshest f on f.release_id = c.release_id and f.plant_id = c.plant_id
left join reserved r on r.keep_id = c.keep_id
where ari.id = c.keep_id;

-- Hide the non-canonical duplicate rows.
update public.availability_release_items ari
set website_visible = false
from dedup_canonical c
where ari.release_id = c.release_id
  and ari.plant_id = c.plant_id
  and ari.id <> c.keep_id
  and ari.website_visible;

-- 2) Enforce one visible row per plant per release going forward.
create unique index if not exists availability_release_items_release_plant_visible_uniq
  on public.availability_release_items (release_id, plant_id)
  where website_visible;

-- 3) Keep the existing partial unique on (release_id, source_submission_id). It is NOT the
--    upsert conflict target (the plant index above is), and an INSERT never reuses a
--    submission id, so it can never be the violated constraint during publish. Replay of an
--    already-approved submission is independently prevented by count_submissions.status
--    flipping to 'approved' (such rows are excluded from the locked CTE below). The index
--    stays as a defense-in-depth net.

-- 4) Rewrite the publish path to upsert by plant in place.
create or replace function public.approve_submission_tag(p_org_id uuid, p_tag text, p_website boolean)
 returns table(consumed_id uuid)
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  v_user uuid;
  v_role text;
  v_release_id uuid;
  v_sub_ids uuid[];
begin
  select id, role into v_user, v_role
    from public.kwg_users
   where lower(email) = lower(auth.jwt() ->> 'email')
     and org_id = p_org_id and is_active;
  if v_user is null then
    raise exception 'No active kwg_users row -- approving requires a resolvable actor';
  end if;
  if v_role not in ('admin', 'operator') then
    raise exception 'Not authorized to approve availability for org %', p_org_id;
  end if;

  with locked as (
    select cs.id
      from public.count_submissions cs
      join public.count_sessions ses on ses.id = cs.count_session_id
      join public.plants p on p.id = cs.plant_id and p.org_id = p_org_id
     where ses.org_id = p_org_id
       and cs.org_id = p_org_id
       and ses.status = 'submitted'
       and cs.status = 'active'
       and coalesce(cs.tag, 'No tag') = p_tag
     for update of cs, ses, p
  )
  select array_agg(id) into v_sub_ids from locked;

  if p_website then
    perform pg_advisory_xact_lock(hashtext(p_org_id::text));

    select id into v_release_id
      from public.availability_releases
     where org_id = p_org_id and status = 'current'
     limit 1;

    if v_release_id is null then
      insert into public.availability_releases (status, published_at, org_id)
        values ('current', now(), p_org_id)
        returning id into v_release_id;
    end if;

    -- Upsert one visible row per plant. On a recount we update the existing row in
    -- place (same id, so wholesale_order_items.release_item_id pointers stay valid) and
    -- set qty_available = fresh_count - open_reservations so already-sold trays are not
    -- re-added. Two different count tags for the same plant collapse to this single
    -- sellable row (the storefront has no tag concept), latest count wins.
    -- distinct on (cs.plant_id) collapses a plant counted twice in one batch to its
    -- latest count; without it ON CONFLICT would touch the same target row twice and error.
    insert into public.availability_release_items
      (release_id, plant_id, qty_available, unit_price, notes, photo_url,
       grade, is_cover, website_visible, tray_count, source_submission_id)
    select distinct on (cs.plant_id)
           v_release_id, cs.plant_id, cs.qty::int, p.unit_price, cs.notes, cs.photo_url,
           cs.grade, false, true, coalesce(p.plants_per_flat, 1)::int, cs.id
      from public.count_submissions cs
      join public.plants p on p.id = cs.plant_id and p.org_id = p_org_id
     where cs.id = any(v_sub_ids)
     order by cs.plant_id, cs.updated_at desc, cs.id
    on conflict (release_id, plant_id) where website_visible
    do update set
      qty_available = greatest(
        excluded.qty_available - coalesce((
          select sum(woi.qty_requested)
            from public.wholesale_order_items woi
            join public.wholesale_orders wo on wo.id = woi.order_id
           where woi.release_item_id = public.availability_release_items.id
             and wo.status not in ('cancelled')
        ), 0), 0),
      unit_price           = excluded.unit_price,
      notes                = excluded.notes,
      photo_url            = coalesce(excluded.photo_url, public.availability_release_items.photo_url),
      grade                = excluded.grade,
      tray_count           = excluded.tray_count,
      source_submission_id = excluded.source_submission_id,
      website_visible      = true;

    update public.availability_releases set published_at = now() where id = v_release_id;
  end if;

  update public.count_submissions cs
     set status = 'approved', updated_at = now()
   where cs.id = any(v_sub_ids);

  update public.count_sessions ses
     set status = 'approved', updated_at = now()
   where ses.org_id = p_org_id
     and ses.status = 'submitted'
     and not exists (
       select 1 from public.count_submissions cs
        where cs.count_session_id = ses.id and cs.status = 'active'
     );

  return query select unnest(v_sub_ids);
end;
$function$;

commit;
