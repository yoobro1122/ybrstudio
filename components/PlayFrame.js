'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

// 게임을 화면 전체로 띄우고, 게임 안의 "종료" 버튼 신호를 받아 게임 소개로 돌아갑니다.
export default function PlayFrame({ slug, title, src }) {
  const ref = useRef(null);
  const router = useRouter();
  const [linked, setLinked] = useState(false);
  const [fallback, setFallback] = useState(false);

  function hello() {
    const w = ref.current && ref.current.contentWindow;
    if (w) w.postMessage({ type: 'yoobros-host' }, '*');
  }

  useEffect(() => {
    document.body.classList.add('playing');
    const onMsg = (e) => {
      if (!ref.current || e.source !== ref.current.contentWindow || !e.data) return;
      if (e.data.type === 'yoobros-ready') setLinked(true);
      if (e.data.type === 'yoobros-exit') router.push(`/games/${slug}`);
    };
    window.addEventListener('message', onMsg);
    // 종료 버튼을 지원하지 않는 게임 파일이면 2초 뒤 기본 나가기 버튼을 보여줍니다.
    const t = setTimeout(() => setFallback(true), 2000);
    // iframe가 화면 준비보다 먼저 열릴 수 있어서, 연결될 때까지 몇 번 신호를 보냅니다.
    let tries = 0;
    const iv = setInterval(() => { hello(); if (++tries >= 12) clearInterval(iv); }, 400);
    return () => { document.body.classList.remove('playing'); window.removeEventListener('message', onMsg); clearTimeout(t); clearInterval(iv); };
  }, [router, slug]);


  return (
    <div className="play-full">
      <iframe
        ref={ref}
        src={src}
        title={`${title} 웹 트라이얼`}
        sandbox="allow-scripts allow-forms allow-modals allow-popups allow-pointer-lock allow-downloads"
        allow="fullscreen; autoplay"
        onLoad={hello}
      />
      {fallback && !linked && (
        <button type="button" className="play-exit" onClick={() => router.push(`/games/${slug}`)} aria-label="게임 종료하고 소개로 돌아가기">종료</button>
      )}
    </div>
  );
}
