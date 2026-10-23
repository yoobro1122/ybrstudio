import { serverClient } from '@/lib/supabase';
import GameCard from './GameCard';
import { getSettings } from '@/lib/settings';

export default async function GameList({ title, lead, category }) {
  let q = serverClient().from('games').select('*')
    .order('featured', { ascending: false }).order('sort_order').order('created_at', { ascending: false });
  if (category) q = q.eq('category', category);
  const [{ data: games }, s] = await Promise.all([q, getSettings()]);

  return (
    <section className="section wrap page-top">
      <h1>{title}</h1>
      {lead && <p className="lead">{lead}</p>}
      {games?.length ? (
        <div className="game-grid">{games.map((g) => <GameCard key={g.id} game={g} badgeDays={s.badgeDays} />)}</div>
      ) : (
        <p className="empty">아직 등록된 게임이 없어요.</p>
      )}
    </section>
  );
}
