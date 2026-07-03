/**
 * 腾讯位置服务 - 类型定义
 * API 文档：https://lbs.qq.com/service/webService/webServiceGuide/overview
 */

/** POI 通用结构（搜索 / 周边推荐） */
export interface TMapPOI {
  id: string;
  title: string;
  address: string;
  tel?: string;
  category?: string;
  category_code?: number;
  type?: number; // 0:POI 1:公交站 2:地铁站 3:公交线 4:行政区
  location: { lat: number; lng: number };
  _distance?: number; // 米
  ad_info?: {
    adcode: string;
    province: string;
    city: string;
    district: string;
  };
}

/** 地点搜索响应 */
export interface TMapSearchResp {
  status: number;
  message: string;
  count: number;
  request_id?: string;
  data: TMapPOI[];
}

/** 地址解析 / 逆地址解析 */
export interface TMapGeocodeResult {
  title?: string;
  address?: string;
  location: { lat: number; lng: number };
  ad_info?: {
    adcode: string;
    province: string;
    city: string;
    district: string;
  };
  address_components?: {
    province: string;
    city: string;
    district: string;
    street: string;
    street_number: string;
  };
  poi_count?: number;
  pois?: TMapPOI[];
}
export interface TMapGeocodeResp {
  status: number;
  message: string;
  request_id?: string;
  result: TMapGeocodeResult;
}

/** 路线规划 - 路段 */
export interface TMapRouteStep {
  instruction?: string;
  road_name?: string;
  dir_desc?: string;
  distance: number; // 米
  duration?: number; // 分钟
  act_desc?: string;
  polyline_idx: [number, number];
}
export interface TMapRoute {
  mode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
  distance: number; // 米
  duration: number; // 分钟
  direction?: string;
  polyline: number[]; // 压缩数组 [lat, lng, dLat, dLng, ...]
  steps: TMapRouteStep[];
  traffic_light_count?: number;
  toll?: number;
  taxi_fare?: { fare: number };
}
export interface TMapRouteResp {
  status: number;
  message: string;
  request_id?: string;
  result: { routes: TMapRoute[] };
}

/** IP 定位 */
export interface TMapIPLoc {
  status: number;
  message: string;
  result: {
    ip: string;
    location: { lat: number; lng: number };
    ad_info: {
      nation: string;
      province: string;
      city: string;
      adcode: string;
      district?: string;
    };
  };
}

/** 解压后的坐标点（供前端 maplibre 直接使用） */
export type LatLng = { lat: number; lng: number };
export type LatLngPath = LatLng[];

/** 统一返回结构（前端拿到的） */
export interface ApiOk<T> { ok: true; data: T; from: 'tencent-map' | 'mock' }
export interface ApiErr { ok: false; error: string; code: number }
export type ApiResp<T> = ApiOk<T> | ApiErr
