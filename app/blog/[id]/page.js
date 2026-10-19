import Link from 'next/link';
import { notFound } from 'next/navigation';
import { serverClient } from '@/lib/supabase';
import { fmtDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

async function getPost(id) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await serverClient().from('posts').select('*').eq('id', id).eq('published', true).maybeSingle();
  return data;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.id);
  return post ? { title: post.title } : {};
}

export default async function PostPage({ params }) {
  const post = await getPost(params.id);
  if (!post) notFound();
  return (
    <article className="wrap page-top post">
      <Link href="/blog" className="more">블로그 목록</Link>
      <h1>{post.title}</h1>
      <time className="muted">{fmtDate(post.created_at)}</time>
      {post.images?.length > 0 && (
        <div className="post-images">
          {post.images.map((src) => <img key={src} src={src} alt="" />)}
        </div>
      )}
      <div className="prose">{post.content}</div>
    </article>
  );
}
