import DEFAULTS from '@/site.config';

const HEX = /^#[0-9a-fA-F]{6}$/;

export const LIMITS = { logoSize: [40, 200], headerLogoSize: [14, 48] };

function clamp(v, min, max, d) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : d;
}

export function mergeSettings(saved) {
  const s = { ...DEFAULTS, ...(saved || {}) };
  const c = { ...DEFAULTS.colors, ...((saved && saved.colors) || {}) };
  s.colors = {
    bg: HEX.test(c.bg) ? c.bg : DEFAULTS.colors.bg,
    ink: HEX.test(c.ink) ? c.ink : DEFAULTS.colors.ink,
    point: HEX.test(c.point) ? c.point : DEFAULTS.colors.point,
  };
  s.people = Array.isArray(s.people) ? s.people : DEFAULTS.people;
  s.logoSize = clamp(s.logoSize, 40, 200, DEFAULTS.logoSize);
  s.headerLogoSize = clamp(s.headerLogoSize, 14, 48, DEFAULTS.headerLogoSize);
  s.showLogoSub = s.showLogoSub !== false;
  return s;
}

export function luminance(hex) {
  const h = hex.replace('#', '');
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}

export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
