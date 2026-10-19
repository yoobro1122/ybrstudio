import Link from 'next/link';
import site from '@/site.config';
import { serverClient } from '@/lib/supabase';
import { LogoLockup } from '@/components/Logo';
import GameCard from '@/components/GameCard';
import { fmtDate, excerpt } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const sb = serverClient();
  const [{ data: games }, { data: posts }] = await Promise.all([
    sb.from('games').select('*').order('featured', { ascending: false }).order('sort_order').order('created_at', { ascending: false }).limit(3),
    sb.from('posts').select('id,title,content,images,created_at').eq('published', true).order('created_at', { ascending: false }).limit(3),
  ]);

  return (
    <>
      <section className="hero wrap">
        <LogoLockup height={88} />
        <h1 className="hero-title">{site.headline}</h1>
        <p className="lead">{site.intro}</p>
        <div className="actions">
          <Link href="/games" className="btn">GAMES</Link>
          <Link href="/contact" className="btn btn-ghost">CONTACT</Link>
        </div>
      </section>

      <section className="section wrap">
        <div className="section-head">
          <h2>보드게임 제작 현황</h2>
          <Link href="/games" className="more">전체 보기</Link>
        </div>
        {games?.length ? (
          <div className="game-grid">{games.map((g) => <GameCard key={g.id} game={g} />)}</div>
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
