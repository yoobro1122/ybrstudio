import { SiteLogo } from './Logo';

export default function Footer({ s }) {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <SiteLogo s={s} height={18} mono />
        {s.copyright && <p className="muted small">{s.copyright}</p>}
        {s.footerEmail && <a className="muted small footer-email" href={`mailto:${s.footerEmail}`}>{s.footerEmail}</a>}
        {s.footerNote && <p className="muted small footer-note">{s.footerNote}</p>}
      </div>
    </footer>
  );
}
