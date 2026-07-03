/**
 * 腾讯位置服务 - 统一 HTTP 客户端
 *
 * 职责：
 * 1. 封装 5 个 WebService API（搜索 / 地址 / 逆地址 / 路线 / IP 定位）
 * 2. polyline 压缩数组解压 → [[lat,lng], ...]
 * 3. 错误统一抛 TMapError
 *
 * 文档：https://lbs.qq.com/service/webService/webServiceGuide/overview
 */

import type {
  TMapSearchResp, TMapGeocodeResp, TMapRouteResp, TMapIPLoc,
  LatLngPath,
} from '@/types/maps';

const BASE = 'https://apis.map.qq.com';

export class TMapError extends Error {
  constructor(public code: number, msg: string) {
    super(msg);
    this.name = 'TMapError';
  }
}

function getKey(): string {
  const k = process.env.TENCENT_MAP_KEY;
  if (!k) throw new TMapError(401, 'TENCENT_MAP_KEY 未配置，回退 mock');
  return k;
}

function isMockMode(): boolean {
  return !process.env.TENCENT_MAP_KEY;
}

async function call<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
  const key = getKey();
  const qs = new URLSearchParams();
  qs.set('key', key);
  qs.set('output', 'json');
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  const url = `${BASE}${path}?${qs.toString()}`;
  const r = await fetch(url, { cache: 'no-store' });
  const json = (await r.json()) as T & { status: number; message: string };
  if (json.status !== 0) {
    throw new TMapError(json.status, json.message || 'unknown error');
  }
  return json;
}

/* ============== 1. 地点搜索 ============== */
export interface SearchOpts {
  keyword: string;
  city?: string;          // region(深圳)
  location?: [number, number]; // nearby(lat,lng,radius)
  radius?: number;        // 10-1000
  pageSize?: number;      // ≤20
  pageIndex?: number;
}
export async function searchPOI(opts: SearchOpts) {
  const boundary = opts.location
    ? `nearby(${opts.location[0]},${opts.location[1]},${opts.radius ?? 500})`
    : `region(${opts.city ?? '深圳'},1)`;
  return call<TMapSearchResp>('/ws/place/v1/search', {
    keyword: opts.keyword,
    boundary,
    page_size: opts.pageSize ?? 10,
    page_index: opts.pageIndex ?? 1,
  });
}

/* ============== 2. 地址解析（地址→坐标） ============== */
export async function geocode(address: string, city?: string) {
  return call<TMapGeocodeResp>('/ws/geocoder/v1', { address, city: city ?? '' });
}

/* ============== 3. 逆地址解析（坐标→地址） ============== */
export async function regeocode(lat: number, lng: number) {
  return call<TMapGeocodeResp>('/ws/geocoder/v1', {
    location: `${lat.toFixed(6)},${lng.toFixed(6)}`,
    get_poi: 1,
  });
}

/* ============== 4. 路线规划（驾车 / 步行 / 骑行） ============== */
export interface RouteOpts {
  from: [number, number];
  to: [number, number];
  waypoints?: [number, number][];
  mode?: 'driving' | 'walking' | 'bicycling';
  policy?: 'LEAST_TIME' | 'LEAST_FEE' | 'REAL_TRAFFIC' | 'AVOID_HIGHWAY';
}
export async function planRoute(opts: RouteOpts) {
  const mode = opts.mode ?? 'driving';
  const from = `${opts.from[0]},${opts.from[1]}`;
  const to = `${opts.to[0]},${opts.to[1]}`;
  const waypoints = opts.waypoints?.map(w => `${w[0]},${w[1]}`).join(';') ?? '';
  return call<TMapRouteResp>(`/ws/direction/v1/${mode}/`, {
    from, to, waypoints, policy: opts.policy ?? 'LEAST_TIME',
  });
}

/* ============== 5. IP 定位 ============== */
export async function ipLocate(ip?: string) {
  return call<TMapIPLoc>('/ws/location/v1/ip', { ip: ip ?? '' });
}

/* ============== polyline 解压 ============== */
/**
 * 腾讯压缩 polyline 解压算法
 * 输入: [lat0, lng0, dLat1, dLng1, dLat2, dLng2, ...]
 * 输出: [[lat0, lng0], [lat1, lng1], ...]
 * 算法: coors[i] = coors[i-2] + coors[i] / 1000000
 */
export function decodePolyline(coors: number[]): LatLngPath {
  if (!coors || coors.length < 2) return [];
  const out: LatLngPath = [{ lat: coors[0], lng: coors[1] }];
  for (let i = 2; i < coors.length; i++) {
    out.push({
      lat: out[out.length - 1].lat + coors[i] / 1e6,
      lng: out[out.length - 1].lng + coors[++i] / 1e6,
    });
  }
  return out;
}

export { isMockMode };
