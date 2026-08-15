-- Private real-time chat for accepted ShipPact team members.
-- Run this file once in the Supabase SQL Editor before deploying the UI.
-- team_posts.id is bigint, so team_messages.post_id must also be bigint.

create table if not exists public.team_messages (
  id uuid primary key default gen_random_uuid(),
  post_id bigint not null references public.team_posts(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

alter table public.team_messages enable row level security;

revoke all on public.team_messages from anon;
grant select, insert on public.team_messages to authenticated;

drop policy if exists "Accepted members read team messages" on public.team_messages;
create policy "Accepted members read team messages"
on public.team_messages
for select
to authenticated
using (
  exists (
    select 1
    from public.team_members
    where team_members.post_id = team_messages.post_id
      and team_members.user_id = auth.uid()
  )
);

drop policy if exists "Accepted members send team messages" on public.team_messages;
create policy "Accepted members send team messages"
on public.team_messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.team_members
    where team_members.post_id = team_messages.post_id
      and team_members.user_id = auth.uid()
  )
);

create index if not exists team_messages_post_created_idx
  on public.team_messages(post_id, created_at);

do $$
begin
  alter publication supabase_realtime add table public.team_messages;
exception
  when duplicate_object then null;
end $$;
