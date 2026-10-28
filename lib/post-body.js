// 블로그 본문 형식: 한 줄에 ![설명](이미지주소) 만 있으면 그 자리에 사진이 들어가요.
export const IMG_LINE = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)\s*$/;
const IMG_ANY = /!\[[^\]]*\]\((https?:\/\/[^\s)]+)\)/g;

export function parseBody(text) {
  const blocks = [];
  let buf = [];
  const flush = () => { if (buf.join('').trim()) blocks.push({ type: 'text', text: buf.join('\n').replace(/^\n+|\n+$/g, '') }); buf = []; };
  for (const line of String(text || '').split('\n')) {
    const m = line.trim().match(IMG_LINE);
    if (m) { flush(); blocks.push({ type: 'img', alt: m[1].trim(), src: m[2] }); }
    else buf.push(line);
  }
  flush();
  return blocks;
}

export function bodyImages(text) {
  return [...String(text || '').matchAll(IMG_ANY)].map((m) => m[1]);
}

export function stripImages(text) {
  return String(text || '').replace(IMG_ANY, ' ');
}
