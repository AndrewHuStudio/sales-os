import { NextRequest, NextResponse } from 'next/server';
import { geocode, isMockMode, TMapError } from '@/lib/tencent-map';
import { mockGeocode } from '@/lib/data/mock-tmap';
import type { ApiResp, TMapGeocodeResult } from '@/types/maps';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const address = searchParams.get('address') ?? '';
  const city = searchParams.get('city') ?? '深圳';

  if (!address) {
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: false, code: 400, error: 'address 不能为空',
    }, { status: 400 });
  }

  if (isMockMode()) {
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: true, from: 'mock', data: mockGeocode(address),
    });
  }

  try {
    const r = await geocode(address, city);
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: true, from: 'tencent-map', data: r.result,
    });
  } catch (e) {
    if (e instanceof TMapError) {
      return NextResponse.json<ApiResp<TMapGeocodeResult>>({
        ok: true, from: 'mock', data: mockGeocode(address),
      });
    }
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: false, code: 500, error: String(e),
    }, { status: 500 });
  }
}
