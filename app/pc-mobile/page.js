import GameList from '@/components/GameList';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'PC&Mobile' };

export default function Page() {
  return <GameList title="PC&Mobile" category="digital" lead="PC와 모바일로 즐기는 게임들이에요. 웹 테스트가 열린 게임은 바로 플레이해볼 수 있어요." />;
}
