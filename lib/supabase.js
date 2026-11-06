import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서버 컴포넌트·API용 (로그인 세션 없음, 공개 데이터만)
// revalidate(초)를 주면 그 시간 동안 결과를 저장해 두고 재사용해요. 없으면 매번 새로 읽어요.
export function serverClient({ revalidate } = {}) {
  const opts = revalidate ? { next: { revalidate } } : { cache: 'no-store' };
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, ...opts }) },
  });
}

// 브라우저용 (관리자 로그인 세션 유지)
let browser;
export function browserClient() {
  if (!browser) browser = createClient(url, key);
  return browser;
}
