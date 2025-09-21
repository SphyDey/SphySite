
-- Full SQL: tables, RLS, trigger, and storage policies.
-- Run this in Supabase SQL editor

drop table if exists links cascade;
drop table if exists profiles cascade;
drop function if exists public.handle_new_user cascade;

create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  updated_at timestamptz default now()
);

create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  url text not null,
  position int default 0,
  is_public boolean default true,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table links enable row level security;

create policy "Profiles are viewable by everyone" on profiles for select using (true);
create policy "Users can insert their own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on profiles for update using (auth.uid() = id);
create policy "Users can delete their own profile" on profiles for delete using (auth.uid() = id);

create policy "Anyone can view public links" on links for select using (is_public = true);
create policy "Users can view their own links" on links for select using (auth.uid() = user_id);
create policy "Users can insert their own links" on links for insert with check (auth.uid() = user_id);
create policy "Users can update their own links" on links for update using (auth.uid() = user_id);
create policy "Users can delete their own links" on links for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, bio)
  values (new.id, null, null, null, null);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- STORAGE policies for avatars bucket (create bucket 'avatars' first)
create policy "Avatars are publicly accessible" on storage.objects for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can update their own avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users can delete their own avatar" on storage.objects for delete using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
