import GameList from '@/components/GameList';
import { getSettings } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const TITLE = '보드게임';
const LEAD = '테이블 위에서 즐기는 게임들이에요. 웹 테스트가 열린 게임은 바로 플레이해볼 수 있어요.';

export async function generateMetadata() {
  const s = await getSettings();
  return pageMeta(s, { title: TITLE, description: `${s.siteName}의 ${TITLE} 목록. ${LEAD}`, path: '/boardgames' });
}

export default function Page() {
  return <GameList title={TITLE} category="board" lead={LEAD} />;
}
