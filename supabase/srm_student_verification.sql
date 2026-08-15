-- Gradual SRM verification rollout.
-- Existing accounts keep access. Only confirmed approved-domain emails get a badge.

alter table public.profiles
  add column if not exists is_srm_verified boolean not null default false;

create or replace function public.is_approved_srm_email(email_address text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select lower(split_part(coalesce(email_address, ''), '@', 2)) = any (
    array['srmist.edu.in']::text[]
  );
$$;

create or replace function public.set_profile_srm_verification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select (
    public.is_approved_srm_email(users.email)
    and users.email_confirmed_at is not null
  )
  into new.is_srm_verified
  from auth.users
  where users.id = new.id;

  new.is_srm_verified := coalesce(new.is_srm_verified, false);
  return new;
end;
$$;

drop trigger if exists set_profile_srm_verification on public.profiles;
create trigger set_profile_srm_verification
before insert or update on public.profiles
for each row execute function public.set_profile_srm_verification();

create or replace function public.sync_srm_verification_from_auth()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
  set is_srm_verified = (
    public.is_approved_srm_email(new.email)
    and new.email_confirmed_at is not null
  )
  where id = new.id;

  return new;
end;
$$;

drop trigger if exists sync_srm_verification_from_auth on auth.users;
create trigger sync_srm_verification_from_auth
after insert or update of email, email_confirmed_at on auth.users
for each row execute function public.sync_srm_verification_from_auth();

-- Verify eligible existing users without disabling anyone else.
update public.profiles as profiles
set is_srm_verified = (
  public.is_approved_srm_email(users.email)
  and users.email_confirmed_at is not null
)
from auth.users as users
where profiles.id = users.id;
