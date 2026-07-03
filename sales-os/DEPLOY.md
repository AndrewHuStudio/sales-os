# 部署指南

## 方案 A：Vercel 部署（推荐，5 分钟）

### 前置
- GitHub/GitLab/Bitbucket 账号
- Vercel 账号（GitHub 一键登录）

### 步骤

1. **推送代码到 Git 仓库**
```bash
cd sales-os
git init
git add .
git commit -m "feat: WorkBuddy GeoSales OS"
git remote add origin https://github.com/<你的用户名>/workbuddy-geosales.git
git push -u origin main
```

2. **Vercel 一键导入**
- 打开 <https://vercel.com/new>
- 选择 `workbuddy-geosales` 仓库
- Framework Preset: **Next.js**（自动识别）
- 点击 **Deploy**

3. **（可选）配置腾讯地图 Key**
- 部署完成 → Project Settings → Environment Variables
- 添加：`TENCENT_MAP_KEY=OB4BZ-...`
- 不配也能用，自动降级 mock

4. **访问**
- Vercel 会分配 `https://workbuddy-geosales-xxx.vercel.app`
- 全球 CDN 加速（hkg1 香港 + sin1 新加坡节点）

### 用 CLI 部署（更可控）

```bash
# 安装项目依赖
npm i

# 登录（会打开浏览器）
npx --yes vercel login

# 部署到生产
npx --yes vercel --prod

# 添加环境变量
npx --yes vercel env add TENCENT_MAP_KEY production
# 粘贴你的 key
```

## 方案 B：CloudStudio 静态部署（无 BFF）

如果只想快速预览 UI，BFF 路由会自动降级为 mock。

```bash
# 本地构建静态站点
npx next build
npx next export  # 或用 scripts/manual-export.mjs

# 部署 out/ 目录到 CloudStudio
```

注意事项：
- `/api/maps/*` 路径会 404，前端自动 fallback mock
- 搜索/路线/定位会显示"离线 Mock"标签
- 真实数据需要配 TENCENT_MAP_KEY

## 方案 C：自建服务器

```bash
# 启动 SSR 服务
npx next start -p 3000

# 用 nginx / caddy 反向代理
# 配置 .env.local:
TENCENT_MAP_KEY=OB4BZ-...
```

## 故障排查

| 现象 | 原因 | 解决 |
|---|---|---|
| 搜索无结果 | key 未启用 WebServiceAPI | lbs.qq.com 控制台勾选 |
| 路线一直 mock | key 无效或配额用尽 | 看浏览器 Network 响应 status |
| 部署 502 | vercel.json framework 不对 | 删掉 vercel.json 让它自动检测 |
| Build 失败 | 端口占用 | `lsof -i:3000` 杀掉 |
