'use client';
import { useState } from 'react';
import { browserClient } from '@/lib/supabase';

export default function ReviewForm({ gameId }) {
  const [nickname, setNickname] = useState('');
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (trap) return setState('done');
    if (!nickname.trim()) return setError('닉네임을 입력하세요.');
    if (!rating) return setError('별점을 골라주세요.');
    if (!content.trim()) return setError('후기 내용을 입력하세요.');
    setState('sending');
    const { error: err } = await browserClient().from('reviews').insert({
      game_id: gameId,
      nickname: nickname.trim(),
      rating,
      content: content.trim(),
    });
    if (err) {
      setState('idle');
      return setError('후기를 보내지 못했어요. 잠시 후 다시 시도하세요.');
    }
    setState('done');
  }

  if (state === 'done') {
    return <p className="notice">후기를 보냈어요. 확인 후 이 페이지에 공개됩니다.</p>;
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="form-row">
        <label className="field">
          <span>닉네임</span>
          <input value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} />
        </label>
        <fieldset className="field rating">
          <legend>별점</legend>
          <div className="rating-buttons">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                className={n <= rating ? 'on' : ''}
                aria-label={`${n}점`}
                aria-pressed={n === rating}
                onClick={() => setRating(n)}
              >
                ★
              </button>
            ))}
          </div>
        </fieldset>
      </div>
      <label className="field">
        <span>한 줄 후기 <em className="muted">{content.length}/500</em></span>
        <textarea rows={3} maxLength={500} value={content} onChange={(e) => setContent(e.target.value)} />
      </label>
      <input className="trap" tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} aria-hidden="true" />
      {error && <p className="error">{error}</p>}
      <button className="btn" disabled={state === 'sending'}>
        {state === 'sending' ? '보내는 중…' : '후기 보내기'}
      </button>
    </form>
  );
}
