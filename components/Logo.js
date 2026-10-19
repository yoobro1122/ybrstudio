export function LogoMark({ height = 28, mono = false, title = 'YBR' }) {
  const width = (height * 181) / 70;
  return (
    <svg width={width} height={height} viewBox="0 0 181 70" role="img" aria-label={title} className="logo-mark">
      <path fill="currentColor" d="M0 0 H15 L28 26 L41 0 H56 L35 38 V70 H21 V38 Z" />
      <path fill="currentColor" fillRule="evenodd" d="M70 0 H95 C108 0 116 7 116 18 C116 26 112 31 105 34 C114 37 119 43 119 52 C119 64 110 70 97 70 H70 Z M84 12 V29 H94 C100 29 103 26 103 20.5 C103 15 100 12 94 12 Z M84 41 V58 H96 C102 58 105 55 105 49.5 C105 44 102 41 96 41 Z" />
      <path fill="currentColor" fillRule="evenodd" d="M132 0 H158 C171 0 179 8 179 21 C179 31 174 37 166 40 L181 70 H165 L152 42 H146 V70 H132 Z M146 12 V30 H157 C163 30 165 26 165 21 C165 16 163 12 157 12 Z" />
      <circle cx="28" cy="9" r="7.5" fill={mono ? 'currentColor' : 'var(--point)'} />
    </svg>
  );
}

// 메인 로고: 업로드한 이미지가 있으면 이미지, 없으면 기본 YBR 마크
export function SiteLogo({ s, height = 28, mono = false }) {
  if (s.logoUrl) return <img src={s.logoUrl} alt={s.siteName} className="logo-img" style={{ height }} />;
  return <LogoMark height={height} mono={mono} title={s.siteName} />;
}

export function LogoLockup({ s, height = 64 }) {
  return (
    <span className="logo-lockup" style={{ '--h-desktop': `${height}px`, '--h': `${height}px` }}>
      <SiteLogo s={s} height={height} />
      {s.showLogoSub && s.logoSub && <span className="logo-sub">{s.logoSub}</span>}
    </span>
  );
}

export function HeaderLogo({ s }) {
  if (s.headerLogoMode === 'image' && s.headerLogoUrl) {
    return <img src={s.headerLogoUrl} alt={s.siteName} className="header-logo-img" style={{ height: s.headerLogoSize * 1.4 }} />;
  }
  return <span className="wordmark" style={{ fontSize: s.headerLogoSize }}>{s.wordmark}</span>;
}
