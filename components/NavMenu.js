'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/pc-mobile', label: 'PC&Mobile' },
  { href: '/boardgames', label: '보드게임' },
  { href: '/blog', label: '블로그' },
  { href: '/contact', label: '컨택' },
];

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const isOn = (href) => path === href || path.startsWith(href + '/');

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.body.classList.add('menu-open');
    return () => { window.removeEventListener('keydown', onKey); document.body.classList.remove('menu-open'); };
  }, [open]);

  return (
    <>
      <nav className="nav" aria-label="주요 메뉴">
        {LINKS.map((l) => <Link key={l.href} href={l.href} aria-current={isOn(l.href) ? 'page' : undefined}>{l.label}</Link>)}
      </nav>
      <button
        type="button"
        className="menu-btn"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(!open)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          {open
            ? <path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            : <path d="M3 6 H21 M3 12 H21 M3 18 H21" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />}
        </svg>
      </button>
      {open && (
        <>
          <nav id="mobile-menu" className="mobile-menu" aria-label="주요 메뉴">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isOn(l.href) ? 'page' : undefined}>
                {l.label}<span aria-hidden="true">›</span>
              </Link>
            ))}
          </nav>
          <div className="menu-dim" aria-hidden="true" onClick={() => setOpen(false)} />
        </>
      )}
    </>
  );
}
