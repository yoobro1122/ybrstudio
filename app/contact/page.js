import { getSettings } from '@/lib/settings';
import ContactForm from '@/components/ContactForm';

import { pageMeta } from '@/lib/seo';

export async function generateMetadata() {
  const s = await getSettings();
  return pageMeta(s, { title: '컨택', description: `${s.siteName}에 연락하기. ${s.contactLead}`, path: '/contact' });
}

const ig = (v) => String(v).trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '');

function rows(p) {
  return [
    p.email && { label: '메일', value: p.email, href: `mailto:${p.email}` },
    p.phone && { label: '연락처', value: p.phone, href: `tel:${String(p.phone).replace(/[^0-9+]/g, '')}` },
    p.instagram && { label: '인스타그램', value: `@${ig(p.instagram)}`, href: `https://instagram.com/${encodeURIComponent(ig(p.instagram))}` },
  ].filter(Boolean);
}

export default async function ContactPage() {
  const site = await getSettings();
  return (
    <section className="section wrap page-top contact">
      <div>
        <h1>컨택</h1>
        <p className="lead">{site.contactLead}</p>
        <div className="people">
          {site.people.filter((p) => p.name).map((p, i) => (
            <section key={i} className="person">
              <div className="person-head">
                <h2>{p.name}</h2>
                <span className="muted">{p.roles}</span>
              </div>
              <dl className="contact-list">
                {rows(p).map((r) => (
                  <div key={r.label}>
                    <dt>{r.label}</dt>
                    <dd><a href={r.href} target={r.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{r.value}</a></dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </div>
      <div className="contact-form">
        <h2 className="h-small">메일 보내기</h2>
        <ContactForm />
      </div>
    </section>
  );
}
