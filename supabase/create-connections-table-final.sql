-- Run this in the Supabase SQL Editor (Dashboard -> SQL) to create the connections table

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);

create index if not exists connections_follower_idx on public.connections (follower_id);
create index if not exists connections_following_idx on public.connections (following_id);

alter table public.connections enable row level security;

-- Policies for connections table
create policy "Connections: read own rows"
  on public.connections for select
  to authenticated
  using (auth.uid() = follower_id or auth.uid() = following_id);

create policy "Connections: insert as follower"
  on public.connections for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "Connections: delete as follower"
  on public.connections for delete
  to authenticated
  using (auth.uid() = follower_id);
