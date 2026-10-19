import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap page-top section">
      <h1>없는 칸이에요</h1>
      <p className="lead">주소가 바뀌었거나 삭제된 페이지예요.</p>
      <Link href="/" className="btn">처음으로 돌아가기</Link>
    </section>
  );
}
