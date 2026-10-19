'use client';
import { useCallback, useEffect, useState } from 'react';
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
          <span>사진 (첫 번째 사진이 목록 썸네일)</span>
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
        <label className="field"><span>본문</span><textarea rows={14} value={p.content} onChange={(e) => setP({ ...p, content: e.target.value })} /></label>
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
