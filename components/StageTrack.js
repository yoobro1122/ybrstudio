import { STAGES, stageIndex } from '@/lib/status';

// 개발 단계를 보드게임 점수 트랙처럼 보여줍니다. 현재 칸에 미플 머리가 올라갑니다.
export default function StageTrack({ status, compact = false }) {
  const current = stageIndex(status);
  return (
    <ol className={`track ${compact ? 'track-compact' : ''}`} aria-label={`개발 단계: ${STAGES[current].label}`}>
      {STAGES.map((s, i) => (
        <li
          key={s.key}
          className={`space ${i < current ? 'done' : ''} ${i === current ? 'now' : ''}`}
          aria-current={i === current ? 'step' : undefined}
        >
          <span className="cell">{i === current && <span className="meeple" aria-hidden="true" />}</span>
          {!compact && <span className="space-label">{s.label}</span>}
        </li>
      ))}
    </ol>
  );
}
