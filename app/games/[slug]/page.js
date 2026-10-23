import { notFound } from 'next/navigation';
import { serverClient } from '@/lib/supabase';
import StageTrack from '@/components/StageTrack';
import ReviewForm from '@/components/ReviewForm';
import { fmtDate, stars } from '@/lib/format';
import { categoryLabel } from '@/lib/status';
import { getSettings } from '@/lib/settings';
import { pageMeta, abs, siteUrl, plain } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import LikeShare from '@/components/LikeShare';
import { badgeFor, BADGE_LABEL } from '@/lib/badge';

export const dynamic = 'force-dynamic';

async function getGame(slug) {
  const { data } = await serverClient().from('games').select('*').eq('slug', slug).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const game = await getGame(params.slug);
  if (!game) return {};
  const s = await getSettings();
  const desc = [game.tagline, game.description].filter(Boolean).join(' ');
  return pageMeta(s, { title: game.title, description: `${categoryLabel(game.category)} · ${desc || game.title}`, path: `/games/${game.slug}`, image: game.cover_url });
}

export default async function GamePage({ params }) {
  const game = await getGame(params.slug);
  if (!game) notFound();

  const sb = serverClient();
  const [{ data: updates }, { data: reviews }, { data: playFile }] = await Promise.all([
    sb.from('game_updates').select('*').eq('game_id', game.id).order('created_at', { ascending: false }),
    sb.from('reviews').select('id,nickname,rating,content,created_at').eq('game_id', game.id).eq('status', 'approved').order('created_at', { ascending: false }),
    sb.from('play_files').select('game_id').eq('game_id', game.id).maybeSingle(),
  ]);
  const { data: likeRow } = await sb.rpc('like_state', { p_game: game.id, p_vid: '' });
  const initialLikes = Number(likeRow?.[0]?.likes || 0);
  const playHref = playFile ? `/play/${game.slug}` : game.play_url;
  const avg = reviews?.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const meta = [
    game.players && ['인원', game.players],
    game.play_time && ['시간', game.play_time],
    game.age && ['연령', game.age],
  ].filter(Boolean);

  const s = await getSettings();
  const badge = badgeFor(game, s.badgeDays);
  const nums = String(game.players || '').match(/\d+/g) || [];
  const ld = {
    '@context': 'https://schema.org',
    '@type': game.category === 'digital' ? 'VideoGame' : 'Game',
    name: game.title,
    description: plain([game.tagline, game.description].filter(Boolean).join(' '), 300),
    url: `${siteUrl()}/games/${game.slug}`,
    ...(game.cover_url ? { image: abs(game.cover_url) } : {}),
    ...(nums.length ? { numberOfPlayers: { '@type': 'QuantitativeValue', minValue: +nums[0], maxValue: +(nums[1] || nums[0]) } } : {}),
    ...(game.category === 'digital' ? { gamePlatform: ['PC', 'Mobile'] } : {}),
    inLanguage: 'ko',
    publisher: { '@id': `${siteUrl()}/#org` },
  };

  return (
    <article className="wrap page-top game-detail">
      <JsonLd data={ld} />
      <div className="game-hero">
        <div className="box-top big">
          {game.cover_url ? <img src={game.cover_url} alt={`${game.title} 커버`} /> : <span className="box-placeholder">{game.title}</span>}
        </div>
        <div className="game-info">
          <p className="kind">{categoryLabel(game.category)}{badge && <span className={`flag-inline flag-${badge}`}>{BADGE_LABEL[badge]}</span>}</p>
          <h1>{game.title}</h1>
          {game.tagline && <p className="lead">{game.tagline}</p>}
          {meta.length > 0 && (
            <dl className="meta">
              {meta.map(([k, v]) => (<div key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
            </dl>
          )}
          <div className="detail-track">
            <h2 className="h-small">개발 현황</h2>
            <StageTrack status={game.status} />
          </div>
          {playHref ? (
            <a href={playHref} target={playFile ? undefined : '_blank'} rel="noopener noreferrer" className="btn btn-point">웹에서 플레이하기</a>
          ) : (
            <p className="small muted">웹 테스트 버전은 준비 중이에요.</p>
          )}
          <LikeShare gameId={game.id} initialLikes={initialLikes} title={`${game.title} | ${s.siteName}`} text={game.tagline || ''} path={`/games/${game.slug}`} />
        </div>
      </div>

      {game.description && (
        <section className="section">
          <h2>어떤 게임인가요</h2>
          <div className="prose">{game.description}</div>
        </section>
      )}

      {updates?.length > 0 && (
        <section className="section">
          <h2>개발 일지</h2>
          <ol className="log">
            {updates.map((u) => (
              <li key={u.id}><time className="small muted">{fmtDate(u.created_at)}</time><p>{u.content}</p></li>
            ))}
          </ol>
        </section>
      )}

      <section className="section" id="review">
        <div className="section-head">
          <h2>플레이 후기</h2>
          {reviews?.length > 0 && <span className="muted"><span className="stars">{stars(avg)}</span> {avg.toFixed(1)} · {reviews.length}개</span>}
        </div>
        {reviews?.length ? (
          <ul className="reviews">
            {reviews.map((r) => (
              <li key={r.id}>
                <div className="review-head"><strong>{r.nickname}</strong><span className="stars">{stars(r.rating)}</span></div>
                <p>{r.content}</p>
                <time className="small muted">{fmtDate(r.created_at)}</time>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">첫 후기를 남겨주세요.</p>
        )}
        <div className="review-form">
          <h3>후기 남기기</h3>
          <ReviewForm gameId={game.id} />
        </div>
      </section>
    </article>
  );
}
