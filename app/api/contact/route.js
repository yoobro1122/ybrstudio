import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: '잘못된 요청이에요.' }, { status: 400 }); }

  const name = String(body.name || '').trim().slice(0, 50);
  const email = String(body.email || '').trim().slice(0, 200);
  const subject = String(body.subject || '').trim().slice(0, 100);
  const content = String(body.content || '').trim().slice(0, 3000);

  if (body.company) return NextResponse.json({ ok: true });
  if (!name || !content || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: '이름, 이메일, 내용을 확인하세요.' }, { status: 400 });
  }

  const { error } = await serverClient().from('messages').insert({ name, email, subject, content });
  if (error) return NextResponse.json({ error: '문의를 저장하지 못했어요. 잠시 후 다시 시도하세요.' }, { status: 500 });

  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    try {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'YBR STUDIO <onboarding@resend.dev>',
          to: [process.env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `[YBR STUDIO 문의] ${subject || name + '님의 메일'}`,
          html: `<p><b>${esc(name)}</b> &lt;${esc(email)}&gt;</p><p style="white-space:pre-wrap">${esc(content)}</p>`,
        }),
      });
    } catch {
      // 메일 발송이 실패해도 문의는 관리자 화면에 저장되어 있습니다.
    }
  }
  return NextResponse.json({ ok: true });
}
