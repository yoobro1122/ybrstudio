'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

// 메인 상단 업데이트 로그. 4초마다 한 줄씩 바뀌고, 마우스를 올리거나 포커스하면 멈춰요.
export default function UpdateTicker({ items }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (items.length < 2 || paused) return;
    const t = setInterval(() => setI((n) => (n + 1) % items.length), 4000);
    return () => clearInterval(t);
  }, [items.length, paused]);

  if (!items.length) return null;
  const it = items[i];

  return (
    <div className="ticker" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="wrap ticker-inner">
        <span className="ticker-label">UPDATE</span>
        <div className="ticker-window" aria-live="polite">
          <Link key={it.id} href={it.href} className="ticker-item">
            <time dateTime={it.iso}>{it.when}</time>
            <span className="ticker-game">{it.game}</span>
            <span className="ticker-text">{it.text}</span>
          </Link>
        </div>
        {items.length > 1 && (
          <span className="ticker-nav">
            <button type="button" aria-label="이전 소식" onClick={() => setI((i - 1 + items.length) % items.length)}>‹</button>
            <span className="ticker-count">{i + 1}/{items.length}</span>
            <button type="button" aria-label="다음 소식" onClick={() => setI((i + 1) % items.length)}>›</button>
          </span>
        )}
      </div>
    </div>
  );
}
