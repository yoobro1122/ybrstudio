import Link from 'next/link';
import { LogoMark } from './Logo';

export default function Header() {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="home-link" aria-label="YBR STUDIO 홈">
          <LogoMark height={24} />
        </Link>
        <nav className="nav" aria-label="주요 메뉴">
          <Link href="/games">게임</Link>
          <Link href="/blog">블로그</Link>
          <Link href="/contact">컨택</Link>
        </nav>
      </div>
    </header>
  );
}
