/**
 * 腾讯地图 - Mock 降级数据
 * 当 TENCENT_MAP_KEY 未配置或 API 调用失败时使用，保证演示可用
 */

import type { TMapPOI, TMapGeocodeResult, LatLngPath } from '@/types/maps';
import type { RouteData } from '@/app/api/maps/route/route';

// 8 个深圳商区中心坐标（与 companies.ts 对齐）
const DISTRICT_CENTERS: Record<string, [number, number]> = {
  '南山科技园': [22.5400, 113.9500],
  '福田CBD':   [22.5410, 114.0590],
  '罗湖蔡屋围': [22.5450, 114.1300],
  '宝安中心':  [22.5550, 113.8840],
  '龙岗中心':  [22.7200, 114.2470],
  '龙华新城':  [22.6850, 114.0300],
  '坪山中心':  [22.7100, 114.3500],
  '光明科学城': [22.7800, 113.9300],
};

/* ============ 1. 搜索 mock ============ */
export function mockSearch(keyword: string, city: string): TMapPOI[] {
  const kw = keyword.toLowerCase();
  return Object.entries(DISTRICT_CENTERS)
    .filter(([name]) => name.includes(kw) || kw.includes('深圳') || kw.includes('科技'))
    .slice(0, 10)
    .map(([name, [lat, lng]], i) => ({
      id: `mock-poi-${i}`,
      title: `${name}（mock）`,
      address: `${city}${name}`,
      category: '商务区',
      type: 4,
      location: { lat, lng },
      _distance: 1000 + i * 500,
      ad_info: { adcode: '440300', province: '广东省', city, district: name },
    }));
}

/* ============ 2. 地址解析 mock（地址→坐标） ============ */
export function mockGeocode(address: string): TMapGeocodeResult {
  const found = Object.entries(DISTRICT_CENTERS)
    .find(([name]) => address.includes(name));
  const location = found
    ? { lat: found[1][0], lng: found[1][1] }
    : { lat: 22.5431, lng: 114.0579 };
  return {
    title: address,
    address,
    location,
    ad_info: { adcode: '440300', province: '广东省', city: '深圳市', district: found?.[0] ?? '南山区' },
  };
}

/* ============ 3. 逆地址解析 mock（坐标→地址） ============ */
export function mockRegeocode(lat: number, lng: number): TMapGeocodeResult {
  let nearest = Object.entries(DISTRICT_CENTERS)[0];
  let minD = Infinity;
  for (const [name, [nlat, nlng]] of Object.entries(DISTRICT_CENTERS)) {
    const d = (nlat - lat) ** 2 + (nlng - lng) ** 2;
    if (d < minD) { minD = d; nearest = [name, [nlat, nlng]]; }
  }
  return {
    address: `广东省深圳市${nearest[0]}（mock）`,
    location: { lat, lng },
    ad_info: { adcode: '440300', province: '广东省', city: '深圳市', district: nearest[0] },
  };
}

/* ============ 4. 路线规划 mock ============ */
function haversine(a: [number, number], b: [number, number]): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const x = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function mockRoute(
  from: [number, number],
  to: [number, number],
  waypoints: [number, number][] = [],
  mode: 'driving' | 'walking' | 'bicycling' = 'driving',
): RouteData {
  const speed = mode === 'driving' ? 13.9 : mode === 'bicycling' ? 4.2 : 1.4; // m/s
  const segments: [number, number][] = [from, ...waypoints, to];
  let totalDist = 0;
  for (let i = 0; i < segments.length - 1; i++) {
    totalDist += haversine(segments[i], segments[i + 1]);
  }
  const realDist = Math.round(totalDist * 1.3);
  const duration = Math.round((realDist / speed) / 60);
  const path: LatLngPath = segments.map(([lat, lng]) => ({ lat, lng }));
  return {
    mode: mode === 'driving' ? 'DRIVING' : mode === 'walking' ? 'WALKING' : 'BICYCLING',
    distance: realDist,
    duration: Math.max(duration, 1),
    path,
    steps_count: segments.length - 1,
    traffic_light_count: mode === 'driving' ? Math.round(realDist / 500) : undefined,
    toll: mode === 'driving' && realDist > 10000 ? Math.round((realDist / 10000) * 5) : undefined,
    from: 'mock',
  };
}
