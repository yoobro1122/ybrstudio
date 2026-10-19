'use client';
import { useCallback, useEffect, useState } from 'react';
import { fmtDate, stars } from '@/lib/format';

const FILTERS = [
  { key: 'pending', label: '검토 대기' },
  { key: 'approved', label: '공개' },
  { key: 'hidden', label: '숨김' },
  { key: 'all', label: '전체' },
];
const STATUS_LABEL = { pending: '검토 대기', approved: '공개', hidden: '숨김' };

export default function ReviewsAdmin({ sb }) {
  const [filter, setFilter] = useState('pending');
  const [rows, setRows] = useState([]);
  const [pending, setPending] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    let q = sb.from('reviews').select('*, games(title)').order('created_at', { ascending: false });
    if (filter !== 'all') q = q.eq('status', filter);
    const [{ data }, { count }] = await Promise.all([
      q,
      sb.from('reviews').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);
    setRows(data || []);
    setPending(count || 0);
    setLoading(false);
  }, [sb, filter]);

  useEffect(() => { load(); }, [load]);

  async function setStatus(id, status) {
    await sb.from('reviews').update({ status }).eq('id', id);
    load();
  }
  async function remove(id) {
    if (!confirm('이 후기를 삭제할까요? 되돌릴 수 없어요.')) return;
    await sb.from('reviews').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="chips">
        {FILTERS.map((f) => (
          <button key={f.key} className={filter === f.key ? 'on' : ''} onClick={() => setFilter(f.key)}>
            {f.label}{f.key === 'pending' && pending > 0 ? ` ${pending}` : ''}
          </button>
        ))}
      </div>
      {loading ? <p className="muted">불러오는 중…</p> : rows.length === 0 ? (
        <p className="empty">{filter === 'pending' ? '검토할 후기가 없어요.' : '해당하는 후기가 없어요.'}</p>
      ) : (
        <ul className="admin-list">
          {rows.map((r) => (
            <li key={r.id}>
              <div className="admin-item-main">
                <p className="small muted">{r.games?.title} · {fmtDate(r.created_at)} · <span className={`badge ${r.status}`}>{STATUS_LABEL[r.status]}</span></p>
                <p><strong>{r.nickname}</strong> <span className="stars">{stars(r.rating)}</span></p>
                <p>{r.content}</p>
              </div>
              <div className="admin-actions">
                {r.status !== 'approved' && <button className="btn btn-sm" onClick={() => setStatus(r.id, 'approved')}>공개</button>}
                {r.status !== 'hidden' && <button className="btn btn-ghost btn-sm" onClick={() => setStatus(r.id, 'hidden')}>숨김</button>}
                <button className="btn btn-danger btn-sm" onClick={() => remove(r.id)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
