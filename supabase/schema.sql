-- YOOBROS STUDIO 데이터베이스 설정
-- Supabase 대시보드 > SQL Editor에 전체를 붙여넣고 Run 하세요.
-- 여러 번 실행해도 됩니다.
-- ⚠️ 아래 is_admin() 안의 이메일을 관리자 로그인 이메일로 바꾼 뒤 실행하세요.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'you@example.com'
$$;

-- 게임
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text default '',
  description text default '',
  players text default '',
  play_time text default '',
  age text default '',
  category text not null default 'board'
    check (category in ('digital','board')),
  status text not null default 'idea'
    check (status in ('idea','prototype','playtest','polish','released')),
  play_url text default '',
  cover_url text default '',
  featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- 개발 일지
create table if not exists public.game_updates (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- 후기
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  nickname text not null,
  rating int not null check (rating between 1 and 5),
  content text not null,
  status text not null default 'pending'
    check (status in ('pending','approved','hidden')),
  created_at timestamptz not null default now()
);

-- 블로그
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text default '',
  images text[] not null default '{}',
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- 문의
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text default '',
  content text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.games enable row level security;
alter table public.game_updates enable row level security;
alter table public.reviews enable row level security;
alter table public.posts enable row level security;
alter table public.messages enable row level security;

-- 게임 / 개발 일지: 누구나 보기, 관리자만 수정
drop policy if exists "games read" on public.games;
create policy "games read" on public.games for select using (true);
drop policy if exists "games admin" on public.games;
create policy "games admin" on public.games for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "updates read" on public.game_updates;
create policy "updates read" on public.game_updates for select using (true);
drop policy if exists "updates admin" on public.game_updates;
create policy "updates admin" on public.game_updates for all using (public.is_admin()) with check (public.is_admin());

-- 후기: 공개 승인된 것만 보기, 누구나 '검토 대기'로만 작성 가능
drop policy if exists "reviews read approved" on public.reviews;
create policy "reviews read approved" on public.reviews for select using (status = 'approved');
drop policy if exists "reviews insert pending" on public.reviews;
create policy "reviews insert pending" on public.reviews for insert
  with check (
    status = 'pending'
    and char_length(nickname) between 1 and 20
    and char_length(content) between 1 and 500
  );
drop policy if exists "reviews admin" on public.reviews;
create policy "reviews admin" on public.reviews for all using (public.is_admin()) with check (public.is_admin());

-- 블로그: 공개 글만 보기
drop policy if exists "posts read" on public.posts;
create policy "posts read" on public.posts for select using (published);
drop policy if exists "posts admin" on public.posts;
create policy "posts admin" on public.posts for all using (public.is_admin()) with check (public.is_admin());

-- 문의: 누구나 보내기, 관리자만 보기
drop policy if exists "messages insert" on public.messages;
create policy "messages insert" on public.messages for insert
  with check (
    is_read = false
    and char_length(name) between 1 and 50
    and char_length(email) between 3 and 200
    and char_length(content) between 1 and 3000
  );
drop policy if exists "messages admin" on public.messages;
create policy "messages admin" on public.messages for all using (public.is_admin()) with check (public.is_admin());

-- 이미지 저장소
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images admin insert" on storage.objects;
create policy "images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and public.is_admin());
drop policy if exists "images admin update" on storage.objects;
create policy "images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'images' and public.is_admin());
drop policy if exists "images admin delete" on storage.objects;
create policy "images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'images' and public.is_admin());

-- 사이트 설정
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings read" on public.site_settings;
create policy "settings read" on public.site_settings for select using (true);
drop policy if exists "settings admin" on public.site_settings;
create policy "settings admin" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());
