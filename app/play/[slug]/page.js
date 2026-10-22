import { notFound } from 'next/navigation';
import { serverClient } from '@/lib/supabase';
import PlayFrame from '@/components/PlayFrame';

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
  return game ? { title: `${game.title} 웹 트라이얼`, robots: { index: false, follow: true } } : {};
}

export default async function PlayPage({ params }) {
  const game = await load(params.slug);
  if (!game) notFound();
  return <PlayFrame slug={game.slug} title={game.title} src={`/play/${game.slug}/raw`} />;
}
