import { serverClient } from '@/lib/supabase';
import { siteUrl } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = siteUrl();
  const sb = serverClient();
  const [{ data: games }, { data: posts }] = await Promise.all([
    sb.from('games').select('*'),
    sb.from('posts').select('id,created_at').eq('published', true),
  ]);
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pc-mobile`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/boardgames`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/games`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    ...(games || []).map((g) => ({ url: `${base}/games/${g.slug}`, lastModified: new Date(g.updated_at || g.created_at), changeFrequency: 'weekly', priority: 0.9 })),
    ...(posts || []).map((p) => ({ url: `${base}/blog/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
