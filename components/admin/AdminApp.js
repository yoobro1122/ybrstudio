'use client';
import { useEffect, useState } from 'react';
import { browserClient } from '@/lib/supabase';
import ReviewsAdmin from './ReviewsAdmin';
import GamesAdmin from './GamesAdmin';
import PostsAdmin from './PostsAdmin';
import MessagesAdmin from './MessagesAdmin';
import SettingsAdmin from './SettingsAdmin';
import VisitorsAdmin from './VisitorsAdmin';

const TABS = [
  { key: 'visitors', label: '통계' },
  { key: 'reviews', label: '후기' },
  { key: 'games', label: '게임' },
  { key: 'posts', label: '블로그' },
  { key: 'messages', label: '문의' },
  { key: 'settings', label: '사이트 설정' },
];

export default function AdminApp() {
  const sb = browserClient();
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('visitors');
  const [counts, setCounts] = useState({ reviews: 0, messages: 0 });

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  // 검토 대기 후기·새 문의 개수를 탭에 표시해요. 탭을 옮길 때마다 새로 세요.
  useEffect(() => {
    if (!session) return;
    Promise.all([
      sb.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('messages').select('id', { count: 'exact', head: true }).eq('is_read', false),
    ]).then(([r, m]) => setCounts({ reviews: r.count || 0, messages: m.count || 0 }));
  }, [sb, session, tab]);

  if (!ready) return <p className="muted">불러오는 중…</p>;
  if (!session) return <Login sb={sb} />;

  return (
    <div>
      <div className="admin-top">
        <h1>관리자</h1>
        <div className="admin-user">
          <span className="small muted">{session.user.email}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => sb.auth.signOut()}>로그아웃</button>
        </div>
      </div>
      <div className="admin-tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}>
            {t.label}{counts[t.key] > 0 && <span className="tab-count" aria-label={`${counts[t.key]}건`}>{counts[t.key]}</span>}
          </button>
        ))}
      </div>
      {tab === 'reviews' && <ReviewsAdmin sb={sb} />}
      {tab === 'games' && <GamesAdmin sb={sb} />}
      {tab === 'posts' && <PostsAdmin sb={sb} />}
      {tab === 'messages' && <MessagesAdmin sb={sb} />}
      {tab === 'settings' && <SettingsAdmin sb={sb} />}
      {tab === 'visitors' && <VisitorsAdmin sb={sb} counts={counts} onGo={setTab} />}
    </div>
  );
}

function Login({ sb }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const { error: err } = await sb.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) setError('이메일 또는 비밀번호가 맞지 않아요.');
  }

  return (
    <form className="form login" onSubmit={submit}>
      <h1>관리자 로그인</h1>
      <label className="field"><span>이메일</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label className="field"><span>비밀번호</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={busy}>{busy ? '확인 중…' : '로그인'}</button>
    </form>
  );
}
