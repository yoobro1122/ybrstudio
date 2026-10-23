'use client';
import { useEffect, useRef, useState } from 'react';
import { browserClient } from '@/lib/supabase';
import { getVid } from '@/lib/visitor';

function Heart({ on }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.9 3.9 4.5 7.3 4.5c2 0 3.5 1.1 4.7 2.7 1.2-1.6 2.7-2.7 4.7-2.7 3.4 0 5.6 3.4 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4Z"
        fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export default function LikeShare({ gameId, initialLikes = 0, title, text, path }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(initialLikes);
  const [busy, setBusy] = useState(false);
  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    const vid = getVid();
    if (!vid) return;
    browserClient().rpc('like_state', { p_game: gameId, p_vid: vid }).then(({ data }) => {
      if (data?.[0]) { setLiked(!!data[0].liked); setLikes(Number(data[0].likes)); }
    });
  }, [gameId]);

  useEffect(() => {
    if (!menu) return;
    const close = (e) => { if (wrap.current && !wrap.current.contains(e.target)) setMenu(false); };
    const esc = (e) => { if (e.key === 'Escape') setMenu(false); };
    document.addEventListener('click', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('click', close); document.removeEventListener('keydown', esc); };
  }, [menu]);

  async function toggle() {
    const vid = getVid();
    if (!vid || busy) return;
    setBusy(true);
    // 먼저 화면에 반영하고, 실패하면 되돌려요.
    const prev = { liked, likes };
    setLiked(!liked); setLikes(likes + (liked ? -1 : 1));
    const { data, error } = await browserClient().rpc('toggle_like', { p_game: gameId, p_vid: vid });
    if (error || !data?.[0]) { setLiked(prev.liked); setLikes(prev.likes); }
    else { setLiked(!!data[0].liked); setLikes(Number(data[0].likes)); }
    setBusy(false);
  }

  const url = () => location.origin + path;

  async function share() {
    if (navigator.share) {
      try { await navigator.share({ title, text, url: url() }); return; } catch (e) { if (e && e.name === 'AbortError') return; }
    }
    setMenu(!menu);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(url()); }
    catch {
      const t = document.createElement('textarea'); t.value = url(); document.body.appendChild(t); t.select();
      try { document.execCommand('copy'); } catch {}
      t.remove();
    }
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  }

  const enc = encodeURIComponent;
  return (
    <div className="like-share" ref={wrap}>
      <button type="button" className={`ls-btn like ${liked ? 'on' : ''}`} aria-pressed={liked} onClick={toggle} disabled={busy}>
        <Heart on={liked} /><span>좋아요</span><span className="ls-count">{likes.toLocaleString('ko-KR')}</span>
      </button>
      <div className="share-wrap">
        <button type="button" className="ls-btn" aria-haspopup="true" aria-expanded={menu} onClick={share}>
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
          </svg>
          <span>공유하기</span>
        </button>
        {menu && (
          <div className="share-menu" role="menu">
            <button type="button" role="menuitem" onClick={copy}>{copied ? '링크를 복사했어요' : '링크 복사'}</button>
            <a role="menuitem" href={`https://x.com/intent/post?text=${enc(title)}&url=${enc(url())}`} target="_blank" rel="noopener noreferrer">X에 공유</a>
            <a role="menuitem" href={`https://www.facebook.com/sharer/sharer.php?u=${enc(url())}`} target="_blank" rel="noopener noreferrer">페이스북에 공유</a>
          </div>
        )}
      </div>
    </div>
  );
}
