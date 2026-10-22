import { serverClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// 업로드한 HTML을 그대로 보내되, 격리된 환경(sandbox)에서만 실행되게 합니다.
// 게임 코드는 이 사이트의 로그인 정보나 다른 페이지에 접근할 수 없어요.
export async function GET(_req, { params }) {
  const sb = serverClient();
  const { data: game } = await sb.from('games').select('id').eq('slug', params.slug).maybeSingle();
  const { data: file } = game
    ? await sb.from('play_files').select('html').eq('game_id', game.id).maybeSingle()
    : { data: null };

  if (!file?.html) {
    return new Response('웹 트라이얼 파일이 없어요.', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  return new Response(file.html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': 'sandbox allow-scripts allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
