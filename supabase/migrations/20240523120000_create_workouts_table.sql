/*
  # Create Workouts Table
  Creates a table to store generated workouts for users.

  ## Metadata:
  - Schema-Category: "Safe"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true

  ## Structure Details:
  - Table: workouts
  - Columns: id, user_id, name, muscle_group, exercises (JSONB), created_at
  - RLS: Enabled (Users can only see their own workouts)
*/

create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  muscle_group text not null,
  exercises jsonb not null,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.workouts enable row level security;

-- Policies
create policy "Users can view their own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);
