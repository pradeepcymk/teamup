-- ShipPact admin dashboard and community reporting.
-- Run once in the Supabase SQL editor, then use the final commented query
-- to add your own auth user UUID as the first administrator.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
revoke all on public.admin_users from anon, authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins see own role" on public.admin_users;
create policy "Admins see own role"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('team', 'profile', 'message')),
  target_id text not null,
  reason text not null check (reason in ('spam', 'harassment', 'misleading', 'unsafe', 'other')),
  details text check (char_length(details) <= 1000),
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.reports enable row level security;
revoke all on public.reports from anon, authenticated;
grant insert (target_type, target_id, reason, details) on public.reports to authenticated;
grant select on public.reports to authenticated;
grant update (status, reviewed_at) on public.reports to authenticated;

drop policy if exists "Users submit reports" on public.reports;
create policy "Users submit reports"
on public.reports for insert to authenticated
with check (reporter_id = auth.uid() and status = 'pending');

drop policy if exists "Admins read reports" on public.reports;
create policy "Admins read reports"
on public.reports for select to authenticated
using (public.is_admin());

drop policy if exists "Admins review reports" on public.reports;
create policy "Admins review reports"
on public.reports for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists reports_status_created_idx
  on public.reports(status, created_at desc);

create or replace function public.get_admin_dashboard_stats()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_users', (select count(*) from public.profiles),
    'verified_srm_users', (select count(*) from public.profiles where is_srm_verified is true),
    'active_teams', (select count(*) from public.team_posts where lifecycle_stage in ('recruiting', 'team_formed', 'building')),
    'pending_applications', (select count(*) from public.join_requests where status = 'pending'),
    'completed_projects', (select count(*) from public.team_posts where lifecycle_stage = 'completed'),
    'reports_to_review', (select count(*) from public.reports where status = 'pending')
  );
end;
$$;

revoke all on function public.get_admin_dashboard_stats() from public;
grant execute on function public.get_admin_dashboard_stats() to authenticated;

-- After this migration succeeds, replace the placeholder with your UUID from
-- Authentication > Users and run this line separately:
-- insert into public.admin_users (user_id) values ('YOUR-AUTH-USER-UUID');
