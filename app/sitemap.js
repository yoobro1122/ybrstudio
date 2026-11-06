import { serverClient } from '@/lib/supabase';
import { siteUrl, setPrimaryDomain } from '@/lib/seo';
import { mergeSettings } from '@/lib/settings-shared';

// 1시간마다 Supabase에서 게임·블로그 글을 다시 읽어 사이트맵을 갱신해요.
export const revalidate = 3600;

export default async function sitemap() {
  const sb = serverClient({ revalidate });
  const [{ data: st }, { data: games }, { data: posts }] = await Promise.all([
    sb.from('site_settings').select('data').eq('id', 1).maybeSingle(),
    sb.from('games').select('*'),
    sb.from('posts').select('id,created_at').eq('published', true),
  ]);
  setPrimaryDomain(mergeSettings(st?.data).primaryDomain);
  const base = siteUrl();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/pc-mobile`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/boardgames`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/games`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    ...(games || []).map((g) => ({ url: `${base}/games/${g.slug}`, lastModified: new Date(g.updated_at || g.created_at), changeFrequency: 'weekly', priority: 0.9 })),
    // RSS에서 뺀 글도 사이트맵에는 그대로 남아요.
    ...(posts || []).map((p) => ({ url: `${base}/blog/${p.id}`, lastModified: new Date(p.created_at), changeFrequency: 'monthly', priority: 0.6 })),
  ];
}
