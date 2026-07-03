from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import connect, decode_json, encode_json
from .seed import init_db

app = FastAPI(title="Sales OS API", version="0.1.0")

origins = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)


class FollowupCreate(BaseModel):
    companyId: str = Field(min_length=1, max_length=80)
    contactId: str | None = Field(default=None, max_length=80)
    type: Literal["拜访", "电话", "微信", "邮件", "会议", "Demo", "其他"] = "拜访"
    direction: Literal["outbound", "inbound"] = "outbound"
    happenedAt: str | None = None
    summary: str = Field(min_length=1, max_length=1000)
    nextStep: str | None = Field(default=None, max_length=500)
    nextAt: str | None = None
    ownerName: str = Field(default="时利", min_length=1, max_length=80)
    mood: Literal["正面", "中性", "负面"] = "中性"
    attachments: list[str] = Field(default_factory=list, max_length=10)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "sales-os-api", "time": datetime.now(timezone.utc).isoformat()}


def company_from_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "shortName": row["short_name"],
        "industry": row["industry"],
        "tier": row["tier"],
        "status": row["status"],
        "score": row["score"],
        "scoreBreakdown": decode_json(row["score_breakdown"], {}),
        "districtId": row["district_id"],
        "address": row["address"],
        "lng": row["lng"],
        "lat": row["lat"],
        "headcount": row["headcount"],
        "revenue": row["revenue"],
        "fundingRound": row["funding_round"],
        "homepage": row["homepage"],
        "painPoints": decode_json(row["pain_points"], []),
        "wbFit": row["wb_fit"],
        "lastContactAt": row["last_contact_at"],
        "nextActionAt": row["next_action_at"],
        "ownerName": row["owner_name"],
        "source": row["source"],
        "tags": decode_json(row["tags"], []),
    }


def district_from_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "name": row["name"],
        "shortName": row["short_name"],
        "description": row["description"],
        "center": decode_json(row["center"], [0, 0]),
        "zoom": row["zoom"],
        "companyCount": row["company_count"],
        "hotScore": row["hot_score"],
        "characteristics": decode_json(row["characteristics"], []),
        "targetIndustries": decode_json(row["target_industries"], []),
        "businessTips": row["business_tips"],
    }


def followup_from_row(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": row["id"],
        "companyId": row["company_id"],
        "contactId": row["contact_id"],
        "type": row["type"],
        "direction": row["direction"],
        "happenedAt": row["happened_at"],
        "summary": row["summary"],
        "nextStep": row["next_step"],
        "nextAt": row["next_at"],
        "ownerName": row["owner_name"],
        "mood": row["mood"],
        "attachments": decode_json(row["attachments"], []),
    }


@app.get("/api/companies")
def list_companies(
    search: str | None = Query(default=None, max_length=100),
    tier: Literal["A", "B", "C"] | None = None,
    district: str | None = Query(default=None, max_length=80),
    sort: Literal["score", "name", "headcount"] = "score",
) -> list[dict[str, Any]]:
    where: list[str] = []
    params: list[Any] = []
    if tier:
        where.append("tier = ?")
        params.append(tier)
    if district:
        where.append("district_id = ?")
        params.append(district)
    if search:
        where.append("(name LIKE ? OR short_name LIKE ? OR industry LIKE ?)")
        keyword = f"%{search}%"
        params.extend([keyword, keyword, keyword])
    order_by = {"score": "score DESC", "name": "name ASC", "headcount": "headcount DESC"}[sort]
    sql = "SELECT * FROM companies"
    if where:
        sql += " WHERE " + " AND ".join(where)
    sql += f" ORDER BY {order_by}"
    with connect() as conn:
        return [company_from_row(row) for row in conn.execute(sql, params).fetchall()]


@app.get("/api/companies/{company_id}")
def get_company(company_id: str) -> dict[str, Any]:
    with connect() as conn:
        row = conn.execute("SELECT * FROM companies WHERE id = ?", (company_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="company not found")
    return company_from_row(row)


@app.get("/api/districts")
def list_districts() -> list[dict[str, Any]]:
    with connect() as conn:
        rows = conn.execute("SELECT * FROM districts ORDER BY hot_score DESC").fetchall()
    return [district_from_row(row) for row in rows]


@app.get("/api/followups")
def list_followups(company_id: str | None = Query(default=None, max_length=80)) -> list[dict[str, Any]]:
    with connect() as conn:
        if company_id:
            rows = conn.execute(
                "SELECT * FROM followups WHERE company_id = ? ORDER BY happened_at DESC",
                (company_id,),
            ).fetchall()
        else:
            rows = conn.execute("SELECT * FROM followups ORDER BY happened_at DESC").fetchall()
    return [followup_from_row(row) for row in rows]


@app.post("/api/followups", status_code=status.HTTP_201_CREATED)
def create_followup(payload: FollowupCreate) -> dict[str, Any]:
    happened_at = payload.happenedAt or datetime.now(timezone.utc).isoformat()
    followup_id = f"fu-{uuid.uuid4().hex[:12]}"
    with connect() as conn:
        company = conn.execute("SELECT id FROM companies WHERE id = ?", (payload.companyId,)).fetchone()
        if not company:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="company not found")
        conn.execute(
            """
            INSERT INTO followups (
                id, company_id, contact_id, type, direction, happened_at, summary,
                next_step, next_at, owner_name, mood, attachments
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                followup_id,
                payload.companyId,
                payload.contactId,
                payload.type,
                payload.direction,
                happened_at,
                payload.summary,
                payload.nextStep,
                payload.nextAt,
                payload.ownerName,
                payload.mood,
                encode_json(payload.attachments),
            ),
        )
        row = conn.execute("SELECT * FROM followups WHERE id = ?", (followup_id,)).fetchone()
    return followup_from_row(row)


@app.get("/api/funnel")
def get_funnel() -> dict[str, Any]:
    with connect() as conn:
        row = conn.execute("SELECT payload FROM app_snapshots WHERE key = 'funnel'").fetchone()
    return decode_json(row["payload"] if row else None, {"stats": [], "total": {}})


@app.get("/api/review")
def get_review() -> dict[str, Any]:
    with connect() as conn:
        row = conn.execute("SELECT payload FROM app_snapshots WHERE key = 'review'").fetchone()
    return decode_json(row["payload"] if row else None, {"metrics": [], "summary": {}})


@app.get("/api/today-route")
def get_today_route() -> dict[str, Any]:
    with connect() as conn:
        rows = conn.execute(
            "SELECT * FROM companies WHERE id IN (?, ?, ?)",
            ("ns-01", "ns-03", "ns-02"),
        ).fetchall()
    companies = {row["id"]: company_from_row(row) for row in rows}
    now = datetime.now(timezone.utc)

    def at(hour: int, minute: int = 0) -> str:
        return now.replace(hour=hour, minute=minute, second=0, microsecond=0).isoformat()

    return {
        "date": now.date().isoformat(),
        "startPoint": {
            "name": "腾讯大厦",
            "address": "深圳市南山区深南大道 10000 号",
            "lng": 113.9528,
            "lat": 22.5431,
        },
        "totalDistance": 18.4,
        "totalDuration": 65,
        "kpiTarget": {"visits": 3, "opportunities": 1, "revenue": 50},
        "aiAdvice": "今日三站都是 A 类高潜客户，建议上午 10 点准时出发（避早高峰）。第一站瀚云智联是 B+ 融资的 AI Agent 平台客户，痛点与你上次 Demo 完全匹配，可直接推 WorkBuddy 行业模板；第二站汇金通是金融科技客户，建议带合规方案而非纯技术 demo；第三站深海跨境是已 Demo 客户，准备好合同收尾。",
        "stops": [
            {"order": 1, "company": companies["ns-01"], "estimatedArrival": at(10, 30), "estimatedDuration": 60, "travelFromPrev": 0, "travelTime": 0, "reason": "A 类 B+ 融资客户，痛点\"Agent 协同成本高\"与你上次 Demo 完美匹配", "status": "pending"},
            {"order": 2, "company": companies["ns-03"], "estimatedArrival": at(13, 0), "estimatedDuration": 90, "travelFromPrev": 5.2, "travelTime": 18, "reason": "A 类金融科技客户，需带天御合规方案 + 私域 SCRM 案例", "status": "pending"},
            {"order": 3, "company": companies["ns-02"], "estimatedArrival": at(15, 30), "estimatedDuration": 60, "travelFromPrev": 13.2, "travelTime": 32, "reason": "A 类已 Demo 客户，准备合同收尾，60% 成本下降是核心钩子", "status": "pending"},
        ],
    }


@app.get("/api/bootstrap")
def get_bootstrap() -> dict[str, Any]:
    return {
        "companies": list_companies(),
        "districts": list_districts(),
        "todayRoute": get_today_route(),
    }
