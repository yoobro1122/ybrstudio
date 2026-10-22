// 사이트 주소: 도메인을 연결하면 Vercel 환경변수 NEXT_PUBLIC_SITE_URL만 바꾸면 돼요.
export function siteUrl() {
  const u = process.env.NEXT_PUBLIC_SITE_URL
    || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'https://yoobros.vercel.app');
  return u.replace(/\/+$/, '');
}

export function abs(path) {
  if (!path) return undefined;
  return /^https?:\/\//.test(path) ? path : siteUrl() + (path.startsWith('/') ? path : '/' + path);
}

export function plain(text, len = 155) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len - 1) + '…' : t;
}

export function handle(v) {
  return String(v || '').trim().replace(/^@/, '')
    .replace(/^https?:\/\/(www\.)?(instagram\.com|x\.com|twitter\.com)\//, '').replace(/[/?#].*$/, '');
}

export function socialLinks(s) {
  const out = [];
  const ig = handle(s.instagram), x = handle(s.x);
  if (ig) out.push({ key: 'instagram', label: 'Instagram', handle: ig, href: `https://instagram.com/${encodeURIComponent(ig)}` });
  if (x) out.push({ key: 'x', label: 'X', handle: x, href: `https://x.com/${encodeURIComponent(x)}` });
  return out;
}

// 붙여넣은 메타 태그 전체에서도 content 값만 뽑아냅니다.
export function verificationCode(v) {
  const s = String(v || '').trim();
  const m = s.match(/content=["']([^"']+)["']/i);
  return (m ? m[1] : s).replace(/[^A-Za-z0-9_\-=.]/g, '');
}

export function pageMeta(s, { title, description, path, image, type = 'website', extra = {} }) {
  const desc = plain(description || s.seoDescription || s.intro);
  const img = abs(image || s.ogImageUrl || '/og-default.png');
  return {
    ...(title ? { title } : {}),
    description: desc,
    alternates: { canonical: path || '/' },
    openGraph: {
      type, siteName: s.siteName, locale: 'ko_KR', url: path || '/',
      title: title ? `${title} | ${s.siteName}` : s.siteName,
      description: desc,
      images: [{ url: img }],
      ...extra,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} | ${s.siteName}` : s.siteName,
      description: desc,
      images: [img],
      ...(handle(s.x) ? { site: '@' + handle(s.x) } : {}),
    },
  };
}
