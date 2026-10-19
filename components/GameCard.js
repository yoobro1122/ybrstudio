import Link from 'next/link';
import StageTrack from './StageTrack';
import { stageLabel, categoryLabel } from '@/lib/status';

export default function GameCard({ game }) {
  return (
    <Link href={`/games/${game.slug}`} className="game-card">
      <div className="box-top">
        {game.cover_url ? (
          <img src={game.cover_url} alt="" loading="lazy" />
        ) : (
          <span className="box-placeholder">{game.title}</span>
        )}
      </div>
      <div className="game-card-body">
        <p className="kind">{categoryLabel(game.category)}</p>
        <h3>{game.title}</h3>
        {game.tagline && <p className="muted">{game.tagline}</p>}
        <div className="card-track">
          <StageTrack status={game.status} compact />
          <span className="small">{stageLabel(game.status)}</span>
        </div>
      </div>
    </Link>
  );
}
