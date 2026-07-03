from __future__ import annotations

import ast
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from .database import connect, encode_json

APP_DIR = Path(__file__).resolve().parent
PROJECT_DIR = APP_DIR.parents[1]
COMPANIES_TS = PROJECT_DIR / "src" / "lib" / "data" / "companies.ts"

DISTRICTS: list[dict[str, Any]] = [
    {
        "id": "nanshan",
        "name": "南山科技园",
        "shortName": "科技园",
        "description": "腾讯、阿里、字节、华为基地，AI 创业公司密度全国第一",
        "center": [113.9528, 22.5431],
        "zoom": 14,
        "companyCount": 12,
        "hotScore": 95,
        "characteristics": ["互联网巨头", "AI 创业", "硬件研发", "高密度人才"],
        "targetIndustries": ["AI", "企业服务", "硬件", "游戏"],
        "businessTips": "以\"技术深度\"切入，强调 WorkBuddy Agent 编排能力",
    },
    {
        "id": "futian-cbd",
        "name": "福田 CBD",
        "shortName": "福田 CBD",
        "description": "金融与专业服务聚集地，决策人最集中",
        "center": [114.0579, 22.5410],
        "zoom": 14,
        "companyCount": 8,
        "hotScore": 88,
        "characteristics": ["金融总部", "高端写字楼", "决策链清晰"],
        "targetIndustries": ["金融", "咨询", "贸易", "专业服务"],
        "businessTips": "高管路线，注重 ROI 与合规，强调本地化部署",
    },
    {
        "id": "baoan",
        "name": "宝安中心区",
        "shortName": "宝安",
        "description": "先进制造与跨境电商，硬件供应链完整",
        "center": [113.8836, 22.5547],
        "zoom": 13,
        "companyCount": 6,
        "hotScore": 78,
        "characteristics": ["智能制造", "跨境电商", "硬件供应链"],
        "targetIndustries": ["制造", "电商", "硬件", "物流"],
        "businessTips": "强调\"成本下降\"和\"出海场景\"，避开纯技术叙事",
    },
    {
        "id": "luohu",
        "name": "罗湖东门/人民南",
        "shortName": "罗湖",
        "description": "传统商贸转型，珠宝、服装、文旅",
        "center": [114.1244, 22.5480],
        "zoom": 14,
        "companyCount": 4,
        "hotScore": 62,
        "characteristics": ["传统商贸", "文旅", "珠宝", "老牌地产"],
        "targetIndustries": ["商贸", "文旅", "珠宝", "地产"],
        "businessTips": "从\"私域直播\"切入，结合天御风控 + 微信生态",
    },
    {
        "id": "longgang",
        "name": "龙岗中心城",
        "shortName": "龙岗",
        "description": "深圳东部中心，机器人、低空经济试点",
        "center": [114.2461, 22.7196],
        "zoom": 13,
        "companyCount": 4,
        "hotScore": 70,
        "characteristics": ["机器人", "低空经济", "产学研"],
        "targetIndustries": ["机器人", "无人机", "智能制造"],
        "businessTips": "关注政府补贴和示范项目，混元大模型 + 云渲染",
    },
    {
        "id": "longhua",
        "name": "龙华/民治",
        "shortName": "龙华",
        "description": "深莞融合，直播电商、网红经济重镇",
        "center": [114.0299, 22.6819],
        "zoom": 13,
        "companyCount": 4,
        "hotScore": 80,
        "characteristics": ["直播基地", "MCN", "网红经济"],
        "targetIndustries": ["直播", "MCN", "电商", "内容"],
        "businessTips": "主打\"AI 数字人 + 低延迟直播\"，降本 60%",
    },
    {
        "id": "guangming",
        "name": "光明科学城",
        "shortName": "光明",
        "description": "大科学装置 + 生物医药，新兴产业高地",
        "center": [113.9356, 22.7481],
        "zoom": 12,
        "companyCount": 2,
        "hotScore": 58,
        "characteristics": ["科研机构", "生物医药", "新材料"],
        "targetIndustries": ["生物医药", "新能源", "科研"],
        "businessTips": "科研场景切入，私有化部署 + 安全合规",
    },
    {
        "id": "pingshan",
        "name": "坪山高新区",
        "shortName": "坪山",
        "description": "比亚迪 + 新能源 + 生物医药",
        "center": [114.3606, 22.7086],
        "zoom": 12,
        "companyCount": 2,
        "hotScore": 55,
        "characteristics": ["新能源", "生物医药", "智能汽车"],
        "targetIndustries": ["新能源", "汽车", "医药"],
        "businessTips": "企业级私有云方案，强调数据安全",
    },
]

FUNNEL_STATS: list[dict[str, Any]] = [
    {"stage": "lead", "label": "线索", "count": 40, "amount": 0, "conversionFromPrev": 100},
    {"stage": "qualified", "label": "已验证", "count": 18, "amount": 320, "conversionFromPrev": 45},
    {"stage": "demo", "label": "Demo", "count": 9, "amount": 480, "conversionFromPrev": 50},
    {"stage": "proposal", "label": "方案", "count": 5, "amount": 380, "conversionFromPrev": 56},
    {"stage": "negotiation", "label": "商务谈判", "count": 3, "amount": 220, "conversionFromPrev": 60},
    {"stage": "closed", "label": "已签约", "count": 1, "amount": 80, "conversionFromPrev": 33},
]

FUNNEL_TOTAL: dict[str, Any] = {
    "totalLeads": 40,
    "qualified": 18,
    "demos": 9,
    "proposals": 5,
    "negotiations": 3,
    "closed": 1,
    "totalAmount": 1480,
    "winRate": 33,
    "avgDealSize": 80,
    "salesCycle": 45,
}

REVIEW_SUMMARY: dict[str, Any] = {
    "thisWeek": {"visits": 21, "demos": 11, "opportunities": 7, "revenue": 80, "winRate": 28},
    "lastWeek": {"visits": 17, "demos": 8, "opportunities": 4, "revenue": 30, "winRate": 25},
    "monthToDate": {"visits": 73, "demos": 35, "opportunities": 18, "revenue": 250, "winRate": 31},
    "topWinReasons": ["决策人路线明确（董事长 / CTO 直接对接）", "Demo 中延迟数字冲击力强（< 1s）", "合规方案完整（私有化 + 国密）"],
    "topLossReasons": ["价格敏感型客户，未提供阶梯报价", "竞品已签长约（Agora / 声网）", "客户预算冻结，决策推迟到 Q4"],
    "nextWeekFocus": ["重点突破 3 个 A 类金融客户（合规包）", "建立数字人主播阶梯报价模板", "完成瀚云智联 POC 启动"],
}


def score_breakdown(score: int) -> dict[str, int]:
    offsets = {
        "industry": 1,
        "scale": -2,
        "budget": -4,
        "urgency": 3,
        "decisionMaker": 0,
        "techMatch": 2,
        "competition": -3,
        "caseStudy": 1,
    }
    return {key: max(0, min(100, score + offset)) for key, offset in offsets.items()}


def tier_for_score(score: int) -> str:
    if score >= 80:
        return "A"
    if score >= 65:
        return "B"
    return "C"


def parse_companies_from_ts() -> list[dict[str, Any]]:
    source = COMPANIES_TS.read_text(encoding="utf-8")
    source = re.sub(r"//.*", "", source)
    companies: list[dict[str, Any]] = []
    for match in re.finditer(r"\bc\((.*?)\),", source, flags=re.S):
        body = match.group(1).replace("undefined", "None")
        try:
            args = ast.literal_eval(f"({body})")
        except (SyntaxError, ValueError) as exc:
            raise ValueError(f"无法解析客户种子数据: {body[:120]}") from exc
        (
            company_id,
            name,
            short_name,
            industry,
            district_id,
            lng,
            lat,
            headcount,
            score,
            pain_points,
            wb_fit,
            *rest,
        ) = args
        owner_name = rest[0] if len(rest) > 0 else "时利"
        source_name = rest[1] if len(rest) > 1 else "企查查"
        tags = rest[2] if len(rest) > 2 else []
        status = rest[3] if len(rest) > 3 else "prospecting"
        funding_round = rest[4] if len(rest) > 4 else None
        revenue = rest[5] if len(rest) > 5 else None
        companies.append(
            {
                "id": company_id,
                "name": name,
                "shortName": short_name,
                "industry": industry,
                "tier": tier_for_score(score),
                "status": status,
                "score": score,
                "scoreBreakdown": score_breakdown(score),
                "districtId": district_id,
                "address": "深圳市",
                "lng": lng,
                "lat": lat,
                "headcount": headcount,
                "revenue": revenue,
                "fundingRound": funding_round,
                "homepage": None,
                "painPoints": pain_points,
                "wbFit": wb_fit,
                "lastContactAt": None,
                "nextActionAt": None,
                "ownerName": owner_name,
                "source": source_name,
                "tags": tags,
            }
        )
    if not companies:
        raise ValueError("未从 src/lib/data/companies.ts 解析到客户数据")
    return companies


def iso_now_delta(hours: int) -> str:
    return (datetime.now(timezone.utc) + timedelta(hours=hours)).isoformat()


def review_metrics() -> list[dict[str, Any]]:
    today = datetime.now(timezone.utc).date()
    rows = [
        (13, 2, 1, 0, 0, 0),
        (12, 3, 1, 1, 0, 0),
        (11, 1, 0, 0, 0, 0),
        (10, 4, 2, 1, 0, 0),
        (9, 3, 1, 0, 0, 0),
        (8, 2, 1, 1, 0, 0),
        (7, 3, 2, 2, 0, 0),
        (6, 4, 2, 1, 0, 0),
        (5, 2, 1, 1, 30, 100),
        (4, 3, 1, 0, 0, 0),
        (3, 5, 3, 2, 50, 50),
        (2, 4, 2, 1, 0, 0),
        (1, 3, 1, 1, 0, 0),
        (0, 0, 0, 0, 0, 0),
    ]
    return [
        {
            "date": (today - timedelta(days=days_ago)).isoformat(),
            "visits": visits,
            "demos": demos,
            "opportunities": opportunities,
            "revenue": revenue,
            "winRate": win_rate,
        }
        for days_ago, visits, demos, opportunities, revenue, win_rate in rows
    ]


def followups() -> list[dict[str, Any]]:
    rows = [
        ("fu-01", "ns-01", "ct-01", "拜访", "outbound", -48, "瀚云智联 CEO 对 WorkBuddy Agent 编排非常感兴趣，特别是行业模板复用。", "准备 POC 方案 + 客户行业案例", 24, "正面"),
        ("fu-02", "ns-02", "ct-02", "会议", "outbound", -72, "深海跨境 TRTC 东南亚延迟测试，从 1.8s 降到 0.8s，客户惊呼。", "商务谈判 + 合同条款", 6, "正面"),
        ("fu-03", "ns-03", "ct-03", "电话", "outbound", -24, "汇金通 CTO 提出合规优先，需要私有化部署方案。", "约下周二实地拜访 + 拉合规架构师", 48, "中性"),
        ("fu-04", "ns-04", "ct-04", "Demo", "outbound", -120, "影游互娱 Demo 全场鼓掌，剧本生成从 2 周降到 2 天。", "方案 + 报价", 72, "正面"),
        ("fu-05", "ft-05", "ct-05", "微信", "inbound", -6, "保查儿（香港）主动询问混元大模型跨境合规方案。", "提供合规白皮书 + 案例", 12, "正面"),
        ("fu-06", "ns-05", "ct-06", "邮件", "outbound", -168, "漫剧 AI 反馈 TTS 配音效果不错，但视频渲染成本仍高。", "云渲染 POC", 96, "中性"),
        ("fu-07", "ft-01", "ct-07", "拜访", "outbound", -240, "华兴证券提出高管路线，准备约董事长。", "约董事长时间", 168, "正面"),
        ("fu-08", "lh2-01", "ct-08", "电话", "outbound", -360, "超级 MCN 数字人主播需求强烈，价格敏感。", "提供阶梯报价", 120, "中性"),
        ("fu-09", "lg-01", "ct-09", "Demo", "outbound", -720, "机器人谷 Demo 客户满意，谈到云渲染远程操控。", "POC 试点一台设备", 240, "正面"),
        ("fu-10", "ns-08", "ct-10", "拜访", "outbound", -1000, "丰年互动嘀觅产品增长放缓，决策人观望 TRTC 替代方案。", "TRTC 接入 Demo", 720, "中性"),
    ]
    return [
        {
            "id": row[0],
            "companyId": row[1],
            "contactId": row[2],
            "type": row[3],
            "direction": row[4],
            "happenedAt": iso_now_delta(row[5]),
            "summary": row[6],
            "nextStep": row[7],
            "nextAt": iso_now_delta(row[8]),
            "ownerName": "时利",
            "mood": row[9],
            "attachments": [],
        }
        for row in rows
    ]


def create_schema() -> None:
    with connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS companies (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                short_name TEXT NOT NULL,
                industry TEXT NOT NULL,
                tier TEXT NOT NULL CHECK (tier IN ('A','B','C')),
                status TEXT NOT NULL,
                score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
                score_breakdown TEXT NOT NULL,
                district_id TEXT NOT NULL,
                address TEXT NOT NULL,
                lng REAL NOT NULL,
                lat REAL NOT NULL,
                headcount INTEGER NOT NULL,
                revenue TEXT,
                funding_round TEXT,
                homepage TEXT,
                pain_points TEXT NOT NULL,
                wb_fit TEXT NOT NULL,
                last_contact_at TEXT,
                next_action_at TEXT,
                owner_name TEXT NOT NULL,
                source TEXT NOT NULL,
                tags TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS districts (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                short_name TEXT NOT NULL,
                description TEXT NOT NULL,
                center TEXT NOT NULL,
                zoom INTEGER NOT NULL,
                company_count INTEGER NOT NULL,
                hot_score INTEGER NOT NULL,
                characteristics TEXT NOT NULL,
                target_industries TEXT NOT NULL,
                business_tips TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS followups (
                id TEXT PRIMARY KEY,
                company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
                contact_id TEXT,
                type TEXT NOT NULL,
                direction TEXT NOT NULL CHECK (direction IN ('outbound','inbound')),
                happened_at TEXT NOT NULL,
                summary TEXT NOT NULL,
                next_step TEXT,
                next_at TEXT,
                owner_name TEXT NOT NULL,
                mood TEXT NOT NULL,
                attachments TEXT NOT NULL DEFAULT '[]'
            );

            CREATE TABLE IF NOT EXISTS app_snapshots (
                key TEXT PRIMARY KEY,
                payload TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
            """
        )


def seed_if_empty() -> None:
    with connect() as conn:
        count = conn.execute("SELECT COUNT(*) AS count FROM companies").fetchone()["count"]
        if count:
            return

        companies = parse_companies_from_ts()
        for company in companies:
            conn.execute(
                """
                INSERT INTO companies (
                    id, name, short_name, industry, tier, status, score, score_breakdown,
                    district_id, address, lng, lat, headcount, revenue, funding_round,
                    homepage, pain_points, wb_fit, last_contact_at, next_action_at,
                    owner_name, source, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    company["id"], company["name"], company["shortName"], company["industry"],
                    company["tier"], company["status"], company["score"], encode_json(company["scoreBreakdown"]),
                    company["districtId"], company["address"], company["lng"], company["lat"],
                    company["headcount"], company["revenue"], company["fundingRound"], company["homepage"],
                    encode_json(company["painPoints"]), company["wbFit"], company["lastContactAt"],
                    company["nextActionAt"], company["ownerName"], company["source"], encode_json(company["tags"]),
                ),
            )

        for district in DISTRICTS:
            conn.execute(
                """
                INSERT INTO districts (
                    id, name, short_name, description, center, zoom, company_count,
                    hot_score, characteristics, target_industries, business_tips
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    district["id"], district["name"], district["shortName"], district["description"],
                    encode_json(district["center"]), district["zoom"], district["companyCount"],
                    district["hotScore"], encode_json(district["characteristics"]),
                    encode_json(district["targetIndustries"]), district["businessTips"],
                ),
            )

        for item in followups():
            conn.execute(
                """
                INSERT INTO followups (
                    id, company_id, contact_id, type, direction, happened_at, summary,
                    next_step, next_at, owner_name, mood, attachments
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    item["id"], item["companyId"], item["contactId"], item["type"], item["direction"],
                    item["happenedAt"], item["summary"], item["nextStep"], item["nextAt"],
                    item["ownerName"], item["mood"], encode_json(item["attachments"]),
                ),
            )

        now = datetime.now(timezone.utc).isoformat()
        snapshots = {
            "funnel": {"stats": FUNNEL_STATS, "total": FUNNEL_TOTAL},
            "review": {"metrics": review_metrics(), "summary": REVIEW_SUMMARY},
        }
        for key, payload in snapshots.items():
            conn.execute(
                "INSERT INTO app_snapshots (key, payload, updated_at) VALUES (?, ?, ?)",
                (key, encode_json(payload), now),
            )


def init_db() -> None:
    create_schema()
    seed_if_empty()
