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
