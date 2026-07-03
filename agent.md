# AGENT 维护守则 · WorkBuddy GeoSales OS

> 本文件是 **Codex / 任何 AI Agent 进入本项目编程前必读**。
>
> 目的：保证所有 Agent 在本仓库内编写的代码、文档、配置 **风格统一、体量受控、注释充分、可被后任维护者（含人 + AI）零成本接手**。
>
> 与 `00-MASTER.md` 的关系：`00-MASTER.md` 是项目全量信息源（产品/架构/数据/AI/排期/部署），本文件是 **协作契约与硬性红线**。两文件必须同时存在；改动业务请改 MASTER，改协作规则请改本文件。
>
> 最后更新：2026-07-03

---

## 〇、5 秒速记（每个 Agent 进项目先看）

1. **任何 `.ts` / `.tsx` 文件 ≤ 600 行**（含 import + 注释 + 空行）。超了拆。
2. **文件头 2 行注释**：第一行 = 一句话职责，第二行 = `// 行数目标：≤N`。
3. **遵循既有分层**：`types / constants / utils → lib/data → components → app`，禁止反向依赖。
4. **不要碰以下文件除非明确要求**：`next.config.mjs` / `tsconfig.json` / `tailwind.config.ts` / `package.json` / `vercel.json` / `prisma/`。
5. **业务上下文都在 `00-MASTER.md`**——遇到拿不准的字段、阶段、Agent 行为，先查那里。

---

## 一、硬性红线（违反 = PR 拒绝）

### 1.1 文件体量红线

| 类型 | 行数上限 | 触发动作 |
| - | -: | - |
| 原子 UI 组件 | 150 | 超 → 拆 props / 拆子组件 |
| 页面入口 `page.tsx` | 80 | 超 → 抽组合组件 |
| 业务子组件 | 200 | 超 → 拆容器/展示分离 |
| 数据层 (`lib/data/*`) | 250 | 超 → 按主题拆文件 |
| BFF 路由 (`app/api/*/route.ts`) | 80 | 超 → 拆工具函数 + 路由壳 |
| Hook | 250 | 超 → 拆内部分函数 |
| 类型定义 (`types/*`) | 200 | 超 → 按业务域拆 |
| 通用工具 (`lib/utils.ts`) | 120 | 超 → 按职责拆 |
| **任何文件** | **600** | **硬上限 → 必须拆** |

> 例外：`src/components/ui/mapcn-marker-popup.tsx` 来自第三方抽象层（468 行），已接近上限。**禁止在原文件上叠加新功能**，需新能力时另开文件再组合。

### 1.2 注释红线

| 文件类型 | 必须包含 | 禁止 |
| - | - | - |
| 任何 `.ts` / `.tsx` | 文件头 2 行注释（职责 + 行数目标） | `// TODO` / `// FIXME` / `// console.log` / 调试断点 |
| 复杂函数 (> 20 行) | 函数体上方 1 行说明意图 | 长段无意义注释 / emoji 装饰 |
| 组件 props | TS 类型 + 关键 prop 的 JSDoc 注释 | 任何 `any`（除非有 `// 已知问题：xxx` 注释） |
| BFF 路由 | 注释 `force-dynamic` / `force-static` 原因 | 静默 fetch |
| 数据层 | 函数上方 1 行说明输入输出契约 | 直接读外部 state / 副作用 |

### 1.3 依赖红线

| 场景 | 规则 |
| - | - |
| 装新依赖 | 必须先确认未被 4 大类职责替代（UI 库 / 工具函数 / 数据层 / 类型层） |
| 删除依赖 | 必须先在 `src/**` 全文搜索无引用 |
| 升级大版本 | 必须在 `00-MASTER.md` 附录 B 登记 |
| 引入运行时 polyfill | 必须注释原因（Node 18+ 不再需要，引入 = 多余包） |

### 1.4 安全红线

| 项 | 规则 |
| - | - |
| 密钥 | 仅 `.env.local` / `.env`；不进 git；不进前端 bundle |
| BFF 出口 | 拒绝 9/10/11/21/30.* 私网；其它白名单 |
| SQL | value binding；禁止字符串拼 |
| XSS | React 默认转义；不直接 `dangerouslySetInnerHTML` |
| 合规字段 | 严禁手机号/身份证/家庭住址；DB trigger + 应用层双重拦截 |

---

## 二、分层契约（禁止反向依赖）

```
URL
 ↓
app/[route]/page.tsx           (RSC, 默认不标 'use client')
 ↓ 只能向下 import
components/[scope]/*.tsx       (按需 'use client')
 ↓
lib/data/*.ts                  (纯函数，无 React)
 ↓
lib/utils.ts + lib/constants.ts + types/*.ts   (叶子)
```

| 规则 | 说明 |
| - | - |
| 叶子模块 | types / constants / utils 不依赖任何业务 |
| 数据层 | lib/data 只依赖叶子 |
| 组件层 | 只依赖数据层 + 叶子 + 第三方 |
| 路由层 | 只组合组件 + 调 BFF |
| **禁止** | types.ts `import` 业务代码；组件 `import` 路由；数据 `import` 组件 |

---

## 三、文件头注释模板（所有源码必带）

```typescript
// {一句话职责：用动词开头，说明这个文件"做什么"而不是"是什么"}
// 行数目标：≤{N}
```

**示例**：
```typescript
// 工作台主页 - 组合 5 个子组件并触发今日路线
// 行数目标：≤80
'use client';
import { ... }
...
```

**反例**（会被拒绝）：
```typescript
// 这里写了一个组件
import ...
```

---

## 四、常见任务的操作步骤

### 4.1 新增页面

1. 在 `src/app/[route]/page.tsx` 创建入口，文件 ≤ 80 行
2. 在 `src/components/[scope]/` 创建对应子组件，单文件 ≤ 200 行
3. 若需数据 → `src/lib/data/[name].ts` 创建 mock + 查询函数
4. 若需类型 → `src/types/index.ts` 添加（不超 200 行时）；否则拆 `src/types/[name].ts`
5. 若涉及图标 → `lucide-react`
6. 完成后 `npx tsc --noEmit` 通过

### 4.2 新增 BFF 路由

1. 在 `src/app/api/[name]/route.ts` 创建，文件 ≤ 80 行
2. 必须 `export const dynamic = 'force-dynamic'`
3. 错误处理统一抛 `TMapError` / Next.js `Response`
4. 外部调用走 `src/lib/tencent-map.ts` 客户端
5. 失败必须有 fallback（前端三层兜底 + 服务端 mock）

### 4.3 新增 mock 数据

1. 命名遵循 `src/lib/data/[domain].ts`
2. 导出 `MOCK_xxx` 常量 + 命名查询函数（`getXxx`, `listXxx`）
3. 类型来自 `src/types/index.ts`，禁止内联类型
4. 单文件 ≤ 250 行；超了按子域拆

### 4.4 修改 AI Agent 提示词

1. Agent 提示词在 `00-MASTER.md` 第五章维护（**不在代码里硬编码**）
2. 实际调用时通过 `src/lib/agents/[name].ts` 读取
3. 改动提示词 → 同步更新 MASTER 第 5 章对应小节

### 4.5 性能改动

1. 必须先看 §12.1 性能守则（在 MASTER.md）
2. 加 `next/dynamic` 时必须配 `ssr: false` 原因注释
3. 改动 `next.config.mjs` 必须解释每个配置项
4. bundle 增量 < 50KB 才接受

---

## 五、Codex 专属指引

### 5.1 Codex 启动检查清单

每次 Codex 接到任务后，先回答这 4 个问题再动手：

1. **目标文件是哪几个？**（必须明确列出来）
2. **目标文件当前行数？**（决定是改还是新建）
3. **会触发哪些红线？**（§1 红线表对照）
4. **改完如何验证？**（`npx tsc --noEmit` / `npx next build`）

### 5.2 Codex 禁止行为

- ❌ 把任意文件改成 > 600 行
- ❌ 在 `package.json` 装新依赖不解释
- ❌ 把业务字段散落到 `MASTER.md` 之外
- ❌ 修改 `prisma/schema.prisma` 不通知（schema 改动要更新 MASTER §4）
- ❌ 删除 V3/V4 已踩坑条目（MASTER §10 踩坑清单只增不改）
- ❌ 把 `'use client'` 加到 `layout.tsx` / `page.tsx` 而不解释 RSC 失效原因

### 5.3 Codex 推荐行为

- ✅ 改动前先 `git status` / `git diff` 评估
- ✅ 改完用 `wc -l src/path/file.tsx` 自查行数
- ✅ 涉及多文件时一次提交，不要分多 PR
- ✅ 提交信息格式：`type(scope): description`（如 `feat(map): 新增路线热力图层`）
- ✅ 任何架构级别变更同步更新 `00-MASTER.md` 附录 B

### 5.4 Codex 完成判定

任务"完成"必须同时满足：

| 检查 | 通过条件 |
| - | - |
| 行数 | 所有改动文件 ≤ 600 行 |
| 类型 | `npx tsc --noEmit` 0 错 |
| 构建 | `npx next build` 成功 |
| 注释 | 改动文件有头注释 + 复杂函数注释 |
| 业务 | 业务字段在 `00-MASTER.md` 已对齐 |
| 红线 | §1 红线表 0 触发 |
| 文档 | 若改了 §4 数据表 / §5 Agent / §8 LBS，MASTER 同步更新 |

---

## 六、文件清单（Agent 必知）

### 6.1 高频编辑文件（Agent 主要改动这里）

```
src/app/[route]/page.tsx         # 页面入口
src/components/[scope]/*.tsx     # 业务子组件
src/lib/data/*.ts                # mock 数据 + 查询
src/lib/utils.ts                 # 通用工具（cn, formatDate）
src/lib/constants.ts             # 颜色/阈值/枚举值
src/types/index.ts               # 业务类型
src/hooks/*.ts                   # 自定义 hooks
```

### 6.2 低频编辑文件（改前必看 00-MASTER.md）

```
prisma/schema.prisma             # 6 张表
next.config.mjs                  # 构建配置
tailwind.config.ts               # 主题/色彩
tsconfig.json                    # 严格模式
package.json                     # 依赖（删装前必查 4 大类）
vercel.json                      # 部署
```

### 6.3 只读文件（Agent 禁止编辑）

```
node_modules/                    # 依赖
.next*/                          # 构建产物
out/                             # 静态导出
00-MASTER.md                     # 只可追加，不可重写已审核章节
```

> 特别说明：`00-MASTER.md` 第〇~四章为产品/数据/AI 核心定义，**修改前必须和销售本人对齐**；附录 B 可直接追加。

---

## 七、命名约定

| 类型 | 约定 | 示例 |
| - | - | - |
| 文件名（组件） | PascalCase | `VisitCard.tsx` |
| 文件名（其它 TS） | kebab-case | `tencent-map.ts` |
| 组件名 | PascalCase | `TodayRouteHeader` |
| 函数 / 变量 | camelCase | `planRoute`, `fromLocation` |
| 类型 / 接口 | PascalCase（无 I 前缀） | `TodayRoute`, `RouteData` |
| 常量 | UPPER_SNAKE | `TODAY_ROUTE`, `SZ_CENTER` |
| 数据库字段 | snake_case | `workbuddy_score`, `customer_level` |
| 数据库表 | 复数下划线 | `business_districts`, `sales_scripts` |
| URL 路由 | kebab-case | `/api/maps/ip-loc` |
| CSS 类（Tailwind） | kebab-case | `gradient-hero`, `animate-fade-in` |
| BFF 路径段 | 单数 + 短横线 | `/api/maps/route/route.ts` |

---

## 八、错误处理与日志

| 场景 | 规范 |
| - | - |
| BFF 路由失败 | 抛 `TMapError(code, message)` → Next.js `Response` JSON |
| 客户端调用失败 | 走三层兜底：BFF → NEXT_PUBLIC_KEY → mock；`useTencentMap` hook 自动处理 |
| 静默失败 | 仅限"非关键 UX"（如 Toast 不出现、Badge 标签不显示）；禁止静默吞错 |
| 错误日志 | 必须在 `00-MASTER.md` §10 登记（仅增不改） |
| console.log | **生产代码禁止**。仅调试时临时插入，提交前必须删 |

---

## 九、Git 提交规范

### 9.1 分支

| 类型 | 命名 | 来源 |
| - | - | - |
| 功能 | `feat/{short-name}` | main |
| 修复 | `fix/{short-name}` | main |
| 文档 | `docs/{short-name}` | main |
| 重构 | `refactor/{short-name}` | main |
| 性能 | `perf/{short-name}` | main |
| AI Agent 自动化 | `agent/{short-name}` | main |

### 9.2 Commit 信息

```
type(scope): 一句话描述（不超过 50 字）

- 详细变更 1
- 详细变更 2

Refs: MASTER.md §X.Y
```

**示例**：
```
feat(map): 接入腾讯 LBS 三层兜底

- 新增 /api/maps/* 5 个 BFF
- 新增 useTencentMap hook（3 层兜底）
- 新增 4 个开箱即用组件

Refs: MASTER.md §8
```

### 9.3 提交粒度

- ✅ 一个 commit 只做一件事
- ❌ 一次提交混杂"feat + fix + refactor + docs"
- ❌ 大型变更（> 10 文件）一次提交

---

## 十、版本号规则

格式：`V{major}.{minor}.{patch}`

| 类型 | 触发 | 例子 |
| - | - | - |
| major | 架构级别变更（如 RSC → CSR 切换） | V4.0 |
| minor | 新增模块 / 新增页面 / 新增 BFF | V3.0 → V3.1 |
| patch | Bug 修复 / 性能优化 / 注释补充 | V3.3 → V3.4 |

每次版本变更 → 在 `00-MASTER.md` 附录 B 追加一行。

---

## 十一、Agent 协作检查清单（交付前自查）

- [ ] 改动文件 ≤ 600 行（用 `wc -l` 自查）
- [ ] 文件头 2 行注释齐全
- [ ] 复杂函数都有意图注释
- [ ] 没有 `any`（除非有原因注释）
- [ ] 没有 `console.log` / `debugger` / `TODO` / `FIXME`
- [ ] 没有引入新依赖（除非已解释）
- [ ] 没有改 `prisma/` / `next.config.mjs` / `tsconfig.json` / `package.json`（除非明确要求）
- [ ] `npx tsc --noEmit` 0 错
- [ ] `npx next build` 成功
- [ ] 业务字段在 `00-MASTER.md` 已对齐
- [ ] commit 信息符合 §9.2 格式
- [ ] 没有删除 `MASTER.md` §10 已踩坑条目

---

## 十二、例外处理

如果某个任务必须违反红线，Agent 必须：

1. 在交付前 **明确说明**违反哪条红线
2. 给出 **为什么必须违反** 的理由
3. 给出 **后续如何收敛** 的计划
4. 在 `00-MASTER.md` 附录 B 登记

不允许默默违反。

---

## 附录 A：本文件自身的维护

| 变更 | 谁来改 |
| - | - |
| §0–§4 硬性规则 | 销售本人 / 项目负责人 |
| §5 Codex 专属 | Codex / Agent 团队 |
| §6 文件清单 | 架构调整时同步 |
| §7–§10 命名/规范 | 任何 Agent 都可提议；最终由销售拍板 |
| §11 自查清单 | 任何 Agent 都可优化 |
| 附录 | 任何 Agent 都可追加 |

> 改本文件 = 改协作契约，必须在 commit 信息里写明 `docs(agent): 改动xxx条款`。

---

> 本文件是项目级"宪法"。Agent / Codex 把它当作入项前必读；维护者把它当作交付门槛。
