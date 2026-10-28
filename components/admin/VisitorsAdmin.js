'use client';
import { useCallback, useEffect, useState } from 'react';

const RANGES = [7, 30, 90];
const n = (v) => Number(v || 0).toLocaleString('ko-KR');

function kstDay(offset = 0) {
  const d = new Date(Date.now() + 9 * 3600 * 1000 - offset * 86400000);
  return d.toISOString().slice(0, 10);
}

export default function VisitorsAdmin({ sb, counts = {}, onGo }) {
  const [range, setRange] = useState(30);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    const [daily, d7, d30, all, pages, refs, games, gstats] = await Promise.all([
      sb.rpc('visit_stats', { p_days: range }),
      sb.rpc('visit_summary', { p_days: 7 }),
      sb.rpc('visit_summary', { p_days: 30 }),
      sb.rpc('visit_summary', { p_days: 0 }),
      sb.rpc('visit_top_pages', { p_days: range, p_limit: 10 }),
      sb.rpc('visit_referrers', { p_days: range, p_limit: 8 }),
      sb.from('games').select('slug,title'),
      sb.rpc('game_stats', { p_days: range }),
    ]);
    if (daily.error) { setError('방문자 기록을 불러오지 못했어요. Supabase에서 migration-5-visits-badges.sql을 실행했는지 확인하세요.'); return; }
    const titles = Object.fromEntries((games.data || []).map((g) => [g.slug, g.title]));
    setData({ daily: daily.data || [], d7: d7.data?.[0], d30: d30.data?.[0], all: all.data?.[0], pages: pages.data || [], refs: refs.data || [], titles, gstats: gstats.error ? null : (gstats.data || []) });
  }, [sb, range]);
  useEffect(() => { load(); }, [load]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">불러오는 중…</p>;

  const byDay = Object.fromEntries(data.daily.map((d) => [String(d.day).slice(0, 10), d]));
  const days = Array.from({ length: range }, (_, i) => kstDay(range - 1 - i));
  const rows = days.map((d) => ({ day: d, views: Number(byDay[d]?.views || 0), visitors: Number(byDay[d]?.visitors || 0) }));
  const max = Math.max(1, ...rows.map((r) => r.visitors));
  const today = rows[rows.length - 1], yesterday = rows[rows.length - 2] || { views: 0, visitors: 0 };

  const label = (path) => {
    const m = path.match(/^\/(games|play)\/([^/]+)/);
    if (m) return `${data.titles[m[2]] || m[2]}${m[1] === 'play' ? ' (웹 트라이얼)' : ''}`;
    return { '/': '메인', '/pc-mobile': 'PC&Mobile', '/boardgames': '보드게임', '/games': '전체 게임', '/blog': '블로그', '/contact': '컨택' }[path] || path;
  };

  return (
    <div className="visitors">
      {(counts.reviews > 0 || counts.messages > 0) && (
        <div className="todo">
          {counts.reviews > 0 && <button type="button" onClick={() => onGo && onGo('reviews')}>검토 대기 후기 <strong>{counts.reviews}</strong>건 확인하기</button>}
          {counts.messages > 0 && <button type="button" onClick={() => onGo && onGo('messages')}>새 문의 <strong>{counts.messages}</strong>건 확인하기</button>}
        </div>
      )}
      <div className="stat-grid">
        {[
          ['오늘', today], ['어제', yesterday], ['최근 7일', data.d7], ['최근 30일', data.d30],
        ].map(([k, v]) => (
          <div key={k} className="stat">
            <span className="small muted">{k}</span>
            <strong>{n(v?.visitors)}<em>명</em></strong>
            <span className="small muted">조회 {n(v?.views)}회</span>
          </div>
        ))}
      </div>
      <p className="small muted">누적 방문자 {n(data.all?.visitors)}명 · 조회 {n(data.all?.views)}회. 방문자는 같은 브라우저를 한 명으로 세고, 관리자로 로그인한 브라우저와 검색엔진 로봇은 빼고 세요.</p>

      <section className="section">
        <div className="section-head">
          <h2>날짜별 방문자</h2>
          <div className="chips">
            {RANGES.map((r) => <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => setRange(r)}>{r}일</button>)}
          </div>
        </div>
        <div className="bars" role="img" aria-label={`최근 ${range}일 날짜별 방문자`}>
          {rows.map((r) => (
            <div key={r.day} className="bar-col" title={`${r.day} · 방문자 ${r.visitors}명 · 조회 ${r.views}회`}>
              <span className="bar" style={{ height: `${(r.visitors / max) * 100}%` }} />
            </div>
          ))}
        </div>
        <div className="bar-axis small muted"><span>{days[0].slice(5).replace('-', '.')}</span><span>오늘</span></div>
      </section>

      <section className="section">
        <h2>프로젝트별 조회수 <span className="small muted">최근 {range}일</span></h2>
        {data.gstats === null ? (
          <p className="small muted">프로젝트별 조회수를 보려면 Supabase에서 migration-6-likes-stats.sql을 실행하세요.</p>
        ) : data.gstats.length ? (
          <div className="table-scroll">
            <table className="stats-table">
              <thead><tr><th>프로젝트</th><th>조회</th><th>방문자</th><th>웹 플레이</th><th>좋아요<span className="small muted"> (전체)</span></th></tr></thead>
              <tbody>
                {data.gstats.map((g) => (
                  <tr key={g.slug}><td>{g.title}</td><td>{n(g.views)}</td><td>{n(g.visitors)}</td><td>{n(g.plays)}</td><td>{n(g.likes)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="empty">등록된 프로젝트가 없어요.</p>}
      </section>

      <div className="visit-lists">
        <section className="section">
          <h2>많이 본 페이지 <span className="small muted">최근 {range}일</span></h2>
          {data.pages.length ? (
            <ol className="rank">
              {data.pages.map((p) => (
                <li key={p.path}><span className="rank-name">{label(p.path)}</span><span className="small muted">{n(p.visitors)}명 · {n(p.views)}회</span></li>
              ))}
            </ol>
          ) : <p className="empty">아직 기록이 없어요.</p>}
        </section>
        <section className="section">
          <h2>들어온 경로 <span className="small muted">최근 {range}일</span></h2>
          {data.refs.length ? (
            <ol className="rank">
              {data.refs.map((r) => <li key={r.referrer}><span className="rank-name">{r.referrer}</span><span className="small muted">{n(r.visitors)}명</span></li>)}
            </ol>
          ) : <p className="empty">아직 다른 사이트에서 들어온 기록이 없어요. 주소를 직접 입력하거나 즐겨찾기로 들어온 방문은 여기 나오지 않아요.</p>}
        </section>
      </div>
    </div>
  );
}
