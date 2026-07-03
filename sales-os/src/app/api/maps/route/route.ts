import { NextRequest, NextResponse } from 'next/server';
import { planRoute, decodePolyline, isMockMode, TMapError } from '@/lib/tencent-map';
import { mockRoute } from '@/lib/data/mock-tmap';
import type { ApiResp, TMapRoute, LatLngPath } from '@/types/maps';

export const dynamic = 'force-dynamic';

export interface RouteData {
  mode: TMapRoute['mode'];
  distance: number;        // 米
  duration: number;        // 分钟
  path: LatLngPath;        // 解压后的坐标点串
  traffic_light_count?: number;
  toll?: number;
  steps_count: number;
  from: 'tencent-map' | 'mock';
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const from = parseCoord(searchParams.get('from'));
  const to = parseCoord(searchParams.get('to'));
  const waypoints = (searchParams.get('waypoints') ?? '')
    .split(';').filter(Boolean).map(parseCoord).filter(Boolean) as [number, number][];
  const mode = (searchParams.get('mode') ?? 'driving') as 'driving' | 'walking' | 'bicycling';

  if (!from || !to) {
    return NextResponse.json<ApiResp<RouteData>>({
      ok: false, code: 400, error: 'from / to 必填 (lat,lng)',
    }, { status: 400 });
  }

  if (isMockMode()) {
    return NextResponse.json<ApiResp<RouteData>>({
      ok: true, from: 'mock', data: mockRoute(from, to, waypoints, mode),
    });
  }

  try {
    const r = await planRoute({ from, to, waypoints, mode });
    const route = r.result.routes[0];
    const data: RouteData = {
      mode: route.mode,
      distance: route.distance,
      duration: route.duration,
      path: decodePolyline(route.polyline),
      traffic_light_count: route.traffic_light_count,
      toll: route.toll,
      steps_count: route.steps.length,
      from: 'tencent-map',
    };
    return NextResponse.json<ApiResp<RouteData>>({ ok: true, from: 'tencent-map', data });
  } catch (e) {
    if (e instanceof TMapError) {
      // 失败回退本地路线估算
      return NextResponse.json<ApiResp<RouteData>>({
        ok: true, from: 'mock', data: mockRoute(from, to, waypoints, mode),
      });
    }
    return NextResponse.json<ApiResp<RouteData>>({
      ok: false, code: 500, error: String(e),
    }, { status: 500 });
  }
}

function parseCoord(s: string | null): [number, number] | null {
  if (!s) return null;
  const [lat, lng] = s.split(',').map(Number);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return [lat, lng];
}
