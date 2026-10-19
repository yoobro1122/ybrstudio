import site from '@/site.config';
import { LogoMark } from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <LogoMark height={18} mono />
        <p className="muted small">© {new Date().getFullYear()} {site.name}</p>
        <a className="muted small" href={`mailto:${site.email}`}>{site.email}</a>
      </div>
    </footer>
  );
}
