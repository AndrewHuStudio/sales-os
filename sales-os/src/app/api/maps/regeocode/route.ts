import { NextRequest, NextResponse } from 'next/server';
import { regeocode, isMockMode, TMapError } from '@/lib/tencent-map';
import { mockRegeocode } from '@/lib/data/mock-tmap';
import type { ApiResp, TMapGeocodeResult } from '@/types/maps';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const lat = Number(searchParams.get('lat'));
  const lng = Number(searchParams.get('lng'));

  if (!isFinite(lat) || !isFinite(lng)) {
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: false, code: 400, error: 'lat/lng 必填',
    }, { status: 400 });
  }

  if (isMockMode()) {
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: true, from: 'mock', data: mockRegeocode(lat, lng),
    });
  }

  try {
    const r = await regeocode(lat, lng);
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: true, from: 'tencent-map', data: r.result,
    });
  } catch (e) {
    if (e instanceof TMapError) {
      return NextResponse.json<ApiResp<TMapGeocodeResult>>({
        ok: true, from: 'mock', data: mockRegeocode(lat, lng),
      });
    }
    return NextResponse.json<ApiResp<TMapGeocodeResult>>({
      ok: false, code: 500, error: String(e),
    }, { status: 500 });
  }
}
