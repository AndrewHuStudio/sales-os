# 腾讯位置服务（Tencent Maps LBS）- 集成文档

> 5 个 BFF 路由 · 1 个 SDK 客户端 · 4 个前端组件 · 0 前端 key 暴露
>
> 官方文档：<https://lbs.qq.com/service/webService/webServiceGuide/overview>

## 1. 能力矩阵

| BFF 路由 | 对应能力 | 调用场景 | 模块位置 |
|---|---|---|---|
| `GET /api/maps/search` | **搜索服务** `/ws/place/v1/search` | 客户地址自动补全、商区内"找客户" | `src/app/api/maps/search/route.ts` |
| `GET /api/maps/geocode` | **地址服务** `/ws/geocoder/v1` | 中文地址 → 坐标（入库、地图标点） | `src/app/api/maps/geocode/route.ts` |
| `GET /api/maps/regeocode` | **地址服务** `/ws/geocoder/v1?location=` | 坐标 → 中文地址（点击地图反查） | `src/app/api/maps/regeocode/route.ts` |
| `GET /api/maps/route` | **路线服务** `/ws/direction/v1/{mode}/` | 拜访路线（驾车/步行/骑行 + 实时路况） | `src/app/api/maps/route/route.ts` |
| `GET /api/maps/ip-loc` | **定位服务** `/ws/location/v1/ip` | "我当前在哪个城市"自动定位 | `src/app/api/maps/ip-loc/route.ts` |

## 2. 架构图

```
┌──────────────┐     fetch       ┌──────────────────┐    HTTPS    ┌──────────────────┐
│  浏览器 (FE)  │ ──────────────▶ │ Next.js BFF 路由  │ ──────────▶ │ 腾讯 LBS WebService│
│              │   /api/maps/*   │   (持有 key)      │             │   apis.map.qq.com │
└──────────────┘                 └──────────────────┘             └──────────────────┘
       ▲                                  │
       │                                  │ key 不存在/失败
       │                                  ▼
       │                          ┌──────────────────┐
       └────────── JSON ──────────│  mock-tmap.ts     │
                                  │  (离线降级)        │
                                  └──────────────────┘
```

**为什么走 BFF？**
- ✅ key 不暴露在浏览器（防抓取、防盗用）
- ✅ 失败统一降级到 mock
- ✅ polyline 后端解压（前端零计算）
- ✅ 配额监控 header (`X-LIMIT`) 后端日志

## 3. Key 申请（5 分钟）

1. 进入 <https://lbs.qq.com/dev/console/quick-register>
2. 注册/登录 → 创建应用（选"其他"）
3. 添加 Key → **勾选 WebServiceAPI**（必勾！否则 199 报错）
4. 分配配额（默认个人开发者 6000 次/日，足够演示）
5. 复制 Key 到 `.env.local`：

```bash
# sales-os/.env.local
TENCENT_MAP_KEY=OB4BZ-D4W3U-XXXX-XXXX-XXXX-XXXXXXXXXXXX
```

> ⚠️ **没配 key 也能用**：自动降级到 mock 数据（`mock-tmap.ts`），演示不受影响。

## 4. SDK 客户端 API

`src/lib/tencent-map.ts` 暴露 6 个导出：

```typescript
searchPOI({ keyword, city, location, radius, pageSize })
geocode(address, city)                    // 地址 → 坐标
regeocode(lat, lng)                       // 坐标 → 地址
planRoute({ from, to, waypoints, mode, policy })
ipLocate(ip?)                             // IP 定位
decodePolyline([lat,lng,dlat,dlng,...])   // 压缩 polyline 解压
haversine([lat1,lng1], [lat2,lng2])       // 本地距离计算
isMockMode()                              // 是否 mock 模式
```

所有函数失败抛 `TMapError(code, message)`。

## 5. 前端 Hook

`src/hooks/useTencentMap.ts` 暴露 4 个 hook：

```typescript
const { data, loading, from, search } = usePOISearch()
const { data, loading, from, geocode } = useGeocode()
const { data, loading, from, plan } = useRoute()  // 自动 useEffect
const { data, loading, from, locate } = useIPLoc()
```

返回值带 `from: 'tencent-map' | 'mock'`，前端可显示数据源标签。

## 6. 前端组件

`src/components/maps/` 4 个开箱即用组件：

| 组件 | 用途 | 用法 |
|---|---|---|
| `<AddressSearch onPick={...} />` | 关键词搜索 POI，结果列表点击 | 顶部搜索框 |
| `<RouteBadge from to mode />` | 路线距离/时长/红绿灯/过路费 | 客户详情侧栏 |
| `<LocationPin onLocate={...} />` | 启动 IP 定位，定位后回调 | 地图顶部 |
| `<CoordTag address coords />` | 地址 → 坐标显示，坐标可复制 | 客户地址卡片 |

## 7. 数据源标签规则

前端组件统一显示数据来源：
- `腾讯地图` / `腾讯实时` / `腾讯实时路线` → 真实 API
- `离线 Mock` / `离线估算` / `默认` → mock 降级

用户一眼能看出当前数据是实时还是估算。

## 8. polyline 解压算法

腾讯返回的 polyline 是前向差分压缩的：
```
[lat0, lng0, dLat1*1e6, dLng1*1e6, dLat2*1e6, dLng2*1e6, ...]
```

解压公式（`src/lib/tencent-map.ts:decodePolyline`）：
```typescript
for (let i = 2; i < coors.length; i++) {
  out.push({
    lat: out[out.length-1].lat + coors[i] / 1e6,
    lng: out[out.length-1].lng + coors[++i] / 1e6,
  });
}
```

解压后传给前端 → maplibre 画线。

## 9. 配额与限制

| 接口 | 个人开发者日配额 | 限制 |
|---|---|---|
| 搜索 | 6000 | 半径 10-1000m，每页 ≤20 |
| 地址解析 | 6000 | — |
| 逆地址解析 | 6000 | — |
| 路线 | 6000 | 步行 ≤300km，骑行 ≤500km |
| IP 定位 | 6000 | — |

配额监控：每次响应 header `X-LIMIT` 含 `current_qps/limit_qps/current_pv/limit_pv`，后端 `console.log` 打印。

## 10. 错误码

| status | 含义 | 处理 |
|---|---|---|
| 0 | 正常 | — |
| 199 | key 未启用 WebServiceAPI | 控制台启用 |
| 310 | 请求参数错误 | 检查 query string |
| 311 | key 格式错误 | 重新申请 key |
| 401 | 配额超限 | 等次日 0 点重置 |

非 0 状态 → BFF 自动降级到 mock，前端无感知。
