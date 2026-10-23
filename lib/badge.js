const DAY = 24 * 60 * 60 * 1000;

// 새로 올린 지 N일 안이면 New, 그 뒤로 수정된 지 N일 안이면 Up
export function badgeFor(game, days = 14) {
  if (!game || !days) return null;
  const now = Date.now();
  const created = new Date(game.created_at).getTime();
  const updated = game.updated_at ? new Date(game.updated_at).getTime() : created;
  if (now - created < days * DAY) return 'new';
  if (updated - created > 60 * 60 * 1000 && now - updated < days * DAY) return 'up';
  return null;
}

export const BADGE_LABEL = { new: 'New', up: 'Up' };
