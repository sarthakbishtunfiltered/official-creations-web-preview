-- =====================================================================================
-- Access requests: someone creates an account (or signs in with Google), and the owner
-- approves them before they can use the generator or the dashboard.
--
-- Run once: Supabase dashboard -> SQL Editor -> New query -> paste all -> Run.
-- Safe to run again.
--
-- It only ADDS a table and three functions. It does not touch your existing tables,
-- policies or functions. It relies on what your app already uses:
--   public.approved_emails (email, role, added_at)  and  public.is_owner_user()
-- =====================================================================================

create table if not exists public.access_requests (
  email        text primary key,
  status       text not null default 'pending' check (status in ('pending', 'rejected')),
  requested_at timestamptz not null default now()
);

alter table public.access_requests enable row level security;

-- Only the owner can read requests. Nobody can change the table directly: all changes go
-- through the three functions below.
drop policy if exists "owner reads access requests" on public.access_requests;
create policy "owner reads access requests" on public.access_requests
  for select to authenticated
  using (public.is_owner_user());

revoke all on public.access_requests from anon, authenticated;
grant select on public.access_requests to authenticated;


-- A signed-in person asks for access. Returns 'approved', 'pending' or 'rejected'.
create or replace function public.request_access()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email  text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_status text;
begin
  if v_email = '' then
    raise exception 'Sign in first.';
  end if;

  if exists (select 1 from public.approved_emails where lower(email) = v_email) then
    return 'approved';
  end if;

  insert into public.access_requests (email) values (v_email)
  on conflict (email) do nothing;

  select status into v_status from public.access_requests where email = v_email;
  return v_status;
end;
$$;


-- The owner approves a request (or an email that has no request yet).
create or replace function public.approve_access_request(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
begin
  if not public.is_owner_user() then
    raise exception 'Only the owner can approve access.';
  end if;
  if v_email = '' or v_email not like '%_@_%' then
    raise exception 'Enter a valid email address.';
  end if;

  insert into public.approved_emails (email, role)
  select v_email, 'team_member'
  where not exists (select 1 from public.approved_emails where lower(email) = v_email);

  delete from public.access_requests where email = v_email;
end;
$$;


-- The owner turns a request down. The person stays unable to sign in.
create or replace function public.reject_access_request(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_owner_user() then
    raise exception 'Only the owner can reject access.';
  end if;

  update public.access_requests
     set status = 'rejected'
   where email = lower(btrim(p_email));
end;
$$;


-- Supabase lets everyone run new functions by default. Close that, then open only what's needed.
revoke all on function public.request_access()                  from public, anon, authenticated;
revoke all on function public.approve_access_request(text)      from public, anon, authenticated;
revoke all on function public.reject_access_request(text)       from public, anon, authenticated;

grant execute on function public.request_access()               to authenticated;
grant execute on function public.approve_access_request(text)   to authenticated;
grant execute on function public.reject_access_request(text)    to authenticated;
