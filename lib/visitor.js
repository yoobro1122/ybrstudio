// 브라우저마다 하나씩 만드는 임의 번호. 방문자 수와 좋아요 중복 방지에 써요.
export function getVid() {
  try {
    let vid = localStorage.getItem('ybr_vid');
    if (!vid) {
      vid = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2);
      localStorage.setItem('ybr_vid', vid);
    }
    return vid;
  } catch {
    return '';
  }
}
