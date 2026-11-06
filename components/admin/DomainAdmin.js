'use client';
import { useCallback, useEffect, useState } from 'react';
import { mergeSettings } from '@/lib/settings-shared';

export default function DomainAdmin({ sb }) {
  const [state, setState] = useState(null);
  const [primary, setPrimary] = useState('');
  const [input, setInput] = useState('');
  const [withWww, setWithWww] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const call = useCallback(async (method, body) => {
    const { data } = await sb.auth.getSession();
    const res = await fetch('/api/admin/domains', {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${data.session?.access_token || ''}` },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error || '요청을 처리하지 못했어요.');
    return json;
  }, [sb]);

  const loadPrimary = useCallback(async () => {
    const { data } = await sb.from('site_settings').select('data').eq('id', 1).maybeSingle();
    setPrimary(mergeSettings(data?.data).primaryDomain);
  }, [sb]);

  const load = useCallback(async () => {
    setError('');
    try { setState(await call('GET')); } catch (e) { setError(e.message); setState({ configured: true, domains: [] }); }
    loadPrimary();
  }, [call, loadPrimary]);
  useEffect(() => { load(); }, [load]);

  async function act(action, domain, extra = {}) {
    if (action === 'remove' && !confirm(`${domain} 연결을 끊을까요? 이 주소로는 사이트가 열리지 않게 돼요.`)) return;
    setBusy(action + domain); setError(''); setMsg('');
    try {
      const r = await call('POST', { action, domain, ...extra });
      setState(r);
      if (action === 'add') { setInput(''); setMsg('도메인을 추가했어요. 아래 DNS 값을 도메인 구입처에 입력하세요.'); }
      if (action === 'verify') setMsg('다시 확인했어요. DNS 변경은 반영까지 몇 분에서 길게는 하루 정도 걸릴 수 있어요.');
      if (action === 'remove' && primary === domain) await setPrimaryDomain('');
    } catch (e) { setError(e.message); }
    setBusy('');
  }

  async function setPrimaryDomain(domain) {
    const { data } = await sb.from('site_settings').select('data').eq('id', 1).maybeSingle();
    const next = { ...(data?.data || {}), primaryDomain: domain };
    const { error: err } = await sb.from('site_settings').upsert({ id: 1, data: next, updated_at: new Date().toISOString() });
    if (err) return setError('대표 주소를 저장하지 못했어요.');
    setPrimary(domain);
    setMsg(domain ? `${domain}을(를) 대표 주소로 지정했어요. 검색엔진·공유 미리보기에 이 주소가 쓰여요.` : '대표 주소 지정을 해제했어요.');
  }

  if (!state) return <p className="muted">불러오는 중…</p>;

  if (!state.configured) {
    return (
      <div className="domain-setup">
        <h2>처음 한 번만 설정이 필요해요</h2>
        <p>관리자 화면에서 도메인을 연결하려면 Vercel이 이 사이트를 대신 조작할 수 있는 열쇠(토큰)가 필요해요.</p>
        <ol className="steps">
          <li><strong>토큰 만들기</strong> — Vercel 오른쪽 위 프로필 › Account Settings › Tokens에서 Create Token. 이름은 아무거나, Scope는 이 프로젝트가 있는 계정(또는 팀), 만료는 원하는 기간으로 만들고 값을 복사하세요.</li>
          <li><strong>프로젝트 ID 복사</strong> — Vercel › 이 프로젝트 › Settings › General의 Project ID를 복사하세요.</li>
          <li><strong>팀 ID (팀 계정일 때만)</strong> — 팀으로 만든 프로젝트라면 팀 Settings › General의 Team ID도 복사하세요.</li>
          <li><strong>환경변수 등록</strong> — 프로젝트 › Settings › Environment Variables에 <code>VERCEL_API_TOKEN</code>, <code>VERCEL_PROJECT_ID</code>, (팀이면) <code>VERCEL_TEAM_ID</code>를 넣고 Redeploy 하세요.</li>
        </ol>
        <p className="small muted">토큰은 서버에만 저장되고 화면이나 방문자에게는 보이지 않아요.</p>
      </div>
    );
  }

  const own = (state.domains || []).filter((d) => !d.vercelDefault);
  const vercelDefault = (state.domains || []).find((d) => d.vercelDefault);

  return (
    <div className="domains">
      <section>
        <h2>도메인 추가</h2>
        <div className="inline-form form">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="yoobros.com" aria-label="연결할 도메인" />
          <button type="button" className="btn" disabled={!input.trim() || !!busy} onClick={() => act('add', input, { withWww })}>{busy.startsWith('add') ? '추가 중…' : '연결하기'}</button>
        </div>
        <label className="check"><input type="checkbox" checked={withWww} onChange={(e) => setWithWww(e.target.checked)} /> www 주소도 함께 연결 (www로 들어오면 기본 주소로 이동)</label>
      </section>

      {error && <p className="error">{error}</p>}
      {msg && <p className="notice">{msg}</p>}

      <section className="section">
        <h2>연결된 도메인</h2>
        <p className="small muted">대표 주소: <strong>{primary ? `https://${primary}` : `${vercelDefault ? 'https://' + vercelDefault.name : '기본 주소'} (지정 안 함)`}</strong></p>
        {own.length === 0 && <p className="empty">아직 연결한 도메인이 없어요.</p>}
        {own.map((d) => {
          const ok = d.verified && !d.misconfigured;
          return (
            <div key={d.name} className="domain-card">
              <div className="domain-head">
                <div>
                  <strong className="domain-name">{d.name}</strong>
                  {d.redirect && <span className="small muted"> → {d.redirect}로 이동</span>}
                  {primary === d.name && <span className="badge approved">대표 주소</span>}
                </div>
                <span className={`badge ${ok ? 'approved' : 'pending'}`}>{ok ? '연결 완료' : !d.verified ? '소유 확인 필요' : 'DNS 설정 필요'}</span>
              </div>
              {!ok && d.records.length > 0 && (
                <>
                  <p className="small">도메인을 산 곳(가비아, 카페24, 후이즈 등)의 DNS 관리 화면에 아래 값을 추가하세요.</p>
                  <div className="table-scroll">
                    <table className="stats-table dns-table">
                      <thead><tr><th>타입</th><th>호스트(이름)</th><th>값</th></tr></thead>
                      <tbody>
                        {d.records.map((r, i) => (
                          <tr key={i}><td>{r.type}</td><td>{r.name}</td><td><code>{r.value}</code>{r.verify && <span className="small muted"> (소유 확인용)</span>}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="small muted">같은 호스트에 이미 A나 CNAME 값이 있으면 지우고 위 값으로 바꿔주세요. 호스트 칸이 @인 곳은 업체에 따라 비워두기도 해요.</p>
                </>
              )}
              <div className="admin-actions">
                {!ok && <button type="button" className="btn btn-sm" disabled={!!busy} onClick={() => act('verify', d.name)}>{busy === 'verify' + d.name ? '확인 중…' : '다시 확인'}</button>}
                {ok && !d.redirect && primary !== d.name && <button type="button" className="btn btn-sm" onClick={() => setPrimaryDomain(d.name)}>대표 주소로 지정</button>}
                {primary === d.name && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPrimaryDomain('')}>대표 주소 해제</button>}
                <button type="button" className="btn btn-danger btn-sm" disabled={!!busy} onClick={() => act('remove', d.name)}>연결 끊기</button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="section">
        <h2>연결 후 할 일</h2>
        <ol className="steps">
          <li>"연결 완료"가 되면 <strong>대표 주소로 지정</strong>을 누르세요. 검색엔진 정보, 공유 미리보기, 사이트맵이 새 주소로 바뀌어요.</li>
          <li>구글 서치콘솔과 네이버 서치어드바이저에 새 주소로 사이트를 다시 등록하고 sitemap.xml을 제출하세요.</li>
          <li>문의 메일을 새 도메인 주소로 받으려면 Resend에서 도메인을 인증하고 환경변수 RESEND_FROM을 바꿔주세요.</li>
        </ol>
      </section>
    </div>
  );
}
