/**
 * useTencentMap - 统一调用腾讯地图的 Hook
 *
 * 4 个能力：search / geocode / regeocode / route / ip-loc
 *
 * 兜底策略：
 * 1. 优先调 BFF 路由 /api/maps/* （key 在服务端，不暴露）
 * 2. BFF 不可用 / 静态部署时，客户端直接调腾讯 API
 *    - 需要 NEXT_PUBLIC_TENCENT_MAP_KEY
 *    - 没有 key → mock 兜底
 *
 * 返回 from: 'tencent-map' | 'mock' 让前端显示数据源标签
 */

'use client';

import { useState, useCallback } from 'react';
import type {
  TMapPOI, TMapGeocodeResult, ApiResp, LatLng,
} from '@/types/maps';
import type { RouteData } from '@/app/api/maps/route/route';
import type { IPLocData } from '@/app/api/maps/ip-loc/route';

type AsyncState<T> = {
  data?: T;
  loading: boolean;
  error?: string;
  from?: 'tencent-map' | 'mock';
};

const PUB_KEY = process.env.NEXT_PUBLIC_TENCENT_MAP_KEY;

/** 直接调腾讯 API（客户端兜底） */
async function directCall<T>(path: string, params: Record<string, string | number | undefined>): Promise<T | null> {
  if (!PUB_KEY) return null;
  const qs = new URLSearchParams({ key: PUB_KEY, output: 'json' });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  try {
    const r = await fetch(`https://apis.map.qq.com${path}?${qs.toString()}`);
    const j = await r.json();
    if (j.status !== 0) return null;
    return j as T;
  } catch {
    return null;
  }
}

/** 智能调度：先 BFF，再直调，再 mock */
async function smartFetch<T>(bffPath: string, directPath: string, params: Record<string, string | number | undefined>, mock: () => T): Promise<ApiResp<T>> {
  // 1) BFF
  try {
    const r = await fetch(`${bffPath}?${new URLSearchParams(params as Record<string, string>).toString()}`, { cache: 'no-store' });
    if (r.ok) {
      const j: ApiResp<T> = await r.json();
      if (j.ok) return j;
    }
  } catch { /* BFF 不可用（静态部署） */ }
  // 2) 直调
  const d = await directCall<T>(directPath, params);
  if (d) {
    return { ok: true, from: 'tencent-map', data: (d as { data?: T; result?: T }).data ?? (d as { result?: T }).result ?? d as T };
  }
  // 3) Mock
  return { ok: true, from: 'mock', data: mock() };
}

/* ============ 1. POI 搜索 ============ */
export function usePOISearch() {
  const [st, setSt] = useState<AsyncState<TMapPOI[]>>({ loading: false });
  const search = useCallback(async (keyword: string, city = '深圳') => {
    setSt({ loading: true });
    const boundary = `region(${city},1)`;
    const j = await smartFetch<TMapPOI[]>(
      '/api/maps/search', '/ws/place/v1/search',
      { keyword, boundary, page_size: 10 },
      () => mockSearch(keyword, city),
    );
    if (j.ok) setSt({ data: j.data, loading: false, from: j.from });
    else setSt({ loading: false, error: j.error });
  }, []);
  return { ...st, search };
}

/* ============ 2. 地址解析 ============ */
export function useGeocode() {
  const [st, setSt] = useState<AsyncState<TMapGeocodeResult>>({ loading: false });
  const geocode = useCallback(async (address: string, city = '深圳') => {
    setSt({ loading: true });
    const j = await smartFetch<TMapGeocodeResult>(
      '/api/maps/geocode', '/ws/geocoder/v1',
      { address, city },
      () => mockGeocode(address),
    );
    if (j.ok) setSt({ data: j.data, loading: false, from: j.from });
    else setSt({ loading: false, error: j.error });
  }, []);
  return { ...st, geocode };
}

/* ============ 3. 路线规划 ============ */
export function useRoute() {
  const [st, setSt] = useState<AsyncState<RouteData>>({ loading: false });
  const plan = useCallback(async (
    from: LatLng, to: LatLng,
    waypoints: LatLng[] = [],
    mode: 'driving' | 'walking' | 'bicycling' = 'driving',
  ) => {
    setSt({ loading: true });
    const wp = waypoints.map(w => `${w.lat},${w.lng}`).join(';');
    const params: Record<string, string> = {
      from: `${from.lat},${from.lng}`,
      to: `${to.lat},${to.lng}`,
      mode,
    };
    if (wp) params.waypoints = wp;

    // 尝试 BFF（解压过 path）
    try {
      const r = await fetch(`/api/maps/route?${new URLSearchParams(params).toString()}`, { cache: 'no-store' });
      if (r.ok) {
        const j: ApiResp<RouteData> = await r.json();
        if (j.ok) { setSt({ data: j.data, loading: false, from: j.from }); return; }
      }
    } catch { /* BFF 不可用 */ }

    // 客户端直调（需要解压）
    if (PUB_KEY) {
      const qs = new URLSearchParams({ key: PUB_KEY, output: 'json', ...params });
      try {
        const r = await fetch(`https://apis.map.qq.com/ws/direction/v1/${mode}/?${qs.toString()}`);
        const j = await r.json();
        if (j.status === 0) {
          const route = j.result.routes[0];
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
          setSt({ data, loading: false, from: 'tencent-map' });
          return;
        }
      } catch { /* 直调失败 */ }
    }

    // Mock
    setSt({ data: mockRoute([from.lat, from.lng], [to.lat, to.lng], waypoints.map(w => [w.lat, w.lng]) as [number, number][], mode), loading: false, from: 'mock' });
  }, []);
  return { ...st, plan };
}

/* ============ 4. IP 定位 ============ */
export function useIPLoc() {
  const [st, setSt] = useState<AsyncState<IPLocData>>({ loading: false });
  const locate = useCallback(async () => {
    setSt({ loading: true });
    const j = await smartFetch<IPLocData>(
      '/api/maps/ip-loc', '/ws/location/v1/ip',
      {},
      () => ({
        ip: '127.0.0.1',
        location: { lat: 22.5431, lng: 114.0579 },
        ad_info: { nation: '中国', province: '广东省', city: '深圳市', adcode: '440300' },
        from: 'mock',
      }),
    );
    if (j.ok) setSt({ data: j.data, loading: false, from: j.from });
    else setSt({ loading: false, error: j.error });
  }, []);
  return { ...st, locate };
}

/* ============ 内置 polyline 解压（客户端用） ============ */
function decodePolyline(coors: number[]): LatLng[] {
  if (!coors || coors.length < 2) return [];
  const out: LatLng[] = [{ lat: coors[0], lng: coors[1] }];
  for (let i = 2; i < coors.length; i++) {
    out.push({
      lat: out[out.length - 1].lat + coors[i] / 1e6,
      lng: out[out.length - 1].lng + coors[++i] / 1e6,
    });
  }
  return out;
}

/* ============ 客户端 mock 兜底（与 BFF mock-tmap.ts 对齐） ============ */
const MOCK_CENTERS: Record<string, [number, number]> = {
  '南山科技园': [22.5400, 113.9500],
  '福田CBD':   [22.5410, 114.0590],
  '罗湖蔡屋围': [22.5450, 114.1300],
  '宝安中心':  [22.5550, 113.8840],
  '龙岗中心':  [22.7200, 114.2470],
  '龙华新城':  [22.6850, 114.0300],
  '坪山中心':  [22.7100, 114.3500],
  '光明科学城': [22.7800, 113.9300],
};
function mockSearch(kw: string, city: string): TMapPOI[] {
  return Object.entries(MOCK_CENTERS)
    .filter(([n]) => n.includes(kw) || kw.includes('深圳'))
    .slice(0, 10)
    .map(([name, [lat, lng]], i) => ({
      id: `mock-${i}`, title: `${name}（mock）`, address: `${city}${name}`,
      category: '商务区', type: 4, location: { lat, lng }, _distance: 1000 + i * 500,
      ad_info: { adcode: '440300', province: '广东省', city, district: name },
    }));
}
function mockGeocode(address: string): TMapGeocodeResult {
  const found = Object.entries(MOCK_CENTERS).find(([n]) => address.includes(n));
  return {
    title: address, address,
    location: found ? { lat: found[1][0], lng: found[1][1] } : { lat: 22.5431, lng: 114.0579 },
    ad_info: { adcode: '440300', province: '广东省', city: '深圳市', district: found?.[0] ?? '南山区' },
  };
}
function mockRoute(
  from: [number, number], to: [number, number],
  waypoints: [number, number][] = [],
  mode: 'driving' | 'walking' | 'bicycling' = 'driving',
): RouteData {
  const speed = mode === 'driving' ? 13.9 : mode === 'bicycling' ? 4.2 : 1.4;
  const segs: [number, number][] = [from, ...waypoints, to];
  let total = 0;
  for (let i = 0; i < segs.length - 1; i++) {
    const R = 6371000, t = (d: number) => (d * Math.PI) / 180;
    const dLat = t(segs[i + 1][0] - segs[i][0]);
    const dLng = t(segs[i + 1][1] - segs[i][1]);
    const x = Math.sin(dLat / 2) ** 2 + Math.cos(t(segs[i][0])) * Math.cos(t(segs[i + 1][0])) * Math.sin(dLng / 2) ** 2;
    total += 2 * R * Math.asin(Math.sqrt(x));
  }
  const dist = Math.round(total * 1.3);
  return {
    mode: mode === 'driving' ? 'DRIVING' : mode === 'walking' ? 'WALKING' : 'BICYCLING',
    distance: dist,
    duration: Math.max(Math.round((dist / speed) / 60), 1),
    path: segs.map(([lat, lng]) => ({ lat, lng })),
    steps_count: segs.length - 1,
    traffic_light_count: mode === 'driving' ? Math.round(dist / 500) : undefined,
    toll: mode === 'driving' && dist > 10000 ? Math.round((dist / 10000) * 5) : undefined,
    from: 'mock',
  };
}
