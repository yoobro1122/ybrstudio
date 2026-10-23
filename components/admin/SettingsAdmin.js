'use client';
import { useEffect, useState } from 'react';
import { mergeSettings, contrast, LIMITS } from '@/lib/settings-shared';
import { LogoMark } from '@/components/Logo';
import { uploadImage } from './upload';

const PRESETS = [
  { label: '기본', bg: '#FFFFFF', ink: '#1C1C1F', point: '#F2613F' },
  { label: '다크', bg: '#151517', ink: '#EDEDEA', point: '#F2613F' },
  { label: '네이비', bg: '#F4F6FA', ink: '#1B2A4A', point: '#F2A900' },
];
const EMPTY_PERSON = { name: '', roles: '', email: '', phone: '', instagram: '' };

export default function SettingsAdmin({ sb }) {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    sb.from('site_settings').select('data').eq('id', 1).maybeSingle()
      .then(({ data }) => setS(mergeSettings(data?.data)));
  }, [sb]);

  if (!s) return <p className="muted">불러오는 중…</p>;

  const set = (k) => (e) => { setMsg(''); setS({ ...s, [k]: e.target.value }); };
  const setColor = (k) => (e) => { setMsg(''); setS({ ...s, colors: { ...s.colors, [k]: e.target.value.toUpperCase() } }); };
  const setPerson = (i, k) => (e) => {
    const people = s.people.map((p, j) => (j === i ? { ...p, [k]: e.target.value } : p));
    setMsg(''); setS({ ...s, people });
  };
  const { bg, ink, point } = s.colors;
  const low = contrast(bg, ink) < 4.5;

  async function upload(key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setError('');
    try {
      const url = await uploadImage(sb, file);
      setS((prev) => ({ ...prev, [key]: url, ...(key === 'headerLogoUrl' ? { headerLogoMode: 'image' } : {}), ...(key === 'footerLogoUrl' ? { footerLogoMode: 'image' } : {}) }));
    } catch { setError('이미지를 올리지 못했어요.'); }
    setBusy(false);
    e.target.value = '';
  }

  async function save() {
    setBusy(true); setError(''); setMsg('');
    const data = { ...s, people: s.people.filter((p) => p.name.trim()) };
    const { error: err } = await sb.from('site_settings').upsert({ id: 1, data, updated_at: new Date().toISOString() });
    setBusy(false);
    if (err) return setError('저장하지 못했어요. Supabase에 site_settings 테이블이 있는지 확인하세요.');
    setS(mergeSettings(data));
    setMsg('저장했어요. 사이트를 새로고침하면 바뀐 내용이 보여요.');
  }

  function reset() {
    if (!confirm('모든 설정을 기본값으로 되돌릴까요? 저장을 눌러야 사이트에 반영돼요.')) return;
    setS(mergeSettings(null)); setMsg('');
  }

  return (
    <div className="settings">
      <div className="settings-form">
        <section>
          <h2>로고</h2>
          <div className="field">
            <span>메인 로고 이미지</span>
            <div className="logo-field">
              <div className="logo-box">{s.logoUrl ? <img src={s.logoUrl} alt="" /> : '기본 YBR 로고'}</div>
              <div className="field">
                <label className="btn btn-ghost btn-sm">이미지 올리기<input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => upload('logoUrl', e)} /></label>
                {s.logoUrl && <button type="button" className="text-btn" onClick={() => setS({ ...s, logoUrl: '' })}>기본 로고로 되돌리기</button>}
              </div>
            </div>
            <p className="small muted">배경이 투명한 PNG나 SVG를 권장해요. 메인 첫 화면과 하단에 쓰여요.</p>
          </div>
          <label className="field">
            <span>메인 로고 크기 <em className="muted">{s.logoSize}px</em></span>
            <input type="range" min={LIMITS.logoSize[0]} max={LIMITS.logoSize[1]} step="2" value={s.logoSize} onChange={(e) => setS({ ...s, logoSize: Number(e.target.value) })} />
          </label>
          <label className="check"><input type="checkbox" checked={s.showLogoSub} onChange={(e) => setS({ ...s, showLogoSub: e.target.checked })} /> 로고 아래 문구 보이기 ({s.logoSub || '비어 있음'})</label>
          <div className="field">
            <span>상단 로고</span>
            <div className="chips">
              <button type="button" className={s.headerLogoMode === 'text' ? 'on' : ''} onClick={() => setS({ ...s, headerLogoMode: 'text' })}>글자 ({s.wordmark || '비어 있음'})</button>
              <button type="button" className={s.headerLogoMode === 'image' ? 'on' : ''} onClick={() => setS({ ...s, headerLogoMode: 'image' })}>이미지</button>
            </div>
            {s.headerLogoMode === 'image' && (
              <div className="logo-field">
                <div className="logo-box">{s.headerLogoUrl ? <img src={s.headerLogoUrl} alt="" /> : '이미지 없음'}</div>
                <label className="btn btn-ghost btn-sm">이미지 올리기<input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => upload('headerLogoUrl', e)} /></label>
              </div>
            )}
          </div>
          <label className="field">
            <span>상단 로고 크기 <em className="muted">{s.headerLogoSize}px</em></span>
            <input type="range" min={LIMITS.headerLogoSize[0]} max={LIMITS.headerLogoSize[1]} value={s.headerLogoSize} onChange={(e) => setS({ ...s, headerLogoSize: Number(e.target.value) })} />
          </label>
        </section>

        <section>
          <h2>색상</h2>
          <div className="chips">
            {PRESETS.map((p) => (
              <button type="button" key={p.label} onClick={() => setS({ ...s, colors: { bg: p.bg, ink: p.ink, point: p.point } })}>
                <span className="swatch" aria-hidden="true"><span style={{ background: p.bg }} /><span style={{ background: p.ink }} /><span style={{ background: p.point }} /></span>{p.label}
              </button>
            ))}
          </div>
          {[
            ['bg', '배경색', '페이지 바탕'],
            ['ink', '메인 컬러', '글자, 버튼, 테두리'],
            ['point', '포인트 컬러', '로고 점, 미플, 별점, 강조'],
          ].map(([k, label, help]) => (
            <label key={k} className="color-row">
              <input type="color" value={s.colors[k]} onChange={setColor(k)} aria-label={label} />
              <span><strong>{label}</strong><br /><span className="small muted">{help}</span></span>
              <span className="small muted">{s.colors[k]}</span>
            </label>
          ))}
          {low && <p className="warn">배경색과 메인 컬러가 비슷해서 글자가 잘 안 보일 수 있어요. 둘의 밝기 차이를 더 벌려주세요.</p>}
        </section>

        <section>
          <h2>사이트 문구</h2>
          <label className="field"><span>사이트 이름 (브라우저 탭, 공유 미리보기)</span><input value={s.siteName} onChange={set('siteName')} /></label>
          <div className="form-row">
            <label className="field"><span>상단 글자 로고</span><input value={s.wordmark} onChange={set('wordmark')} /></label>
            <label className="field"><span>로고 아래 문구</span><input value={s.logoSub} onChange={set('logoSub')} /></label>
          </div>
          <label className="field"><span>메인 헤드라인</span><textarea rows={2} value={s.headline} onChange={set('headline')} /></label>
          <label className="field">
            <span>헤드라인 글자 크기 <em className="muted">{s.headlineSize}px</em></span>
            <input type="range" min={LIMITS.headlineSize[0]} max={LIMITS.headlineSize[1]} step="2" value={s.headlineSize} onChange={(e) => setS({ ...s, headlineSize: Number(e.target.value) })} />
          </label>
          <label className="field"><span>메인 소개 문구</span><textarea rows={3} value={s.intro} onChange={set('intro')} /></label>
          <label className="field"><span>컨택 안내 문구</span><textarea rows={2} value={s.contactLead} onChange={set('contactLead')} /></label>
          <p className="small muted">여러 줄 칸에서 줄을 바꾸면 사이트에서도 그대로 줄이 바뀌어요.</p>
        </section>

        <section>
          <h2>연락처</h2>
          {s.people.map((p, i) => (
            <div key={i} className="person-card">
              <div className="admin-top">
                <strong>{p.name || '새 연락처'}</strong>
                <button type="button" className="text-btn danger" onClick={() => setS({ ...s, people: s.people.filter((_, j) => j !== i) })}>삭제</button>
              </div>
              <div className="form-row">
                <label className="field"><span>이름</span><input value={p.name} onChange={setPerson(i, 'name')} /></label>
                <label className="field"><span>역할</span><input value={p.roles} onChange={setPerson(i, 'roles')} /></label>
                <label className="field"><span>메일</span><input type="email" value={p.email} onChange={setPerson(i, 'email')} placeholder="name@example.com" /></label>
                <label className="field"><span>연락처</span><input value={p.phone} onChange={setPerson(i, 'phone')} placeholder="010-0000-0000" /></label>
              </div>
              <label className="field"><span>인스타그램 (@ 없이 계정만)</span><input value={p.instagram} onChange={setPerson(i, 'instagram')} placeholder="yoobros_studio" /></label>
            </div>
          ))}
          <button type="button" className="btn btn-ghost btn-sm" style={{ justifySelf: 'start' }} onClick={() => setS({ ...s, people: [...s.people, { ...EMPTY_PERSON }] })}>사람 추가</button>
          <p className="small muted">비워둔 칸은 컨택 페이지에 표시되지 않아요. 이름이 빈 연락처는 저장할 때 빠져요.</p>
        </section>

        <section>
          <h2>푸터</h2>
          <div className="field">
            <span>하단 로고</span>
            <div className="chips">
              {[['main', '메인 로고와 같게'], ['image', '다른 이미지'], ['none', '표시 안 함']].map(([k, label]) => (
                <button type="button" key={k} className={s.footerLogoMode === k ? 'on' : ''} onClick={() => setS({ ...s, footerLogoMode: k })}>{label}</button>
              ))}
            </div>
            {s.footerLogoMode === 'image' && (
              <div className="logo-field">
                <div className="logo-box">{s.footerLogoUrl ? <img src={s.footerLogoUrl} alt="" /> : '이미지 없음'}</div>
                <label className="btn btn-ghost btn-sm">이미지 올리기<input type="file" accept="image/png,image/svg+xml,image/webp,image/jpeg" hidden onChange={(e) => upload('footerLogoUrl', e)} /></label>
              </div>
            )}
          </div>
          {s.footerLogoMode !== 'none' && (
            <label className="field">
              <span>하단 로고 크기 <em className="muted">{s.footerLogoSize}px</em></span>
              <input type="range" min={LIMITS.footerLogoSize[0]} max={LIMITS.footerLogoSize[1]} value={s.footerLogoSize} onChange={(e) => setS({ ...s, footerLogoSize: Number(e.target.value) })} />
            </label>
          )}
          <label className="field"><span>저작권 문구</span><input value={s.copyright} onChange={set('copyright')} /></label>
          <label className="field"><span>대표 이메일</span><input type="email" value={s.footerEmail} onChange={set('footerEmail')} placeholder="hello@yoobros.com" /></label>
          <label className="field"><span>추가 문구</span><textarea rows={3} value={s.footerNote} onChange={set('footerNote')} placeholder="사업자 정보, 주소 등 필요할 때만" /></label>
        </section>

        <section>
          <h2>프로젝트 표시</h2>
          <label className="field">
            <span>New · Up 표시 기간 <em className="muted">{s.badgeDays}일</em></span>
            <input type="range" min={LIMITS.badgeDays[0]} max={LIMITS.badgeDays[1]} value={s.badgeDays} onChange={(e) => setS({ ...s, badgeDays: Number(e.target.value) })} />
          </label>
          <p className="small muted">새로 올린 게임은 이 기간 동안 New가 붙어요. 그 뒤에 게임 정보를 고치거나 개발 일지·웹 트라이얼 파일을 올리면 같은 기간 동안 Up이 붙어요.</p>
        </section>

        <section>
          <h2>SNS</h2>
          <div className="form-row">
            <label className="field"><span>인스타그램 (@ 없이 계정만)</span><input value={s.instagram} onChange={set('instagram')} placeholder="yoobros_studio" /></label>
            <label className="field"><span>X (@ 없이 계정만)</span><input value={s.x} onChange={set('x')} placeholder="yoobros_studio" /></label>
          </div>
          <p className="small muted">입력하면 메인 화면 버튼 아래와 하단에 아이콘 링크가 생겨요. 검색엔진에도 스튜디오 공식 계정으로 알려줘요.</p>
        </section>

        <section>
          <h2>검색 노출</h2>
          <label className="field">
            <span>사이트 대표 설명 <em className="muted">{(s.seoDescription || '').length}자 · 80~150자 권장</em></span>
            <textarea rows={3} value={s.seoDescription} onChange={set('seoDescription')} placeholder={s.intro.split('\n')[0]} />
          </label>
          <p className="small muted">검색 결과와 링크 공유 미리보기에 보이는 설명이에요. 비우면 메인 소개 문구 첫 줄을 써요.</p>
          <div className="field">
            <span>기본 공유 이미지</span>
            <div className="logo-field">
              <div className="logo-box og-box"><img src={s.ogImageUrl || '/og-default.png'} alt="" /></div>
              <div className="field">
                <label className="btn btn-ghost btn-sm">이미지 올리기<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => upload('ogImageUrl', e)} /></label>
                {s.ogImageUrl && <button type="button" className="text-btn" onClick={() => setS({ ...s, ogImageUrl: '' })}>기본 이미지로 되돌리기</button>}
              </div>
            </div>
            <p className="small muted">1200×630px 권장. 카카오톡·SNS에 링크를 붙였을 때 보이는 이미지예요. 게임과 블로그 글은 각자의 커버·첫 사진이 우선 쓰여요.</p>
          </div>
          <label className="field"><span>구글 서치콘솔 소유 확인 코드</span><input value={s.googleVerification} onChange={set('googleVerification')} placeholder="코드만 또는 meta 태그 전체를 붙여넣어도 돼요" /></label>
          <label className="field"><span>네이버 서치어드바이저 소유 확인 코드</span><input value={s.naverVerification} onChange={set('naverVerification')} placeholder="코드만 또는 meta 태그 전체를 붙여넣어도 돼요" /></label>
        </section>

        {error && <p className="error">{error}</p>}
        {msg && <p className="notice">{msg}</p>}
        <div className="admin-actions">
          <button type="button" className="btn" disabled={busy} onClick={save}>{busy ? '저장 중…' : '설정 저장'}</button>
          <button type="button" className="btn btn-ghost" onClick={reset}>기본값으로</button>
        </div>
      </div>

      <div className="settings-preview">
        <span className="small muted">미리보기</span>
        <div className="pv" style={{ background: bg, color: ink, borderColor: `${ink}22` }}>
          <div className="pv-head" style={{ borderBottom: `1px solid ${ink}22` }}>
            {s.headerLogoMode === 'image' && s.headerLogoUrl
              ? <img src={s.headerLogoUrl} alt="" style={{ height: s.headerLogoSize * 1.4 * 0.75, width: 'auto' }} />
              : <span style={{ fontWeight: 800, letterSpacing: '.06em', fontSize: s.headerLogoSize * 0.75 }}>{s.wordmark}</span>}
            <nav><span>PC&amp;Mobile</span><span>보드게임</span><span>블로그</span><span>컨택</span></nav>
          </div>
          <div className="pv-body">
            <div style={{ display: 'grid', gap: 6, justifyItems: 'start' }}>
              {s.logoUrl ? <img src={s.logoUrl} alt="" style={{ height: s.logoSize / 2, width: 'auto', maxWidth: '100%' }} /> : (
                <span style={{ color: ink, '--point': point }}><LogoMark height={s.logoSize / 2} /></span>
              )}
              {s.showLogoSub && s.logoSub && <span style={{ fontSize: Math.max(8, s.logoSize / 2 * 0.19), fontWeight: 600, letterSpacing: '.32em' }}>{s.logoSub}</span>}
            </div>
            <p className="pv-title" style={{ fontSize: Math.round(s.headlineSize * 0.43) }}>{s.headline}</p>
            <p className="pv-intro" style={{ opacity: 0.7 }}>{s.intro}</p>
            <div className="pv-btns">
              <span style={{ background: ink, color: bg, borderColor: ink }}>PC&amp;Mobile</span>
              <span style={{ background: ink, color: bg, borderColor: ink }}>보드게임</span>
              <span style={{ background: bg, color: ink, borderColor: ink }}>컨택</span>
            </div>
            <div style={{ display: 'flex', gap: 18, alignItems: 'flex-end', marginTop: 8 }}>
              <div style={{ width: 100, aspectRatio: 1, border: `1.5px solid ${ink}`, borderRadius: 4, boxShadow: `5px 5px 0 ${point}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>게임 카드</div>
              <div aria-hidden="true" style={{ display: 'flex', width: 120 }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i} style={{ flex: 1, height: 18, border: `1.5px solid ${ink}`, borderRightWidth: i === 4 ? 1.5 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ width: i === 2 ? 9 : i < 2 ? 4 : 0, height: i === 2 ? 9 : i < 2 ? 4 : 0, borderRadius: '50%', background: i === 2 ? point : ink }} />
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="pv-foot" style={{ borderTop: `1px solid ${ink}22` }}>
            {s.footerLogoMode === 'image' && s.footerLogoUrl
              ? <img src={s.footerLogoUrl} alt="" style={{ height: s.footerLogoSize * 0.75, width: 'auto', justifySelf: 'start' }} />
              : s.footerLogoMode === 'main' && (s.logoUrl
                ? <img src={s.logoUrl} alt="" style={{ height: s.footerLogoSize * 0.75, width: 'auto', justifySelf: 'start' }} />
                : <span style={{ color: ink, justifySelf: 'start' }}><LogoMark height={s.footerLogoSize * 0.75} mono /></span>)}
            <div><span>{s.copyright}</span><span>{s.footerEmail}</span></div>
            {s.footerNote && <span style={{ opacity: 0.7, whiteSpace: 'pre-line' }}>{s.footerNote}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
