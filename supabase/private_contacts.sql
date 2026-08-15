-- Private contact details for accepted ShipPact teammates.
-- Run this file once in the Supabase SQL Editor before deploying the UI.

create table if not exists public.private_contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  contact_type text not null check (
    contact_type in ('Email', 'WhatsApp', 'Discord', 'LinkedIn', 'Other')
  ),
  contact_value text not null check (char_length(contact_value) between 3 and 200),
  updated_at timestamptz not null default now()
);

alter table public.private_contacts enable row level security;

drop policy if exists "Users manage their own contact" on public.private_contacts;
create policy "Users manage their own contact"
on public.private_contacts
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Accepted teammates view contacts" on public.private_contacts;
create policy "Accepted teammates view contacts"
on public.private_contacts
for select
to authenticated
using (
  exists (
    select 1
    from public.team_members as viewer
    join public.team_members as contact_owner
      on contact_owner.post_id = viewer.post_id
    where viewer.user_id = auth.uid()
      and contact_owner.user_id = private_contacts.user_id
  )
);

create index if not exists private_contacts_user_id_idx
  on public.private_contacts(user_id);
