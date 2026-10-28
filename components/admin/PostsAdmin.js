'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import PostBody from '@/components/PostBody';
import { fmtDate } from '@/lib/format';
import { uploadImage } from './upload';

export default function PostsAdmin({ sb }) {
  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const { data } = await sb.from('posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  if (editing) return <PostForm sb={sb} initial={editing} onDone={() => { setEditing(null); load(); }} />;

  return (
    <div>
      <button className="btn" onClick={() => setEditing({ title: '', content: '', images: [], published: true })}>새 글 쓰기</button>
      {posts.length === 0 ? <p className="empty">아직 쓴 글이 없어요.</p> : (
        <ul className="admin-list">
          {posts.map((p) => (
            <li key={p.id}>
              <div className="admin-item-main">
                <p><strong>{p.title}</strong> {!p.published && <span className="badge hidden">비공개</span>}</p>
                <p className="small muted">{fmtDate(p.created_at)} · 사진 {p.images?.length || 0}장</p>
              </div>
              <div className="admin-actions"><button className="btn btn-ghost btn-sm" onClick={() => setEditing(p)}>수정</button></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PostForm({ sb, initial, onDone }) {
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(false);
  const bodyRef = useRef(null);

  // 커서 위치에 사진 줄을 끼워 넣어요. 사진은 항상 한 줄을 차지해요.
  function insertAtCursor(lines) {
    const ta = bodyRef.current;
    const text = p.content || '';
    const pos = ta ? ta.selectionStart : text.length;
    const before = text.slice(0, pos), after = text.slice(pos);
    const pre = before && !before.endsWith('\n') ? '\n' : '';
    const post = after && !after.startsWith('\n') ? '\n' : '';
    const block = pre + lines.join('\n') + '\n' + post;
    const next = before + block + after;
    setP((prev) => ({ ...prev, content: next }));
    requestAnimationFrame(() => {
      if (!ta) return;
      const c = (before + block).length;
      ta.focus(); ta.setSelectionRange(c, c);
    });
  }

  async function onBodyImages(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    setBusy(true); setError('');
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImage(sb, f));
      insertAtCursor(urls.map((u) => `![](${u})`));
    } catch { setError('사진을 올리지 못했어요.'); }
    setBusy(false);
  }

  async function onImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImage(sb, f));
      setP((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch { setError('사진을 올리지 못했어요.'); }
    setBusy(false);
    e.target.value = '';
  }

  function move(i, d) {
    const imgs = [...p.images];
    const j = i + d;
    if (j < 0 || j >= imgs.length) return;
    [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
    setP({ ...p, images: imgs });
  }

  async function save(e) {
    e.preventDefault();
    setError('');
    if (!p.title.trim()) return setError('제목을 입력하세요.');
    setBusy(true);
    const fields = { title: p.title.trim(), content: p.content, images: p.images || [], published: p.published };
    const res = p.id ? await sb.from('posts').update(fields).eq('id', p.id) : await sb.from('posts').insert(fields);
    setBusy(false);
    if (res.error) return setError('저장하지 못했어요.');
    onDone();
  }

  async function remove() {
    if (!confirm('이 글을 삭제할까요? 되돌릴 수 없어요.')) return;
    await sb.from('posts').delete().eq('id', p.id);
    onDone();
  }

  return (
    <div>
      <button className="more" onClick={onDone}>목록으로</button>
      <form className="form admin-form" onSubmit={save}>
        <h2>{p.id ? '글 수정' : '새 글'}</h2>
        <label className="field"><span>제목</span><input value={p.title} onChange={(e) => setP({ ...p, title: e.target.value })} /></label>
        <div className="field">
          <div className="body-toolbar">
            <span>본문</span>
            <div className="admin-actions">
              <label className={`btn btn-sm ${busy ? 'disabled' : ''}`}>{busy ? '올리는 중…' : '사진 넣기'}<input type="file" accept="image/*" multiple hidden disabled={busy} onChange={onBodyImages} /></label>
              <button type="button" className="btn btn-ghost btn-sm" aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? '편집하기' : '미리보기'}</button>
            </div>
          </div>
          {preview ? (
            <div className="body-preview post"><PostBody content={p.content} title={p.title} /></div>
          ) : (
            <textarea ref={bodyRef} rows={18} value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} />
          )}
          <p className="small muted">본문에서 사진을 넣을 위치를 클릭한 뒤 "사진 넣기"를 누르세요. 사진은 <code>![](주소)</code> 한 줄로 들어가고, 대괄호 안에 글을 쓰면 사진 설명이 돼요. 예: <code>![3차 테스트 현장](주소)</code>. 줄을 잘라내고 붙여넣으면 사진 위치를 옮길 수 있어요.</p>
        </div>
        <div className="field">
          <span>본문 위에 모아 보여줄 사진 <em className="muted">(선택 · 첫 번째 사진이 목록 썸네일)</em></span>
          {p.images?.length > 0 && (
            <div className="image-grid">
              {p.images.map((src, i) => (
                <div key={src} className="image-tile">
                  <img src={src} alt="" />
                  <div className="tile-actions">
                    <button type="button" aria-label="앞으로" onClick={() => move(i, -1)}>‹</button>
                    <button type="button" aria-label="뒤로" onClick={() => move(i, 1)}>›</button>
                    <button type="button" aria-label="사진 빼기" onClick={() => setP({ ...p, images: p.images.filter((x) => x !== src) })}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <input type="file" accept="image/*" multiple onChange={onImages} />
        </div>
        <label className="check"><input type="checkbox" checked={p.published} onChange={(e) => setP({ ...p, published: e.target.checked })} /> 공개하기</label>
        {error && <p className="error">{error}</p>}
        <div className="admin-actions">
          <button className="btn" disabled={busy}>{busy ? '저장 중…' : p.published ? '발행' : '비공개로 저장'}</button>
          {p.id && <button type="button" className="btn btn-danger" onClick={remove}>글 삭제</button>}
        </div>
      </form>
    </div>
  );
}
