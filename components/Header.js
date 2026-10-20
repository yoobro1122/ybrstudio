import Link from 'next/link';
import { HeaderLogo } from './Logo';
import NavMenu from './NavMenu';

export default function Header({ s }) {
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="home-link" aria-label={`${s.siteName} 홈`}>
          <HeaderLogo s={s} />
        </Link>
        <NavMenu />
      </div>
    </header>
  );
}
