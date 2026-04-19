-- Add if your project predates the connections feature.

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
