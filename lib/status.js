export const STAGES = [
  { key: 'idea', label: '아이디어' },
  { key: 'prototype', label: '프로토타입' },
  { key: 'playtest', label: '플레이테스트' },
  { key: 'polish', label: '다듬는 중' },
  { key: 'released', label: '출시' },
];

export function stageIndex(key) {
  const i = STAGES.findIndex((s) => s.key === key);
  return i < 0 ? 0 : i;
}

export function stageLabel(key) {
  return STAGES[stageIndex(key)].label;
}
