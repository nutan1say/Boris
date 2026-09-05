-- Boris profiles + leaderboard
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  display_name text,
  avatar_url text,
  best_deaths integer,
  best_coins integer,
  best_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_leaderboard_idx
  on public.profiles (best_deaths asc nulls last, best_coins desc nulls last);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

alter table public.profiles enable row level security;

-- Public leaderboard reads
drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

-- Localhost-friendly writes via anon key (Clerk gates /play in the app).
-- For production, switch to Clerk JWT → Supabase third-party auth and tighten these.
drop policy if exists "profiles_insert_anon" on public.profiles;
create policy "profiles_insert_anon"
  on public.profiles
  for insert
  to anon, authenticated
  with check (clerk_user_id is not null and length(clerk_user_id) > 0);

drop policy if exists "profiles_update_anon" on public.profiles;
create policy "profiles_update_anon"
  on public.profiles
  for update
  to anon, authenticated
  using (clerk_user_id is not null and length(clerk_user_id) > 0)
  with check (clerk_user_id is not null and length(clerk_user_id) > 0);
