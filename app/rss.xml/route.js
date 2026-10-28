import { serverClient } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';
import { siteUrl, plain } from '@/lib/seo';
import { bodyImages } from '@/lib/post-body';

export const dynamic = 'force-dynamic';

const x = (s) => String(s || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

export async function GET() {
  const s = await getSettings();
  const base = siteUrl();
  const { data: posts } = await serverClient()
    .from('posts').select('id,title,content,images,created_at').eq('published', true)
    .order('created_at', { ascending: false }).limit(50);
  const items = (posts || []).map((p) => ({ ...p, cover: p.images?.[0] || bodyImages(p.content)[0] })).map((p) => `
    <item>
      <title>${x(p.title)}</title>
      <link>${base}/blog/${p.id}</link>
      <guid isPermaLink="true">${base}/blog/${p.id}</guid>
      <pubDate>${new Date(p.created_at).toUTCString()}</pubDate>
      <description>${x(plain(p.content, 300))}</description>${p.cover ? `
      <enclosure url="${x(p.cover)}" type="image/jpeg" />` : ''}
    </item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${x(s.siteName)} 블로그</title>
    <link>${base}/blog</link>
    <description>${x(plain(s.seoDescription || s.intro, 200))}</description>
    <language>ko</language>${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
}
