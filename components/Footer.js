import { SiteLogo } from './Logo';
import Social from './Social';

function FooterLogo({ s }) {
  if (s.footerLogoMode === 'none') return null;
  if (s.footerLogoMode === 'image' && s.footerLogoUrl) {
    return <img src={s.footerLogoUrl} alt={s.siteName} className="footer-logo-img" style={{ height: s.footerLogoSize }} />;
  }
  return <SiteLogo s={s} height={s.footerLogoSize} mono />;
}

export default function Footer({ s }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <FooterLogo s={s} />
        {s.copyright && <p className="muted small">{s.copyright}</p>}
        <Social s={s} compact />
        {s.footerEmail && <a className="muted small footer-email" href={`mailto:${s.footerEmail}`}>{s.footerEmail}</a>}
        {s.footerNote && <p className="muted small footer-note">{s.footerNote}</p>}
      </div>
    </footer>
  );
}
