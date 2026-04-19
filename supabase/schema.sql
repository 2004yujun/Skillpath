-- Run this in the Supabase SQL Editor (Dashboard → SQL) after creating a project.

-- Profiles (one row per auth user)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  job_title text,
  location text,
  bio text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Profiles: owner can select"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles: owner can insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles: owner can update"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Skills
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  skill_name text not null,
  proficiency text not null,
  details text,
  proof_path text,
  created_at timestamptz default now()
);

create index if not exists skills_user_id_idx on public.skills (user_id);

alter table public.skills enable row level security;

create policy "Skills: owner can select"
  on public.skills for select
  using (auth.uid() = user_id);

create policy "Skills: owner can insert"
  on public.skills for insert
  with check (auth.uid() = user_id);

create policy "Skills: owner can update"
  on public.skills for update
  using (auth.uid() = user_id);

create policy "Skills: owner can delete"
  on public.skills for delete
  using (auth.uid() = user_id);

-- Private bucket for optional proof files (path: <user_id>/<filename>)
insert into storage.buckets (id, name, public)
values ('skill-proofs', 'skill-proofs', false)
on conflict (id) do nothing;

create policy "Skill proofs: upload own prefix"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'skill-proofs'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "Skill proofs: read own prefix"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'skill-proofs'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "Skill proofs: update own prefix"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'skill-proofs'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

create policy "Skill proofs: delete own prefix"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'skill-proofs'
    and (storage.foldername (name))[1] = auth.uid()::text
  );

-- Home directory: anyone can read profiles & skills (listing + badges).
-- Owner-only policies above still apply for insert/update/delete.
drop policy if exists "Profiles: public read" on public.profiles;
create policy "Profiles: public read"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Skills: public read" on public.skills;
create policy "Skills: public read"
  on public.skills for select
  to anon, authenticated
  using (true);

-- Certifications (credentials / certificates)
create table if not exists public.certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  issuer text,
  issued_at text,
  created_at timestamptz default now()
);

create index if not exists certifications_user_id_idx on public.certifications (user_id);

alter table public.certifications enable row level security;

drop policy if exists "Certifications: public read" on public.certifications;
create policy "Certifications: public read"
  on public.certifications for select
  to anon, authenticated
  using (true);

drop policy if exists "Certifications: owner insert" on public.certifications;
create policy "Certifications: owner insert"
  on public.certifications for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Certifications: owner update" on public.certifications;
create policy "Certifications: owner update"
  on public.certifications for update
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Certifications: owner delete" on public.certifications;
create policy "Certifications: owner delete"
  on public.certifications for delete
  to authenticated
  using (auth.uid() = user_id);

-- One-way connections (follower → following). "My connections" = people you follow.
create table if not exists public.connections (
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists connections_follower_idx on public.connections (follower_id);
create index if not exists connections_following_idx on public.connections (following_id);

alter table public.connections enable row level security;

drop policy if exists "Connections: read own rows" on public.connections;
create policy "Connections: read own rows"
  on public.connections for select
  to authenticated
  using (auth.uid() = follower_id or auth.uid() = following_id);

drop policy if exists "Connections: insert as follower" on public.connections;
create policy "Connections: insert as follower"
  on public.connections for insert
  to authenticated
  with check (auth.uid() = follower_id);

drop policy if exists "Connections: delete as follower" on public.connections;
create policy "Connections: delete as follower"
  on public.connections for delete
  to authenticated
  using (auth.uid() = follower_id);
