import GameList from '@/components/GameList';
import { getSettings } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const TITLE = '전체 게임';
const LEAD = 'PC&Mobile 게임과 보드게임을 모두 모았어요.';

export async function generateMetadata() {
  const s = await getSettings();
  return pageMeta(s, { title: TITLE, description: `${s.siteName}의 ${TITLE} 목록. ${LEAD}`, path: '/games' });
}

export default function Page() {
  return <GameList title={TITLE} lead={LEAD} />;
}
