create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  type text not null check (type in ('group', 'self')),
  start_date date not null,
  end_date date not null,
  reminder_time time,
  invite_code text unique,
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists public.challenge_members (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'member')),
  joined_at timestamp with time zone default now(),
  unique(challenge_id, user_id)
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  title text not null,
  description text,
  required boolean not null default true,
  proof_type text not null check (proof_type in ('none', 'photo', 'text', 'number')),
  target_value numeric,
  target_unit text,
  created_at timestamp with time zone default now()
);

create table if not exists public.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  checkin_date date not null,
  completed boolean not null default false,
  proof_image_url text,
  text_response text,
  numeric_value numeric,
  created_at timestamp with time zone default now(),
  unique(goal_id, user_id, checkin_date)
);

create table if not exists public.daily_user_status (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status_date date not null,
  required_goals_completed integer not null default 0,
  total_required_goals integer not null default 0,
  day_complete boolean not null default false,
  reminder_sent boolean not null default false,
  created_at timestamp with time zone default now(),
  unique(challenge_id, user_id, status_date)
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid not null references public.challenges(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  activity_type text not null,
  message text not null,
  proof_image_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.reactions (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activity_feed(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  emoji text not null,
  created_at timestamp with time zone default now(),
  unique(activity_id, user_id, emoji)
);

create or replace function public.is_challenge_member(target_challenge_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.challenge_members
    where challenge_id = target_challenge_id
      and user_id = target_user_id
  );
$$;

create or replace function public.is_challenge_owner(target_challenge_id uuid, target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.challenge_members
    where challenge_id = target_challenge_id
      and user_id = target_user_id
      and role = 'owner'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.refresh_daily_user_status(target_challenge_id uuid, target_user_id uuid, target_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  required_count integer;
  completed_count integer;
begin
  select count(*) into required_count
  from public.goals
  where challenge_id = target_challenge_id and required = true;

  select count(*) into completed_count
  from public.goals g
  join public.daily_checkins dc on dc.goal_id = g.id
  where g.challenge_id = target_challenge_id
    and g.required = true
    and dc.user_id = target_user_id
    and dc.checkin_date = target_date
    and dc.completed = true;

  insert into public.daily_user_status (
    challenge_id,
    user_id,
    status_date,
    required_goals_completed,
    total_required_goals,
    day_complete
  )
  values (
    target_challenge_id,
    target_user_id,
    target_date,
    completed_count,
    required_count,
    required_count > 0 and completed_count = required_count
  )
  on conflict (challenge_id, user_id, status_date)
  do update set
    required_goals_completed = excluded.required_goals_completed,
    total_required_goals = excluded.total_required_goals,
    day_complete = excluded.day_complete;
end;
$$;

create or replace function public.refresh_status_after_checkin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.refresh_daily_user_status(new.challenge_id, new.user_id, new.checkin_date);
  return new;
end;
$$;

drop trigger if exists daily_checkin_refresh_status on public.daily_checkins;
create trigger daily_checkin_refresh_status
after insert or update on public.daily_checkins
for each row execute function public.refresh_status_after_checkin();

alter table public.profiles enable row level security;
alter table public.challenges enable row level security;
alter table public.challenge_members enable row level security;
alter table public.goals enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.daily_user_status enable row level security;
alter table public.activity_feed enable row level security;
alter table public.reactions enable row level security;

create policy "Users can insert their own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "Users can read their profile and shared member profiles"
on public.profiles for select
using (
  auth.uid() = id
  or exists (
    select 1
    from public.challenge_members mine
    join public.challenge_members theirs on theirs.challenge_id = mine.challenge_id
    where mine.user_id = auth.uid()
      and theirs.user_id = profiles.id
  )
);

create policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can create challenges"
on public.challenges for insert
with check (auth.uid() = created_by);

create policy "Users can read member group challenges and own self challenges"
on public.challenges for select
using (
  (type = 'self' and created_by = auth.uid())
  or public.is_challenge_member(id, auth.uid())
);

create policy "Owners can update challenges"
on public.challenges for update
using (created_by = auth.uid() or public.is_challenge_owner(id, auth.uid()))
with check (created_by = auth.uid() or public.is_challenge_owner(id, auth.uid()));

create policy "Users can join as themselves"
on public.challenge_members for insert
with check (auth.uid() = user_id);

create policy "Users can read members for their challenges"
on public.challenge_members for select
using (public.is_challenge_member(challenge_id, auth.uid()));

create policy "Owners can update members"
on public.challenge_members for update
using (public.is_challenge_owner(challenge_id, auth.uid()))
with check (public.is_challenge_owner(challenge_id, auth.uid()));

create policy "Members can read challenge goals"
on public.goals for select
using (public.is_challenge_member(challenge_id, auth.uid()));

create policy "Owners can create goals"
on public.goals for insert
with check (public.is_challenge_owner(challenge_id, auth.uid()));

create policy "Owners can update goals"
on public.goals for update
using (public.is_challenge_owner(challenge_id, auth.uid()))
with check (public.is_challenge_owner(challenge_id, auth.uid()));

create policy "Users can read their checkins and member checkins for group challenges"
on public.daily_checkins for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.challenges c
    where c.id = daily_checkins.challenge_id
      and c.type = 'group'
      and public.is_challenge_member(c.id, auth.uid())
  )
);

create policy "Users can check in only as themselves"
on public.daily_checkins for insert
with check (auth.uid() = user_id and public.is_challenge_member(challenge_id, auth.uid()));

create policy "Users can update only their same-day checkins"
on public.daily_checkins for update
using (auth.uid() = user_id and checkin_date = current_date)
with check (auth.uid() = user_id and checkin_date = current_date);

create policy "Users can read their statuses and group member statuses"
on public.daily_user_status for select
using (
  user_id = auth.uid()
  or exists (
    select 1 from public.challenges c
    where c.id = daily_user_status.challenge_id
      and c.type = 'group'
      and public.is_challenge_member(c.id, auth.uid())
  )
);

create policy "System can write user statuses through security definer functions"
on public.daily_user_status for all
using (auth.uid() = user_id or public.is_challenge_member(challenge_id, auth.uid()))
with check (auth.uid() = user_id or public.is_challenge_member(challenge_id, auth.uid()));

create policy "Members can view group activity feed"
on public.activity_feed for select
using (
  exists (
    select 1 from public.challenges c
    where c.id = activity_feed.challenge_id
      and c.type = 'group'
      and public.is_challenge_member(c.id, auth.uid())
  )
);

create policy "Members can create group activity"
on public.activity_feed for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.challenges c
    where c.id = activity_feed.challenge_id
      and c.type = 'group'
      and public.is_challenge_member(c.id, auth.uid())
  )
);

create policy "Members can read reactions on visible activities"
on public.reactions for select
using (
  exists (
    select 1 from public.activity_feed af
    where af.id = reactions.activity_id
      and public.is_challenge_member(af.challenge_id, auth.uid())
  )
);

create policy "Users can react as themselves"
on public.reactions for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.activity_feed af
    where af.id = reactions.activity_id
      and public.is_challenge_member(af.challenge_id, auth.uid())
  )
);

create policy "Users can remove their own reactions"
on public.reactions for delete
using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('proofs', 'proofs', true)
on conflict (id) do nothing;

create policy "Members can upload proof images"
on storage.objects for insert
with check (bucket_id = 'proofs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Proof images are public read"
on storage.objects for select
using (bucket_id = 'proofs');
