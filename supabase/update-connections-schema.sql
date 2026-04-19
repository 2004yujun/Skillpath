-- Run this in the Supabase SQL Editor (Dashboard -> SQL) to create/update the connections table

-- Drop existing connections table if it exists with wrong structure
DROP TABLE IF EXISTS public.connections CASCADE;

-- Create connections table with correct structure
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users (id) on delete cascade,
  following_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz default now(),
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
