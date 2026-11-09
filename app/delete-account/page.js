import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import { pageMeta } from '@/lib/seo';

export async function generateMetadata() {
  const s = await getSettings();
  return pageMeta(s, { title: '계정 및 데이터 삭제 요청', description: '렛츠콕! 배드민턴의 계정 및 데이터 삭제를 앱 재설치 없이 이메일로 요청하는 방법을 안내합니다.', path: '/delete-account' });
}

const email = 'denghoon@yoobros.com';
const subject = '[렛츠콕! 배드민턴] 계정 및 데이터 삭제 요청';
const body = `앱 이름: 렛츠콕! 배드민턴
요청 내용: 계정 및 관련 데이터 삭제
닉네임(기억하는 경우):
프로필 ID 또는 Unity 플레이어 ID(알고 있는 경우):
이전에 문의·신고한 이메일 주소(해당하는 경우):
추가 설명(선택):

삭제할 데이터와 남겨야 하는 데이터가 있다면 그 사유·보관 기간을 안내해 주세요.`;
const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export default function DeleteAccountPage() {
  return (
    <article className="section wrap page-top privacy">
      <header className="privacy-header">
        <p className="kind">유브로스 · 유브로스 게임즈</p>
        <h1>계정 및 데이터 삭제 요청</h1>
        <p className="lead">렛츠콕! 배드민턴의 계정 및 관련 데이터 삭제는 아래 이메일로 요청할 수 있습니다. 앱을 재설치하거나 로그인할 필요가 없습니다.</p>
        <p>운영자: 유명훈 · 유브로스</p>
        <a className="btn" href={mailto}>삭제 요청 메일 작성</a>
        <p className="small muted">버튼은 이메일 앱의 작성 화면을 엽니다. 내용을 확인하고 직접 전송해야 요청이 접수됩니다.</p>
      </header>
      <section className="privacy-section" aria-labelledby="request-title">
        <h2 id="request-title">1. 웹에서 삭제를 요청하는 방법</h2>
        <ol>
          <li>위 버튼을 누르거나, 평소 사용하는 이메일 서비스에서 <a href={`mailto:${email}`}>{email}</a> 앞으로 메일을 작성합니다.</li>
          <li>제목에 “렛츠콕! 배드민턴 계정 및 데이터 삭제 요청”을 적고 삭제를 원하는 내용을 알려 주세요.</li>
          <li>기억하는 닉네임, 알고 있는 프로필 ID·Unity 플레이어 ID 또는 이전 문의·신고 이메일 주소가 있다면 적어 주세요. ID를 모르는 경우에도 요청할 수 있습니다.</li>
          <li>운영자가 대상 정보 확인에 필요한 최소한의 사항과 처리 가능한 범위를 회신합니다. 확인 후 삭제 결과와 별도 보관이 필요한 정보의 사유·기간을 안내합니다.</li>
        </ol>
        <p>이메일 앱이 열리지 않으면 웹메일에서 위 주소로 직접 보내 주세요. ID를 확인하기 위한 앱 재설치는 요구하지 않습니다. 비밀번호, 인증 코드, 신분증 또는 Google 계정 비밀번호를 보내지 마세요.</p>
        <p>프로필 ID와 Unity 익명 플레이어 ID는 서로 다릅니다. 닉네임만으로는 동일한 이용자를 구분하기 어려울 수 있으며, 필요한 정보를 확인할 수 없는 경우 그 사유와 가능한 후속 절차를 안내합니다.</p>
      </section>
      <section className="privacy-section" aria-labelledby="data-title">
        <h2 id="data-title">2. 데이터 종류와 삭제 범위</h2>
        <h3>기기에 저장된 데이터</h3>
        <p>닉네임, 프로필 ID, 캐릭터 색상·의상, 약관 동의 버전, 차단 목록, 게임 설정, 경기 전적과 익명 접속 정보는 기기에 저장됩니다. 운영자는 이메일 요청만으로 이용자의 기기를 원격 초기화할 수 없습니다. 기기에 앱이 남아 있는 경우 운영체제 설정에서 앱 데이터를 삭제할 수 있습니다. 기기를 사용하지 못하더라도 운영자가 보관하는 정보의 삭제는 이메일로 요청할 수 있습니다.</p>
        <h3>Unity 익명 계정과 관련 데이터</h3>
        <p>인터넷 대전에는 Unity 익명 플레이어 ID와 접속 정보 등이 사용됩니다. 앱 데이터 삭제만으로 Unity 계정이 삭제되는 것은 아닙니다. 이메일 요청 시 해당 계정의 식별 및 삭제 처리 가능 범위를 확인하여 안내합니다. 이름·이메일을 등록하지 않은 익명 계정은 이메일 주소만으로 연결할 수 없습니다.</p>
        <h3>운영자에게 보낸 문의·신고</h3>
        <p>운영자가 보관하는 문의·신고의 발신 이메일, 본문·첨부 자료 및 관련 처리 기록에 대해 삭제를 요청할 수 있습니다. 삭제 대상 확인에 필요한 최소한의 정보를 확인하여 처리합니다.</p>
        <h3>백업 및 상대 기기에 전달된 데이터</h3>
        <p>Google 등의 기기 백업은 해당 계정의 백업 설정에서 관리해야 합니다. 대전 상대에게 이미 전달된 닉네임·프로필 정보와 이용자가 별도로 보관한 자료는 운영자가 원격으로 삭제할 수 없습니다.</p>
      </section>
      <section className="privacy-section" aria-labelledby="retention-title">
        <h2 id="retention-title">3. 별도 보관되는 데이터</h2>
        <p>문의·신고 및 처리 기록은 개인정보처리방침에 안내된 처리 목적이 유지되는 동안 보관하며, 더 이상 필요하지 않으면 삭제합니다. 법령에 따른 보존 또는 분쟁 대응 등으로 일부 정보를 남겨야 하는 경우에는 해당 정보, 사유와 보관 기간을 삭제 요청에 대한 답변으로 안내합니다.</p>
        <p>Unity의 보관 정보에는 Unity의 처리·보관 정책도 적용됩니다. 자세한 내용은 <a href="https://unity.com/legal/game-player-and-app-user-privacy-policy" target="_blank" rel="noopener noreferrer">Unity 개인정보처리방침</a>을 확인해 주세요.</p>
      </section>
      <section className="privacy-section" aria-labelledby="result-title">
        <h2 id="result-title">4. 처리 결과와 문의</h2>
        <p>운영자는 요청을 확인하여 처리 범위와 진행 상황을 답장으로 안내합니다. 삭제가 완료된 데이터는 복구되지 않을 수 있습니다. 삭제 요청에 관한 문의나 추가 설명은 같은 메일로 보내 주세요.</p>
        <p><a href={`mailto:${email}`}>{email}</a> · 유명훈 · <a href="tel:01052209785">010-5220-9785</a></p>
        <p><Link href="/privacy#deletion">개인정보 보관·삭제 안내</Link> · <Link href="/terms">서비스 이용약관</Link></p>
      </section>
    </article>
  );
}
