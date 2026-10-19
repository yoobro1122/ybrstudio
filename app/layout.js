import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import site from '@/site.config';

export const metadata = {
  title: { default: site.name, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;600;700;800&display=swap"
        />
      </head>
      <body>
        <a href="#main" className="skip">본문으로 건너뛰기</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
