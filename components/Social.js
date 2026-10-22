import { socialLinks } from '@/lib/seo';

function Icon({ k }) {
  if (k === 'instagram') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
    </svg>
  );
}

export default function Social({ s, compact = false }) {
  const links = socialLinks(s);
  if (!links.length) return null;
  return (
    <ul className={`social ${compact ? 'social-compact' : ''}`} aria-label="SNS">
      {links.map((l) => (
        <li key={l.key}>
          <a href={l.href} target="_blank" rel="noopener noreferrer me" aria-label={`${l.label} @${l.handle}`}>
            <Icon k={l.key} />{!compact && <span>@{l.handle}</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
