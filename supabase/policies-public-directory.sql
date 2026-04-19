-- Run in Supabase SQL Editor if you already applied schema.sql without public reads.
-- Enables the home page to list all profiles and skills (public directory).

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
