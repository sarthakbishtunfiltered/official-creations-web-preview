-- =====================================================================================
-- Visitor leads (the sales funnel on the public homepage)
--
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to run again. It does not touch your other tables.
--
-- What it does
--   * Creates the "leads" table. Nobody can read or change it directly, not even signed-in
--     users: every action goes through the functions below.
--   * submit_lead      anyone     a visitor sends the form (a sample request or an order request)
--   * list_leads       team only  the Leads tab in the dashboard
--   * get_lead         team only  fills the generator from a lead ("Create preview")
--   * update_lead      team only  change status, notes, or attach the preview link
--   * delete_lead      owner only remove a lead (spam, duplicates)
--   Spam protection inside submit_lead: a hidden trap field that bots fill in, at most 3
--   requests per phone number per day, and an overall cap if the form is flooded.
--
-- It relies on what your app already uses: public.is_approved_user() and public.is_owner_user().
-- =====================================================================================


-- ---- 1. The table ---------------------------------------------------------------------

create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  kind             text not null check (kind in ('sample', 'order')),
  name             text not null,
  phone            text not null,
  email            text,
  business_name    text not null,
  niche            text not null,
  city             text not null,
  design           text,
  budget           text,
  timeline         text,
  details          text,
  status           text not null default 'new'
                   check (status in ('new', 'contacted', 'sample_sent', 'won', 'lost')),
  notes            text,
  preview_token    text,
  handled_by_email text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);

-- No policies on purpose: with row security on and no policy, direct table access returns nothing.
alter table public.leads enable row level security;
revoke all on public.leads from public, anon, authenticated;


-- ---- 2. A visitor sends the form (anyone) --------------------------------------------

create or replace function public.submit_lead(p_lead jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_kind     text;
  v_name     text;
  v_phone    text;
  v_digits   text;
  v_email    text;
  v_business text;
  v_niche    text;
  v_city     text;
  v_design   text;
  v_budget   text;
  v_timeline text;
  v_details  text;
begin
  if p_lead is null or jsonb_typeof(p_lead) <> 'object' then
    raise exception 'Please fill in the form.';
  end if;

  -- The hidden "website" field is invisible to people. If it has text, a bot filled it in:
  -- pretend it worked and save nothing.
  if btrim(coalesce(p_lead ->> 'website', '')) <> '' then
    return jsonb_build_object('ok', true);
  end if;

  v_kind     := btrim(coalesce(p_lead ->> 'kind', ''));
  v_name     := btrim(coalesce(p_lead ->> 'name', ''));
  v_phone    := btrim(coalesce(p_lead ->> 'phone', ''));
  v_email    := btrim(coalesce(p_lead ->> 'email', ''));
  v_business := btrim(coalesce(p_lead ->> 'business_name', ''));
  v_niche    := btrim(coalesce(p_lead ->> 'niche', ''));
  v_city     := btrim(coalesce(p_lead ->> 'city', ''));
  v_design   := btrim(coalesce(p_lead ->> 'design', ''));
  v_budget   := btrim(coalesce(p_lead ->> 'budget', ''));
  v_timeline := btrim(coalesce(p_lead ->> 'timeline', ''));
  v_details  := btrim(coalesce(p_lead ->> 'details', ''));

  if v_kind not in ('sample', 'order') then
    raise exception 'Choose a free sample or an order.';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 100 then
    raise exception 'Please enter your name.';
  end if;

  v_digits := regexp_replace(v_phone, '\D', '', 'g');
  if char_length(v_phone) > 40 or char_length(v_digits) < 10 or char_length(v_digits) > 13 then
    raise exception 'Please enter a valid phone number.';
  end if;

  if v_email <> '' and (char_length(v_email) > 200 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$') then
    raise exception 'That email address does not look right.';
  end if;

  if char_length(v_business) < 2 or char_length(v_business) > 120 then
    raise exception 'Please enter your business name.';
  end if;

  if v_niche not in (
    'interior-designers', 'photographers', 'salons', 'cloud-kitchens', 'architects',
    'event-decorators', 'clinics', 'real-estate', 'driving-schools', 'ca-legal'
  ) then
    raise exception 'Please choose your business type.';
  end if;

  if char_length(v_city) < 2 or char_length(v_city) > 80 then
    raise exception 'Please enter your city.';
  end if;

  if v_design not in ('', 'simple', 'premium') then
    raise exception 'Please choose a design style.';
  end if;

  if char_length(v_budget) > 60 or char_length(v_timeline) > 60 then
    raise exception 'Please pick a budget and timeline from the list.';
  end if;

  if char_length(v_details) > 2000 then
    raise exception 'Please keep the extra details under 2000 characters.';
  end if;

  -- Limits. The same phone number can send 3 requests a day, and the whole form takes at most
  -- 40 requests in any 10 minutes. Numbers are compared by their last 10 digits, so
  -- "98765 43210", "+91 98765 43210" and "098765 43210" count as the same number.
  if (
    select count(*) from public.leads
     where created_at > now() - interval '24 hours'
       and right(regexp_replace(phone, '\D', '', 'g'), 10) = right(v_digits, 10)
  ) >= 3 then
    raise exception 'We already have your requests. Our team will contact you soon.';
  end if;

  if (select count(*) from public.leads where created_at > now() - interval '10 minutes') >= 40 then
    raise exception 'We are getting a lot of requests right now. Please try again in a few minutes.';
  end if;

  insert into public.leads
    (kind, name, phone, email, business_name, niche, city, design, budget, timeline, details)
  values
    (v_kind, v_name, v_phone, nullif(v_email, ''), v_business, v_niche, v_city,
     nullif(v_design, ''), nullif(v_budget, ''), nullif(v_timeline, ''), nullif(v_details, ''));

  return jsonb_build_object('ok', true);
end;
$$;


-- ---- 3. Team: list, open, update, delete ----------------------------------------------

create or replace function public.list_leads()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not coalesce(public.is_approved_user(), false) then
    raise exception 'Only approved team members can see leads.';
  end if;

  return coalesce(
    (select jsonb_agg(to_jsonb(l) order by l.created_at desc)
       from (select * from public.leads order by created_at desc limit 1000) l),
    '[]'::jsonb
  );
end;
$$;

create or replace function public.get_lead(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.leads%rowtype;
begin
  if not coalesce(public.is_approved_user(), false) then
    raise exception 'Only approved team members can see leads.';
  end if;

  select * into r from public.leads where id = p_id;
  if not found then
    return null;
  end if;
  return to_jsonb(r);
end;
$$;

-- A null argument means "leave this as it is". An empty p_notes clears the notes.
create or replace function public.update_lead(
  p_id            uuid,
  p_status        text default null,
  p_notes         text default null,
  p_preview_token text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.leads%rowtype;
begin
  if not coalesce(public.is_approved_user(), false) then
    raise exception 'Only approved team members can change leads.';
  end if;

  if p_status is not null and p_status not in ('new', 'contacted', 'sample_sent', 'won', 'lost') then
    raise exception 'That status is not valid.';
  end if;

  if p_notes is not null and char_length(p_notes) > 4000 then
    raise exception 'Notes can be up to 4000 characters.';
  end if;

  if p_preview_token is not null and not exists (
    select 1 from public.previews where link_token = p_preview_token
  ) then
    raise exception 'That preview does not exist.';
  end if;

  update public.leads
     set status           = coalesce(p_status, status),
         notes            = case when p_notes is null then notes else nullif(btrim(p_notes), '') end,
         preview_token    = coalesce(p_preview_token, preview_token),
         updated_at       = now(),
         handled_by_email = lower(coalesce(auth.jwt() ->> 'email', ''))
   where id = p_id
  returning * into r;

  if not found then
    raise exception 'That lead no longer exists.';
  end if;

  return to_jsonb(r);
end;
$$;

create or replace function public.delete_lead(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not coalesce(public.is_owner_user(), false) then
    raise exception 'Only the owner can delete leads.';
  end if;

  delete from public.leads where id = p_id;
end;
$$;


-- ---- 4. Who may run what --------------------------------------------------------------
-- Supabase lets everyone run new functions by default. Close that, then open only what's needed.

revoke all on function public.submit_lead(jsonb)                    from public, anon, authenticated;
revoke all on function public.list_leads()                          from public, anon, authenticated;
revoke all on function public.get_lead(uuid)                        from public, anon, authenticated;
revoke all on function public.update_lead(uuid, text, text, text)   from public, anon, authenticated;
revoke all on function public.delete_lead(uuid)                     from public, anon, authenticated;

grant execute on function public.submit_lead(jsonb)                  to anon, authenticated;
grant execute on function public.list_leads()                        to authenticated;
grant execute on function public.get_lead(uuid)                      to authenticated;
grant execute on function public.update_lead(uuid, text, text, text) to authenticated;
grant execute on function public.delete_lead(uuid)                   to authenticated;

notify pgrst, 'reload schema';
