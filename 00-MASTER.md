# WorkBuddy GeoSales OS · 单一总览文档（MASTER）

> 版本：V4.0｜整合 10 份分散文档为唯一参考
>
> 来源（已合并）：`01-prototype-structure.md` / `02-database-schema.md` / `03-ai-prompts.md` / `04-mvp-schedule.md` / `05-shenzhen-collection-plan.md` / `overview.md` / `sales-os/overview.md` / `sales-os/docs/MODULE_MAP.md` / `sales-os/docs/TENCENT_MAPS.md` / `sales-os/DEPLOY.md`
>
> 维护原则：**一份即全部**。任何子文档需要新增/修改/废弃时，直接改本文档对应章节。
>
> 阅读顺序建议：① 〇~二（背景与架构）→ ② 三~七（业务核心）→ ③ 八~十（工程与运维）→ ④ 十一~十三（守则与边界）。

---

## 〇、文档索引（13 章速查）

| 章节 | 主题 | 适用读者 |
| - | - | - |
| 一 | 产品定义与商业目标 | 全员 |
| 二 | 技术栈与目录架构 | 开发 / 维护 |
| 三 | 7 大页面原型（融合 01） | 产品 / 销售 / 开发 |
| 四 | 6 张数据库表（融合 02） | 后端 / 数据 |
| 五 | 7 个 AI Agent 提示词（融合 03） | AI 工程师 |
| 六 | MVP 4 周排期（融合 04） | 项目管理 |
| 七 | 深圳 8 商区 × 300 家采集（融合 05） | 数据 / 销售 |
| 八 | 腾讯地图 LBS 集成（融合 TENCENT_MAPS） | 前端 / 全栈 |
| 九 | 部署指南（融合 DEPLOY） | 运维 |
| 十 | 已踩坑清单（融合 MODULE_MAP §12） | 全员 |
| 十一 | 文件结构与行数红线 | 开发 / 维护 |
| 十二 | 性能与全栈守则 | 开发 / codex 维护 |
| 十三 | 合规与边界 | 全员 |

---

## 一、产品定义与商业目标

### 1.1 一句话定位

地图驱动的销售作战系统——让腾讯云销售 **30 秒看到今天该打谁、3 分钟了解一家企业、5 分钟完成一次跟进**。

### 1.2 商业目标（V1 MVP）

| 维度 | 目标 |
| - | - |
| 覆盖城市 | 1 个（深圳） |
| 覆盖商区 | 8 个 |
| 覆盖企业 | 300 家（首期 50 家种子） |
| 销售人员 | 1 人（销售本人自用） |
| 决策周期 | 30 秒定位客户、2 分钟读完作战卡、3 分钟完成跟进 |
| 持久化 | localStorage（单机 MVP） → 飞书多维表格 / PostgreSQL |

### 1.3 关键决策摘要

| # | 决策 | 原因 | 切换时机 |
| - | - | - | - |
| 1 | MVP 用 mock 数据 | 比赛展示阶段简化部署 | W8+ 接真实数据 |
| 2 | 评分模型 8 维度固定权重 | 样本不足，动态学习易过拟合 | 月度人工校验 → 季度调权重 |
| 3 | AI 输出全部结构化 + 可编辑 | 销售不愿被 AI"绑架" | 持续 |
| 4 | KP 以角色为主 | 合规 + 数据可获得性 | 持续 |
| 5 | 话术库独立表，迭代靠 effectiveness_score | 数据驱动优化 | 持续 |
| 6 | 框架 Next.js 14 App Router | RSC + Client 混用，构建快 | — |
| 7 | 地图 maplibre-gl + OSM（基线）+ 腾讯 LBS（增值） | OSM 无需 Key，腾讯加能力 | — |
| 8 | 部署 Vercel + 沙箱兜底 | 一键上线 + 演示无阻 | — |

---

## 二、技术栈与目录架构

### 2.1 技术栈一览

| 层级 | 技术 | 备注 |
| - | - | - |
| 框架 | Next.js 14.2.35（App Router） | RSC + Client 混用 |
| 语言 | TypeScript 5.x（strict: true） | 全量类型化 |
| 样式 | Tailwind CSS 3.4 + CSS 变量 | 玻璃拟态 / 渐变 / 微交互 |
| UI 原子 | 本地 shadcn 风格（不依赖远程 registry） | 11 个原子组件 |
| 地图底图 | maplibre-gl + OpenStreetMap | 公开瓦片，无需 Key |
| 地图能力 | 腾讯位置服务 LBS（5 BFF + 客户端兜底） | 搜索/地址/路线/定位 |
| 数据 | 纯 mock（`lib/data/*`） → Prisma + SQLite（预留） | 比赛阶段用 mock |
| 图标 | lucide-react | shadcn 标准 |
| 部署 | Vercel / CloudStudio 静态 / 自建 SSR | 三套方案 |
| 性能 | next/dynamic + ssr:false（maplibre） | 地图按需加载 |

### 2.2 目录结构

```
工作区根/
├── MASTER.md                  ← 本文档（唯一总览）
├── agent.md                   ← Agent / Codex 维护守则
├── 销售系统/                   ← 旧静态 HTML 演示版（保留）
├── web/                       ← V1 静态 HTML 7 页（保留为历史版本）
└── sales-os/                  ← V3 主项目（Next.js 14 + TS）
    ├── prisma/
    │   └── schema.prisma      ← 6 张表（待切换）
    ├── scripts/
    │   └── manual-export.mjs  ← 静态导出脚本（绕过 safe-delete）
    ├── src/
    │   ├── app/               ← 路由层（8 个 page）
    │   │   ├── layout.tsx     ← 全局布局
    │   │   ├── page.tsx       ← /  → 客户端跳 /dashboard
    │   │   ├── dashboard/     ← P1 工作台
    │   │   ├── map/           ← P2 销售地图
    │   │   ├── companies/     ← P3 企业列表
    │   │   ├── company/[id]/  ← P4 客户详情
    │   │   ├── followups/     ← P5 跟进记录
    │   │   ├── funnel/        ← P6 销售漏斗
    │   │   ├── review/        ← P7 销售复盘
    │   │   └── api/maps/      ← 5 个 BFF 路由
    │   ├── components/
    │   │   ├── ui/            ← 11 个原子组件（≤150 行/个）
    │   │   ├── layout/        ← Sidebar / Topbar / MobileTabbar
    │   │   ├── dashboard/     ← 工作台 5 个子组件
    │   │   ├── map/           ← 地图 1 个核心组件（385 行）
    │   │   ├── company/       ← 客户详情 6 个子组件
    │   │   ├── followups/     ← 2 个组件
    │   │   ├── funnel/        ← 2 个组件
    │   │   ├── review/        ← 3 个组件
    │   │   └── maps/          ← 4 个开箱即用地图组件
    │   ├── lib/
    │   │   ├── data/          ← 7 个 mock 数据（companies/districts/followups/funnel/route/company-verification/mock-tmap）
    │   │   ├── tencent-map.ts ← 腾讯 LBS SDK 客户端
    │   │   ├── constants.ts   ← 颜色/阶段/阈值
    │   │   └── utils.ts       ← cn / formatDate
    │   ├── types/
    │   │   ├── index.ts       ← 业务类型
    │   │   └── maps.ts        ← 腾讯 API 类型
    │   └── hooks/
    │       ├── useTheme.ts    ← 主题切换
    │       └── useTencentMap.ts ← 三层兜底 hook
    ├── package.json
    ├── tsconfig.json          ← strict: true
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    ├── next.config.mjs        ← transpilePackages + optimizePackageImports
    ├── components.json        ← shadcn 配置
    ├── vercel.json            ← Vercel 部署
    └── .env.local.example     ← 双 Key 模板
```

### 2.3 数据流（自上而下，禁止反向依赖）

```
URL
  ↓
app/[route]/page.tsx           ← 服务端组件（默认 RSC）
  ↓ (import)
components/[scope]/*.tsx       ← 客户端组件（需要交互时 'use client'）
  ↓ (import)
lib/data/*.ts                  ← 纯数据函数（mock）
  ↓
types/index.ts + constants.ts  ← 叶子（零依赖）
```

| 规则 | 说明 |
| - | - |
| 叶子模块 | types / constants / utils 不依赖任何业务模块 |
| 数据层 | lib/data 只依赖叶子 |
| 组件层 | 只依赖数据层 + 叶子 |
| 路由层 | 只组合组件 |
| **禁止** | 反向依赖（types 不能 import 业务代码） |

### 2.4 客户端组件边界（'use client' 标记规则）

| 场景 | 是否 'use client' | 原因 |
| - | - | - |
| 页面入口（`page.tsx`） | ❌ | 默认 RSC，构建更快 |
| 含 onClick / useState / useEffect | ✅ | 需要 hydration |
| 含浏览器 API（localStorage / window） | ✅ | |
| 纯展示（只读 props） | ❌ | 走 RSC，零 JS |
| mapcn / maplibre 地图组件 | ✅ | 内部用 maplibre + 事件 |

> 备注：因 `next/dynamic({ ssr: false })` 包裹，地图组件在 SSR 阶段不会执行，客户端再加载，避开了 `window is not defined` 报错。

### 2.5 主题与色彩规范

| 项 | 规范 |
| - | - |
| 主题三态 | `light` / `dark` / `system` |
| 持久化 | `localStorage.theme` |
| 实现 | `html.classList` 切换 `dark` |
| 入口 | `<html suppressHydrationWarning>` |
| 切换器 | `components/layout/ThemeToggle.tsx` |
| 腾讯蓝 | `#0052D9`（primary） |
| 腾讯绿 | `#00A86B`（success） |
| 警示橙 | `#FA8C16`（warning） |
| 错误红 | `#F5222D`（destructive） |
| 渐变 | `gradient-hero: linear-gradient(135deg, #0052D9, #00A6FF, #00C7BE)` |

---

## 三、7 大页面原型（融合 01-prototype-structure.md）

### 3.1 全局导航与跳转关系图

```
                        ┌──────────────────┐
                        │  P1 首页工作台      │  ← 日常入口
                        └────────┬─────────┘
              ┌──────────┬──────┴──────┬──────────────┐
              ▼          ▼             ▼              ▼
       ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
       │ P2 深圳地图 │ │ P3 企业列表│ │ P6 销售漏斗│ │ P7 销售复盘│
       └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────────┘
            │            │            │
            └──────┬─────┘            │
                   ▼                  │
            ┌──────────────┐          │
            │ P4 企业详情/   │◀─────────┘
            │   客户作战卡   │
            └──────┬───────┘
                   │
                   ▼
            ┌──────────────┐
            │ P5 跟进记录    │  ← 单条跟进详情（也可作 P4 内嵌 Tab）
            └──────────────┘
```

**跳转原则**：
- **首页工作台**是销售每日入口，跳转频次最高。
- **企业列表（P3）**是流量中转站（地图筛选 → 列表 → 详情）。
- **客户作战卡（P4）**是核心操作页，从地图、列表、漏斗都能进入。
- **跟进记录（P5）**可作为 P4 的内嵌 Tab，也可独立访问。

---

### 3.2 页面 1：首页工作台（Daily Cockpit）

| 维度 | 内容 |
| - | - |
| 目标 | 销售每天打开系统 **30 秒内** 知道：今天该打谁、该见谁、该推谁 |
| ★★★ | 今日 Top 10 优先客户（workbuddy_score≥80 & 今日无跟进） |
| ★★★ | 今日待跟进（next_followup_date = 今天 & 阶段 < 已成交） |
| ★★☆ | 本周漏斗快照 |
| ★★☆ | 高潜商区排名（business_districts.priority = A） |
| ★☆☆ | 最近新增高潜（入库 < 7 天 & A 类） |
| ★☆☆ | 本周动作统计（触达 / 会议 / POC） |
| ★★☆ | 系统推荐下一步 |
| 字段示例 | 企业名 / 商区 / 评分 / 推荐 KP / 一句话切入 / 行动按钮 |
| 跳转 | P2 / P3 / P4 / P5 / P6 |
| 验收 | 30 秒定位今日 Top 1 |

---

### 3.3 页面 2：深圳客户地图（Geo Map）

| 维度 | 内容 |
| - | - |
| 目标 | 在地图上**一眼看到**深圳重点商区里 WorkBuddy 高潜客户的密度分布 |
| ★★★ | 深圳行政区底图（南山/福田/宝安/龙华/龙岗五大区） |
| ★★★ | 8 个重点商区边界（多边形覆盖，配色按 priority A 橙 / B 蓝 / C 灰） |
| ★★★ | 企业点位（按 workbuddy_score 着色） |
| ★★☆ | 商区热力图（按 A 类客户数渲染） |
| ★★☆ | 筛选侧栏（行业 / 评分 / 状态 / 商区） |
| ★☆☆ | 商区详情弹窗 |
| ★☆☆ | 图例与图层切换 |
| 筛选字段 | 行业多选 / 评分 0–100 / 等级 A+B+C / 状态 / 仅 A 类开关 |
| 跳转 | 商区 → P3（district_id）/ 企业 → P4（company_id） |
| 地图状态 | 写入 URL query，刷新可还原 |
| 验收 | 8 商区全部展示，点击响应 < 200ms |

---

### 3.4 页面 3：企业列表（Company Roster）

| 维度 | 内容 |
| - | - |
| 目标 | 地图/漏斗/复盘的"中转站"，集中筛选 + 批量处理 |
| ★★★ | 筛选条件栏（商区/行业/等级/评分/状态/跟进日期） |
| ★★★ | 列表主表（11 列，见下） |
| ★★☆ | 批量操作工具栏（标记跟进 / 导出 / 修改阶段） |
| ★★☆ | 列头排序（评分、规模、跟进时间） |
| ★☆☆ | 分页 / 每页条数（默认 50） |
| 主表字段 | 公司名 / 商区 / 行业 / 规模 / 评分 / 等级 / 场景 / 阶段 / 下一步 / 下次跟进 / 操作 |
| 跳转 | 公司名 → P4 / 跟进 → P5（company_id 预填） |
| URL 参数 | `?district_id / ?industry / ?level / ?stage / ?min_score` |
| 验收 | 筛选响应 < 1s |

---

### 3.5 页面 4：企业详情 / 客户作战卡（Battle Card）

| 维度 | 内容 |
| - | - |
| 目标 | 销售打开一家企业 **2 分钟内** 知道：值不值得打 / 先找谁 / 第一句说什么 / 下一步怎么推 |
| ★★★ Tab | 概览 / 痛点与场景 / KP 路线 / 触达话术 / 跟进历史 |
| ★★☆ Tab | 机会 / 备注 |
| 概览字段 | 名称 / 商区 / 行业 / 规模 / 成立 / 官网 / 评分 / 等级 / 评分理由 / 8 维度明细 |
| KP 路线 | 6 步攻坚（业务痛点拥有者 → Champion → IT → 部门负责人 → 采购 → CEO） |
| 触达话术 | 9 类话术（wechat_first / phone_open / email_outreach / meeting_invite / followup / objection / ceo_brief / it_security / procurement_roi） |
| 跟进历史 | 时间倒序，7 字段（时间/对象/方式/摘要/关注/异议/下一步） |
| 操作 | 切换 Tab / 重新生成 / 复制话术 / 标记有效 / 新增跟进 / 编辑备注 / 调整阶段 |
| 跳转 | 新增跟进 → P5（company_id 预填）/ 在地图查看 → P2 |
| 验收 | 完整作战卡生成 < 5s |

---

### 3.6 页面 5：跟进记录（Followup Log）

| 维度 | 内容 |
| - | - |
| 目标 | **1 分钟内**完成一次跟进记录（自然语言输入 + AI 自动结构化） |
| ★★★ | 新增跟进表单（自然语言输入框 + 提交） |
| ★★★ | AI 结构化结果预览（提交后弹出，确认后落库） |
| ★★☆ | 该企业跟进历史（时间倒序） |
| ★★☆ | 销售漏斗 mini 视图（当前阶段 + 阶段历史） |
| ★★☆ | 快捷操作栏（约下次 / 调整阶段 / 标记输单） |
| 输入字段 | 企业 / 沟通时间 / 沟通对象角色+姓名 / 沟通方式 / 跟进摘要（200–500 字） |
| AI 输出 | 客户关注点 / 异议 / 当前意向 / 阶段 / 下一步 / 下次时间（3/7/14 天）/ 推荐材料 |
| 操作 | 提交跟进 / 编辑 AI 结果 / 确认落库 / 约下次 / 标记输单 |
| 跳转 | 提交成功默认跳回 P4，可配置跳转 P3 下一条 |
| 验收 | 输入到结构化 < 3s |

---

### 3.7 页面 6：销售漏斗（Sales Funnel）

| 维度 | 内容 |
| - | - |
| 目标 | 一眼看清自己手里客户分布在哪个阶段，识别卡点 |
| ★★★ | 11 阶段漏斗图（横向漏斗 + 客户数 + 转化率） |
| ★★★ | 阶段客户列表（点击阶段展开） |
| ★★☆ | 阶段金额预估（按 opportunity 汇总） |
| ★★☆ | 阶段停留时长（平均停留天数） |
| ★★☆ | 风险标记（> N 天未跟进标红） |
| 11 阶段 | 未触达 / 已触达 / 有效回复 / 需求沟通 / 产品演示 / POC 试点 / 商务报价 / 合同推进 / 已成交 / 输单 / 暂缓 |
| 展开字段 | 公司名 / 评分 / 阶段停留天数 / 预计金额 / 下一步 / 最近跟进 / 风险 |
| 筛选 | 时间范围（本周/本月/本季/全部）+ 商区/行业 |
| 跳转 | 点击客户 → P4（company_id） |
| 验收 | 阶段数据 100% 准确 |

---

### 3.8 页面 7：销售复盘（Weekly Review）

| 维度 | 内容 |
| - | - |
| 目标 | 销售**每周五下班前 5 分钟**看到这周做了什么、卡在哪、下周该冲谁 |
| ★★★ | 本周关键指标（6 个核心数字 + 同比箭头） |
| ★★★ | 高转化商区 Top 3 / 高转化行业 Top 3 / 高转化话术 Top 3 |
| ★★☆ | 常见客户异议 Top 5 |
| ★★☆ | 本周新进 A 类客户 |
| ★★☆ | 下周重点客户推荐（复盘 Agent 输出） |
| ★★☆ | 本周新增跟进条数趋势（折线图） |
| 6 指标 | 新增客户 / 已触达 / 有效回复 / 已约会议 / POC 客户 / 商务推进 |
| 操作 | 切换时间范围 / 导出 Markdown 或 PDF / 重新生成 |
| 跳转 | 客户 → P4 / 话术 → P4 话术 Tab |
| 验收 | 复盘生成 < 8s |

---

### 3.9 全局通用模块

| 模块 | 内容 |
| - | - |
| 顶部导航 | Logo / 主菜单 / 搜索框 / 主题切换 / 销售身份 |
| 全局筛选器 | 城市 / 商区 / 行业 / 客户等级 / 时间范围 / 我的 / 全部 |
| 浮层清单 | 商区详情卡 / 企业 mini 卡 / 话术生成器 / 跟进结果确认 / 阶段调整确认 |

### 3.10 页面交付物清单

| 页面 | 主交付物 | 验收标准 |
| - | - | - |
| P1 工作台 | Figma + 字段映射 | 30 秒定位今日 Top 1 |
| P2 地图 | 地图组件 + 商区 GeoJSON | 8 商区展示，点击响应 < 200ms |
| P3 列表 | 表格 + 6 筛选器 | 筛选响应 < 1s |
| P4 作战卡 | 7 Tab + 6 Agent | 生成 < 5s |
| P5 跟进 | 自然语言表单 + AI 总结 | 输入到结构化 < 3s |
| P6 漏斗 | 11 阶段 + 列表展开 | 数据 100% 准确 |
| P7 复盘 | 6 指标 + 3 Top + 下周推荐 | 生成 < 8s |

---

## 四、6 张数据库表（融合 02-database-schema.md）

### 4.1 全局约定

| 项 | 约定 |
| - | - |
| 主键 | UUID v4 |
| 时间 | timestamptz（UTC 存储，前端 GMT+8） |
| 数组 | text[]（PG 原生 / 飞书多选） |
| JSON | jsonb |
| 软删除 | `deleted_at timestamptz NULL` |
| 审计 | `created_at` / `updated_at` / `created_by` / `updated_by` |
| 命名 | 表复数下划线 / 字段小写下划线 / 枚举小写字符串 |
| 金额 | numeric(14,2) |
| 坐标 | 浮点 + GiST 索引（PostGIS） |

### 4.2 ER 总览

```
business_districts (1) ──────< (N) companies
                                    │
                                    ├──< (N) contacts
                                    │
                                    ├──< (N) opportunities ──> (1) contacts
                                    │         │
                                    │         └──< (N) followups
                                    │
                                    └──< (N) followups ──> (1) contacts

sales_scripts (独立) ──── 通过 industry / kp_role / scenario 弱关联到 companies
```

---

### 4.3 表 1：business_districts（商区）

| 关键字段 | 类型 | 说明 |
| - | - | - |
| id | uuid PK | |
| name | varchar(64) | "南山科技园" |
| city | varchar(32) | 默认"深圳" |
| district | varchar(32) | 行政区 |
| type | varchar(32) | tech_park / hq_zone / financial / manufacturing / port_logistics / culture_tourism |
| main_industries | text[] | 主导行业数组 |
| boundary | jsonb | 商区边界 GeoJSON Polygon |
| center_lat / center_lng | numeric(10,7) | 中心点 |
| zoom_level | smallint | 默认 13 |
| company_count / high_score_count / touched_count / followup_count | integer | 冗余统计 |
| avg_workbuddy_score | numeric(5,2) | |
| priority | varchar(1) | A / B / C（默认 C） |
| sort_order | integer | 排序权重 |
| description | text | |
| 8 商区种子 | 南山科技园（A）/ 深圳湾·后海（A）/ 前海（A）/ 福田 CBD（A）/ 宝安·西乡·福永（B）/ 龙华·坂田（A）/ 龙岗·坂雪岗·大运（B）/ 蛇口·华侨城（B） |

**索引**：`idx_districts_city / idx_districts_priority / idx_districts_boundary (GiST)`

---

### 4.4 表 2：companies（企业）

| 关键字段 | 类型 | 说明 |
| - | - | - |
| id | uuid PK | |
| name / short_name | varchar(128/64) | 全称 / 简称 |
| address / city / district | text / varchar | 办公地址 |
| business_district_id | uuid FK | → business_districts.id |
| industry / sub_industry | varchar | 一级 / 细分 |
| company_size | varchar(8) | S(<50) / M(50-200) / L(200-1000) / XL(>1000) |
| employee_count / founded_year / registered_capital / annual_revenue | 数字 | |
| website | varchar(256) | |
| lat / lng | numeric(10,7) | |
| **workbuddy_score** | smallint | 0–100（默认 0） |
| **scoring_breakdown** | jsonb | 8 维度明细 |
| **score_reasoning** | text | 100–200 字 |
| **customer_level** | varchar(1) | A / B / C（自动） |
| recommended_scenarios | text[] | 场景字典 |
| pain_points | text[] | |
| current_stage | varchar(32) | 默认 'untouched' |
| next_action / next_followup_date / last_followup_at | | |
| owner | varchar(64) | 销售负责人 |
| data_source | varchar(32) | manual / qcc / public / ai_inferred |
| notes / tags | text / text[] | |

**枚举：current_stage**：`untouched / touched / replied / requirement / demo / poc / quote / contract / won / lost / paused`

**枚举：scenarios**：`sales_proposal / customer_research / meeting_notes / knowledge_qa / cs_assistant / onboarding / marketing_content / bidding / product_docs / analytics_report`

**索引**：`idx_companies_district / idx_companies_score DESC / idx_companies_level / idx_companies_stage / idx_companies_next_followup / idx_companies_industry / idx_companies_geo (GiST point)`

**8 维度评分结构**（见 §5.3）：

```json
{
  "knowledge_density":      { "score": 18, "max": 20, "reason": "..." },
  "org_size":               { "score": 12, "max": 15, "reason": "..." },
  "multi_dept_complexity":  { "score": 13, "max": 15, "reason": "..." },
  "ai_readiness":           { "score": 10, "max": 15, "reason": "..." },
  "tencent_ecosystem":      { "score": 8,  "max": 10, "reason": "..." },
  "growth_pressure":        { "score": 8,  "max": 10, "reason": "..." },
  "data_security":          { "score": 7,  "max": 10, "reason": "..." },
  "procurement_likelihood": { "score": 4,  "max": 5,  "reason": "..." }
}
```

---

### 4.5 表 3：contacts（KP 联系人）

| 关键字段 | 类型 | 说明 |
| - | - | - |
| id | uuid PK | |
| company_id | uuid FK | → companies.id |
| name | varchar(64) | 姓名（**可空**，优先以角色记录） |
| role | varchar(32) | ceo / coo / sales_lead / marketing_lead / it_lead / hr_lead / procurement / finance / other |
| role_label | varchar(64) | 角色中文名 |
| influence_level | varchar(8) | high / medium / low |
| attitude | varchar(8) | supportive / neutral / opposed / unknown |
| is_champion | boolean | 是否内部 Champion |
| contact_source | varchar(32) | manual / business_card / public_event / authorized |
| priority | smallint | 1–6（1 最先触达） |
| last_contact_at | timestamptz | |

**合规约束（应用层 + DB Trigger 双重）**：
- 严禁手机号 / 私人微信 / 身份证号 / 家庭住址
- 字段级约束：name ≤ 64 字符；notes 提示词中禁止"手机号""身份证"等关键词
- MVP 阶段以角色为主，name 允许空

**索引**：`idx_contacts_company / idx_contacts_role / idx_contacts_priority (company_id, priority)`

---

### 4.6 表 4：opportunities（机会）

| 关键字段 | 类型 | 说明 |
| - | - | - |
| id | uuid PK | |
| company_id | uuid FK | |
| opportunity_name | varchar(128) | "WorkBuddy 销售部试点 50 人" |
| product | varchar(32) | 默认 'WorkBuddy' |
| scenario | varchar(32) | 试点场景 |
| estimated_users | integer | |
| unit_price | numeric(10,2) | 元/人/年 |
| estimated_amount | numeric(14,2) | |
| stage | varchar(32) | 同 companies.current_stage |
| probability | smallint | 0–100（默认 30） |
| expected_close_date | date | |
| key_risks | text[] | |
| champion_contact_id | uuid FK | → contacts.id |
| next_action | text | |

**索引**：`idx_opps_company / idx_opps_stage / idx_opps_amount DESC / idx_opps_close_date`

---

### 4.7 表 5：followups（跟进记录）

| 关键字段 | 类型 | 说明 |
| - | - | - |
| id | uuid PK | |
| company_id / opportunity_id | uuid FK | |
| followup_time | timestamptz | 默认 now() |
| contact_id | uuid FK | → contacts.id（**可空**） |
| contact_role | varchar(32) | 即使 contact_id 为空也**必填** |
| contact_name | varchar(64) | 可空 |
| channel | varchar(16) | phone / wechat / meeting / email / offline |
| summary | text | 销售录入自然语言 |
| **ai_structured** | jsonb | AI 总结结构化 |
| customer_interest | text[] | |
| objections | text[] | |
| stage_after | varchar(32) | 本次沟通后阶段 |
| next_action / next_followup_date / materials_needed | | |
| sentiment | varchar(8) | positive / neutral / negative（默认 neutral） |

**ai_structured JSON 结构**：
```json
{
  "interest_tags": ["销售方案生成", "会议纪要"],
  "objection_tags": ["价格", "数据安全"],
  "implied_stage": "requirement",
  "stage_change_reason": "客户主动要求 demo",
  "next_action": "准备安全说明材料并约 IT 负责人",
  "next_followup_days": 3,
  "materials": ["安全白皮书", "案例集", "试点方案"],
  "risk_level": "medium"
}
```

**索引**：`idx_followups_company (company_id, followup_time DESC) / idx_followups_contact / idx_followups_opportunity / idx_followups_next_date`

---

### 4.8 表 6：sales_scripts（话术库）

| 关键字段 | 类型 | 说明 |
| - | - | - |
| id | uuid PK | |
| industry / kp_role / scenario / stage | varchar | 弱关联 companies（可空） |
| script_type | varchar(32) | 9 类之一（见下） |
| content | text | 话术正文（占位符用 `{{var}}`） |
| variables | jsonb | `["{{company_name}}","{{pain_point}}"]` |
| effectiveness_score | numeric(4,2) | 0–5（默认 0） |
| usage_count | integer | 使用次数 |
| version | smallint | 重新生成会递增 |
| parent_script_id | uuid FK | 父版本（追溯演进） |
| is_template | boolean | 是否通用模板 |
| tags | text[] | |

**枚举：script_type**：`wechat_first / phone_open / email_outreach / meeting_invite / followup / objection / ceo_brief / it_security / procurement_roi`

**索引**：`idx_scripts_industry_role / idx_scripts_type / idx_scripts_score DESC`

---

### 4.9 触发器与自动化

| # | 触发器 | 作用 |
| - | - | - |
| T1 | `trg_companies_level` | INSERT/UPDATE workbuddy_score 时自动计算 customer_level（A: ≥80, B: 60–79, C: <60）+ 更新 score_updated_at |
| T2 | `trg_companies_refresh_district` | AFTER INSERT/UPDATE/DELETE companies 时刷新商区统计（company_count / high_score_count / touched_count / followup_count / avg_workbuddy_score） |
| T3 | `trg_contacts_compliance` | 拦截手机号（`1[3-9][0-9]{9}`）和身份证号（`[0-9]{17}[0-9Xx]`） |

### 4.10 存储选型建议

| 阶段 | 推荐 | 理由 |
| - | - | - |
| MVP（0–4 周） | 飞书多维表格 / Notion 数据库 | 0 代码、可分享、字段可视化 |
| 内部版（1–3 月） | Airtable + Zapier | 视图丰富、轻自动化 |
| 正式版（3 月+） | PostgreSQL 14+ + PostGIS | 空间查询、并发、可控 |

---

## 五、7 个 AI Agent 提示词（融合 03-ai-prompts.md）

### 5.0 系统级 System Prompt（所有 Agent 共享）

```
你是 WorkBuddy GeoSales OS 的销售作战助手，服务于腾讯云销售。
所有回答必须符合以下硬性约束：

1. 真实性：不得编造企业数据、KP 姓名、案例客户、合同金额、产品功能。
2. 合规性：不得提供个人手机号、私人微信、身份证号等敏感信息。
3. 专业性：语气为"专业顾问 + 实战销售"，不浮夸、不套路。
4. 结构化：必须按本提示词规定的 JSON / Markdown 结构输出。
5. 简洁性：单段文字不超过 200 字，列表项不超过 8 条。
6. 行业感：根据企业所在行业使用对应的业务术语和痛点词汇。
7. 不确定性：拿不准的内容用"建议进一步核实"标注，禁止硬编。
```

### 5.1 占位符与长度规范

| 占位符 | 含义 | 示例 |
| - | - | - |
| `{{company_name}}` | 企业全称 | 丰年互动 |
| `{{contact_name}}` | 联系人姓名（可空） | 张总 |
| `{{industry}}` | 一级行业 | 跨境电商 |
| `{{pain_point_X}}` | 第 X 个痛点 | 多语言内容生产慢 |
| `{{scenario_label}}` | 场景中文名 | 销售方案自动生成 |

| 输出类型 | 字数上限 |
| - | -: |
| 单段解释 | 200 |
| 列表项 | 30 |
| 完整话术 | 200–300 |
| 评分理由 | 200 |

**温度参数建议**：评分 0.2 / 话术 0.7 / 复盘 0.5 / 跟进总结 0.3

**错误兜底**：
- 评分 Agent：返回 `{total_score: 0, customer_level: "C", ...}` 并标注"信息不足"
- 话术 Agent：返回占位符 + 提示"请补充 {{X}} 后再生成"
- 其他 Agent：末尾追加 `## 需进一步核实` 列表

---

### 5.2 Agent 1：商区分析 Agent

- **角色**：深圳商业地理分析师
- **输入**：district / companies[] / period
- **输出 JSON**：`summary / high_potential_industries[] / development_priority / priority_reason / top_10_companies[] / suggested_action / watch_out`
- **判断规则**：
  - A 类 ≥ 10 → high
  - A 类 5–9 → medium
  - A 类 < 5 且 B 类 ≥ 20 → medium
  - 平均分 < 60 → priority ≤ medium
  - 已触达率 < 10% → 提示"高潜待开拓"
  - 已触达率 > 50% → 提示"精耕阶段，避免重复打扰"

---

### 5.3 Agent 2：企业画像 Agent

- **角色**：企业 BPO 顾问
- **输入**：company_name / industry / sub_industry / company_size / address / website / public_info / sales_notes
- **输出 Markdown**：
  - ## 企业简介（100–200 字）
  - ## 业务判断（主营业务 / 目标客户 / 商业模式 / 增长阶段）
  - ## 可能痛点（3–5 条，按可能性排序）
  - ## WorkBuddy 适配理由（100–150 字）
  - ## 推荐销售切入点（1–3 个）
  - ## 需进一步核实
- **规则**：
  - 严格基于提供的公开信息，不得补充未提供的数字
  - 痛点 3–5 条；不足 3 条需说明"暂无明显公开信号"
  - 切入点必须与场景字典对齐

---

### 5.4 Agent 3：评分 Agent（WorkBuddy Fit Score）

- **角色**：WorkBuddy 适配评分模型
- **输入**：company + signals
- **输出 JSON**：`total_score / customer_level / dimension_scores{}/ scoring_reasoning / key_strengths / key_risks`
- **8 维度评分细则**（总分 100）：

| 维度 | 权重 | 评分要点 |
| - | -: | - |
| 知识工作密度 | 20 | 高度依赖文档/方案/报告/会议/知识库 +；现场/体力为主 - |
| 组织规模 | 15 | XL(>1000) 12-15 / L(200-1000) 10-12 / M(50-200) 7-9 / S(<50) 3-6 |
| 多部门协作复杂度 | 15 | ≥4 部门 +；单一部门 - |
| AI 接受度 | 15 | 已用 AI 工具/组建 AI 团队 12-15；有 AI 招聘/试点 8-11；无信号 3-7 |
| 腾讯生态适配度 | 10 | ≥3 项 8-10；1-2 项 5-7；未用 0-4 |
| 业务增长压力 | 10 | 扩招+扩品类+融资+出海 8-10；正常 5-7；收缩 0-4 |
| 数据安全 / 私有化需求 | 10 | 关注数据出境/合规 8-10；中等 5-7；不敏感 0-4 |
| 采购可能性 | 5 | 有 IT 部门+采购流程+年度预算 4-5；弱 2-3；散户 0-1 |

- **客户等级**：
  - 80–100 → A
  - 60–79 → B
  - 0–59 → C
- **强制规则**：
  - 各维度评分不得超出 max 范围
  - scoring_reasoning 必须引用至少 3 个维度的具体证据
  - key_risks 必须与得分 ≤ 6 的维度对应
  - 严重合规风险（医疗涉密、金融核心）总分上限 75

---

### 5.5 Agent 4：KP 路线 Agent

- **角色**：大客户攻坚路径规划师
- **输入**：company + recommended_scenarios + current_stage + available_kps[]
- **输出 JSON**：
  - `recommended_path[step, kp_role, kp_label, goal, key_message, materials[], success_signal, duration_minutes, next_step_trigger]`
  - `path_strategy`（先纵后横 / 横向铺开 / 自上而下）
  - `estimated_total_meetings`
  - `estimated_days_to_quote`
- **标准路径（按场景）**：

| 场景类型 | 推荐路径 |
| - | - |
| 销售密集型 | 销售负责人 → Champion → IT → 业务负责人 → 采购 → CEO |
| 文档密集型（产品/研发） | 产品负责人 → 研发负责人 → IT → CTO → 采购 |
| 客服密集型 | 客服负责人 → 运营 → IT → COO → 采购 |
| 多语言/营销 | 市场负责人 → 内容/品牌 → 销售 → COO |
| 决策层快 | CEO 直访 → IT → 采购 |

- **规则**：
  - 必须包含至少 1 个"业务痛点拥有者"+ 1 个"决策拍板者"
  - IT 永远在第 2–3 步，避免太早引入安全议题阻断销售
  - current_stage = untouched 从第 1 步起；= requirement 跳到第 2 步
  - 已有 Champion 自动提到第 1 步

---

### 5.6 Agent 5：话术 Agent

- **角色**：实战销售话术教练（专业但不套路、有数字有案例）
- **输入**：company + kp_role + kp_attitude + scenario + stage + script_type + word_count_limit
- **输出 JSON**：
  - `script_type / content / variables_needed[] / key_phrases[] / do_not_say[] / expected_reply_rate`
- **9 类话术规范**：

| script_type | 字数 | 必备元素 |
| - | -: | - |
| wechat_first | ≤ 200 | 自我介绍 + 痛点共鸣 + 30 秒价值 + 时间请求 |
| phone_open | ≤ 100 | 自我介绍 + 时间许可 + 30 秒价值 |
| email_outreach | 200–300 | 主题行 + 痛点 + 案例 + CTA |
| meeting_invite | ≤ 150 | 价值预告 + 时间窗 + 三选一时段 |
| followup | ≤ 150 | 上次回顾 + 价值增量 + 下一步 |
| objection | ≤ 250 | 共情 + 拆解 + 证据 + 替代方案 |
| ceo_brief | ≤ 200 | 行业趋势 + 标杆 + 三点收益 |
| it_security | 200–300 | 认证 + 部署模式 + 权限 + 邀请安全工程师 |
| procurement_roi | 200–300 | 投入 + 产出 + 回收期 + 风险对冲 |

- **通用禁忌**：
  - 不得使用"赋能""抓手""闭环""打通""沉淀"
  - 不得承诺未发布的 WorkBuddy 功能
  - 不得捏造案例客户、合同金额
  - 不得在首次触达中提价格
  - 不得使用感叹号超过 1 个
  - 不得对比攻击友商

---

### 5.7 Agent 6：跟进总结 Agent

- **角色**：销售跟进复盘员
- **输入**：company + raw_followup（200–500 字）+ current_stage + followup_time + contact_role
- **输出 JSON**：
  - `summary`（50–100 字客观摘要）
  - `interest_tags[] / objection_tags[]`
  - `implied_stage / stage_change_reason`
  - `next_action / next_followup_days / materials[]`
  - `risk_level / sentiment`
- **阶段判断规则**：

| 信号 | 推断阶段 |
| - | - |
| 客户主动询问价格 | quote |
| 客户要求 demo | demo |
| 客户同意小范围试用 | poc |
| 客户表达具体需求 | requirement |
| 客户简单回复 | replied |
| 客户拒绝/多次未回复 | lost |
| 客户主动暂停 | paused |
| 已签约付款 | won |
| 之前未联系过 | touched |

- **next_followup_days 建议**：

| 阶段/信号 | 天数 |
| - | -: |
| 客户主动提到具体时间 | 按客户时间 |
| 强兴趣 | 1–3 |
| 异议 | 3–5 |
| 中性回复 | 5–7 |
| 加微信未聊 | 2–3 |
| POC 阶段 | 7 |
| 报价阶段 | 5 |

---

### 5.8 Agent 7：销售复盘 Agent

- **角色**：销售教练（数据驱动 + 直击问题 + 可执行建议，不灌鸡汤）
- **输入**：period / companies_touched[] / followups[] / stage_changes[] / script_usage[] / kpi_snapshot
- **输出 Markdown**：
  - # {{period}} 销售复盘
  - ## 本周关键指标（6 项 + 周同比 + 状态）
  - ## 三大亮点 / ## 三大问题
  - ## 高转化商区 Top 3 / 高转化行业 Top 3 / 高转化话术 Top 3
  - ## 常见客户异议 Top 5
  - ## 下周重点客户建议
  - ## 行动清单（按优先级）
- **触发规则**：

| 规则 | 触发 |
| - | - |
| 转化率 < 5% | "触达效率低" |
| POC = 0 且商务 > 0 | "过早商务报价，跳过 POC" |
| 异议"价格" ≥ 3 次 | "需更新 ROI 案例库" |
| 高转化商区本周未触达 | "下周重点"优先安排 |
| 同一客户本周 ≥ 3 次跟进但阶段未变 | "沟通卡点，建议换 KP" |
| 周同比下降 > 20% | 告警"连续 2 周下降，需复盘话术/渠道" |

---

### 5.9 挂载建议

| 平台 | 接入方式 |
| - | - |
| 飞书多维表格 + 扣子（Coze） | 每个 Agent 对应一个"智能字段"，输入变量通过"调用方传入"映射到多维表格字段，输出 JSON 通过"字段回填"写回 |
| WorkBuddy Agent 框架 | `agent.create({ name, system_prompt, input_schema, output_schema })`，output_schema 严格按 JSON 结构，失败返回兜底 JSON 不抛异常 |
| 国产大模型 | 已规避"赋能/抓手/闭环"等可能触发生成降级的词汇；输出格式优先用 Markdown + JSON 双格式 |

---

## 六、MVP 4 周排期（融合 04-mvp-schedule.md）

### 6.1 排期原则

**先跑通数据 → 再做地图 → 再做跟进 → 最后做复盘**，与 PRD 15.x 阶段一致。

### 6.2 全局里程碑

| 节点 | 时间 | 交付 |
| - | - | - |
| M0：开工 | W1 周一 | 数据底座 + 商区企业清单 |
| M1：可视化 | W2 周五 | 地图 + 列表 + 作战卡 |
| M2：闭环 | W3 周五 | 跟进 + 漏斗 + AI 总结 |
| M3：上线 | W4 周五 | 复盘 + 优化 + 销售自用 |

### 6.3 W1：数据底座 + 评分模型

| 任务 | 责任方 | 估时 |
| - | - | -: |
| 飞书多维表格建表（6 张） | 销售 + 助理 | 0.5 天 |
| 录入 8 个深圳重点商区（含边界 GeoJSON） | 销售 | 0.5 天 |
| 采集 300 家企业（首期 50 家种子） | 销售 | 2 天 |
| 填字段：行业/规模/商区/地址/官网 | 销售 | 1 天 |
| 部署评分 Agent 到飞书智能字段 | 开发 | 0.5 天 |
| 批量计算 300 家 WorkBuddy 评分 | 开发 | 0.5 天 |
| 校验评分合理性，调整提示词 | 销售 + 开发 | 1 天 |

**W1 验收**：
- ✅ 8 商区全部录入，地图可正常显示
- ✅ 300 家企业字段完整度 ≥ 95%
- ✅ 100% 企业已生成 WorkBuddy 评分
- ✅ 等级分布 A 10–20% / B 30–40% / C 40–60%
- ✅ 每家企业评分理由 ≥ 100 字

**W1 风险**：
- 采集速度慢 → 优先 50 家种子 + 公开数据爬取 + AI 补全
- 评分分布不合理 → 抽 20 家人工校验反向调权重
- GeoJSON 不准 → 用腾讯/高德行政区边界代替，标注"近似边界"

### 6.4 W2：地图 + 列表 + 作战卡

| 任务 | 责任方 | 估时 |
| - | - | -: |
| 首页工作台页面 | 开发 | 1 天 |
| 集成腾讯地图 JS SDK，绘制 8 商区多边形 | 开发 | 1 天 |
| 企业点位渲染（按评分着色） | 开发 | 0.5 天 |
| 地图筛选侧栏（行业/评分/状态） | 开发 | 0.5 天 |
| 企业列表页面（表格 + 6 筛选器 + 排序） | 开发 | 1 天 |
| 企业详情 - 概览/痛点与场景/KP 路线/触达话术 Tab | 开发 | 0.5×4 天 |

**W2 验收**：
- ✅ 30 秒看到今日 Top 10
- ✅ 地图筛选响应 < 1s
- ✅ 列表支持 4 维筛选
- ✅ 4 核心 Tab 全部可生成
- ✅ 任意企业可一键复制话术

### 6.5 W3：跟进记录 + 销售漏斗

| 任务 | 责任方 | 估时 |
| - | - | -: |
| 跟进记录 - 自然语言输入表单 | 开发 | 0.5 天 |
| 集成跟进总结 Agent | 开发 | 0.5 天 |
| AI 结果预览 + 手动编辑 + 确认落库 | 开发 | 0.5 天 |
| 阶段自动判断 + 客户表同步 | 开发 | 0.5 天 |
| 下次跟进时间智能建议 | 开发 | 0.3 天 |
| 飞书日历/企微提醒集成 | 开发 | 0.5 天 |
| 销售漏斗页（11 阶段横向） | 开发 | 1 天 |
| 漏斗阶段展开 + 风险标记 | 开发 | 0.5 天 |
| 漏斗数据导出 Excel | 开发 | 0.2 天 |
| 真实跑 5 家客户全流程 | 销售 | 1 天 |

**W3 验收**：
- ✅ 输入 200 字自然语言，AI 自动结构化
- ✅ AI 结构化字段可手动编辑
- ✅ 客户阶段自动更新
- ✅ 下次跟进时间自动建议（3/7/14 天）
- ✅ 漏斗 11 阶段数据准确（人工核对 10 家）
- ✅ 漏斗可导出 Excel

### 6.6 W4：复盘 + 优化 + 销售自用

| 任务 | 责任方 | 估时 |
| - | - | -: |
| 销售复盘页 - 6 关键指标卡片 | 开发 | 0.5 天 |
| 高转化商区/行业/话术 Top 3 | 开发 | 0.5 天 |
| 常见异议统计 | 开发 | 0.3 天 |
| 下周重点客户推荐 | 开发 | 0.5 天 |
| 话术库管理 - 标记有效/失效 | 开发 | 0.3 天 |
| 评分模型优化（基于反馈） | 销售 + 开发 | 1 天 |
| 话术库扩充 | 销售 | 1 天 |
| 销售自用 3 天 + 收集反馈 | 销售 | 3 天 |
| 修复 P0/P1 Bug | 开发 | 1 天 |
| 编写使用手册 + 3 分钟教学视频 | 销售 | 0.5 天 |

**W4 验收**：
- ✅ 复盘每周五自动生成
- ✅ Top 3 数据可解释
- ✅ 话术库覆盖 8 类
- ✅ 销售连续 3 天主动使用
- ✅ P0 Bug 0，P1 ≤ 3
- ✅ 使用手册 + 教学视频

### 6.7 资源与角色

| 角色 | 投入 | 主要工作 |
| - | - | - |
| 销售（你） | 50% | 数据采集 / 验收 / 反馈 / 自用 |
| 助理 / 数据 | 30% | 录入 / 整理 / 校验 |
| 开发 | 100%（4 周） | 6 张表 + 7 页面 + 7 Agent 集成 |
| AI 工程师 | 30% | Agent 提示词调优 + 评分模型迭代 |

### 6.8 上线标准（M4 必达）

**必达指标**：
1. 销售连续 5 天主动打开系统
2. 累计录入跟进 ≥ 50 条
3. 至少 3 家进入"需求沟通"或更后阶段
4. 至少 1 家进入 POC 阶段
5. 销售满意度 ≥ 7/10

**推迟上线条件**：
- W3 结束前未跑通跟进闭环 → 推迟到 W5
- 评分模型认可度 < 60% → 推迟到 W5，优先优化评分
- AI 关键 Agent 失败率 > 30% → 推迟到 W5

### 6.9 后续规划（W5+）

| 周 | 重点 |
| - | - |
| W5 | 接入企微/飞书日历，自动化提醒 |
| W6 | 团队版（多销售共享战报） |
| W7 | 广州/北京数据接入 |
| W8 | WorkBuddy API 正式对接 |
| W9–10 | React/Vue 重构前端，PostgreSQL 切换 |
| W11+ | 移动端 + 语音录入 + 自动挖掘客户 |

---

## 七、深圳 8 商区 × 300 家采集（融合 05-shenzhen-collection-plan.md）

### 7.1 采集原则

**精准优先于数量，先做透 8 商区再扩规模**。首期目标：8 商区 × 300 家 | 周期 W1 完成。

### 7.2 8 个商区采集规划

| # | 商区 | 行政区 | 类型 | 计划 | 优先级 | 难度 |
| -: | - | - | - | -: | - | - |
| 1 | 南山科技园 | 南山区 | 科技园区 | 50 | P0 | 中 |
| 2 | 深圳湾/后海 | 南山区 | 总部经济区 | 35 | P0 | 中 |
| 3 | 前海 | 南山区 | 金融+跨境 | 35 | P0 | 中 |
| 4 | 福田 CBD | 福田区 | 金融+总部 | 40 | P0 | 中 |
| 5 | 宝安中心/西乡/福永 | 宝安区 | 制造+跨境 | 40 | P1 | 中 |
| 6 | 龙华/坂田 | 龙华区 | 科技+直播 | 40 | P0 | 低 |
| 7 | 龙岗坂雪岗/大运 | 龙岗区 | 制造+ICT | 30 | P1 | 低 |
| 8 | 蛇口/华侨城 | 南山区 | 文旅+文创 | 30 | P1 | 中 |
| **合计** | | | | **300** | | |

### 7.3 各商区特征

| 商区 | 范围 | 主导行业 | 重点采集 | 难点 |
| - | - | - | - | - |
| 南山科技园 | 科苑南路-高新南-科技中-松坪山 | 软件/SaaS/智能硬件/跨境电商/游戏 | 200+ 中型科技公司、B 轮+ | 园区密集，按"楼栋+楼层"区分 |
| 深圳湾/后海 | 后海中心 + 深圳湾人才公园 + 海岸城 | 总部经济、金融科技、文创 | 总部型、深圳有 IT 决策权 | 总部未必在深圳决策 AI 采购 |
| 前海 | 前海合作区 + 桂湾 + 前湾 + 妈湾 | 金融科技、跨境电商、保税物流 | 亚马逊/独立站、保税仓 | 注册地 ≠ 办公地 |
| 福田 CBD | 中心区 + 平安金融中心 + 卓越世纪 | 银行/证券/保险、咨询、总部 | 全国性金融机构深圳总部 | 合规严，找"非核心系统"窗口 |
| 宝安/西乡/福永 | 中心区 + 西乡 + 福永 + 机场周边 | 智能制造、跨境电商、电子 | 工厂销售/采购/客服部门 | 知识工作密度低 |
| 龙华/坂田 | 龙华中心 + 坂田华为基地 + 星河 WORLD | 智能硬件、视频/直播、跨境电商 | 华为生态、视频直播、跨境 | 华为品牌影响 |
| 龙岗坂雪岗/大运 | 坂雪岗 + 大运新城 + 天安数码城 | 智能制造、新能源、ICT、医疗 | 智能制造（工信部认证）、新能源、医疗器械 | 重点看研发/品控/海外业务 |
| 蛇口/华侨城 | 蛇口 + 太子湾 + 华侨城 + 欢乐海岸 | 文旅、文创、商业运营、跨境贸易 | 文旅集团、文创、商业地产 | 预算节奏不稳 |

### 7.4 行业采集优先级

| 优先级 | 行业 | 目标 | 推荐商区 |
| - | - | -: | - |
| 一 | 跨境电商 | 60 | 南山/前海/坂田/宝安 |
| 一 | 软件/SaaS/科技 | 50 | 南山/福田/龙华 |
| 一 | 金融科技 | 30 | 福田/前海 |
| 一 | 智能硬件 | 25 | 南山/龙华/龙岗 |
| 一 | 大型制造业 | 20 | 宝安/龙岗 |
| 一 | 文旅/会展/商业运营 | 15 | 蛇口/华侨城 |
| 二 | 企业服务（咨询/法律/HR） | 25 | 福田/南山 |
| 二 | 教育培训 | 15 | 福田/南山 |
| 二 | 医疗服务（不含公立） | 15 | 福田/南山 |
| 二 | 房地产/园区 | 15 | 福田/南山 |
| 二 | 供应链/物流 | 10 | 宝安/前海 |
| 三 | 生物医药/新能源汽车零部件/游戏/传媒广告 | 40 | — |

### 7.5 采集字段表

| 类型 | 字段 | 类型 | 来源 | 方法 |
| - | - | - | - | - |
| 必填 | 公司名称 | text | 企查查/官网 | 工商全称 |
| 必填 | 办公地址 | text | 高德/百度 | 标"XX 楼 XX 室" |
| 必填 | 所属商区 | enum | 地图定位 | 落入哪填哪 |
| 必填 | 一级行业 | enum | 企查查/官网 | 8 类预设 |
| 必填 | 细分行业 | text | 官网"关于我们" | 1–2 段 |
| 必填 | 企业规模 | enum | 企查查"参保人数" | S/M/L/XL 映射 |
| 必填 | 官网 | url | 搜索引擎 | |
| 必填 | 成立时间 | year | 企查查 | |
| 必填 | 注册地 | text | 企查查 | |
| 必填 | 法定代表人 | text | 企查查 | 仅记录 |
| 评分 | 已用数字化工具 | multi-enum | 招聘 JD/官网/新闻 | 企微/飞书/钉钉/Salesforce |
| 评分 | AI 接受度信号 | multi-enum | 招聘/新闻 | AI 招聘/项目/数字化转型 |
| 评分 | 腾讯生态使用 | multi-enum | 官网/公众号 | 企微/腾讯会议/腾讯文档/腾讯云 |
| 评分 | 业务增长信号 | multi-enum | 招聘/融资/新闻 | 扩招/融资/扩品类/出海 |
| 评分 | 采购信号 | multi-enum | 招聘/新闻 | 采购/IT 负责人/年度预算 |
| 选填 | 公开新闻/招聘 JD/公开年报/KP 身份/业务简介 | — | — | |
| **严禁** | 个人手机号/私人微信/身份证号/家庭住址/未公开薪资/内部经营数据 | — | — | 走合规商务渠道 |

### 7.6 7 个采集渠道

| 渠道 | 适用 | 优势 | 局限 |
| - | - | - | - |
| 企查查 | 全行业 | 数据齐全、已认证 | 部分企业参保为 0 |
| 高德/百度地图 | 园区企业 | 精准定位、楼栋清晰 | 缺规模/行业 |
| 官网 | 中大型 | 业务介绍、案例 | 需逐家访问 |
| 招聘网站 | 增长期 | 数字化/AI 信号 | 信号延迟 |
| 36 氪/虎嗅 | 科技/金融 | 融资/产品/团队 | 仅头部 |
| 微信公众号 | 跨境/品牌 | 业务动态、KP 发言 | 需关注公众号 |
| 公开演讲/活动 | 总部企业 | 高管身份、业务方向 | 信息碎片化 |

### 7.7 采集 SOP（单家 ~4 分钟）

| 步骤 | 动作 | 耗时 | 输出 |
| -: | - | -: | - |
| 1 | 企查查搜索 → 工商信息 | 30s | 公司名/地址/成立/规模 |
| 2 | 高德地图确认办公地址 | 30s | 楼栋 + 商区归属 |
| 3 | 访问官网 → 业务介绍 | 1min | 业务简介/细分行业 |
| 4 | BOSS 直聘 → JD 关键词 | 1min | AI/数字化/腾讯生态信号 |
| 5 | 微信搜一搜 → 最近新闻 | 30s | 业务增长信号 |
| 6 | 填入采集表 → 触发 AI 评分 | 30s | 评分 + 评分理由 |
| 7 | 抽样校验 | 1min | 调整/标注"待核实" |

**单人 8 小时可采集 ~100 家；首期 300 家需投入 3 人 × 1 天 或 1 人 × 3 天**

### 7.8 评分方式

| 触发 | 时机 |
| - | - |
| 单条 | 录入一条企业后自动调用评分 Agent |
| 批量 | 每日 23:00 跑批，更新全部企业评分 |
| 手动 | 销售点击"重新评分" |

**输出**：`workbuddy_score` / `scoring_breakdown (JSON)` / `score_reasoning` / `customer_level`（自动） / `recommended_scenarios` / `pain_points`

**校准**：
- W1 结束抽 30 家人工评分对比
- W2 周一校准评分 Agent 提示词
- 每月最后一周重新校准
- 每月复盘后基于转化数据反哺

### 7.9 采集时间表（W1）

| 天 | 工作 | 产出 |
| - | - | - |
| W1 周一上午 | 飞书建表 + 商区录入 | 6 张表 + 8 商区 |
| W1 周一下午 | 南山科技园 25 家 | 25 条 |
| W1 周二 | 南山 + 前海 + 后海 = 50 家 | 75 条累计 |
| W1 周三 | 福田 CBD = 40 家 | 115 条累计 |
| W1 周四 | 宝安 + 龙华 + 龙岗 = 80 家 | 195 条累计 |
| W1 周五 | 蛇口 + 补全 = 40 家 + 校验 | 300 条 + 评分 |
| W1 周五晚 | 评分 Agent 批量跑分 | 300 条含评分 |

### 7.10 采集质量验收

| 维度 | 标准 |
| - | - |
| 商区覆盖 | 8 个全部有企业，≥ 30 家/商区 |
| 行业覆盖 | 第一优先级 6 类全部有企业 |
| 企业总数 | ≥ 300 家 |
| 必填字段完整度 | ≥ 95% |
| 评分字段完整度 | ≥ 80% |
| WorkBuddy 评分完成 | 100% |
| 等级分布 | A 10–20% / B 30–40% / C 40–60% |
| 抽样人工校验 | 抽 30 家，销售认可率 ≥ 80% |

### 7.11 行业归类速查

| 一级行业 | 包含 |
| - | - |
| 跨境电商 | 亚马逊卖家、独立站、外贸 B2B、保税仓运营 |
| 软件/SaaS | 企业服务 SaaS、消费 SaaS、垂直行业软件 |
| 金融科技 | 支付、互联网保险、互联网理财、区块链应用 |
| 智能硬件 | 消费电子、IoT、机器人、AR/VR |
| 大型制造业 | 工信部认证、智能制造、上市制造业 |
| 文旅/会展/商业运营 | 文旅集团、会展公司、商业地产、IP 运营 |
| 企业服务 | 咨询、法律、HR、营销服务 |
| 教育培训 | K12、高教、职业培训、企业培训 |
| 医疗服务 | 民营医院、医疗器械、互联网医疗 |
| 房地产/园区 | 开发商、产业园、写字楼运营 |
| 供应链/物流 | 3PL、跨境物流、仓储 SaaS |

### 7.12 持续采集节奏

| 周期 | 量 | 来源 |
| - | -: | - |
| 每周 | 30–50 家 | 企查查 + 公开新闻 + 销售走访 |
| 每月 | 100–150 家 | + 招聘高峰 + 融资高峰 |
| 每季度 | 全量重核 | 行业/评分/阶段全量更新 |

---

## 八、腾讯地图 LBS 集成（融合 TENCENT_MAPS.md）

### 8.1 能力矩阵

| BFF 路由 | 对应能力 | 调用场景 |
| - | - | - |
| `GET /api/maps/search` | `/ws/place/v1/search` | 客户地址自动补全、商区内"找客户" |
| `GET /api/maps/geocode` | `/ws/geocoder/v1` | 中文地址 → 坐标（入库、地图标点） |
| `GET /api/maps/regeocode` | `/ws/geocoder/v1?location=` | 坐标 → 中文地址（点击地图反查） |
| `GET /api/maps/route` | `/ws/direction/v1/{mode}/` | 拜访路线（驾车/步行/骑行 + 实时路况） |
| `GET /api/maps/ip-loc` | `/ws/location/v1/ip` | "我当前在哪个城市"自动定位 |

### 8.2 架构（三层兜底）

```
浏览器 → /api/maps/* BFF (持 key) → 腾讯 LBS WebService
   ↑              │
   │              │ 失败
   │              ▼
   │      客户端 NEXT_PUBLIC_KEY → 腾讯 LBS
   │              │ 失败
   │              ▼
   └──── JSON ← mock-tmap.ts (内置 8 商区)
```

**为什么走 BFF？**
- ✅ key 不暴露在浏览器（防抓取、防盗用）
- ✅ 失败统一降级到 mock
- ✅ polyline 后端解压（前端零计算）
- ✅ 配额信息 `X-LIMIT` 响应头可按需接入正式监控

### 8.3 Key 申请（5 分钟）

1. 打开 <https://lbs.qq.com/dev/console/quick-register>
2. 注册/登录 → 创建应用（选"其他"）
3. 添加 Key → **勾选 WebServiceAPI**（不勾会 199 报错）
4. 分配配额（默认个人开发者 6000 次/日）
5. 复制 Key 到 `sales-os/.env.local`：
   ```
   TENCENT_MAP_KEY=OB4BZ-D4W3U-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   ```
6. 没配 key 也能用 → 自动降级 mock，演示不受影响

### 8.4 SDK 客户端 API（`src/lib/tencent-map.ts`）

```typescript
searchPOI({ keyword, city, location, radius, pageSize })
geocode(address, city)                    // 地址 → 坐标
regeocode(lat, lng)                       // 坐标 → 地址
planRoute({ from, to, waypoints, mode, policy })
ipLocate(ip?)                             // IP 定位
decodePolyline([lat,lng,dlat,dlng,...])   // 压缩 polyline 解压
isMockMode()                              // 是否 mock 模式
```

所有函数失败抛 `TMapError(code, message)`。

### 8.5 前端 Hook（`src/hooks/useTencentMap.ts`）

```typescript
const { data, loading, from, search } = usePOISearch()
const { data, loading, from, geocode } = useGeocode()
const { data, loading, from, plan } = useRoute()   // 自动 useEffect
const { data, loading, from, locate } = useIPLoc()
```

返回值带 `from: 'tencent-map' | 'mock'`，前端可显示数据源标签。

### 8.6 前端组件（`src/components/maps/`）

| 组件 | 用途 | 用法 |
| - | - | - |
| `<AddressSearch onPick={...} />` | 关键词搜索 POI，结果列表点击 | 顶部搜索框 |
| `<RouteBadge from to mode />` | 路线距离/时长/红绿灯/过路费 | 客户详情侧栏 |
| `<LocationPin onLocate={...} />` | 启动 IP 定位，定位后回调 | 地图顶部 |
| `<CoordTag address coords />` | 地址 → 坐标显示，坐标可复制 | 客户地址卡片 |

### 8.7 数据源标签规则

| 标签 | 含义 |
| - | - |
| `腾讯地图` / `腾讯实时` / `腾讯实时路线` | 真实 API |
| `离线 Mock` / `离线估算` / `默认` | mock 降级 |

### 8.8 polyline 解压算法

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

### 8.9 配额与限制

| 接口 | 个人开发者日配额 | 限制 |
| - | -: | - |
| 搜索 | 6000 | 半径 10–1000m，每页 ≤ 20 |
| 地址解析 | 6000 | — |
| 逆地址解析 | 6000 | — |
| 路线 | 6000 | 步行 ≤ 300km，骑行 ≤ 500km |
| IP 定位 | 6000 | — |

### 8.10 错误码

| status | 含义 | 处理 |
| -: | - | - |
| 0 | 正常 | — |
| 199 | key 未启用 WebServiceAPI | 控制台启用 |
| 310 | 请求参数错误 | 检查 query string |
| 311 | key 格式错误 | 重新申请 key |
| 401 | 配额超限 | 等次日 0 点重置 |

非 0 状态 → BFF 自动降级到 mock，前端无感知。

---

## 九、部署指南（融合 DEPLOY.md）

### 9.1 方案 A：Vercel 部署（推荐，5 分钟）

**前置**：GitHub/GitLab/Bitbucket 账号 + Vercel 账号

**步骤**：
1. 推送代码到 Git 仓库
2. Vercel 一键导入 → Framework Preset: **Next.js**（自动识别） → Deploy
3. （可选）配置腾讯地图 Key：Project Settings → Environment Variables → `TENCENT_MAP_KEY=OB4BZ-...`
4. 访问 `https://workbuddy-geosales-xxx.vercel.app`（hkg1 + sin1 节点加速）

**用 CLI 部署**：
```bash
npm i                              # 安装项目依赖
npx --yes vercel login             # 登录（会打开浏览器）
npx --yes vercel --prod            # 部署到生产
npx --yes vercel env add TENCENT_MAP_KEY production
```

### 9.2 方案 B：CloudStudio 静态部署（无 BFF）

```bash
npx next build
npx next export                    # 或用 scripts/manual-export.mjs
# 部署 out/ 目录到 CloudStudio
```

**注意**：
- `/api/maps/*` 路径会 404 → 前端自动 fallback mock
- 搜索/路线/定位显示"离线 Mock"标签
- 真实数据需要配 `TENCENT_MAP_KEY`

### 9.3 方案 C：自建服务器

```bash
npx next start -p 3000
# 用 nginx / caddy 反向代理
# 配置 .env.local:
TENCENT_MAP_KEY=OB4BZ-...
```

### 9.4 故障排查

| 现象 | 原因 | 解决 |
| - | - | - |
| 搜索无结果 | key 未启用 WebServiceAPI | lbs.qq.com 控制台勾选 |
| 路线一直 mock | key 无效或配额用尽 | 看浏览器 Network 响应 status |
| 部署 502 | vercel.json framework 不对 | 删掉 vercel.json 让它自动检测 |
| Build 失败 | 端口占用 | `lsof -i:3000` 杀掉 |

### 9.5 本地开发

```bash
cd sales-os
npm install
npx next dev              # http://localhost:3000
npx next build            # 生产构建
npx next start -p 3000    # 启动 SSR
node scripts/manual-export.mjs   # 手动拼装静态站
```

---

## 十、已踩坑清单（融合 MODULE_MAP §12）

> 每踩一个坑都登记一次，下次绝不再踩。

### 10.1 静态导出 + `redirect()` → 根路径空白
- **现象**：访问根路径时 layout 正常但 `<main>` 区域空白
- **原因**：`src/app/page.tsx` 用了 Next.js 服务端 `redirect('/dashboard')`；但 `output: 'export'` 静态导出**不支持**服务端 redirect
- **修复**：改成 `'use client'` + `useRouter().replace('/dashboard')` + 友好 loading 提示
- **教训**：任何依赖 Node runtime 的特性（redirect/headers/cookies）在静态导出模式下都不工作

### 10.2 brace expansion 没展开 → 残留空目录
- **现象**：`src/components/{ui,layout,dashboard,...}/` 是个真实存在的目录（名字带大括号，里面是空的）
- **原因**：bash 在某些场景下 brace expansion 不会自动展开（嵌套引号、不同 shell）
- **修复**：手动 `rm -rf '{...}'` 删掉，然后 `mkdir dashboard map ...` 一个个建
- **教训**：建多目录一律逐个写，不要赌 brace expansion

### 10.3 `next export` 被 CloudStudio safe-delete 拦截
- **现象**：`next build` 跑 export 阶段时，CloudStudio 沙箱的 safe-delete 守卫会删掉 `out/` 里的内容
- **修复**：写 `scripts/manual-export.mjs`，手动复制 `.next/server/app/*.html` → `out/`，**用 append 模式**不删旧文件

### 10.4 maplibre 强类型 GeoJSON 报错
- **现象**：TS 编译报 `Geometry` 类型不匹配
- **修复**：用 `as any` 绕过 maplibre 的强类型 GeoJSON 接口

### 10.5 动态路由 `[id]/page.tsx` 静态化时 404
- **现象**：`next export` 完成后 `/company/[id]` 全部 404
- **原因**：静态导出必须知道要导出的所有动态参数
- **修复**：在 `company/[id]/page.tsx` 加 `generateStaticParams()` 列出全部 40 个 ID

### 10.6 maplibre 必须 client-side
- **现象**：服务端 import maplibre 报 `window is not defined`
- **修复**：用 `next/dynamic` 包裹，`ssr: false`

### 10.7 路径带空格要双引号
- **现象**：`cd /Users/.../比赛 - 销售系统/sales-os` 报 `cd:1: too many arguments`
- **修复**：用单引号包整个路径 `'...'`

### 10.8 CloudStudio 静态托管不支持 BFF
- **现象**：静态部署后 `/api/maps/*` 全部 404
- **修复**：`useTencentMap` hook 加客户端兜底（→ `NEXT_PUBLIC_KEY` → mock）

### 10.9 SearchParams 同步异步签名
- **现象**：Next.js 14+ 中 `useSearchParams` 在不同上下文签名不一致
- **修复**：客户端 hook 用 `useCallback` 封装异步逻辑

### 10.10 删目录的 shell 转义陷阱
- **现象**：`rm -rf 'sales-os/{docs,prisma,public'` 实际把大括号当字面量
- **修复**：必须用 `--` 终止选项 + 显式列出真实目录

### 10.11 内部 brace 误创建空目录
- **现象**：`src/components/{ui,layout,dashboard,map,company,companies,followups,funnel,review,shared}/` 名字带大括号实际为单目录
- **修复**：手动 `rm -rf 'src/components/{ui,layout,dashboard,map,company,companies,followups,funnel,review,shared}'`（V4.0 已清理）

---

## 十一、文件结构与行数红线

### 11.1 行数红线

> **任何 `.ts` / `.tsx` 文件不超过 600 行**（含 import + 注释 + 空行）。超过立即拆。

### 11.2 当前文件大小（V3 实测，V4 待重新统计）

| 文件 | 行数 | 备注 |
| - | -: | - |
| `src/components/ui/mapcn-marker-popup.tsx` | 468 | mapcn 声明式 marker popup / route / controls |
| `src/components/map/SalesMap.tsx` | 385 | 主地图（marker popup + 腾讯路线） |
| `src/hooks/useTencentMap.ts` | 247 | 三层兜底 hook |
| `src/lib/data/companies.ts` | 194 | 客户 mock + 查询 |
| `src/app/companies/page.tsx` | 178 | P3 列表 |
| `src/types/index.ts` | 145 | 全量业务类型 |
| `src/components/dashboard/RouteMiniMap.tsx` | 141 | 工作台路线小地图 |
| `src/lib/tencent-map.ts` | 129 | 5 API + polyline 解压 |
| `src/types/maps.ts` | 114 | 腾讯 API 类型 |
| `src/lib/data/districts.ts` | 112 | 商区 mock |
| `src/components/dashboard/VisitCard.tsx` | 112 | 拜访卡 |
| `src/lib/data/mock-tmap.ts` | 105 | 离线降级 |
| `src/lib/data/company-verification.ts` | 97 | 企查查主体核验 |
| `src/lib/constants.ts` | 88 | 颜色/阶段/阈值 |
| `src/components/maps/AddressSearch.tsx` | 86 | 搜索 |
| `src/components/maps/RouteBadge.tsx` | 85 | 路线徽章 |
| 其他 | < 80 | — |

**总行数**：~4,900 行 TS/TSX | **最大单文件**：468 行 | **平均单文件**：~70 行

### 11.3 各文件建议行数目标

| 类型 | 目标 | 备注 |
| - | -: | - |
| 原子 UI 组件 | ≤ 150 | Button/Card/Badge/Input/Tabs/Progress/Dialog/Avatar/Mapcn |
| 页面入口 page.tsx | ≤ 80 | 仅组合子组件 |
| 业务子组件 | ≤ 200 | 单个职责 |
| 数据层 | ≤ 250 | mock + 查询函数 |
| BFF 路由 | ≤ 80 | 单一能力 + 错误处理 |
| Hook | ≤ 250 | 三层兜底允许稍大 |
| 类型定义 | ≤ 200 | 业务类型 + 第三方类型 |
| 常量 | ≤ 100 | 纯数据 |

---

## 十二、性能与全栈守则

### 12.1 Web 性能守则（Core Web Vitals 导向）

| 指标 | 目标 | 措施 |
| - | - | - |
| LCP（最大内容绘制） | < 2.5s | maplibre 用 `next/dynamic` 懒加载；关键字体用 `next/font` |
| INP（交互到下一帧） | < 200ms | 客户端组件最小化；'use client' 只标在必要的叶子组件 |
| CLS（布局偏移） | < 0.1 | 占位骨架屏；图片显式宽高；字体 swap |
| TBT（总阻塞时间） | < 200ms | 拆分大组件；maplibre 不打包进首屏 |
| Bundle Size | First Load < 200KB | `optimizePackageImports: ['lucide-react']` 已开 |

**已实施**：
- ✅ `next/dynamic` + `ssr: false` 包裹 maplibre
- ✅ `optimizePackageImports: ['lucide-react']`
- ✅ `transpilePackages: ['maplibre-gl']`
- ✅ RSC 优先，'use client' 只在必要处
- ✅ 地图三层兜底（BFF → 直调 → mock），失败不阻塞渲染

**应持续关注**：
- ⚠️ mapcn-marker-popup.tsx 468 行 → 关注是否需要拆 `<MapRoute>` `<MapControls>` 到独立文件
- ⚠️ SalesMap.tsx 385 行 → 如引入富弹窗内容，应拆出 `<CompanyPopupCard>` 子组件
- ⚠️ 数据 mock 文件合并后可考虑加 prefetch

### 12.2 全栈架构守则

| 守则 | 说明 |
| - | - |
| 单文件 ≤ 600 行 | 超了立即拆 |
| 组件纯函数化 | props 进，JSX 出，不在内部发请求（mock 数据走 import） |
| 类型完备 | 任何函数都要有入参 / 返回类型 |
| 零硬编码颜色 | 全走 `tailwind.config.ts` + CSS 变量 |
| RSC 优先 | 能不 'use client' 就不加 |
| 图标统一 | 全部 `lucide-react`，不用 emoji |
| 注释策略 | 文件顶部 1 行说明职责；复杂函数 1 行说明意图；行数目标写在文件头 |
| 叶子模块零依赖 | types / constants / utils 不依赖业务 |
| 禁止反向依赖 | 数据层不依赖组件层；组件层不依赖路由层 |
| BFF 保护 key | 服务端 key 不暴露；客户端兜底走 NEXT_PUBLIC_KEY |
| 失败统一降级 | mock 是最后防线，前端不感知失败 |
| polyline 后端解压 | 前端零计算 |

### 12.3 安全守则

| 项 | 要求 |
| - | - |
| SQL 注入 | 全部 value binding，不用字符串拼接 |
| RCE | 避免 shell 调用；如必须用，沙箱化 |
| AuthZ | 鉴权 + 资源归属校验（MVP 阶段单机版豁免） |
| XSS | React 默认转义；不直接渲染 HTML |
| SSRF | BFF 出口限制白名单；拒绝 9/10/11/21/30.* 私网 |
| 反序列化 | 不信任外部 JSON；schema 校验 |
| 密钥 | 仅 `.env.local` / `.env`；不进 git；不进前端 bundle |
| 合规字段 | 严禁手机号/身份证/家庭住址；DB trigger + 应用层双重拦截 |

### 12.4 注释与文件头规范

每个源码文件头部必须包含：

```typescript
// {一句话职责}
// 行数目标：≤{N}
```

复杂函数（> 20 行）函数体上方必须有 1 行说明意图。  
组件 props 类型必须有 JSDoc 风格注释。  
BFF 路由必须注释"force-dynamic"原因（如有）。

---

## 十三、合规与边界

### 13.1 数据采集合规

| 允许 | 禁止 |
| - | - |
| 工商公开信息（企查查/官网） | 个人手机号 |
| 官网/招聘/公开新闻 | 私人微信 |
| 公开融资/活动信息 | 身份证号 |
| 销售本人在销售系统录入的备注 | 家庭住址 |
| 企业规模/行业/地址 | 未公开薪资 |
| | 内部经营数据 |

### 13.2 范围蔓延边界

| 不在本次交付 | 何时启动 |
| - | - |
| 正式前端（React/Vue 重构） | W9+ |
| 移动端 | W11+ |
| 团队版（多销售共享战报） | W6+ |
| 自动化跟进提醒 | W5+ |
| 语音录入 | W11+ |
| 客户自动挖掘 | W11+ |
| 全国城市接入 | W7+ |

### 13.3 已知限制

| 现状 | 限制 |
| - | - |
| 销售 1 人自用 | 单人单机，不支持多人协作 |
| localStorage 持久化 | 浏览器清理即丢，生产需切换数据库 |
| Mock 40 家企业 | 真实数据需等 8 商区采集完成 |
| 地图为 OSM 底图 + 腾讯 LBS 增值 | 部分高级能力（卫星图/3D）暂不支持 |
| 无登录鉴权 | MVP 阶段豁免，生产必须加 |
| AI 全部 mock | 真实 LLM 接入需 8 月后 |

### 13.4 后续演进路线（不在本期范围）

- [ ] 接入 WorkBuddy 真实 Agent API（替换 mock）
- [ ] 接入磐石 MCP（需要 BFF，单独服务）
- [ ] 鉴权（OAuth / 企业微信扫码）
- [ ] 多租户
- [ ] 移动端 PWA
- [ ] 替换 SQLite → PostgreSQL
- [ ] 单元测试 + Playwright E2E

---

## 附录 A：术语表

| 术语 | 含义 |
| - | - |
| WorkBuddy | 腾讯云 AI 办公产品（本系统售卖对象） |
| GeoSales OS | 本系统名（地理位置驱动的销售操作系统） |
| KP | Key Person，关键决策人 / 关键联系人 |
| POC | Proof of Concept，概念验证（小范围试点） |
| BFF | Backend For Frontend，前端专用后端（这里指 /api/maps/*） |
| RSC | React Server Component，服务端组件 |
| MVP | Minimum Viable Product，最小可行产品 |
| W1/W2/... | Week 1 / Week 2 |
| 销售阶段 | 11 阶段：未触达 / 已触达 / 有效回复 / 需求沟通 / 产品演示 / POC 试点 / 商务报价 / 合同推进 / 已成交 / 输单 / 暂缓 |
| 客户等级 | A（80+）/ B（60–79）/ C（<60），按 workbuddy_score 自动 |
| 评分维度 | 8 维度：知识工作密度 / 组织规模 / 多部门复杂度 / AI 接受度 / 腾讯生态 / 增长压力 / 数据安全 / 采购可能 |

## 附录 B：变更日志

| 版本 | 日期 | 主要变更 |
| - | - | - |
| V1.0 | 2026-07-01 | 5 份规划文档完成（01–05 + overview） |
| V2.0 | 2026-07-03 | Next.js + TS + Tailwind 项目搭建，60 个源文件 |
| V3.0 | 2026-07-03 | 腾讯地图 LBS 5 BFF + 4 组件集成 |
| V3.3 | 2026-07-03 | 销售地图数据核验与工作台联动 |
| V3.4 | 2026-07-03 | 代码精简（删除未用 Radix、vercel CLI；升级 Next 14.2.35） |
| **V4.0** | **2026-07-03** | **10 份文档整合为 MASTER.md + 创建 agent.md（Codex 维护守则）** |

---

> 最后更新：2026-07-03 · 整合完成
>
> 维护入口：见 `agent.md`（Codex / Agent 必读）
