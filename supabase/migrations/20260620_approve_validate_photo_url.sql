-- Validate count photo URLs at the publish boundary.
--
-- count_submissions.photo_url is written verbatim by the availability counting app
-- (submit_count stores whatever the client sends). approve_submission_tag copies it into
-- availability_release_items.photo_url, which is rendered as an <img> on the PUBLIC
-- kelstonway.com storefront. An external or non-bucket URL would therefore make every
-- buyer's browser fetch arbitrary content (trust-boundary / SSRF-on-the-client leak).
--
-- The inbox view model already refuses to render non-bucket URLs, but that is UI-only and
-- does not stop publish. This makes the publish path authoritative: only a real public
-- plant-photos bucket URL is copied onto the release item; anything else is stored as null.
-- The bucket host is the project's own storage origin, so the prefix is safe to pin here.
--
-- Only the photo_url select expression changed; the rest is identical to
-- 20260620_release_item_dedup_by_plant.sql.

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

    -- Only publish a photo_url that lives in our own public plant-photos bucket; reject
    -- anything else to null so a crafted submission cannot inject an external URL onto the
    -- public storefront.
    insert into public.availability_release_items
      (release_id, plant_id, qty_available, unit_price, notes, photo_url,
       grade, is_cover, website_visible, tray_count, source_submission_id)
    select distinct on (cs.plant_id)
           v_release_id, cs.plant_id, cs.qty::int, p.unit_price, cs.notes,
           case
             when cs.photo_url like 'https://wuemcpptmjmvtzaciezq.supabase.co/storage/v1/object/public/plant-photos/%'
               then cs.photo_url
             else null
           end,
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
      -- Validate the preserved existing value too: a recount with no/invalid photo must not
      -- keep a previously-published non-bucket URL alive on the public storefront.
      photo_url            = coalesce(
        excluded.photo_url,
        case
          when public.availability_release_items.photo_url like 'https://wuemcpptmjmvtzaciezq.supabase.co/storage/v1/object/public/plant-photos/%'
            then public.availability_release_items.photo_url
          else null
        end),
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

-- One-time cleanup: null any already-published photo_url that is not a real plant-photos
-- bucket URL, so the prior verbatim-copy behavior cannot leave stale external URLs live on
-- the public storefront. (At apply time this matched 0 rows; it is a safety backstop.)
update public.availability_release_items
   set photo_url = null
 where photo_url is not null
   and photo_url not like 'https://wuemcpptmjmvtzaciezq.supabase.co/storage/v1/object/public/plant-photos/%';
