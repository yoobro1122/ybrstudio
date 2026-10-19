import GameList from '@/components/GameList';

export const dynamic = 'force-dynamic';
export const metadata = { title: '전체 게임' };

export default function Page() {
  return <GameList title="전체 게임" lead="PC&Mobile 게임과 보드게임을 모두 모았어요." />;
}
