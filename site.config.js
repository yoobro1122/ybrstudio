// 기본값입니다. 관리자 > 사이트 설정에서 저장하면 그 값이 우선 적용돼요.
// 설정을 한 번도 저장하지 않았거나 DB를 불러오지 못할 때 이 값이 쓰입니다.
const site = {
  siteName: 'YOOBROS STUDIO',
  wordmark: 'YOOBROS',
  logoSub: 'YOOBROS GAME STUDIO',
  headline: '한 편의 영화 같은\n게임을 만듭니다.',
  headlineSize: 60,     // 메인 헤드라인 글자 크기(px)
  intro:
    'YOOBROS STUDIO는 PC/Mobile 게임과 보드게임을 제작하는 스튜디오입니다.\n테마 속 주인공이 된 것 같은 몰입감을 느끼셨으면 합니다.',
  contactLead: '게임 협업, 플레이테스트 참여, 출판 제안 모두 환영해요.',
  colors: { bg: '#FFFFFF', ink: '#1C1C1F', point: '#F2613F' },
  logoUrl: '',
  logoSize: 88,        // 메인 로고 높이(px)
  showLogoSub: true,   // 로고 아래 문구 표시
  headerLogoSize: 20,  // 상단 로고 크기(px)
  headerLogoMode: 'text', // 'text' | 'image'
  headerLogoUrl: '',
  footerLogoMode: 'main', // 'main'(메인 로고와 같게) | 'image' | 'none'
  footerLogoUrl: '',
  footerLogoSize: 18,     // 하단 로고 높이(px)
  copyright: '© 2026 YOOBROS STUDIO',
  footerEmail: '',
  footerNote: '',
  people: [
    { name: '유브로', roles: '기획, 제작', email: '', phone: '', instagram: '' },
    { name: '띵훈', roles: '기획, 디자인, 개발', email: '', phone: '', instagram: '' },
  ],
};

export default site;
