# sales-os

销售系统采用 `Next.js` 前端 + `Python FastAPI` 后端 + `SQLite` 本地数据库。

## 本地启动

```bash
cd sales-os
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
npm install
```

分别启动后端和前端：

```bash
npm run dev:api
npm run dev:web
```

- 前端默认地址：`http://localhost:3000`
- 后端默认地址：`http://127.0.0.1:8000`
- 后端健康检查：`http://127.0.0.1:8000/health`
- API 文档：`http://127.0.0.1:8000/docs`

## 数据说明

- 后端首次启动会自动创建 `backend/data/sales_os.db`。
- 初始客户数据会从现有 `sales-os/src/lib/data/companies.ts` 安全解析后写入 SQLite。
- 前端优先读取 Python 后端；如果后端未启动，只读页面会自动回退到本地静态数据。

## 主要接口

- `GET /api/companies`
- `GET /api/companies/{company_id}`
- `GET /api/districts`
- `GET /api/followups`
- `POST /api/followups`
- `GET /api/funnel`
- `GET /api/review`
- `GET /api/today-route`
- `GET /api/bootstrap`

## 后续部署方向

当前 SQLite 适合比赛原型和单机部署。正式部署时可保留 FastAPI 接口层，将数据库替换为 PostgreSQL。
