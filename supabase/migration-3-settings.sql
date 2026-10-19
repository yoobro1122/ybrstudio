-- 사이트 설정(로고, 색상, 문구, 연락처, 푸터) 저장 테이블
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.
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
