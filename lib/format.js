export function fmtDate(d) {
  return new Date(d).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul',
  });
}

export function stars(n) {
  const r = Math.max(0, Math.min(5, Math.round(n || 0)));
  return '★'.repeat(r) + '☆'.repeat(5 - r);
}

export function excerpt(text, len = 90) {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > len ? t.slice(0, len) + '…' : t;
}
