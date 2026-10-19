'use client';
import { useCallback, useEffect, useState } from 'react';
import { fmtDate } from '@/lib/format';

export default function MessagesAdmin({ sb }) {
  const [rows, setRows] = useState([]);

  const load = useCallback(async () => {
    const { data } = await sb.from('messages').select('*').order('created_at', { ascending: false });
    setRows(data || []);
  }, [sb]);
  useEffect(() => { load(); }, [load]);

  async function toggleRead(m) {
    await sb.from('messages').update({ is_read: !m.is_read }).eq('id', m.id);
    load();
  }
  async function remove(id) {
    if (!confirm('이 문의를 삭제할까요?')) return;
    await sb.from('messages').delete().eq('id', id);
    load();
  }

  if (!rows.length) return <p className="empty">받은 문의가 없어요.</p>;
  return (
    <ul className="admin-list">
      {rows.map((m) => (
        <li key={m.id} className={m.is_read ? 'read' : ''}>
          <div className="admin-item-main">
            <p className="small muted">{fmtDate(m.created_at)} {!m.is_read && <span className="badge pending">새 문의</span>}</p>
            <p><strong>{m.subject || '(제목 없음)'}</strong></p>
            <p className="small">{m.name} · <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + (m.subject || 'YBR STUDIO 문의'))}`}>{m.email}</a></p>
            <p className="prose">{m.content}</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-ghost btn-sm" onClick={() => toggleRead(m)}>{m.is_read ? '안 읽음으로' : '읽음'}</button>
            <button className="btn btn-danger btn-sm" onClick={() => remove(m.id)}>삭제</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
