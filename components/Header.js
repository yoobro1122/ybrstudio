import Link from 'next/link';
import { HeaderLogo } from './Logo';

export default function Header({ s }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="home-link" aria-label={`${s.siteName} 홈`}>
          <HeaderLogo s={s} />
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          <Link href="/pc-mobile">PC&amp;Mobile</Link>
          <Link href="/boardgames">보드게임</Link>
          <Link href="/blog">블로그</Link>
          <Link href="/contact">컨택</Link>
        </nav>
      </div>
    </header>
  );
}
