import Link from 'next/link';
import { serverClient } from '@/lib/supabase';
import { fmtDate, excerpt } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';

export const dynamic = 'force-dynamic';
export async function generateMetadata() {
  const s = await getSettings();
  return pageMeta(s, { title: '블로그', description: `${s.siteName} 블로그. 개발하면서 생긴 일, 테스트 플레이 기록, 그 밖의 이야기들.`, path: '/blog' });
}

export default async function BlogPage() {
  const { data: posts } = await serverClient()
    .from('posts').select('id,title,content,images,created_at').eq('published', true).order('created_at', { ascending: false });

  return (
    <section className="section wrap page-top">
      <h1>블로그</h1>
      <p className="lead">개발하면서 생긴 일, 테스트 플레이 기록, 그 밖의 이야기들.</p>
      {posts?.length ? (
        <ul className="blog-list">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/blog/${p.id}`} className="blog-item">
                <div className="thumb">{p.images?.[0] ? <img src={p.images[0]} alt={p.title} loading="lazy" /> : null}</div>
                <div>
                  <time className="small muted">{fmtDate(p.created_at)}</time>
                  <h2 className="blog-title">{p.title}</h2>
                  <p className="muted">{excerpt(p.content, 110)}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">아직 글이 없어요.</p>
      )}
    </section>
  );
}
