import { serverClient } from '@/lib/supabase';
import { getSettings } from '@/lib/settings';
import { siteUrl, plain } from '@/lib/seo';
import { bodyImages } from '@/lib/post-body';
import { categoryLabel } from '@/lib/status';

export const dynamic = 'force-dynamic';

const LIMIT = 20;
const x = (s) => String(s || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
const mime = (u) => (/\.png(\?|$)/i.test(u) ? 'image/png' : /\.webp(\?|$)/i.test(u) ? 'image/webp' : /\.gif(\?|$)/i.test(u) ? 'image/gif' : 'image/jpeg');

// 블로그 글(RSS 포함으로 둔 것)과 새 게임 소식을 날짜순으로 섞어 최신 20개를 보여줘요.
export async function GET() {
  const s = await getSettings();
  const base = siteUrl();
  const sb = serverClient();
  const [{ data: posts }, { data: games }] = await Promise.all([
    sb.from('posts').select('*').eq('published', true).order('created_at', { ascending: false }).limit(LIMIT * 2),
    sb.from('games').select('slug,title,tagline,description,category,cover_url,created_at').order('created_at', { ascending: false }).limit(LIMIT),
  ]);

  const items = [
    ...(posts || []).filter((p) => p.include_in_rss !== false).map((p) => ({
      kind: '블로그',
      title: p.title,
      link: `${base}/blog/${p.id}`,
      date: p.created_at,
      desc: plain(p.content, 300),
      cover: p.images?.[0] || bodyImages(p.content)[0],
    })),
    ...(games || []).map((g) => ({
      kind: '새 게임',
      title: `[새 ${categoryLabel(g.category)}] ${g.title}`,
      link: `${base}/games/${g.slug}`,
      date: g.created_at,
      desc: plain([g.tagline, g.description].filter(Boolean).join(' — '), 300) || `${g.title}을(를) 새로 소개합니다.`,
      cover: g.cover_url,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, LIMIT);

  const body = items.map((it) => `
    <item>
      <title>${x(it.title)}</title>
      <link>${x(it.link)}</link>
      <guid isPermaLink="true">${x(it.link)}</guid>
      <category>${x(it.kind)}</category>
      <pubDate>${new Date(it.date).toUTCString()}</pubDate>
      <description>${x(it.desc)}</description>${it.cover ? `
      <enclosure url="${x(it.cover)}" length="0" type="${mime(it.cover)}" />` : ''}
    </item>`).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${x(s.siteName)} 소식</title>
    <link>${base}/</link>
    <atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml" />
    <description>${x(plain(s.seoDescription || s.intro, 200))}</description>
    <language>ko</language>${items[0] ? `
    <lastBuildDate>${new Date(items[0].date).toUTCString()}</lastBuildDate>` : ''}${body}
  </channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=600' } });
}
