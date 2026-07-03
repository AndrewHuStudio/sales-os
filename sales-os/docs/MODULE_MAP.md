# WorkBuddy GeoSales OS — 模块地图

> 这份文档是整个项目的"导航中心"。每个模块一行卡片，告诉你：它在哪儿、它干嘛、它依赖谁、它被谁用。
> **红线：单个 `.tsx` / `.ts` 文件不超过 600 行（含 import + 注释 + 空行）。** 超过就要拆。

最后更新：2026-07-03 16:56（V3.3 销售地图数据核验与工作台联动）

---

## 1. 技术栈一览

| 层级 | 技术 | 备注 |
|---|---|---|
| 框架 | Next.js 14 (App Router) | RSC + Client 混用 |
| 语言 | TypeScript 5.x | strict: true |
| 样式 | Tailwind CSS 3.4 + shadcn/ui | 玻璃拟态 / 渐变 / 微交互 |
| 地图底图 | mapcn + maplibre-gl + OpenStreetMap | 公开瓦片，无需 Key |
| **地图能力** | **腾讯位置服务 LBS** | **5 个 BFF 路由 + 客户端兜底** |
| 数据 | Prisma + SQLite (dev) | 后续可换 PostgreSQL |
| 图标 | lucide-react | shadcn 标准 |
| 部署 | CloudStudio 沙箱 + Vercel | 静态 / SSR 两套方案 |

---

## 2. 目录结构

```
sales-os/
├── docs/
│   └── MODULE_MAP.md          ← 你正在看的文件
├── prisma/
│   ├── schema.prisma          ← 6 张表
│   └── seed.ts                ← 种子数据
├── public/
│   └── data/
│       └── shenzhen.geojson   ← 8 个商区边界
├── src/
│   ├── app/                   ← 路由层（App Router）
│   │   ├── layout.tsx
│   │   ├── page.tsx           ← /  → 重定向 /dashboard
│   │   ├── globals.css
│   │   ├── dashboard/page.tsx
│   │   ├── map/page.tsx
│   │   ├── companies/page.tsx
│   │   ├── company/[id]/page.tsx
│   │   ├── followups/page.tsx
│   │   ├── funnel/page.tsx
│   │   └── review/page.tsx
│   ├── components/
│   │   ├── ui/                ← 原子组件（shadcn 风格）
│   │   ├── layout/            ← 布局组件
│   │   ├── dashboard/         ← 工作台子组件
│   │   ├── map/               ← 地图子组件
│   │   ├── company/           ← 客户详情子组件
│   │   ├── companies/         ← 客户列表子组件
│   │   ├── followups/
│   │   ├── funnel/
│   │   ├── review/
│   │   └── shared/            ← 跨页面共享
│   ├── lib/
│   │   ├── data/              ← 数据访问层
│   │   ├── utils.ts           ← cn() 等工具
│   │   └── constants.ts       ← 业务常量
│   ├── types/                 ← TS 类型
│   └── hooks/                 ← 自定义 hooks
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.mjs
├── components.json            ← shadcn 配置
└── README.md
```

---

## 3. 路由 ↔ 页面 ↔ 组件 一览

| 路由 | 页面文件 | 页面职责 | 子组件（≤600 行/个） |
|---|---|---|---|
| `/` | `app/page.tsx` | 重定向到 dashboard | — |
| `/dashboard` | `app/dashboard/page.tsx` | 工作台（任务颁发者） | VisitCard / TodayRoute / MiniMap / AIRecommendation / TodayStats |
| `/map` | `app/map/page.tsx` | 销售地图 | MapView / DistrictLayer / CompanyMarker / RouteLine / DistrictPanel |
| `/companies` | `app/companies/page.tsx` | 客户列表 | CompanyTable / FilterPanel / ScoreBadge / ScoreSort |
| `/company/[id]` | `app/company/[id]/page.tsx` | 客户详情作战卡 | CompanyHeader / ScoreRadar / ContactList / OpportunityTimeline / ActionPlan / CompetitorList |
| `/followups` | `app/followups/page.tsx` | 跟进记录 | FollowupTimeline / FollowupForm / FollowupStats |
| `/funnel` | `app/funnel/page.tsx` | 销售漏斗 | FunnelChart / StageDetail / ConversionTrend |
| `/review` | `app/review/page.tsx` | 销售复盘 | KPISummary / WinLossAnalysis / CoachingTip |

---

## 4. 共享模块（按依赖方向，从底向上）

| 模块 | 文件 | 职责 | 上游依赖 | 下游消费者 |
|---|---|---|---|---|
| **类型** | `src/types/index.ts` | 全部 TS 类型（Company / District / Followup …） | 无 | 所有 |
| **常量** | `src/lib/constants.ts` | 颜色、阶段、评分阈值 | 无 | 所有 |
| **工具** | `src/lib/utils.ts` | `cn()` / `formatDate()` | clsx + tailwind-merge | 所有组件 |
| **数据** | `src/lib/data/companies.ts` | 客户 mock + 查询函数 | types, constants | dashboard / companies / company / map |
| **数据** | `src/lib/data/districts.ts` | 商区 mock | types, constants | map / dashboard |
| **数据** | `src/lib/data/followups.ts` | 跟进 mock | types, constants | followups / company / dashboard |
| **数据** | `src/lib/data/funnel.ts` | 漏斗阶段 | types, constants | funnel |
| **数据** | `src/lib/data/route.ts` | 今日路线 | types, constants | dashboard / map |
| **数据** | `src/lib/data/company-verification.ts` | 企查查主体候选、坐标核验状态、数据来源标签 | 无 | map |
| **Hooks** | `src/hooks/useTheme.ts` | 主题切换 | localStorage | layout |
| **Hooks** | `src/hooks/useTodayRoute.ts` | 今日路线状态 | data/route | dashboard |

---

## 5. UI 原子组件（src/components/ui/）

| 组件 | 文件 | 行数目标 | 备注 |
|---|---|---|---|
| Button | `ui/button.tsx` | ≤80 | variant: default/outline/ghost |
| Card | `ui/card.tsx` | ≤80 | 玻璃拟态 |
| Badge | `ui/badge.tsx` | ≤60 | 5 种语义色 |
| Input | `ui/input.tsx` | ≤50 | 圆角 + focus ring |
| Tabs | `ui/tabs.tsx` | ≤120 | Radix 封装 |
| Progress | `ui/progress.tsx` | ≤60 | 线性进度 |
| Dialog | `ui/dialog.tsx` | ≤150 | Radix 封装 |
| Avatar | `ui/avatar.tsx` | ≤80 | 头像占位 |
| Separator | `ui/separator.tsx` | ≤30 | 1px 分割线 |
| Tooltip | `ui/tooltip.tsx` | ≤80 | Radix 封装 |
| ScrollArea | `ui/scroll-area.tsx` | ≤50 | 滚动容器 |
| MapcnMarkerPopup | `ui/mapcn-marker-popup.tsx` | 468 | maplibre 声明式地图 / marker / popup / route / controls |

> 这些都是 shadcn 标准实现，本项目不复用远程 registry，直接本地写，避免构建依赖网络。

---

## 6. 数据流（自上而下）

```
URL
  ↓
app/[route]/page.tsx           ← 服务端组件（默认）
  ↓ (import)
components/[scope]/*.tsx       ← 客户端组件（需要交互时 'use client'）
  ↓ (import)
lib/data/*.ts                  ← 纯数据函数（mock）
  ↓
types/index.ts + constants.ts  ← 叶子
```

**规则：**
- 叶子模块（types / constants / utils）不依赖任何业务模块
- 数据层（lib/data）只依赖叶子
- 组件层只依赖数据层 + 叶子
- 路由层只组合组件
- **不允许反向依赖**

---

## 7. 客户端组件边界（'use client' 标记规则）

| 场景 | 是否 'use client' | 原因 |
|---|---|---|
| 页面入口（`page.tsx`） | ❌ | 默认 RSC，构建更快 |
| 含 onClick / useState / useEffect | ✅ | 需要 hydration |
| 含浏览器 API（localStorage / window） | ✅ | |
| 纯展示（只读 props） | ❌ | 走 RSC，零 JS |
| mapcn 地图组件 | ✅ | 内部用 maplibre + 事件 |

---

## 8. 主题系统

- 三态：`light` / `dark` / `system`
- 持久化：`localStorage.theme`
- 实现：`html.classList` 切换 `dark`
- 入口：`<html suppressHydrationWarning>`
- 切换器：`components/layout/ThemeToggle.tsx`

**色彩规范（写入 tailwind.config.ts）：**
- primary: 腾讯蓝 `#0052D9`
- success: 腾讯绿 `#00A86B`
- warning: 警示橙 `#FA8C16`
- danger: 错误红 `#F5222D`
- gradient-hero: `from-blue-500 via-cyan-400 to-emerald-400`

---

## 9. 性能与可维护性守则

1. **单文件 ≤600 行** — 超了立刻拆
2. **组件纯函数化** — props 进，JSX 出，不在内部发请求（mock 数据走 import）
3. **类型完备** — 任何函数都要有入参 / 返回类型
4. **零硬编码颜色** — 全走 `tailwind.config.ts` + CSS 变量
5. **RSC 优先** — 能不 'use client' 就不加
6. **图标统一** — 全部用 `lucide-react`，不用 emoji
7. **注释策略** — 文件顶部 1 行说明职责；复杂函数 1 行说明意图

---

## 10. 后续演进路线（不在本期范围）

- [ ] 接入 WorkBuddy 真实 Agent API（替换 mock）
- [ ] 接入磐石 MCP（需要 BFF，单独服务）
- [ ] 鉴权（OAuth / 企业微信扫码）
- [ ] 多租户
- [ ] 移动端 PWA
- [ ] 替换 SQLite → PostgreSQL
- [ ] 单元测试 + Playwright E2E

---

## 11. V3 增量：腾讯地图 LBS（5 个 BFF + 4 组件）

### 11.1 架构

```
浏览器 → /api/maps/* BFF (持 key) → 腾讯 LBS WebService
                ↓ 失败
            客户端 NEXT_PUBLIC_KEY → 腾讯 LBS
                ↓ 失败
            mock-tmap.ts (内置 8 商区)
```

### 11.2 BFF 路由表

| 路径 | 入口文件 | 能力 | 行数 |
|---|---|---|---|
| `/api/maps/search` | `src/app/api/maps/search/route.ts` | 地点搜索 | ~45 |
| `/api/maps/geocode` | `src/app/api/maps/geocode/route.ts` | 地址→坐标 | ~40 |
| `/api/maps/regeocode` | `src/app/api/maps/regeocode/route.ts` | 坐标→地址 | ~38 |
| `/api/maps/route` | `src/app/api/maps/route/route.ts` | 路线规划 | ~60 |
| `/api/maps/ip-loc` | `src/app/api/maps/ip-loc/route.ts` | IP 定位 | ~45 |

所有路由 `export const dynamic = 'force-dynamic'`（不能静态化）。

### 11.3 核心模块

| 模块 | 路径 | 职责 | 行数 |
|---|---|---|---|
| SDK 客户端 | `src/lib/tencent-map.ts` | 5 API + polyline 解压 + haversine | 146 |
| 客户端 Hook | `src/hooks/useTencentMap.ts` | 三层兜底（BFF → 直调 → mock） | 247 |
| 类型定义 | `src/types/maps.ts` | 腾讯 API 全量类型 | 114 |
| Mock 数据 | `src/lib/data/mock-tmap.ts` | 离线降级（8 商区 + 路线估算） | 105 |

### 11.4 4 个前端组件

| 组件 | 路径 | 用途 | 行数 |
|---|---|---|---|
| `AddressSearch` | `src/components/maps/AddressSearch.tsx` | 关键词搜 POI，结果列表 | 86 |
| `RouteBadge` | `src/components/maps/RouteBadge.tsx` | 路线距离/时长/红绿灯 | 85 |
| `LocationPin` | `src/components/maps/LocationPin.tsx` | IP 定位回调 | 65 |
| `CoordTag` | `src/components/maps/CoordTag.tsx` | 地址→坐标显示，坐标可复制 | 75 |

### 11.5 集成点

| 页面 | 替换前 | 替换后 |
|---|---|---|
| `dashboard/page.tsx` | 硬编码"18.4 km / 65 min" | `useEffect` 调 `/api/maps/route` 拿真实数据 |
| `dashboard/TodayRouteHeader.tsx` | 不显示数据源 | 真实数据时显示"腾讯实时路线" Badge |
| `dashboard/RouteMiniMap.tsx` | 直线折线 | 真实 polyline（解压后的多段曲线） |
| `map/page.tsx` | 裸 map | 顶部加 AddressSearch + LocationPin |
| `map/SalesMap.tsx` | 单层 useEffect | 改为 mapcn 声明式 marker popup + 富信息弹窗 + 腾讯路线 MapRoute；支持 `/map?company=<id>` 自动聚焦并打开 popup |
| `dashboard/VisitCard.tsx` | 仅查看作战卡 | 整卡点击跳转 `/map?company=<id>`，地图自动飞到对应客户 |
| `company/[id]/page.tsx` | 2 列布局 | 3 列布局 + CoordTag + RouteBadge |

### 11.6 部署支持

- `vercel.json` - Vercel 部署配置（hkg1 + sin1 节点）
- `DEPLOY.md` - 3 套部署方案（Vercel / 静态 / SSR）
- `.env.local.example` - 双 key 模板（服务端 + 客户端）
- `docs/TENCENT_MAPS.md` - 5 API 完整集成文档

### 11.7 关键设计决策

1. **BFF 保护 key** - 主路径走 Next.js API 路由，key 不暴露
2. **三层兜底** - 静态部署也能用真实数据（配 NEXT_PUBLIC_KEY）或 mock
3. **polyline 后端解压** - 前端零计算，maplibre 直接画线
4. **数据源标签** - `from: 'tencent-map' | 'mock'`，前端透明显示
5. **配额监控** - 后端 `console.log` 打印 `X-LIMIT` 响应头

---

## 12. 已踩坑清单（按时间倒序）

> **每踩一个坑都登记一次，下次绝不再踩**。

### 12.1 ❌ 静态导出 + `redirect()` → 根路径空白

- **现象**：访问 `https://.../` 时，layout 正常（侧边栏/顶栏都在），但 `<main>` 区域是空的
- **原因**：`src/app/page.tsx` 用了 Next.js 服务端 `redirect('/dashboard')`；但 `output: 'export'` 静态导出**不支持**服务端 redirect，redirect 调用被丢弃，page 渲染为空
- **修复**：改成 `'use client'` + `useRouter().replace('/dashboard')` + 友好 loading 提示
- **教训**：**任何依赖 Node runtime 的特性（redirect/headers/cookies）在静态导出模式下都不工作**。要么换 client-side 实现，要么放弃静态导出
- **影响版本**：V3.1（2026-07-03）

### 12.2 ❌ brace expansion 没展开 → 残留空目录

- **现象**：`src/app/{dashboard,map,companies,company,followups,funnel,review}/` 是个真实存在的目录（名字带大括号，里面是空的）
- **原因**：bash 在某些场景下 brace expansion 不会自动展开（嵌套引号、不同 shell）
- **修复**：手动 `rm -rf '{...}'` 删掉，然后 `mkdir dashboard map ...` 一个个建
- **教训**：**建多目录一律逐个写**，不要赌 brace expansion
- **影响版本**：V2 搭建期（2026-07-03）

### 12.3 ❌ `next export` 被 CloudStudio safe-delete 拦截

- **现象**：`next build` 跑 export 阶段时，CloudStudio 沙箱的 safe-delete 守卫会删掉 `out/` 里的内容
- **修复**：写 `scripts/manual-export.mjs`，手动复制 `.next/server/app/*.html` → `out/`，**用 append 模式**不删旧文件
- **影响版本**：V2 部署期（2026-07-03）

### 12.4 ❌ maplibre 强类型 GeoJSON 报错

- **现象**：TS 编译报 `Geometry` 类型不匹配
- **修复**：用 `as any` 绕过 maplibre 的强类型 GeoJSON 接口
- **影响版本**：V2 地图接入期（2026-07-03）

### 12.5 ❌ 动态路由 `[id]/page.tsx` 静态化时 404

- **现象**：`next export` 完成后 `/company/[id]` 全部 404
- **原因**：静态导出必须知道要导出的所有动态参数
- **修复**：在 `company/[id]/page.tsx` 加 `generateStaticParams()` 列出全部 40 个 ID
- **影响版本**：V2 部署期（2026-07-03）

### 12.6 ❌ maplibre 必须 client-side

- **现象**：服务端 import maplibre 报 `window is not defined`
- **修复**：用 `next/dynamic` 包裹，`ssr: false`
- **影响版本**：V2 地图接入期（2026-07-03）

### 12.7 ❌ 路径带空格要双引号

- **现象**：`cd /Users/.../比赛 - 销售系统/sales-os` 报 `cd:1: too many arguments`
- **修复**：用单引号包整个路径 `'...'`（双引号会被 shell 拆，空格切断）
- **影响版本**：所有 Bash 操作
