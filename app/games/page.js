import { serverClient } from '@/lib/supabase';
import GameCard from '@/components/GameCard';

export const dynamic = 'force-dynamic';
export const metadata = { title: '게임' };

export default async function GamesPage() {
  const { data: games } = await serverClient()
    .from('games').select('*').order('sort_order').order('created_at', { ascending: false });

  return (
    <section className="section wrap page-top">
      <h1>게임</h1>
      <p className="lead">직접 기획하고 테스트하고 있는 게임들이에요. 웹 테스트가 열린 게임은 바로 플레이해볼 수 있어요.</p>
      {games?.length ? (
        <div className="game-grid">{games.map((g) => <GameCard key={g.id} game={g} />)}</div>
      ) : (
        <p className="empty">아직 등록된 게임이 없어요.</p>
      )}
    </section>
  );
}
