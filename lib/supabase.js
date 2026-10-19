import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 서버 컴포넌트·API용 (로그인 세션 없음, 공개 데이터만)
export function serverClient() {
  return createClient(url, key, {
    auth: { persistSession: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }) },
  });
}

// 브라우저용 (관리자 로그인 세션 유지)
let browser;
export function browserClient() {
  if (!browser) browser = createClient(url, key);
  return browser;
}
