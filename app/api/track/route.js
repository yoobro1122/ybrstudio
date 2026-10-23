import { serverClient } from '@/lib/supabase';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|kakaotalk-scrap|yeti|daum|bingpreview|headless|lighthouse|vercel/i;

export async function POST(req) {
  try {
    if (BOT.test(req.headers.get('user-agent') || '')) return new Response(null, { status: 204 });
    const b = await req.json();
    const path = String(b.path || '').slice(0, 300);
    const vid = String(b.vid || '').replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64);
    const referrer = String(b.ref || '').replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 200);
    if (!path.startsWith('/') || path.startsWith('/admin') || vid.length < 8) return new Response(null, { status: 204 });
    await serverClient().from('page_views').insert({ path, vid, referrer });
  } catch {}
  return new Response(null, { status: 204 });
}
