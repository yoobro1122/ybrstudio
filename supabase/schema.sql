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

-- 웹 트라이얼 HTML 파일
create table if not exists public.play_files (
  game_id uuid primary key references public.games(id) on delete cascade,
  file_name text not null default '',
  html text not null,
  updated_at timestamptz not null default now()
);

alter table public.play_files enable row level security;

drop policy if exists "play read" on public.play_files;
create policy "play read" on public.play_files for select using (true);
drop policy if exists "play admin" on public.play_files;
create policy "play admin" on public.play_files for all using (public.is_admin()) with check (public.is_admin());

-- 방문자 기록 + New/Up

-- 1) 게임 수정 시각: 게임 정보 수정, 개발 일지 추가, 웹 트라이얼 파일 업로드 때 자동으로 갱신돼요.
alter table public.games add column if not exists updated_at timestamptz;
update public.games set updated_at = created_at where updated_at is null;
alter table public.games alter column updated_at set default now();
alter table public.games alter column updated_at set not null;

create or replace function public.touch_game() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists games_touch on public.games;
create trigger games_touch before update on public.games
  for each row execute function public.touch_game();

create or replace function public.touch_parent_game() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.games set updated_at = now() where id = new.game_id;
  return null;
end $$;
drop trigger if exists updates_touch on public.game_updates;
create trigger updates_touch after insert or update on public.game_updates
  for each row execute function public.touch_parent_game();
drop trigger if exists play_touch on public.play_files;
create trigger play_touch after insert or update on public.play_files
  for each row execute function public.touch_parent_game();

-- 2) 방문자 기록 (IP는 저장하지 않고, 브라우저마다 임의의 번호만 저장해요)
create table if not exists public.page_views (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text not null,
  vid text not null,
  referrer text not null default ''
);
create index if not exists page_views_created_idx on public.page_views (created_at);
alter table public.page_views enable row level security;

drop policy if exists "views insert" on public.page_views;
create policy "views insert" on public.page_views for insert
  with check (char_length(path) between 1 and 300 and char_length(vid) between 8 and 64 and char_length(referrer) <= 200);
drop policy if exists "views admin" on public.page_views;
create policy "views admin" on public.page_views for all using (public.is_admin()) with check (public.is_admin());

-- 날짜별 방문자·조회수 (한국 시간 기준)
create or replace function public.visit_stats(p_days int default 30)
returns table(day date, views bigint, visitors bigint)
language sql stable security invoker as $$
  select (created_at at time zone 'Asia/Seoul')::date as day, count(*), count(distinct vid)
  from public.page_views
  where created_at >= (date_trunc('day', now() at time zone 'Asia/Seoul') - make_interval(days => p_days - 1)) at time zone 'Asia/Seoul'
  group by 1 order by 1
$$;

-- 기간 합계 (방문자는 기간 안에서 중복 없이)
create or replace function public.visit_summary(p_days int)
returns table(views bigint, visitors bigint)
language sql stable security invoker as $$
  select count(*), count(distinct vid) from public.page_views
  where p_days <= 0 or created_at >= (date_trunc('day', now() at time zone 'Asia/Seoul') - make_interval(days => p_days - 1)) at time zone 'Asia/Seoul'
$$;

-- 많이 본 페이지
create or replace function public.visit_top_pages(p_days int default 7, p_limit int default 10)
returns table(path text, views bigint, visitors bigint)
language sql stable security invoker as $$
  select path, count(*), count(distinct vid) from public.page_views
  where created_at >= (date_trunc('day', now() at time zone 'Asia/Seoul') - make_interval(days => p_days - 1)) at time zone 'Asia/Seoul'
  group by 1 order by 2 desc limit p_limit
$$;

-- 유입 경로
create or replace function public.visit_referrers(p_days int default 7, p_limit int default 10)
returns table(referrer text, visitors bigint)
language sql stable security invoker as $$
  select referrer, count(distinct vid) from public.page_views
  where referrer <> '' and created_at >= (date_trunc('day', now() at time zone 'Asia/Seoul') - make_interval(days => p_days - 1)) at time zone 'Asia/Seoul'
  group by 1 order by 2 desc limit p_limit
$$;

-- 좋아요 + 프로젝트별 조회수

create table if not exists public.game_likes (
  game_id uuid not null references public.games(id) on delete cascade,
  vid text not null,
  created_at timestamptz not null default now(),
  primary key (game_id, vid)
);
alter table public.game_likes enable row level security;
drop policy if exists "likes admin" on public.game_likes;
create policy "likes admin" on public.game_likes for select using (public.is_admin());
-- 방문자는 아래 함수로만 좋아요를 누르고 취소할 수 있어요 (다른 사람 기록은 볼 수 없어요)

create or replace function public.like_state(p_game uuid, p_vid text)
returns table(liked boolean, likes bigint)
language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.game_likes l where l.game_id = p_game and l.vid = p_vid),
         (select count(*) from public.game_likes l where l.game_id = p_game)
$$;

create or replace function public.toggle_like(p_game uuid, p_vid text)
returns table(liked boolean, likes bigint)
language plpgsql security definer set search_path = public as $$
begin
  if char_length(coalesce(p_vid, '')) not between 8 and 64 then
    raise exception 'invalid visitor';
  end if;
  if exists(select 1 from public.game_likes l where l.game_id = p_game and l.vid = p_vid) then
    delete from public.game_likes l where l.game_id = p_game and l.vid = p_vid;
  else
    insert into public.game_likes (game_id, vid) values (p_game, p_vid);
  end if;
  return query
    select exists(select 1 from public.game_likes l where l.game_id = p_game and l.vid = p_vid),
           (select count(*) from public.game_likes l where l.game_id = p_game);
end $$;

grant execute on function public.like_state(uuid, text) to anon, authenticated;
grant execute on function public.toggle_like(uuid, text) to anon, authenticated;

-- 프로젝트별 조회수 (p_days = 0 이면 전체 기간)
create or replace function public.game_stats(p_days int default 0)
returns table(slug text, title text, views bigint, visitors bigint, plays bigint, likes bigint)
language sql stable security invoker as $$
  with since as (
    select case when p_days <= 0 then '-infinity'::timestamptz
      else (date_trunc('day', now() at time zone 'Asia/Seoul') - make_interval(days => p_days - 1)) at time zone 'Asia/Seoul' end as t
  ),
  pv as (
    select split_part(v.path, '/', 2) as kind, split_part(v.path, '/', 3) as s, v.vid
    from public.page_views v, since
    where v.created_at >= since.t and (v.path like '/games/%' or v.path like '/play/%')
  )
  select g.slug, g.title,
    (select count(*) from pv where pv.kind = 'games' and pv.s = g.slug),
    (select count(distinct pv.vid) from pv where pv.kind = 'games' and pv.s = g.slug),
    (select count(*) from pv where pv.kind = 'play' and pv.s = g.slug),
    (select count(*) from public.game_likes l where l.game_id = g.id)
  from public.games g
  order by 3 desc, g.title
$$;
