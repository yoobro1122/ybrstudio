-- 웹 트라이얼 HTML 파일 저장 테이블
-- SQL Editor에서 이 파일만 한 번 실행하세요. 여러 번 실행해도 됩니다.
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
