import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverClient } from '@/lib/supabase';
import { fmtDate } from '@/lib/format';
import { getSettings } from '@/lib/settings';
import { pageMeta, abs, siteUrl, plain } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';
import PostBody from '@/components/PostBody';
import { bodyImages } from '@/lib/post-body';

export const dynamic = 'force-dynamic';

async function getPost(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await serverClient().from('posts').select('*').eq('id', id).eq('published', true).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.id);
  if (!post) return {};
  const s = await getSettings();
  return pageMeta(s, {
    title: post.title, description: post.content || post.title, path: `/blog/${post.id}`, image: post.images?.[0] || bodyImages(post.content)[0], type: 'article',
    extra: { publishedTime: new Date(post.created_at).toISOString() },
  });
}

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  if (!post) notFound();
  const inBody = new Set(bodyImages(post.content));
  const topImages = (post.images || []).filter((src) => !inBody.has(src));
  const allImages = [...new Set([...(post.images || []), ...inBody])];
  return (
    <article className="wrap page-top post">
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BlogPosting',
        headline: post.title, description: plain(post.content, 200),
        datePublished: new Date(post.created_at).toISOString(),
        ...(allImages.length ? { image: allImages.map(abs) } : {}),
        mainEntityOfPage: `${siteUrl()}/blog/${post.id}`, inLanguage: 'ko',
        author: { '@id': `${siteUrl()}/#org` }, publisher: { '@id': `${siteUrl()}/#org` },
      }} />
      <Link href="/blog" className="more">블로그 목록</Link>
      <h1>{post.title}</h1>
      <time className="muted">{fmtDate(post.created_at)}</time>
      {topImages.length > 0 && (
        <div className="post-images">
          {topImages.map((src, i) => <img key={src} src={src} alt={`${post.title} 사진 ${i + 1}`} loading={i ? 'lazy' : undefined} />)}
        </div>
      )}
      <PostBody content={post.content} title={post.title} />
    </article>
  );
}
