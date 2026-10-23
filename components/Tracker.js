'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getVid } from '@/lib/visitor';

// 페이지를 볼 때마다 방문 기록을 남깁니다. 관리자로 로그인한 브라우저와 관리자 화면은 제외해요.
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    try {
      if (!path || path.startsWith('/admin')) return;
      if (navigator.webdriver) return;
      if (Object.keys(localStorage).some((k) => /^sb-.*-auth-token$/.test(k))) return;
      const vid = getVid();
      if (!vid) return;
      let ref = '';
      if (!sessionStorage.getItem('ybr_ref_sent') && document.referrer) {
        const h = new URL(document.referrer).host;
        if (h && h !== location.host) ref = h.replace(/^www\./, '');
        sessionStorage.setItem('ybr_ref_sent', '1');
      }
      fetch('/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path, vid, ref }), keepalive: true }).catch(() => {});
    } catch {}
  }, [path]);
  return null;
}
