-- Run this in the Supabase SQL Editor (Dashboard -> SQL) to create the education table

create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  school text not null,
  degree text,
  field_of_study text,
  start_date text,
  end_date text,
  created_at timestamptz default now()
);

create index if not exists education_profile_id_idx on public.education (profile_id);

alter table public.education enable row level security;

-- Policies for education table
create policy "Education: read own rows"
  on public.education for select
  to authenticated
  using (auth.uid() = profile_id);

create policy "Education: insert as profile owner"
  on public.education for insert
  to authenticated
  with check (auth.uid() = profile_id);

create policy "Education: update as profile owner"
  on public.education for update
  to authenticated
  using (auth.uid() = profile_id);

create policy "Education: delete as profile owner"
  on public.education for delete
  to authenticated
  using (auth.uid() = profile_id);
