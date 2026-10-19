import GameList from '@/components/GameList';

export const dynamic = 'force-dynamic';
export const metadata = { title: '보드게임' };

export default function Page() {
  return <GameList title="보드게임" category="board" lead="테이블 위에서 즐기는 게임들이에요. 웹 테스트가 열린 게임은 바로 플레이해볼 수 있어요." />;
}
