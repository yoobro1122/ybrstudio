'use client';
import { useCallback, useEffect, useState } from 'react';
import { STAGES, CATEGORIES, stageLabel, categoryLabel } from '@/lib/status';
import { fmtDate } from '@/lib/format';
import { uploadImage } from './upload';
import { badgeFor, BADGE_LABEL } from '@/lib/badge';

const EMPTY = {
  title: '', slug: '', tagline: '', description: '', players: '', play_time: '', age: '',
  category: 'board', status: 'idea', play_url: '', cover_url: '', featured: false, sort_order: 0,
};

export default function GamesAdmin({ sb }) {
  const [games, setGames] = useState([]);
  const [editing, setEditing] = useState(null);

  const [stats, setStats] = useState({});
  const load = useCallback(async () => {
    const [{ data }, st] = await Promise.all([
      sb.from('games').select('*').order('sort_order').order('created_at', { ascending: false }),
      sb.rpc('game_stats', { p_days: 0 }),
    ]);
    setGames(data || []);
    setStats(Object.fromEntries((st.data || []).map((x) => [x.slug, x])));
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  if (editing) {
    return <GameForm sb={sb} initial={editing} onDone={() => { setEditing(null); load(); }} />;
  }

  return (
    <div>
      <button className="btn" onClick={() => setEditing({ ...EMPTY })}>새 게임 추가</button>
      {games.length === 0 ? <p className="empty">등록된 게임이 없어요.</p> : (
        <ul className="admin-list">
          {games.map((g) => (
            <li key={g.id}>
              <div className="admin-item-main">
                <p><strong>{g.title}</strong> {badgeFor(g) && <span className={`flag-inline flag-${badgeFor(g)}`}>{BADGE_LABEL[badgeFor(g)]}</span>} {g.featured && <span className="badge approved">메인 노출</span>}</p>
                <p className="small muted">{categoryLabel(g.category)} · /games/{g.slug} · {stageLabel(g.status)}{g.play_url ? ' · 웹 테스트 있음' : ''}</p>
                {stats[g.slug] && <p className="small">조회 {Number(stats[g.slug].views).toLocaleString('ko-KR')} · 방문자 {Number(stats[g.slug].visitors).toLocaleString('ko-KR')} · 웹 플레이 {Number(stats[g.slug].plays).toLocaleString('ko-KR')} · 좋아요 {Number(stats[g.slug].likes).toLocaleString('ko-KR')}</p>}
              </div>
              <div className="admin-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(g)}>수정</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function GameForm({ sb, initial, onDone }) {
  const [g, setG] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setG({ ...g, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  async function onCover(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { setG({ ...g, cover_url: await uploadImage(sb, file) }); }
    catch { setError('이미지를 올리지 못했어요.'); }
    setBusy(false);
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    if (!g.title.trim()) return setError('게임 이름을 입력하세요.');
    if (!/^[a-z0-9-]+$/.test(g.slug)) return setError('주소는 영어 소문자, 숫자, 하이픈(-)만 쓸 수 있어요. 예: deadpoint');
    setBusy(true);
    const { id, created_at, ...fields } = g;
    fields.sort_order = Number(fields.sort_order) || 0;
    const res = id ? await sb.from('games').update(fields).eq('id', id) : await sb.from('games').insert(fields);
    setBusy(false);
    if (res.error) return setError(res.error.code === '23505' ? '이미 쓰고 있는 주소예요.' : '저장하지 못했어요.');
    onDone();
  }

  async function remove() {
    if (!confirm(`'${g.title}'을(를) 삭제할까요? 후기와 개발 일지도 함께 지워져요.`)) return;
    await sb.from('games').delete().eq('id', g.id);
    onDone();
  }

  return (
    <div>
      <button className="more" onClick={onDone}>목록으로</button>
      <form className="form admin-form" onSubmit={save}>
        <h2>{g.id ? '게임 수정' : '새 게임'}</h2>
        <fieldset className="field">
          <legend>종류</legend>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button type="button" key={c.key} className={g.category === c.key ? 'on' : ''} aria-pressed={g.category === c.key} onClick={() => setG({ ...g, category: c.key })}>{c.label}</button>
            ))}
          </div>
        </fieldset>
        <div className="form-row">
          <label className="field"><span>게임 이름</span><input value={g.title} onChange={set('title')} /></label>
          <label className="field"><span>주소 (영문)</span><input value={g.slug} onChange={set('slug')} placeholder="deadpoint" /></label>
        </div>
        <label className="field"><span>한 줄 소개</span><input value={g.tagline} onChange={set('tagline')} /></label>
        <label className="field"><span>게임 설명</span><textarea rows={6} value={g.description} onChange={set('description')} /></label>
        <div className="form-row three">
          <label className="field"><span>인원</span><input value={g.players} onChange={set('players')} placeholder="2~5명" /></label>
          <label className="field"><span>시간</span><input value={g.play_time} onChange={set('play_time')} placeholder="30분" /></label>
          <label className="field"><span>연령</span><input value={g.age} onChange={set('age')} placeholder="12세 이상" /></label>
        </div>
        <div className="form-row">
          <label className="field">
            <span>개발 단계</span>
            <select value={g.status} onChange={set('status')}>
              {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </label>
          <label className="field"><span>외부 웹 테스트 링크 (파일을 올리면 파일이 우선)</span><input value={g.play_url} onChange={set('play_url')} placeholder="https://" /></label>
        </div>
        <div className="field">
          <span>커버 이미지</span>
          {g.cover_url && <img src={g.cover_url} alt="" className="cover-preview" />}
          <input type="file" accept="image/*" onChange={onCover} />
        </div>
        <div className="form-row">
          <label className="check"><input type="checkbox" checked={g.featured} onChange={set('featured')} /> 메인에 먼저 보여주기</label>
          <label className="field"><span>정렬 순서 (작을수록 앞)</span><input type="number" value={g.sort_order} onChange={set('sort_order')} /></label>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="admin-actions">
          <button className="btn" disabled={busy}>{busy ? '저장 중…' : '저장'}</button>
          {g.id && <button type="button" className="btn btn-danger" onClick={remove}>게임 삭제</button>}
        </div>
      </form>
      {g.id ? <PlayFile sb={sb} game={g} /> : <p className="small muted">웹 트라이얼 HTML 파일은 게임을 먼저 저장한 뒤 올릴 수 있어요.</p>}
      {g.id && <GameUpdates sb={sb} gameId={g.id} />}
    </div>
  );
}

function GameUpdates({ sb, gameId }) {
  const [rows, setRows] = useState([]);
  const [text, setText] = useState('');

  const load = useCallback(async () => {
    const { data } = await sb.from('game_updates').select('*').eq('game_id', gameId).order('created_at', { ascending: false });
    setRows(data || []);
  }, [sb, gameId]);
  useEffect(() => { load(); }, [load]);

  async function add(e) {
    e.preventDefault();
    if (!text.trim()) return;
    await sb.from('game_updates').insert({ game_id: gameId, content: text.trim() });
    setText('');
    load();
  }
  async function remove(id) {
    if (!confirm('이 일지를 삭제할까요?')) return;
    await sb.from('game_updates').delete().eq('id', id);
    load();
  }

  return (
    <section className="section">
      <h2>개발 일지</h2>
      <form className="form inline-form" onSubmit={add}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="예: 3차 플레이테스트 완료, 살인마 카드 2장 조정" />
        <button className="btn">일지 추가</button>
      </form>
      <ul className="admin-list">
        {rows.map((u) => (
          <li key={u.id}>
            <div className="admin-item-main"><p className="small muted">{fmtDate(u.created_at)}</p><p>{u.content}</p></div>
            <div className="admin-actions"><button className="btn btn-danger btn-sm" onClick={() => remove(u.id)}>삭제</button></div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const MAX_HTML = 5 * 1024 * 1024;

function PlayFile({ sb, game }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data } = await sb.from('play_files').select('file_name,updated_at').eq('game_id', game.id).maybeSingle();
    setFile(data || null);
  }, [sb, game.id]);
  useEffect(() => { load(); }, [load]);

  async function onFile(e) {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setError(''); setMsg('');
    if (!/\.html?$/i.test(f.name)) return setError('.html 파일만 올릴 수 있어요.');
    if (f.size > MAX_HTML) return setError('5MB 이하 파일만 올릴 수 있어요. 이미지는 줄이거나 외부 링크 방식을 써주세요.');
    setBusy(true);
    const html = await f.text();
    const { error: err } = await sb.from('play_files').upsert({ game_id: game.id, file_name: f.name, html, updated_at: new Date().toISOString() });
    setBusy(false);
    if (err) return setError('올리지 못했어요. Supabase에 play_files 테이블이 있는지 확인하세요.');
    setMsg(file ? '새 버전으로 바꿨어요.' : '올렸어요. 게임 상세의 "웹에서 플레이하기" 버튼이 이 파일로 연결돼요.');
    load();
  }

  async function remove() {
    if (!confirm('웹 트라이얼 파일을 삭제할까요?')) return;
    await sb.from('play_files').delete().eq('game_id', game.id);
    setMsg(''); load();
  }

  return (
    <section className="section">
      <h2>웹 트라이얼 파일</h2>
      <p className="small muted">게임 HTML 파일 한 개를 올리면 /play/{game.slug} 주소에서 바로 플레이할 수 있어요. 다시 올리면 새 버전으로 바뀌어요.</p>
      {file && (
        <p>
          <strong>{file.file_name || 'index.html'}</strong>{' '}
          <span className="small muted">{fmtDate(file.updated_at)} 업로드</span>{' '}
          <a href={`/play/${game.slug}`} target="_blank" rel="noopener" className="small">플레이 화면 열기</a>
        </p>
      )}
      <div className="admin-actions">
        <label className="btn btn-sm">{busy ? '올리는 중…' : file ? '새 버전 올리기' : 'HTML 파일 올리기'}<input type="file" accept=".html,.htm,text/html" hidden disabled={busy} onChange={onFile} /></label>
        {file && <button type="button" className="btn btn-danger btn-sm" onClick={remove}>파일 삭제</button>}
      </div>
      {error && <p className="error">{error}</p>}
      {msg && <p className="notice">{msg}</p>}
    </section>
  );
}
