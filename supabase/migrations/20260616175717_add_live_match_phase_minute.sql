alter table public.matches
  add column if not exists phase text,
  add column if not exists match_minute int;
