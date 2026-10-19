import AdminApp from '@/components/admin/AdminApp';

export const metadata = { title: '관리자', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <section className="wrap page-top admin">
      <AdminApp />
    </section>
  );
}
