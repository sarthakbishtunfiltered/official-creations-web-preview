-- =====================================================================================
-- Shareable preview links
--
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to run again.
--
-- What it does
--   * Adds the columns a preview link needs to your existing "previews" table.
--   * Gives every preview a long random link code, so links cannot be guessed.
--   * Adds three functions the website uses:
--       save_preview        team only    creates a preview, or updates one ("Edit details")
--       get_preview_form    team only    loads a preview back into the form
--       get_public_preview  anyone       opens a link: only works while it is active and not
--                                        expired, and counts the visit
--   * Shuts signed-out visitors out of the previews tables completely. A client can only
--     reach a preview through get_public_preview, with its link code.
--
-- It does not delete or rename anything, and it leaves your existing policies alone.
-- It relies on what your app already uses: public.previews and public.is_approved_user().
-- =====================================================================================


-- ---- 1. Columns -----------------------------------------------------------------------

alter table public.previews add column if not exists link_token       text;
alter table public.previews add column if not exists form             jsonb;
alter table public.previews add column if not exists design           text;
alter table public.previews add column if not exists created_by       uuid;
alter table public.previews add column if not exists created_by_email text;

-- Give every existing preview a link code, then require one on all new previews.
update public.previews
   set link_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 24)
 where link_token is null;

alter table public.previews
  alter column link_token set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 24);
alter table public.previews
  alter column link_token set not null;

create unique index if not exists previews_link_token_key on public.previews (link_token);


-- ---- 2. Signed-out visitors cannot read the tables ------------------------------------
-- Whatever row policies exist, "anon" (not signed in) now has no table access at all.

revoke all on public.previews from anon;

do $$
begin
  if to_regclass('public.preview_visits') is not null then
    execute 'revoke all on public.preview_visits from anon';
  end if;
end
$$;


-- ---- 3. Create or update a preview (team only) ----------------------------------------

create or replace function public.save_preview(p_form jsonb, p_token text default null)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_niche  text;
  v_design text;
  v_values jsonb;
  v_name   text;
  r        public.previews%rowtype;
begin
  if not coalesce(public.is_approved_user(), false) then
    raise exception 'Only approved team members can create previews.';
  end if;

  if p_form is null or jsonb_typeof(p_form) <> 'object' then
    raise exception 'The preview details are missing.';
  end if;

  v_niche  := p_form ->> 'niche';
  v_design := p_form ->> 'design';
  v_values := p_form -> 'values';

  if coalesce(v_niche, '') = '' or coalesce(v_design, '') = ''
     or v_values is null or jsonb_typeof(v_values) <> 'object' then
    raise exception 'The preview details are incomplete.';
  end if;

  v_name := btrim(coalesce(v_values ->> 'businessName', ''));
  if v_name = '' then
    raise exception 'A business name is required.';
  end if;

  if octet_length(p_form::text) > 15000000 then
    raise exception 'The preview is too large. Use smaller photos or image links.';
  end if;

  if p_token is null then
    insert into public.previews
      (business_name, niche, design, form, status, is_active, expires_at, total_views,
       created_at, created_by, created_by_email)
    values
      (v_name, v_niche, v_design, p_form, 'preview_created', true, now() + interval '7 days', 0,
       now(), auth.uid(), lower(coalesce(auth.jwt() ->> 'email', '')))
    returning * into r;
  else
    update public.previews
       set business_name = v_name,
           niche         = v_niche,
           design        = v_design,
           form          = p_form
     where link_token = p_token
    returning * into r;

    if not found then
      raise exception 'That preview no longer exists.';
    end if;
  end if;

  return jsonb_build_object('token', r.link_token, 'expires_at', r.expires_at);
end;
$$;


-- ---- 4. Load a preview back into the form (team only) ---------------------------------

create or replace function public.get_preview_form(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_form jsonb;
begin
  if not coalesce(public.is_approved_user(), false) then
    raise exception 'Only approved team members can edit previews.';
  end if;

  select form into v_form from public.previews where link_token = p_token;
  return v_form;
end;
$$;


-- ---- 5. Open a link (anyone with the link code) ---------------------------------------
-- Returns a status: ok, expired, disabled or not_found. Only "ok" carries the website data.
-- A visit is counted when p_count is true and the viewer is not a signed-in team member.
-- The first visit also moves the sales status from "Preview Created" to "Preview Viewed".
-- Team members can still open expired or disabled links ("live" is then false).

create or replace function public.get_public_preview(p_token text, p_count boolean default true)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  r      public.previews%rowtype;
  v_team boolean := coalesce(public.is_approved_user(), false);
  v_live boolean;
begin
  select * into r from public.previews where link_token = p_token;

  if not found or r.form is null then
    return jsonb_build_object('status', 'not_found');
  end if;

  v_live := r.is_active and r.expires_at > now();

  if not v_live and not v_team then
    return jsonb_build_object(
      'status', case when not r.is_active then 'disabled' else 'expired' end,
      'business_name', r.business_name
    );
  end if;

  if p_count and not v_team then
    update public.previews
       set total_views     = coalesce(total_views, 0) + 1,
           first_viewed_at = coalesce(first_viewed_at, now()),
           last_viewed_at  = now(),
           status          = case when status = 'preview_created' then 'preview_viewed' else status end
     where id = r.id;
  end if;

  return jsonb_build_object(
    'status', 'ok',
    'live', v_live,
    'business_name', r.business_name,
    'form', r.form
  );
end;
$$;


-- ---- 6. Who may run what ---------------------------------------------------------------
-- Supabase lets everyone run new functions by default. Close that, then open only what's needed.

revoke all on function public.save_preview(jsonb, text)        from public, anon, authenticated;
revoke all on function public.get_preview_form(text)           from public, anon, authenticated;
revoke all on function public.get_public_preview(text, boolean) from public, anon, authenticated;

grant execute on function public.save_preview(jsonb, text)         to authenticated;
grant execute on function public.get_preview_form(text)            to authenticated;
grant execute on function public.get_public_preview(text, boolean) to anon, authenticated;

notify pgrst, 'reload schema';
