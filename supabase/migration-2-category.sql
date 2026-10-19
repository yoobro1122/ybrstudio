-- 이미 schema.sql을 실행한 프로젝트용: 게임 종류(PC&Mobile / 보드게임) 칸 추가
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.
alter table public.games
  add column if not exists category text not null default 'board';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'games_category_check') then
    alter table public.games
      add constraint games_category_check check (category in ('digital','board'));
  end if;
end $$;
