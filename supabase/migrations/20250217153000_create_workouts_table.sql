/*
  # Create Workouts Table

  ## Query Description:
  Creates a table to store generated workouts for users.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Medium"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - Table: workouts
  - Columns: id, user_id, name, muscle_group, exercises (jsonb), created_at
  
  ## Security Implications:
  - RLS Enabled
  - Policies for Select, Insert, Delete for owner
*/

create table if not exists public.workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  muscle_group text not null,
  exercises jsonb not null,
  created_at timestamptz default now()
);

alter table public.workouts enable row level security;

create policy "Users can view their own workouts"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "Users can create their own workouts"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own workouts"
  on public.workouts for delete
  using (auth.uid() = user_id);
