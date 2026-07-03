import { NextRequest, NextResponse } from 'next/server';
import { searchPOI, isMockMode, TMapError } from '@/lib/tencent-map';
import { mockSearch } from '@/lib/data/mock-tmap';
import type { ApiResp } from '@/types/maps';
import type { TMapPOI } from '@/types/maps';

// 强制动态（不要静态化）
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const keyword = searchParams.get('keyword') ?? '';
  const city = searchParams.get('city') ?? '深圳';
  const radius = Number(searchParams.get('radius') ?? 1000);
  const pageSize = Math.min(Number(searchParams.get('page_size') ?? 10), 20);

  if (!keyword) {
    return NextResponse.json<ApiResp<TMapPOI[]>>({
      ok: false, code: 400, error: 'keyword 不能为空',
    }, { status: 400 });
  }

  // 降级：无 key → mock
  if (isMockMode()) {
    return NextResponse.json<ApiResp<TMapPOI[]>>({
      ok: true, from: 'mock', data: mockSearch(keyword, city),
    });
  }

  try {
    const r = await searchPOI({ keyword, city, radius, pageSize });
    return NextResponse.json<ApiResp<TMapPOI[]>>({
      ok: true, from: 'tencent-map', data: r.data,
    });
  } catch (e) {
    return handleErr<TMapPOI[]>(e, () => mockSearch(keyword, city));
  }
}

async function handleErr<T>(e: unknown, fallback: () => T): Promise<NextResponse> {
  if (e instanceof TMapError) {
    console.warn('[BFF search] TMapError:', e.code, e.message, '→ fallback mock');
    return NextResponse.json<ApiResp<T>>({ ok: true, from: 'mock', data: fallback() });
  }
  console.error('[BFF search] unexpected:', e);
  return NextResponse.json<ApiResp<T>>({
    ok: false, code: 500, error: e instanceof Error ? e.message : 'unknown',
  }, { status: 500 });
}
