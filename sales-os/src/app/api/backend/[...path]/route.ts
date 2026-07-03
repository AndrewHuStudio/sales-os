import { NextRequest, NextResponse } from 'next/server';
import { COMPANIES } from '@/lib/data/companies';
import { DISTRICTS } from '@/lib/data/districts';
import { FOLLOWUPS } from '@/lib/data/followups';
import { FUNNEL_STATS, FUNNEL_TOTAL } from '@/lib/data/funnel';
import { REVIEW_METRICS, REVIEW_SUMMARY } from '@/lib/data/review';
import { TODAY_ROUTE } from '@/lib/data/route';

export const dynamic = 'force-dynamic';

const API_BASE = (process.env.FASTAPI_BASE_URL || process.env.BACKEND_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

type RouteContext = { params: { path?: string[] } };

function targetUrl(req: NextRequest, segments: string[]) {
  const apiPath = segments[0] === 'health' ? '/health' : `/api/${segments.join('/')}`;
  const url = new URL(`${API_BASE}${apiPath}`);
  req.nextUrl.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  return url;
}

async function forward(req: NextRequest, ctx: RouteContext) {
  const segments = ctx.params.path ?? [];
  const init: RequestInit = {
    method: req.method,
    headers: { 'Content-Type': req.headers.get('content-type') || 'application/json' },
    cache: 'no-store',
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') init.body = await req.text();

  const res = await fetch(targetUrl(req, segments), init);
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
  });
}

function localCompanies(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search')?.toLowerCase();
  const tier = req.nextUrl.searchParams.get('tier');
  const district = req.nextUrl.searchParams.get('district');
  const sort = req.nextUrl.searchParams.get('sort') || 'score';
  let list = COMPANIES;
  if (tier) list = list.filter(c => c.tier === tier);
  if (district) list = list.filter(c => c.districtId === district);
  if (search) list = list.filter(c => c.name.toLowerCase().includes(search) || c.shortName.toLowerCase().includes(search) || c.industry.toLowerCase().includes(search));
  return [...list].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'headcount' ? b.headcount - a.headcount : b.score - a.score);
}

function localFallback(req: NextRequest, segments: string[]) {
  const [resource, id] = segments;
  if (resource === 'bootstrap') {
    return NextResponse.json({ companies: COMPANIES, districts: DISTRICTS, todayRoute: TODAY_ROUTE });
  }
  if (resource === 'companies' && id) {
    const company = COMPANIES.find(c => c.id === id);
    return company ? NextResponse.json(company) : NextResponse.json({ error: 'company not found' }, { status: 404 });
  }
  if (resource === 'companies') return NextResponse.json(localCompanies(req));
  if (resource === 'districts') return NextResponse.json(DISTRICTS);
  if (resource === 'followups') {
    const companyId = req.nextUrl.searchParams.get('company_id');
    const list = companyId ? FOLLOWUPS.filter(f => f.companyId === companyId) : FOLLOWUPS;
    return NextResponse.json([...list].sort((a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime()));
  }
  if (resource === 'funnel') return NextResponse.json({ stats: FUNNEL_STATS, total: FUNNEL_TOTAL });
  if (resource === 'review') return NextResponse.json({ metrics: REVIEW_METRICS, summary: REVIEW_SUMMARY });
  if (resource === 'today-route') return NextResponse.json(TODAY_ROUTE);
  if (resource === 'health') return NextResponse.json({ ok: false, service: 'next-fallback' }, { status: 503 });
  return NextResponse.json({ error: 'backend route not found' }, { status: 404 });
}

export async function GET(req: NextRequest, ctx: RouteContext) {
  const segments = ctx.params.path ?? [];
  try {
    return await forward(req, ctx);
  } catch {
    return localFallback(req, segments);
  }
}

export async function POST(req: NextRequest, ctx: RouteContext) {
  try {
    return await forward(req, ctx);
  } catch {
    return NextResponse.json({ error: 'Python backend is not running' }, { status: 503 });
  }
}
