-- 프로젝트 좋아요 + 프로젝트별 조회수
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.
-- (migration-5-visits-badges.sql을 먼저 실행해야 해요)

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
