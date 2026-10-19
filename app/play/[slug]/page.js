import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

async function load(slug) {
  const sb = serverClient();
  const { data: game } = await sb.from('games').select('id,slug,title').eq('slug', slug).maybeSingle();
  if (!game) return null;
  const { data: file } = await sb.from('play_files').select('game_id').eq('game_id', game.id).maybeSingle();
  return file ? game : null;
}

export async function generateMetadata({ params }) {
  const game = await load(params.slug);
  return game ? { title: `${game.title} 웹 트라이얼` } : {};
}

export default async function PlayPage({ params }) {
  const game = await load(params.slug);
  if (!game) notFound();
  const raw = `/play/${game.slug}/raw`;

  return (
    <section className="play">
      <div className="wrap play-bar">
        <Link href={`/games/${game.slug}`} className="more">게임 소개로</Link>
        <strong>{game.title}</strong>
        <span className="play-actions">
          <a href={raw} target="_blank" rel="noopener" className="btn btn-ghost btn-sm">새 창으로 열기</a>
          <Link href={`/games/${game.slug}#review`} className="btn btn-sm">후기 남기기</Link>
        </span>
      </div>
      <iframe
        src={raw}
        title={`${game.title} 웹 트라이얼`}
        className="play-frame"
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"
        allow="fullscreen; autoplay"
      />
    </section>
  );
}
