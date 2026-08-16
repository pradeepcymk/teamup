-- Team lifecycle: Recruiting -> Team formed -> Building -> Completed.
-- Existing open teams remain Recruiting; existing closed teams become Team formed.

alter table public.team_posts
  add column if not exists lifecycle_stage text;

update public.team_posts
set lifecycle_stage = case
  when status = 'open' then 'recruiting'
  else 'team_formed'
end
where lifecycle_stage is null;

alter table public.team_posts
  alter column lifecycle_stage set default 'recruiting',
  alter column lifecycle_stage set not null;

alter table public.team_posts
  drop constraint if exists team_posts_lifecycle_stage_check;

alter table public.team_posts
  add constraint team_posts_lifecycle_stage_check
  check (lifecycle_stage in ('recruiting', 'team_formed', 'building', 'completed'));

create or replace function public.sync_team_lifecycle_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE'
     and new.lifecycle_stage is not distinct from old.lifecycle_stage
     and new.status is distinct from old.status then
    new.lifecycle_stage := case
      when new.status = 'open' then 'recruiting'
      when old.lifecycle_stage = 'recruiting' then 'team_formed'
      else old.lifecycle_stage
    end;
  else
    new.status := case
      when new.lifecycle_stage = 'recruiting' then 'open'
      else 'closed'
    end;
  end if;

  return new;
end;
$$;

drop trigger if exists sync_team_lifecycle_status on public.team_posts;
create trigger sync_team_lifecycle_status
before insert or update on public.team_posts
for each row execute function public.sync_team_lifecycle_status();
