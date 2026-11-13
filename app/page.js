import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { serverClient } from '@/lib/supabase';
import { LogoLockup } from '@/components/Logo';
import GameCard from '@/components/GameCard';
import Social from '@/components/Social';
import UpdateTicker from '@/components/UpdateTicker';
import { fmtDate, excerpt } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const site = await getSettings();
  const sb = serverClient();
  const [{ data: games }, { data: posts }, { data: logs }] = await Promise.all([
    sb.from('games').select('*').order('featured', { ascending: false }).order('sort_order').order('created_at', { ascending: false }).limit(12),
    sb.from('posts').select('id,title,content,images,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3),
    site.showTicker
      ? sb.from('game_updates').select('id,content,created_at,games!inner(slug,title)').eq('show_in_ticker', true).order('created_at', { ascending: false }).limit(10)
      : Promise.resolve({ data: [] }),
  ]);
  const when = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const ticker = (logs || []).map((l) => {
    const p = Object.fromEntries(when.formatToParts(new Date(l.created_at)).map((x) => [x.type, x.value]));
    return { id: l.id, iso: l.created_at, when: `${p.month}.${p.day} ${p.hour}:${p.minute}`, game: l.games.title, text: l.content, href: `/games/${l.games.slug}#log` };
  });

  return (
    <>
      <UpdateTicker items={ticker} />
      <section className="hero wrap">
        <LogoLockup s={site} height={site.logoSize} />
        <h1 className="hero-title" style={{ '--hs': `${site.headlineSize}px` }}>{site.headline}</h1>
        <p className="lead hero-lead">{site.intro}</p>
        <div className="actions">
          <Link href="/pc-mobile" className="btn">PC&amp;Mobile</Link>
          <Link href="/boardgames" className="btn">보드게임</Link>
          <Link href="/contact" className="btn btn-ghost">컨택</Link>
        </div>
        <Social s={site} />
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>게임 제작 현황</h2>
          <Link href="/games" className="more">전체 보기</Link>
        </div>
        {games?.length ? (
          <div className="game-grid home-grid">{games.map((g) => <GameCard key={g.id} game={g} badgeDays={site.badgeDays} />)}</div>
        ) : (
          <p className="empty">아직 등록된 게임이 없어요. 관리자 화면에서 첫 게임을 올려보세요.</p>
        )}
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>최근 블로그</h2>
          <Link href="/blog" className="more">전체 보기</Link>
        </div>
        {posts?.length ? (
          <ul className="post-list">
            {posts.map((p) => (
              <li key={p.id}>
                <Link href={`/blog/${p.id}`} className="post-row">
                  <span className="post-date small muted">{fmtDate(p.created_at)}</span>
                  <span className="post-title">{p.title}</span>
                  <span className="post-excerpt muted">{excerpt(p.content, 70)}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">첫 글을 기다리고 있어요.</p>
        )}
      </section>
    </>
  );
}
