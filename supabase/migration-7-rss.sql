-- 블로그 글별 "RSS에 포함" 선택 (기본: 포함)
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.
alter table public.posts add column if not exists include_in_rss boolean not null default true;
