import site from '@/site.config';
import ContactForm from '@/components/ContactForm';

export const metadata = { title: '컨택' };

export default function ContactPage() {
  return (
    <section className="section wrap page-top contact">
      <div>
        <h1>컨택</h1>
        <p className="lead">게임 협업, 플레이테스트 참여, 출판 제안 모두 환영해요.</p>
        <dl className="contact-list">
          {site.contacts.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd><a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{c.value}</a></dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="contact-form">
        <h2 className="h-small">메일 보내기</h2>
        <ContactForm />
      </div>
    </section>
  );
}
