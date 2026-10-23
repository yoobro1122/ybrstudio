# YOOBROS STUDIO 홈페이지

Next.js 14 + Supabase + Vercel. PC&Mobile·보드게임 소개(개발 현황·웹 테스트·후기), 블로그, 컨택, 관리자(/admin).

## 1. Supabase 새 프로젝트
1. supabase.com에서 새 프로젝트 생성 (Region: Northeast Asia (Seoul))
2. `supabase/schema.sql`을 열어 `'you@example.com'`을 **관리자 로그인 이메일**로 바꾸기
3. SQL Editor에 전체 붙여넣고 Run
4. Authentication > Users > Add user > Create new user (위와 같은 이메일, 비밀번호, Auto Confirm 체크)
5. Authentication > Sign In / Providers > Email 에서 **Allow new users to sign up 끄기**
6. Project Settings > API 에서 Project URL, anon public key 복사

## 2. Resend (문의 메일 받기)
1. resend.com 가입 > API Keys > Create
2. 도메인 연결 전에는 `onboarding@resend.dev` 발신만 가능하고, **Resend 가입 이메일로만** 받을 수 있어요. CONTACT_TO_EMAIL을 가입 이메일로 두세요.
3. 도메인 구입 후 Resend > Domains에서 도메인 인증 → RESEND_FROM을 `YOOBROS STUDIO <hello@내도메인>`으로 변경

## 3. GitHub + Vercel
1. GitHub에 새 저장소(예: ybr-studio) 만들고, 이 폴더 안의 파일 전체를 웹 업로드로 드래그
2. Vercel > Add New Project > 저장소 선택
3. Environment Variables에 `.env.example`의 5개 값 입력 후 Deploy

| 이름 | 값 |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon public key |
| RESEND_API_KEY | Resend API key |
| CONTACT_TO_EMAIL | 문의 받을 이메일 |
| RESEND_FROM | `YOOBROS STUDIO <onboarding@resend.dev>` |

## 4. 사용
- `/admin` 에서 로그인 → 게임 추가, 블로그 글쓰기, 후기 공개/숨김, 문의 확인
- 로고·색상·문구·연락처·푸터: 관리자 > 사이트 설정 (`site.config.js`는 기본값)
- 후기는 작성 즉시 '검토 대기'로 저장되고, 관리자가 공개해야 게임 페이지에 보여요
- 문의는 메일로 오고, 관리자 > 문의에도 쌓여요

## 5. 도메인
Vercel > 프로젝트 > Settings > Domains 에서 구입한 도메인 추가 후 안내되는 DNS 레코드를 도메인 업체에 등록

## 업데이트 기록
- v2: 사이트명 YOOBROS STUDIO, PC&Mobile/보드게임 메뉴 분리, 메인 게임 12개 노출, 2인 컨택.
  이미 DB를 만든 경우 `supabase/migration-2-category.sql`을 SQL Editor에서 한 번 실행하세요.
  연락처는 `site.config.js`의 people에 입력 (비워두면 표시 안 됨).
- v3: 관리자 > 사이트 설정 추가 (로고 이미지, 배경·메인·포인트 컬러, 사이트 문구, 연락처, 푸터).
  이미 DB를 만든 경우 `supabase/migration-3-settings.sql`을 SQL Editor에서 한 번 실행하세요.
  기기 설정에 따른 자동 다크 모드는 꺼지고, 관리자가 정한 색이 항상 적용돼요.
- v4: 웹 트라이얼 HTML 업로드. 관리자 > 게임 > 수정에서 HTML 파일을 올리면 /play/게임주소 에서 플레이돼요.
  이미 DB를 만든 경우 `supabase/migration-4-play-files.sql`을 SQL Editor에서 한 번 실행하세요.
  업로드한 게임은 격리된 환경에서 실행돼서 사이트 로그인 정보에 접근할 수 없어요. 그래서 게임 안에서 localStorage 저장 기능은 동작하지 않아요.
- v5: 모바일 최적화. 760px 이하에서 햄버거 메뉴, 로고 확대, 간격 정리, 메인 게임 6개 노출.
- v6: 웹 트라이얼을 화면 전체로 열고, 게임 안 종료 버튼(yoobros-exit 신호)으로 게임 소개로 돌아가요. 종료 버튼이 없는 게임 파일은 2초 뒤 오른쪽 위에 기본 종료 버튼이 나타나요.
- v7: SEO(페이지별 제목·설명·공유 미리보기, sitemap.xml, robots.txt, rss.xml, 구조화 데이터, 서치콘솔·서치어드바이저 확인 코드)와 스튜디오 SNS(인스타그램·X) 링크. 도메인 연결 시 Vercel 환경변수 NEXT_PUBLIC_SITE_URL에 https://새도메인 을 넣고 다시 배포하세요.
- v8: 관리자 > 방문자 탭(날짜별 방문자·조회수, 많이 본 페이지, 유입 경로)과 게임 New·Up 표시. 이미 DB를 만든 경우 supabase/migration-5-visits-badges.sql을 한 번 실행하세요.
- v9: 게임 좋아요(브라우저당 1회, 다시 누르면 취소)·공유하기 버튼, 관리자 프로젝트별 조회수. 이미 DB를 만든 경우 supabase/migration-6-likes-stats.sql을 한 번 실행하세요(migration-5 다음에).
