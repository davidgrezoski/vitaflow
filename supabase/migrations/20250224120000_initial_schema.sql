/*
  # Initial Schema Setup for VitaFlow

  ## Query Description:
  Creates tables for profiles, meals, water logs, and chat messages.
  Sets up Row Level Security (RLS) to ensure users only access their own data.
  Creates a trigger to automatically create a profile entry when a new user signs up.

  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "High"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - public.profiles: Stores user metrics (weight, height, goals)
  - public.meals: Stores food logs
  - public.water_logs: Stores hydration history
  - public.chat_messages: Stores chat history with NutriBot

  ## Security Implications:
  - RLS Enabled on all tables.
  - Policies created for SELECT, INSERT, UPDATE, DELETE based on auth.uid().
*/

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  name text,
  age integer,
  weight float,
  height float,
  gender text,
  activity_level text,
  goal text,
  tmb float,
  tdee float,
  water_goal float default 2500,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Meals table
create table if not exists public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  calories float not null,
  protein float not null,
  carbs float not null,
  fat float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Water logs table
create table if not exists public.water_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount float not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Chat messages table
create table if not exists public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.meals enable row level security;
alter table public.water_logs enable row level security;
alter table public.chat_messages enable row level security;

-- Policies for Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Policies for Meals
create policy "Users can view own meals" on public.meals for select using (auth.uid() = user_id);
create policy "Users can insert own meals" on public.meals for insert with check (auth.uid() = user_id);
create policy "Users can delete own meals" on public.meals for delete using (auth.uid() = user_id);

-- Policies for Water Logs
create policy "Users can view own water logs" on public.water_logs for select using (auth.uid() = user_id);
create policy "Users can insert own water logs" on public.water_logs for insert with check (auth.uid() = user_id);

-- Policies for Chat
create policy "Users can view own chat" on public.chat_messages for select using (auth.uid() = user_id);
create policy "Users can insert own chat" on public.chat_messages for insert with check (auth.uid() = user_id);

-- Trigger for new users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists to avoid duplication error on re-run
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
