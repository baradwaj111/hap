-- Hap: initial schema
-- Two accounts share this database: an "admin" (manages settings/memes) and
-- "user" (her — the only account with personal companion data). Her personal
-- tables are locked to her own auth.uid() with no admin bypass, so admin
-- literally cannot read them through the API (not just hidden in the UI).
-- To open that up later, add one more USING clause to those policies —
-- nothing else needs to change.

create extension if not exists pgcrypto;

-- ---------- profiles (role lookup) ----------

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'user')),
  display_name text not null,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "read own profile"
  on profiles for select
  using (auth.uid() = id);

-- SECURITY DEFINER so policies on other tables can check role without
-- recursively hitting RLS on profiles itself.
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- her personal data ----------

create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  ml int not null,
  at bigint not null
);

create table if not exists meal_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  slot text not null check (slot in ('morning', 'afternoon', 'evening')),
  status text not null check (status in ('yes', 'small', 'notYet')),
  note text,
  at bigint not null
);

create table if not exists moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  weather text not null check (weather in ('sunny', 'cloudy', 'rainy', 'stormy', 'rainbow')),
  note text,
  at bigint not null
);

create table if not exists journal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  text text not null,
  prompt_used text,
  at bigint not null
);

create table if not exists days_closed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  summary_snapshot jsonb not null,
  at bigint not null,
  unique (user_id, date)
);

create table if not exists panic_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date text not null,
  duration_sec int not null,
  at bigint not null
);

alter table water_logs enable row level security;
alter table meal_checks enable row level security;
alter table moods enable row level security;
alter table journal enable row level security;
alter table days_closed enable row level security;
alter table panic_sessions enable row level security;

create policy "own rows only" on water_logs for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on meal_checks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on moods for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on journal for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on days_closed for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on panic_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------- shared app config (admin-managed) ----------

create table if not exists settings (
  key text primary key,
  value jsonb not null
);

alter table settings enable row level security;

create policy "anyone signed in can read settings"
  on settings for select
  using (auth.role() = 'authenticated');

create policy "only admin can write settings"
  on settings for all
  using (is_admin()) with check (is_admin());

-- ---------- meme links (admin-added, both can read) ----------

create table if not exists meme_links (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  kind text not null check (kind in ('instagram', 'youtube')),
  added_at timestamptz not null default now()
);

alter table meme_links enable row level security;

create policy "anyone signed in can read meme links"
  on meme_links for select
  using (auth.role() = 'authenticated');

create policy "only admin can manage meme links"
  on meme_links for all
  using (is_admin()) with check (is_admin());
