import { getSettings } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';

export async function generateMetadata() {
  const s = await getSettings();
  return pageMeta(s, { title: '개인정보처리방침', description: '유브로스의 게임·앱과 웹사이트 이용 시 처리되는 정보와 이용자의 권리를 안내합니다.', path: '/privacy' });
}

const sections = [
  ['scope', '적용 범위'],
  ['apps', '게임·앱 기본 이용'],
  ['online', '인터넷 대전'],
  ['wifi', '같은 Wi-Fi 대전'],
  ['website', '웹사이트 이용'],
  ['providers', '외부 서비스와 정보 처리'],
  ['permissions', '기기 권한'],
  ['deletion', '보관·삭제와 이용자의 권리'],
  ['children', '아동의 개인정보'],
  ['changes', '방침 변경'],
  ['contact', '개인정보 보호책임자 및 문의'],
];

function PolicySection({ index, children }) {
  const [id, title] = sections[index];
  return <section id={id} className="privacy-section" aria-labelledby={`${id}-title`}><h2 id={`${id}-title`}>{index + 1}. {title}</h2>{children}</section>;
}

export default function PrivacyPage() {
  return (
    <article className="section wrap page-top privacy">
      <header className="privacy-header">
        <p className="kind">유브로스 · YOOBROS</p>
        <h1>개인정보처리방침</h1>
        <p className="muted small">시행일: <time dateTime="2026-11-06">2026년 11월 6일</time></p>
        <p className="lead">유브로스(운영자: 유명훈, 이하 “운영자”)는 이용자의 개인정보를 소중히 여기며, 서비스 이용 과정에서 어떤 정보가 어떻게 처리되는지 안내합니다.</p>
      </header>
      <nav className="privacy-toc" aria-label="개인정보처리방침 목차">
        <h2 className="h-small">목차</h2>
        <ol>{sections.map(([id, title]) => <li key={id}><a href={`#${id}`}>{title}</a></li>)}</ol>
      </nav>
      <PolicySection index={0}>
        <p>이 방침은 유브로스 및 유브로스 게임즈 이름으로 제공하며 이 방침을 연결한 게임·앱과 공식 웹사이트(이하 “서비스”)에 적용됩니다. 서비스별로 제공하는 기능이 다르므로, 인터넷 대전·같은 Wi-Fi 대전 등 선택 기능에 관한 내용은 해당 기능을 제공하는 서비스에서 이용자가 그 기능을 사용할 때 적용됩니다.</p>
        <p>특정 서비스에 별도의 개인정보처리방침이나 추가 안내가 있는 경우 해당 서비스의 안내를 함께 확인해 주세요. 수집 항목이나 목적이 다른 기능을 추가할 때에는 해당 내용을 사전에 안내합니다.</p>
      </PolicySection>
      <PolicySection index={1}>
        <p>회원가입·로그인 없이 이용하는 게임·앱의 기본 플레이에서는 운영자가 이름·이메일·전화번호·정확한 위치 등의 정보를 직접 수집하지 않습니다. 문의를 보내거나 웹사이트 기능을 이용하는 경우에는 제5항에 따라 정보가 처리됩니다.</p>
        <p>게임 설정(음량, 진동, 난이도, 튜토리얼 완료 여부 등), 경기 전적(승패·연승 기록 등), 인터넷 대전용 익명 접속 정보는 해당 기능을 제공하는 게임·앱의 이용자 기기에 저장됩니다. 앱 데이터를 지우면 삭제되며, 앱 삭제 시에도 운영체제의 정책에 따라 삭제됩니다.</p>
        <p>Android 기기 백업을 켠 경우 기기에 저장된 정보가 이용자의 Google 계정 백업에 포함되거나 재설치 시 복원될 수 있습니다. 백업과 삭제는 기기 설정 및 Google의 정책에 따릅니다.</p>
      </PolicySection>
      <PolicySection index={2}>
        <p>Unity 기반 인터넷 대전을 제공하는 게임·앱에서 자동 매칭, 방 만들기 또는 방 코드 참가를 이용하면 Unity Technologies(이하 “Unity”)의 익명 로그인(Unity Authentication)과 중계 서버(Unity Relay)를 이용해 상대 기기와 연결합니다. 이 과정에서 Unity는 대전 연결·인증·서비스 운영을 위해 다음 정보를 처리합니다.</p>
        <ul>
          <li>익명 플레이어 ID: 이름·이메일을 입력하지 않고 생성되는 무작위 식별자</li>
          <li>IP 주소와 이를 바탕으로 한 대략적인 위치: 가까운 중계 서버 선택과 연결 유지</li>
          <li>연결·이용 기록과 성능 정보: 서비스 운영과 품질 개선</li>
          <li>자동 매칭 이용 시 임시 방 정보(앱 버전, 익명 플레이어 ID)와 진단 정보(Unity Lobby)</li>
        </ul>
        <p>경기 진행에 필요한 타격 입력과 시각, 점수 확인값 등은 암호화된 연결을 통해 중계 서버를 거쳐 상대 기기로 전달되며 운영자는 이를 별도로 저장하지 않습니다. 인터넷 대전을 이용하지 않으면 이 대전용 Unity 서비스는 시작되지 않습니다.</p>
        <p>Unity가 처리하는 정보의 보관·삭제와 이용자 권리에 관한 내용은 <a href="https://unity.com/legal/game-player-and-app-user-privacy-policy" target="_blank" rel="noopener noreferrer">Unity 개인정보처리방침</a>에서 확인할 수 있습니다.</p>
      </PolicySection>
      <PolicySection index={3}>
        <p>같은 Wi-Fi 대전을 제공하는 게임·앱에서는 같은 공유기에 연결된 상대 기기와 직접 연결하여 경기 진행 정보(타격 입력과 시각, 점수 확인값 등)와 기기의 내부 네트워크 주소를 주고받습니다. 방을 만든 동안에는 같은 Wi-Fi 안의 기기가 방을 찾도록 방 이름과 연결 주소를 알립니다.</p>
        <p>이 대전 정보는 외부 서버·운영자·제3자에게 전송되지 않으며, 경기가 끝나면 별도로 저장하지 않습니다.</p>
      </PolicySection>
      <PolicySection index={4}>
        <ul>
          <li><strong>문의:</strong> 이름, 이메일, 제목, 문의 내용과 접수 시각을 문의 확인 및 답변을 위해 처리합니다. 이메일·전화로 직접 문의하면 이용자가 전달한 연락처와 문의 내용도 같은 목적으로 처리합니다.</li>
          <li><strong>게임 후기:</strong> 닉네임, 별점, 후기 내용, 대상 게임과 작성 시각을 후기 검토·게시를 위해 저장합니다. 승인된 후기는 웹사이트에 공개되므로 연락처 등 개인정보를 내용에 적지 말아 주세요.</li>
          <li><strong>방문 통계:</strong> 브라우저에 생성한 무작위 방문자 식별자, 방문한 페이지 경로, 외부 유입 사이트의 도메인과 방문 시각을 방문자 수 집계 및 사이트 운영을 위해 저장합니다.</li>
          <li><strong>좋아요:</strong> 무작위 방문자 식별자, 대상 게임과 등록 시각을 좋아요 표시와 중복 방지를 위해 저장합니다.</li>
        </ul>
        <p>웹사이트는 브라우저의 로컬 저장소에 방문자 식별자(<code>ybr_vid</code>)를, 세션 저장소에 유입 경로 전송 여부(<code>ybr_ref_sent</code>)를 저장합니다. 브라우저 설정에서 사이트 데이터를 삭제하거나 저장을 제한할 수 있습니다. 저장을 제한하면 좋아요 등 일부 기능이 제한될 수 있으며, 사이트 데이터 삭제만으로 서버에 이미 저장된 기록이 삭제되지는 않습니다.</p>
      </PolicySection>
      <PolicySection index={5}>
        <p>운영자는 개인정보를 판매하거나 광고 목적으로 제공하지 않습니다. 웹사이트의 데이터 저장·조회에는 Supabase를 이용하며, 문의 이메일 알림 기능이 설정된 경우 Resend를 통해 문의자의 이름·이메일·문의 내용을 운영자에게 전달합니다. 인터넷 대전에는 제3항의 Unity 서비스 및 Unity의 서비스 제공 업체가 관여합니다.</p>
        <p>웹사이트와 외부 리소스를 제공하는 서버는 통신 과정에서 IP 주소 등 접속 정보를 처리할 수 있습니다. 외부 서비스의 처리·보관과 국외 처리 여부는 실제 이용 서비스의 계약 및 서버 설정에 따라 달라집니다. 관련 문의는 개인정보 보호책임자에게 연락해 주세요.</p>
        <p>광고·분석 도구·인앱 결제·채팅·음성·이름 표시 기능의 유무는 개별 게임·앱의 안내를 따릅니다. 제공하지 않는 기능을 위해 개인정보를 수집하지 않으며, 새롭게 정보를 처리하는 기능을 도입하면 해당 내용을 안내합니다.</p>
      </PolicySection>
      <PolicySection index={6}>
        <p>해당 기능을 제공하는 게임·앱은 타격 피드백을 위한 진동과 대전을 위한 네트워크 권한(인터넷 연결, Wi-Fi 멀티캐스트 수신 등)을 사용할 수 있습니다. 진동은 앱 설정에서 끌 수 있으며, 대전용 네트워크 기능은 대전 이용 시 사용합니다. 운영체제에서 별도 권한을 요청하는 경우 화면의 안내를 확인하고 허용 여부를 선택할 수 있습니다.</p>
      </PolicySection>
      <PolicySection index={7}>
        <p>기기에 저장된 게임·앱 정보는 앱 데이터 삭제로, 웹사이트의 브라우저 저장 정보는 사이트 데이터 삭제로 지울 수 있습니다. 백업에서 익명 접속 정보가 복원되지 않는 경우, 앱 데이터를 지운 뒤 인터넷 대전을 다시 이용하면 새 익명 플레이어 ID가 생성될 수 있습니다. 기기 정보 삭제가 Unity에 보관된 정보의 삭제를 의미하지는 않습니다.</p>
        <p>문의 정보는 문의 처리 목적이 달성될 때까지, 후기는 게시·관리 목적이 유지되는 동안, 방문·좋아요 기록은 통계 및 중복 방지 목적이 유지되는 동안 보관하며, 목적이 달성되거나 정보가 불필요해지면 삭제합니다. 법령에 따라 보존해야 하는 경우에는 해당 기간 동안 보관합니다.</p>
        <p>이용자는 개인정보 보호책임자에게 자신에 관한 정보의 열람·정정·삭제·처리 정지를 요청할 수 있습니다. 운영자는 요청 대상 확인에 필요한 최소한의 정보를 확인한 뒤 처리 결과를 안내합니다. 익명 식별자를 이용하는 기록은 이름·이메일만으로 특정하기 어려울 수 있으므로, 확인 가능한 방법을 함께 안내합니다. Unity가 보관하는 정보는 Unity의 권리 행사 절차도 이용할 수 있습니다.</p>
      </PolicySection>
      <PolicySection index={8}>
        <p>각 게임·앱의 이용 가능 연령은 해당 서비스와 앱 스토어의 안내를 따릅니다. 운영자는 만 14세 미만 아동의 개인정보를 의도적으로 수집하지 않습니다. 아동의 개인정보가 전달된 사실을 알게 된 경우 개인정보 보호책임자에게 연락해 주시면 확인 후 필요한 조치를 취합니다.</p>
      </PolicySection>
      <PolicySection index={9}>
        <p>이 방침이 변경되면 이 페이지에 변경 내용과 시행일을 안내합니다. 개인정보 처리 항목·목적 등 중요한 사항이 변경되는 경우 서비스 내 공지 등 적절한 방법으로 안내합니다.</p>
        <p>공용 개인정보처리방침 최초 시행일: 2026년 11월 6일</p>
      </PolicySection>
      <PolicySection index={10}>
        <dl className="privacy-contact">
          <div><dt>이름</dt><dd>유명훈</dd></div>
          <div><dt>이메일</dt><dd><a href="mailto:mhoo999@naver.com">mhoo999@naver.com</a></dd></div>
          <div><dt>전화</dt><dd><a href="tel:01052209785">010-5220-9785</a></dd></div>
        </dl>
      </PolicySection>
    </article>
  );
}
