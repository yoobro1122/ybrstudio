-- 게임 비공개 전환 + 메인 업데이트 로그
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.
-- (migration-4, migration-5를 먼저 실행해야 해요)

-- 1) 공개 여부 (기본: 공개)
alter table public.games add column if not exists is_public boolean not null default true;

-- 비공개 게임은 관리자만 볼 수 있어요. 게임 소개, 목록, 사이트맵, RSS, 웹 플레이, 업데이트 로그 모두에서 빠져요.
drop policy if exists "games read" on public.games;
create policy "games read" on public.games for select using (is_public or public.is_admin());

drop policy if exists "updates read" on public.game_updates;
create policy "updates read" on public.game_updates for select
  using (exists (select 1 from public.games g where g.id = game_id and (g.is_public or public.is_admin())));

drop policy if exists "play read" on public.play_files;
create policy "play read" on public.play_files for select
  using (exists (select 1 from public.games g where g.id = game_id and (g.is_public or public.is_admin())));

drop policy if exists "reviews read approved" on public.reviews;
create policy "reviews read approved" on public.reviews for select
  using (status = 'approved' and exists (select 1 from public.games g where g.id = game_id and g.is_public));

-- 2) 공개/비공개 전환, 메인 노출, 정렬 순서만 바꿀 때는 Up 표시가 붙지 않게 해요.
create or replace function public.touch_game() returns trigger language plpgsql as $$
begin
  if (to_jsonb(new) - 'updated_at' - 'is_public' - 'featured' - 'sort_order')
     = (to_jsonb(old) - 'updated_at' - 'is_public' - 'featured' - 'sort_order') then
    new.updated_at := old.updated_at;
  else
    new.updated_at := now();
  end if;
  return new;
end $$;

-- 3) 개발 일지별 "메인 업데이트 로그에 표시" (기본: 표시)
alter table public.game_updates add column if not exists show_in_ticker boolean not null default true;
