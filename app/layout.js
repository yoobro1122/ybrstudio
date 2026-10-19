import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSettings, luminance } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings();
  return {
    title: { default: s.siteName, template: `%s | ${s.siteName}` },
    description: s.intro.split('\n')[0],
    icons: { icon: '/icon.svg' },
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
        <a href="#main" className="skip">본문으로 건너뛰기</a>
        <Header s={s} />
        <main id="main">{children}</main>
        <Footer s={s} />
      </body>
    </html>
  );
}
