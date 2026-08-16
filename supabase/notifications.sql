-- Private real-time in-app notifications for ShipPact.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  link text,
  dedupe_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
revoke all on public.notifications from anon;
grant select, delete on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;

drop policy if exists "Users read own notifications" on public.notifications;
create policy "Users read own notifications"
on public.notifications for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Users update own notifications" on public.notifications;
create policy "Users update own notifications"
on public.notifications for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications"
on public.notifications for delete to authenticated
using (user_id = auth.uid());

create index if not exists notifications_user_created_idx
  on public.notifications(user_id, created_at desc);

create index if not exists notifications_user_unread_idx
  on public.notifications(user_id, read_at)
  where read_at is null;

create or replace function public.notify_join_request_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  team_title text;
  team_creator uuid;
  applicant_name text;
begin
  select title, creator_id into team_title, team_creator
  from public.team_posts where id = new.post_id;

  select full_name into applicant_name
  from public.profiles where id = new.applicant_id;

  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, type, title, body, link, dedupe_key)
    values (
      team_creator,
      'new_application',
      'New team application',
      coalesce(applicant_name, 'A student') || ' applied to join ' || coalesce(team_title, 'your team') || '.',
      '/applications',
      'application:new:' || new.id::text
    ) on conflict (dedupe_key) do nothing;
  elsif new.status is distinct from old.status
        and new.status in ('accepted', 'rejected') then
    insert into public.notifications (user_id, type, title, body, link, dedupe_key)
    values (
      new.applicant_id,
      'request_' || new.status,
      case when new.status = 'accepted' then 'Request accepted' else 'Request rejected' end,
      'Your request to join ' || coalesce(team_title, 'the team') || ' was ' || new.status || '.',
      '/my-requests',
      'application:' || new.status || ':' || new.id::text
    ) on conflict (dedupe_key) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists notify_join_request_change on public.join_requests;
create trigger notify_join_request_change
after insert or update of status on public.join_requests
for each row execute function public.notify_join_request_change();

create or replace function public.notify_new_team_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  team_title text;
  sender_name text;
begin
  select title into team_title from public.team_posts where id = new.post_id;
  select full_name into sender_name from public.profiles where id = new.sender_id;

  insert into public.notifications (user_id, type, title, body, link, dedupe_key)
  select
    recipients.user_id,
    'team_message',
    'New team message',
    coalesce(sender_name, 'A teammate') || ' sent a message in ' || coalesce(team_title, 'your team') || '.',
    '/messages/' || new.post_id::text,
    'message:' || new.id::text || ':' || recipients.user_id::text
  from (
    select user_id from public.team_members where post_id = new.post_id
    union
    select creator_id from public.team_posts where id = new.post_id
  ) as recipients
  where recipients.user_id <> new.sender_id
  on conflict (dedupe_key) do nothing;

  return new;
end;
$$;

drop trigger if exists notify_new_team_message on public.team_messages;
create trigger notify_new_team_message
after insert on public.team_messages
for each row execute function public.notify_new_team_message();

create or replace function public.generate_deadline_notifications()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.notifications (user_id, type, title, body, link, dedupe_key)
  select
    auth.uid(),
    'application_deadline',
    'Application deadline approaching',
    posts.title || ' closes applications on ' || to_char(posts.deadline, 'DD Mon YYYY') || '.',
    '/teams/' || posts.id::text,
    'deadline:' || posts.id::text || ':' || posts.deadline::text || ':' || auth.uid()::text
  from public.team_posts as posts
  where posts.status = 'open'
    and posts.deadline between current_date and current_date + 3
    and (
      posts.creator_id = auth.uid()
      or exists (
        select 1 from public.join_requests as requests
        where requests.post_id = posts.id
          and requests.applicant_id = auth.uid()
          and requests.status = 'pending'
      )
    )
  on conflict (dedupe_key) do nothing;
end;
$$;

revoke all on function public.generate_deadline_notifications() from public;
grant execute on function public.generate_deadline_notifications() to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.notifications;
exception
  when duplicate_object then null;
end $$;
