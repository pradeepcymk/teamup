-- Persistent onboarding progress. Existing users and data are unaffected.

create table if not exists public.onboarding_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  browsed_teams_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.onboarding_progress enable row level security;
revoke all on public.onboarding_progress from anon;
grant select, insert, update on public.onboarding_progress to authenticated;

drop policy if exists "Users read own onboarding progress" on public.onboarding_progress;
create policy "Users read own onboarding progress"
on public.onboarding_progress for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users create own onboarding progress" on public.onboarding_progress;
create policy "Users create own onboarding progress"
on public.onboarding_progress for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users update own onboarding progress" on public.onboarding_progress;
create policy "Users update own onboarding progress"
on public.onboarding_progress for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
