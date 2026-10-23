-- 방문자 기록 + New/Up 표시용 수정 시각
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.

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
