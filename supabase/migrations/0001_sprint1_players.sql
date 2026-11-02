-- HANYU LOOP · Sprint 1 · Người chơi, nhân vật, nhiệm vụ, phần thưởng
-- Chạy toàn bộ file này một lần trong Supabase → SQL Editor.
-- Nguyên tắc: người chơi chỉ đọc được dữ liệu của chính mình,
-- và KHÔNG tự sửa được XP / xu. XP và xu chỉ thay đổi qua hàm complete_quest()
-- chạy trên server, mỗi nhiệm vụ chỉ nhận thưởng một lần.

-- =========================================================
-- 1. BẢNG
-- =========================================================

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text check (display_name is null or char_length(display_name) between 1 and 40),
  current_hsk  smallint not null default 1 check (current_hsk between 1 and 9),
  created_at   timestamptz not null default now()
);

create table if not exists public.player_profiles (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  character_type   text not null check (character_type in ('fox', 'rabbit', 'panda')),
  character_name   text not null check (char_length(character_name) between 1 and 20),
  level            integer not null default 1 check (level >= 1),
  xp               integer not null default 0 check (xp >= 0),
  coins            integer not null default 0 check (coins >= 0),
  current_location text not null default 'fox_village',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.quests (
  code        text primary key check (code ~ '^[a-z0-9_]{3,60}$'),
  title_vi    text not null,
  xp_reward   integer not null default 0 check (xp_reward between 0 and 500),
  coin_reward integer not null default 0 check (coin_reward between 0 and 500),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.quest_progress (
  user_id      uuid not null references auth.users (id) on delete cascade,
  quest_code   text not null references public.quests (code),
  completed_at timestamptz not null default now(),
  primary key (user_id, quest_code)
);

create table if not exists public.user_events (
  id         bigint generated always as identity primary key,
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  event_name text not null check (event_name ~ '^[a-z_]{3,40}$'),
  event_data jsonb not null default '{}'::jsonb check (pg_column_size(event_data) < 2000),
  created_at timestamptz not null default now()
);

create index if not exists user_events_user_created_idx
  on public.user_events (user_id, created_at desc);

-- =========================================================
-- 2. QUYỀN TRUY CẬP (Row Level Security)
-- =========================================================

alter table public.profiles        enable row level security;
alter table public.player_profiles enable row level security;
alter table public.quests          enable row level security;
alter table public.quest_progress  enable row level security;
alter table public.user_events     enable row level security;

-- Thu hồi quyền mặc định, sau đó chỉ cấp đúng những gì cần.
revoke all on public.profiles, public.player_profiles, public.quests,
              public.quest_progress, public.user_events
  from anon, authenticated;

grant select on public.profiles, public.player_profiles, public.quests,
                public.quest_progress, public.user_events
  to authenticated;
grant update (display_name, current_hsk) on public.profiles to authenticated;
grant insert (event_name, event_data) on public.user_events to authenticated;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

drop policy if exists "players: read own" on public.player_profiles;
create policy "players: read own" on public.player_profiles
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "quests: read active" on public.quests;
create policy "quests: read active" on public.quests
  for select to authenticated using (is_active);

drop policy if exists "quest_progress: read own" on public.quest_progress;
create policy "quest_progress: read own" on public.quest_progress
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "events: read own" on public.user_events;
create policy "events: read own" on public.user_events
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists "events: insert own" on public.user_events;
create policy "events: insert own" on public.user_events
  for insert to authenticated with check (user_id = (select auth.uid()));

-- =========================================================
-- 3. TỰ TẠO HỒ SƠ KHI CÓ TÀI KHOẢN MỚI
-- =========================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(left(trim(coalesce(new.raw_user_meta_data ->> 'display_name', '')), 40), '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 4. HÀM SERVER (người chơi chỉ thay đổi dữ liệu qua đây)
-- =========================================================

-- Tạo nhân vật: mỗi tài khoản chỉ một nhân vật.
create or replace function public.create_player(p_character_type text, p_character_name text)
returns public.player_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_name text := trim(coalesce(p_character_name, ''));
  v_row  public.player_profiles;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;
  if p_character_type not in ('fox', 'rabbit', 'panda') then
    raise exception 'invalid_character';
  end if;
  if char_length(v_name) < 1 or char_length(v_name) > 20 then
    raise exception 'invalid_name';
  end if;

  insert into public.player_profiles (user_id, character_type, character_name)
  values (v_uid, p_character_type, v_name)
  on conflict (user_id) do nothing
  returning * into v_row;

  if v_row.user_id is null then
    raise exception 'player_exists';
  end if;

  insert into public.user_events (user_id, event_name, event_data)
  values (v_uid, 'onboarding_completed', jsonb_build_object('character', p_character_type));

  return v_row;
end;
$$;

-- Hoàn thành nhiệm vụ: phần thưởng lấy từ bảng quests (không tin dữ liệu gửi từ trình duyệt),
-- và mỗi nhiệm vụ chỉ được thưởng một lần.
create or replace function public.complete_quest(p_quest_code text)
returns public.player_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid      uuid := auth.uid();
  v_quest    public.quests;
  v_inserted boolean := false;
  v_row      public.player_profiles;
begin
  if v_uid is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_quest from public.quests where code = p_quest_code and is_active;
  if v_quest.code is null then
    raise exception 'quest_not_found';
  end if;

  if not exists (select 1 from public.player_profiles where user_id = v_uid) then
    raise exception 'no_player';
  end if;

  insert into public.quest_progress (user_id, quest_code)
  values (v_uid, v_quest.code)
  on conflict do nothing
  returning true into v_inserted;

  if coalesce(v_inserted, false) then
    update public.player_profiles
       set xp         = xp + v_quest.xp_reward,
           coins      = coins + v_quest.coin_reward,
           level      = 1 + (xp + v_quest.xp_reward) / 100,
           updated_at = now()
     where user_id = v_uid;

    insert into public.user_events (user_id, event_name, event_data)
    values (v_uid, 'quest_completed', jsonb_build_object('quest', v_quest.code));
  end if;

  select * into v_row from public.player_profiles where user_id = v_uid;
  return v_row;
end;
$$;

revoke all on function public.handle_new_user()             from public, anon, authenticated;
revoke all on function public.create_player(text, text)     from public, anon;
revoke all on function public.complete_quest(text)          from public, anon;
grant execute on function public.create_player(text, text)  to authenticated;
grant execute on function public.complete_quest(text)       to authenticated;

-- =========================================================
-- 5. DỮ LIỆU BAN ĐẦU
-- =========================================================

insert into public.quests (code, title_vi, xp_reward, coin_reward) values
  ('welcome_fox_village', 'Chào mừng đến Fox Village', 20, 10)
on conflict (code) do nothing;
