-- Weekly Compass schema. Applied to Supabase project "knew-it".
-- Login codes are inserted separately and are not kept in the repo.
create extension if not exists pgcrypto with schema extensions;

create table public.planner_users (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text,
  created_at timestamptz not null default now()
);

create table public.planner_sessions (
  token text primary key,
  user_id uuid not null references public.planner_users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index planner_sessions_user_idx on public.planner_sessions(user_id);

create table public.planner_profiles (
  user_id uuid primary key references public.planner_users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.planner_weeks (
  user_id uuid not null references public.planner_users(id) on delete cascade,
  week_start date not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, week_start)
);

-- Locked down: RLS on, no policies. Access only via security-definer RPCs below.
alter table public.planner_users enable row level security;
alter table public.planner_sessions enable row level security;
alter table public.planner_profiles enable row level security;
alter table public.planner_weeks enable row level security;

create or replace function public.planner_uid(p_token text)
returns uuid language sql stable security definer set search_path = '' as $$
  select s.user_id from public.planner_sessions s
  where s.token = p_token and s.created_at > now() - interval '90 days'
$$;

create or replace function public.planner_login(p_code text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_uid uuid; v_token text;
begin
  select id into v_uid from public.planner_users where code = upper(trim(p_code));
  if v_uid is null then return null; end if;
  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.planner_sessions(token, user_id) values (v_token, v_uid);
  return v_token;
end $$;

create or replace function public.planner_logout(p_token text)
returns void language sql security definer set search_path = '' as $$
  delete from public.planner_sessions where token = p_token
$$;

create or replace function public.planner_get_profile(p_token text)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_uid uuid := public.planner_uid(p_token);
begin
  if v_uid is null then raise exception 'unauthorized'; end if;
  return coalesce((select data from public.planner_profiles where user_id = v_uid), '{}'::jsonb);
end $$;

create or replace function public.planner_save_profile(p_token text, p_data jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := public.planner_uid(p_token);
begin
  if v_uid is null then raise exception 'unauthorized'; end if;
  insert into public.planner_profiles(user_id, data, updated_at) values (v_uid, p_data, now())
  on conflict (user_id) do update set data = excluded.data, updated_at = now();
end $$;

create or replace function public.planner_get_week(p_token text, p_week date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare v_uid uuid := public.planner_uid(p_token);
begin
  if v_uid is null then raise exception 'unauthorized'; end if;
  return coalesce((select data from public.planner_weeks where user_id = v_uid and week_start = p_week), '{}'::jsonb);
end $$;

create or replace function public.planner_save_week(p_token text, p_week date, p_data jsonb)
returns void language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := public.planner_uid(p_token);
begin
  if v_uid is null then raise exception 'unauthorized'; end if;
  insert into public.planner_weeks(user_id, week_start, data, updated_at) values (v_uid, p_week, p_data, now())
  on conflict (user_id, week_start) do update set data = excluded.data, updated_at = now();
end $$;

revoke all on function public.planner_uid(text) from public, anon, authenticated;
revoke all on function public.planner_login(text) from public, authenticated;
revoke all on function public.planner_logout(text) from public, authenticated;
revoke all on function public.planner_get_profile(text) from public, authenticated;
revoke all on function public.planner_save_profile(text, jsonb) from public, authenticated;
revoke all on function public.planner_get_week(text, date) from public, authenticated;
revoke all on function public.planner_save_week(text, date, jsonb) from public, authenticated;
grant execute on function public.planner_login(text) to anon;
grant execute on function public.planner_logout(text) to anon;
grant execute on function public.planner_get_profile(text) to anon;
grant execute on function public.planner_save_profile(text, jsonb) to anon;
grant execute on function public.planner_get_week(text, date) to anon;
grant execute on function public.planner_save_week(text, date, jsonb) to anon;
