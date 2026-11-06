import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const TOKEN = process.env.VERCEL_API_TOKEN;
const PROJECT = process.env.VERCEL_PROJECT_ID;
const TEAM = process.env.VERCEL_TEAM_ID;
const DOMAIN_RE = /^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/;

// 요청한 사람이 관리자인지 Supabase로 확인해요.
async function isAdmin(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await sb.rpc('is_admin');
  return !error && data === true;
}

async function vercel(path, init = {}) {
  const url = new URL(`https://api.vercel.com${path}`);
  if (TEAM) url.searchParams.set('teamId', TEAM);
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    cache: 'no-store',
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

function records(d, config) {
  const out = [];
  const sub = d.name === d.apexName ? '@' : d.name.slice(0, -(d.apexName.length + 1));
  {
    if (d.name === d.apexName) {
      const ip = (config?.recommendedIPv4 || []).sort((a, b) => a.rank - b.rank)[0]?.value?.[0] || '76.76.21.21';
      out.push({ type: 'A', name: '@', value: ip });
    } else {
      const cname = (config?.recommendedCNAME || []).sort((a, b) => a.rank - b.rank)[0]?.value || 'cname.vercel-dns.com';
      out.push({ type: 'CNAME', name: sub, value: cname.replace(/\.$/, '') });
    }
  }
  for (const v of d.verification || []) {
    const host = v.domain === d.apexName ? '@' : v.domain.replace(new RegExp(`\\.${d.apexName.replace(/\./g, '\\.')}$`), '');
    out.push({ type: v.type, name: host, value: v.value, verify: true });
  }
  return out;
}

async function listDomains() {
  const r = await vercel(`/v9/projects/${encodeURIComponent(PROJECT)}/domains`);
  if (!r.ok) return { error: r.body?.error?.message || 'Vercel에서 도메인 목록을 불러오지 못했어요.' };
  const domains = await Promise.all((r.body.domains || []).map(async (d) => {
    const c = await vercel(`/v6/domains/${encodeURIComponent(d.name)}/config?projectIdOrName=${encodeURIComponent(PROJECT)}`);
    const config = c.ok ? c.body : null;
    return {
      name: d.name,
      apexName: d.apexName,
      redirect: d.redirect || null,
      verified: !!d.verified,
      misconfigured: config ? !!config.misconfigured : true,
      vercelDefault: d.name.endsWith('.vercel.app'),
      records: d.name.endsWith('.vercel.app') ? [] : records(d, config),
    };
  }));
  return { domains };
}

export async function GET(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: '관리자만 볼 수 있어요.' }, { status: 401 });
  if (!TOKEN || !PROJECT) return NextResponse.json({ configured: false });
  const res = await listDomains();
  if (res.error) return NextResponse.json({ configured: true, error: res.error }, { status: 502 });
  return NextResponse.json({ configured: true, ...res });
}

export async function POST(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: '관리자만 할 수 있어요.' }, { status: 401 });
  if (!TOKEN || !PROJECT) return NextResponse.json({ error: 'Vercel 연결 정보가 설정되지 않았어요.' }, { status: 400 });
  const b = await req.json().catch(() => ({}));
  const name = String(b.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!DOMAIN_RE.test(name) || name.endsWith('.vercel.app')) return NextResponse.json({ error: '도메인 형식을 확인하세요. 예: yoobros.com' }, { status: 400 });
  const P = encodeURIComponent(PROJECT), D = encodeURIComponent(name);

  if (b.action === 'add') {
    const r = await vercel(`/v10/projects/${P}/domains`, { method: 'POST', body: JSON.stringify({ name }) });
    if (!r.ok && r.status !== 409) return NextResponse.json({ error: r.body?.error?.message || '도메인을 추가하지 못했어요.' }, { status: r.status });
    if (r.status === 409) return NextResponse.json({ error: r.body?.error?.message || '이미 다른 곳에 연결된 도메인이에요.' }, { status: 409 });
    if (b.withWww && !name.startsWith('www.')) {
      await vercel(`/v10/projects/${P}/domains`, { method: 'POST', body: JSON.stringify({ name: `www.${name}`, redirect: name, redirectStatusCode: 308 }) });
    }
  } else if (b.action === 'verify') {
    await vercel(`/v9/projects/${P}/domains/${D}/verify`, { method: 'POST' });
  } else if (b.action === 'remove') {
    const r = await vercel(`/v9/projects/${P}/domains/${D}`, { method: 'DELETE' });
    if (!r.ok) return NextResponse.json({ error: r.body?.error?.message || '도메인을 제거하지 못했어요.' }, { status: r.status });
  } else {
    return NextResponse.json({ error: '알 수 없는 요청이에요.' }, { status: 400 });
  }
  const res = await listDomains();
  return NextResponse.json({ configured: true, ...res });
}
