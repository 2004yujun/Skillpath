-- Run once if your project already has schema.sql applied without certifications.

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
