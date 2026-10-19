'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', content: '', company: '' });
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('이름을 입력하세요.');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError('답장 받을 이메일을 정확히 입력하세요.');
    if (!form.content.trim()) return setError('문의 내용을 입력하세요.');
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '');
      setState('done');
    } catch (err) {
      setState('idle');
      setError(err.message || '메일을 보내지 못했어요. 잠시 후 다시 시도하세요.');
    }
  }

  if (state === 'done') return <p className="notice">메일을 보냈어요. 남겨주신 이메일로 답장드릴게요.</p>;

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-row">
        <label className="field"><span>이름</span><input value={form.name} maxLength={50} onChange={set('name')} /></label>
        <label className="field"><span>이메일</span><input type="email" value={form.email} maxLength={200} onChange={set('email')} /></label>
      </div>
      <label className="field"><span>제목</span><input value={form.subject} maxLength={100} onChange={set('subject')} /></label>
      <label className="field"><span>내용</span><textarea rows={6} maxLength={3000} value={form.content} onChange={set('content')} /></label>
      <input className="trap" tabIndex={-1} autoComplete="off" value={form.company} onChange={set('company')} aria-hidden="true" />
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={state === 'sending'}>{state === 'sending' ? '보내는 중…' : '메일 보내기'}</button>
    </form>
  );
}
