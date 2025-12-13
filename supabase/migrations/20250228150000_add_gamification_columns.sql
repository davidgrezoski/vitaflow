/*
  # Add Gamification Columns
  Adds support for XP, Levels, and Streaks to the user profile.

  ## Query Description: Safe addition of gamification columns to existing profiles table.
  
  ## Metadata:
  - Schema-Category: "Structural"
  - Impact-Level: "Low"
  - Requires-Backup: false
  - Reversible: true
  
  ## Structure Details:
  - profiles: +current_streak (int), +level (int), +xp (int), +last_log_date (date)
*/

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_log_date DATE;
