import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, luminance } from '@/lib/settings';
import { siteUrl, abs, pageMeta, socialLinks, verificationCode } from '@/lib/seo';
import JsonLd from '@/components/JsonLd';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  const base = pageMeta(s, { path: '/' });
  const google = verificationCode(s.googleVerification);
  const naver = verificationCode(s.naverVerification);
  return {
    ...base,
    metadataBase: new URL(siteUrl()),
    title: { default: s.siteName, template: `%s | ${s.siteName}` },
    applicationName: s.siteName,
    icons: { icon: '/icon.svg' },
    alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/rss.xml', title: `${s.siteName} 블로그` }] } },
    verification: { ...(google ? { google } : {}), ...(naver ? { other: { 'naver-site-verification': naver } } : {}) },
  };
}

export default async function RootLayout({ children }) {
  const s = await getSettings();
  const { bg, ink, point } = s.colors;
  const scheme = luminance(bg) < 0.3 ? 'dark' : 'light';
  const vars = `:root{--paper:${bg};--ink:${ink};--point:${point};color-scheme:${scheme}}`;

  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600;700;800&display=swap" />
        <style dangerouslySetInnerHTML={{ __html: vars }} />
      </head>
      <body>
        <JsonLd data={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'Organization', '@id': `${siteUrl()}/#org`, name: s.siteName, url: siteUrl(), logo: abs(s.logoUrl || '/logo.png'), sameAs: socialLinks(s).map((l) => l.href) },
            { '@type': 'WebSite', '@id': `${siteUrl()}/#site`, name: s.siteName, url: siteUrl(), inLanguage: 'ko', publisher: { '@id': `${siteUrl()}/#org` } },
          ],
        }} />
        <a href="#main" className="skip">본문으로 건너뛰기</a>
        <Header s={s} />
        <main id="main">{children}</main>
        <Footer s={s} />
      </body>
    </html>
  );
}
