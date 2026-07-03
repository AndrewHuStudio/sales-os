# 任务二 · WorkBuddy GeoSales OS 数据库表结构

> 版本：V1.0｜6 张核心表｜含 PostgreSQL DDL、字段说明、示例数据、索引建议
>
> MVP 推荐存储：飞书多维表格（快速落地） / PostgreSQL + PostGIS（正式版）

---

## 全局约定

| 项 | 约定 |
| - | - |
| 主键策略 | UUID（v4），便于分布式与外部系统对接 |
| 时间字段 | timestamptz（带时区），统一 UTC 存储，前端按 GMT+8 渲染 |
| 数组字段 | text[]（PostgreSQL 原生），飞书版用多选字段 |
| JSON 字段 | jsonb，存评分明细 / KP 路线 / 痛点等结构化数据 |
| 软删除 | `deleted_at timestamptz NULL` 统一软删 |
| 审计 | `created_at` / `updated_at` / `created_by` / `updated_by` 全表统一 |
| 命名 | 表名复数下划线；字段名小写下划线；枚举用小写字符串 |
| 金额 | numeric(14,2)，单位元 |
| 坐标 | 浮点 + GiST 索引（PostGIS） |

---

## 表 1：business_districts（商区表）

### 1.1 字段定义

| 字段名 | 字段类型 | 是否必填 | 默认值 | 字段说明 |
| - | - | - | - | - |
| id | uuid | 是 | gen_random_uuid() | 主键 |
| name | varchar(64) | 是 | - | 商区名称，如"南山科技园" |
| city | varchar(32) | 是 | '深圳' | 城市 |
| district | varchar(32) | 是 | - | 行政区，如"南山区" |
| type | varchar(32) | 是 | - | 商区类型：tech_park / hq_zone / financial / manufacturing / port_logistics / culture_tourism |
| main_industries | text[] | 是 | '{}' | 主导行业数组 |
| boundary | jsonb | 否 | NULL | 商区边界 GeoJSON（Polygon） |
| center_lat | numeric(10,7) | 是 | - | 中心点纬度 |
| center_lng | numeric(10,7) | 是 | - | 中心点经度 |
| zoom_level | smallint | 否 | 13 | 推荐展示缩放级别 |
| company_count | integer | 否 | 0 | 商区内企业数（冗余，定时刷新） |
| high_score_count | integer | 否 | 0 | A 类客户数（workbuddy_score ≥ 80） |
| touched_count | integer | 否 | 0 | 已触达客户数 |
| followup_count | integer | 否 | 0 | 待跟进客户数 |
| avg_workbuddy_score | numeric(5,2) | 否 | NULL | 平均适配分 |
| priority | varchar(1) | 是 | 'C' | 商区优先级 A / B / C |
| sort_order | integer | 否 | 100 | 列表排序权重 |
| description | text | 否 | NULL | 商区简介 |
| created_at | timestamptz | 是 | now() | |
| updated_at | timestamptz | 是 | now() | |
| created_by | varchar(64) | 是 | - | |
| updated_by | varchar(64) | 是 | - | |
| deleted_at | timestamptz | 否 | NULL | 软删 |

### 1.2 索引建议

```sql
CREATE INDEX idx_districts_city ON business_districts(city) WHERE deleted_at IS NULL;
CREATE INDEX idx_districts_priority ON business_districts(priority, sort_order);
CREATE INDEX idx_districts_boundary ON business_districts USING GIST (boundary);
```

### 1.3 示例数据

| id | name | city | district | type | main_industries | center_lat | center_lng | priority |
| - | - | - | - | - | - | - | - | - |
| 11111111-... | 南山科技园 | 深圳 | 南山区 | tech_park | {软件,SaaS,智能硬件,跨境电商} | 22.5431 | 113.9344 | A |
| 11111112-... | 深圳湾/后海 | 深圳 | 南山区 | hq_zone | {总部经济,金融科技,文创} | 22.5180 | 113.9450 | A |
| 11111113-... | 前海 | 深圳 | 南山区 | financial | {金融科技,跨境电商,企业服务} | 22.5340 | 113.8990 | A |
| 11111114-... | 福田 CBD | 深圳 | 福田区 | financial | {金融,咨询,总部经济} | 22.5410 | 114.0590 | A |
| 11111115-... | 宝安中心/西乡/福永 | 深圳 | 宝安区 | manufacturing | {智能制造,跨境电商,电子} | 22.5560 | 113.8840 | B |
| 11111116-... | 龙华/坂田 | 深圳 | 龙华区 | tech_park | {智能硬件,跨境电商,视频直播} | 22.6820 | 114.0330 | A |
| 11111117-... | 龙岗坂雪岗/大运 | 深圳 | 龙岗区 | tech_park | {智能制造,新能源,ICT} | 22.6940 | 114.1800 | B |
| 11111118-... | 蛇口/华侨城 | 深圳 | 南山区 | culture_tourism | {文旅,文创,商业运营} | 22.4880 | 113.9290 | B |

### 1.4 DDL

```sql
CREATE TABLE business_districts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            varchar(64) NOT NULL,
  city            varchar(32) NOT NULL DEFAULT '深圳',
  district        varchar(32) NOT NULL,
  type            varchar(32) NOT NULL,
  main_industries text[] NOT NULL DEFAULT '{}',
  boundary        jsonb,
  center_lat      numeric(10,7) NOT NULL,
  center_lng      numeric(10,7) NOT NULL,
  zoom_level      smallint DEFAULT 13,
  company_count   integer DEFAULT 0,
  high_score_count integer DEFAULT 0,
  touched_count   integer DEFAULT 0,
  followup_count  integer DEFAULT 0,
  avg_workbuddy_score numeric(5,2),
  priority        varchar(1) NOT NULL DEFAULT 'C',
  sort_order      integer DEFAULT 100,
  description     text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  created_by      varchar(64) NOT NULL,
  updated_by      varchar(64) NOT NULL,
  deleted_at      timestamptz,
  CONSTRAINT chk_district_priority CHECK (priority IN ('A','B','C'))
);
```

---

## 表 2：companies（企业表）

### 2.1 字段定义

| 字段名 | 字段类型 | 是否必填 | 默认值 | 字段说明 |
| - | - | - | - | - |
| id | uuid | 是 | gen_random_uuid() | 主键 |
| name | varchar(128) | 是 | - | 企业全称 |
| short_name | varchar(64) | 否 | NULL | 简称 |
| address | text | 是 | - | 办公地址 |
| city | varchar(32) | 是 | '深圳' | 城市 |
| district | varchar(32) | 是 | - | 行政区 |
| business_district_id | uuid | 否 | NULL | 所属商区 ID（外键 → business_districts.id） |
| industry | varchar(64) | 是 | - | 一级行业 |
| sub_industry | varchar(64) | 否 | NULL | 细分行业 |
| company_size | varchar(8) | 是 | - | S(<50) / M(50-200) / L(200-1000) / XL(>1000) |
| employee_count | integer | 否 | NULL | 员工数（如可获取） |
| founded_year | smallint | 否 | NULL | 成立年份 |
| registered_capital | numeric(14,2) | 否 | NULL | 注册资本（元） |
| annual_revenue | numeric(14,2) | 否 | NULL | 年营收（公开/估算） |
| website | varchar(256) | 否 | NULL | 官网 |
| lat | numeric(10,7) | 否 | NULL | 纬度 |
| lng | numeric(10,7) | 否 | NULL | 经度 |
| workbuddy_score | smallint | 是 | 0 | WorkBuddy 适配评分 0-100 |
| scoring_breakdown | jsonb | 否 | NULL | 8 维度评分明细 |
| score_reasoning | text | 否 | NULL | 评分理由（100-200 字） |
| score_updated_at | timestamptz | 否 | NULL | 评分最近更新时间 |
| customer_level | varchar(1) | 是 | 'C' | 客户等级 A / B / C（按分数自动计算） |
| recommended_scenarios | text[] | 是 | '{}' | 推荐切入场景（来自场景字典） |
| pain_points | text[] | 是 | '{}' | 可能痛点 |
| business_summary | text | 否 | NULL | 业务简介（AI 生成） |
| current_stage | varchar(32) | 是 | 'untouched' | 当前销售阶段 |
| next_action | text | 否 | NULL | 下一步动作 |
| next_followup_date | date | 否 | NULL | 下次跟进日期 |
| last_followup_at | timestamptz | 否 | NULL | 最近跟进时间 |
| owner | varchar(64) | 是 | - | 销售负责人 |
| data_source | varchar(32) | 是 | 'manual' | 数据来源：manual / qcc / public / ai_inferred |
| public_info | jsonb | 否 | NULL | 公开信息来源汇总 |
| notes | text | 否 | NULL | 销售本人备注 |
| tags | text[] | 是 | '{}' | 自定义标签 |
| created_at | timestamptz | 是 | now() | |
| updated_at | timestamptz | 是 | now() | |
| created_by | varchar(64) | 是 | - | |
| updated_by | varchar(64) | 是 | - | |
| deleted_at | timestamptz | 否 | NULL | |

**枚举：销售阶段 current_stage**

```
untouched        未触达
touched          已触达
replied          有效回复
requirement      需求沟通
demo             产品演示
poc              POC 试点
quote            商务报价
contract         合同推进
won              已成交
lost             输单
paused           暂缓
```

**枚举：场景字典 recommended_scenarios**

```
sales_proposal          销售方案自动生成
customer_research       客户资料研究
meeting_notes           会议纪要和行动项
knowledge_qa            企业知识库问答
cs_assistant            客服知识助手
onboarding              新员工培训助手
marketing_content       市场内容生成
bidding                 投标资料整理
product_docs            产品文档管理
analytics_report        经营分析报告生成
```

### 2.2 索引建议

```sql
CREATE INDEX idx_companies_district ON companies(business_district_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_score ON companies(workbuddy_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_level ON companies(customer_level);
CREATE INDEX idx_companies_stage ON companies(current_stage);
CREATE INDEX idx_companies_next_followup ON companies(next_followup_date) WHERE next_followup_date IS NOT NULL;
CREATE INDEX idx_companies_industry ON companies(industry);
CREATE INDEX idx_companies_geo ON companies USING GIST (point(lng, lat));
```

### 2.3 评分明细 JSON 结构（scoring_breakdown）

```json
{
  "knowledge_density":     { "score": 18, "max": 20, "reason": "跨境电商选品/客服/营销高度依赖文档与知识" },
  "org_size":              { "score": 12, "max": 15, "reason": "员工 200-500 人，跨部门协作价值明显" },
  "multi_dept_complexity": { "score": 13, "max": 15, "reason": "销售/运营/客服/物流多部门并行" },
  "ai_readiness":          { "score": 10, "max": 15, "reason": "已有 ERP/BI 数字化基础，AI 接受度中等" },
  "tencent_ecosystem":     { "score": 8,  "max": 10, "reason": "已使用企业微信 + 腾讯会议" },
  "growth_pressure":       { "score": 8,  "max": 10, "reason": "近一年扩招 + 新品类上线 + 出海" },
  "data_security":         { "score": 7,  "max": 10, "reason": "关注数据出境与平台账号安全" },
  "procurement_likelihood":{ "score": 4,  "max": 5,  "reason": "有独立 IT 负责人 + 采购流程" }
}
```

### 2.4 示例数据（3 条）

**示例 1：A 类跨境电商**

```json
{
  "id": "c-0001",
  "name": "深圳市丰年互动科技有限公司",
  "short_name": "丰年互动",
  "address": "深圳市南山区粤海街道科技园南区高新南一道 XX 号",
  "city": "深圳",
  "district": "南山区",
  "business_district_id": "11111111-...",
  "industry": "跨境电商",
  "sub_industry": "品牌出海",
  "company_size": "L",
  "employee_count": 320,
  "founded_year": 2017,
  "registered_capital": 5000000.00,
  "website": "https://www.example.com",
  "lat": 22.5431,
  "lng": 113.9344,
  "workbuddy_score": 86,
  "scoring_breakdown": { "见上方示例" },
  "score_reasoning": "该企业属于品牌出海跨境电商，多语言内容、选品、客服与运营高度依赖文档协作；300+ 员工规模下多部门协同价值明显；已使用企微/腾讯会议，腾讯生态适配度高；处于扩品类+出海双增长期，业务增长压力大。",
  "customer_level": "A",
  "recommended_scenarios": ["marketing_content", "cs_assistant", "customer_research"],
  "pain_points": ["多语言营销内容生产慢", "客服知识库分散", "选品研究耗时长"],
  "current_stage": "requirement",
  "next_action": "准备试点方案，约 IT 负责人沟通数据安全",
  "next_followup_date": "2026-07-04",
  "owner": "Andrew",
  "data_source": "qcc+public",
  "tags": ["出海", "亚马逊", "独立站"]
}
```

**示例 2：B 类科技企业**

```json
{
  "id": "c-0002",
  "name": "元象 XVERSE",
  "industry": "科技/SaaS",
  "sub_industry": "大模型/数字人",
  "company_size": "M",
  "workbuddy_score": 72,
  "customer_level": "B",
  "recommended_scenarios": ["meeting_notes", "product_docs", "knowledge_qa"],
  "current_stage": "touched",
  "next_action": "准备技术 demo，寻找 Champion"
}
```

**示例 3：C 类小型贸易**

```json
{
  "id": "c-0003",
  "name": "深圳某小微贸易商",
  "company_size": "S",
  "workbuddy_score": 42,
  "customer_level": "C",
  "current_stage": "untouched"
}
```

### 2.5 DDL

```sql
CREATE TABLE companies (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                varchar(128) NOT NULL,
  short_name          varchar(64),
  address             text NOT NULL,
  city                varchar(32) NOT NULL DEFAULT '深圳',
  district            varchar(32) NOT NULL,
  business_district_id uuid REFERENCES business_districts(id),
  industry            varchar(64) NOT NULL,
  sub_industry        varchar(64),
  company_size        varchar(8) NOT NULL,
  employee_count      integer,
  founded_year        smallint,
  registered_capital  numeric(14,2),
  annual_revenue      numeric(14,2),
  website             varchar(256),
  lat                 numeric(10,7),
  lng                 numeric(10,7),
  workbuddy_score     smallint NOT NULL DEFAULT 0,
  scoring_breakdown   jsonb,
  score_reasoning     text,
  score_updated_at    timestamptz,
  customer_level      varchar(1) NOT NULL DEFAULT 'C',
  recommended_scenarios text[] NOT NULL DEFAULT '{}',
  pain_points         text[] NOT NULL DEFAULT '{}',
  business_summary    text,
  current_stage       varchar(32) NOT NULL DEFAULT 'untouched',
  next_action         text,
  next_followup_date  date,
  last_followup_at    timestamptz,
  owner               varchar(64) NOT NULL,
  data_source         varchar(32) NOT NULL DEFAULT 'manual',
  public_info         jsonb,
  notes               text,
  tags                text[] NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          varchar(64) NOT NULL,
  updated_by          varchar(64) NOT NULL,
  deleted_at          timestamptz,
  CONSTRAINT chk_company_level CHECK (customer_level IN ('A','B','C')),
  CONSTRAINT chk_company_size CHECK (company_size IN ('S','M','L','XL')),
  CONSTRAINT chk_company_score CHECK (workbuddy_score BETWEEN 0 AND 100),
  CONSTRAINT chk_company_stage CHECK (current_stage IN
    ('untouched','touched','replied','requirement','demo','poc','quote','contract','won','lost','paused'))
);
```

---

## 表 3：contacts（KP 联系人表）

### 3.1 字段定义

| 字段名 | 字段类型 | 是否必填 | 默认值 | 字段说明 |
| - | - | - | - | - |
| id | uuid | 是 | gen_random_uuid() | 主键 |
| company_id | uuid | 是 | - | 企业 ID（外键） |
| name | varchar(64) | 否 | NULL | 姓名（可空，优先以角色记录） |
| role | varchar(32) | 是 | - | 角色：ceo / coo / sales_lead / marketing_lead / it_lead / hr_lead / procurement / finance / other |
| role_label | varchar(64) | 是 | - | 角色中文显示名 |
| department | varchar(64) | 否 | NULL | 部门 |
| influence_level | varchar(8) | 是 | 'medium' | 高 / 中 / low |
| attitude | varchar(8) | 是 | 'unknown' | 支持 / 中立 / 反对 / 未知 |
| is_champion | boolean | 是 | false | 是否内部 Champion |
| contact_source | varchar(32) | 是 | 'manual' | manual / business_card / public_event / authorized |
| public_profile_url | varchar(256) | 否 | NULL | 公开商务主页 |
| linkedin_url | varchar(256) | 否 | NULL | LinkedIn（公开） |
| notes | text | 否 | NULL | 备注 |
| priority | smallint | 是 | 5 | KP 攻坚顺序（1-6，1 最先触达） |
| last_contact_at | timestamptz | 否 | NULL | 最近沟通时间 |
| created_at | timestamptz | 是 | now() | |
| updated_at | timestamptz | 是 | now() | |
| created_by | varchar(64) | 是 | - | |
| updated_by | varchar(64) | 是 | - | |
| deleted_at | timestamptz | 否 | NULL | |

**合规约束（应用层 + DB Trigger 双重）**：
- 不允许存入手机号 / 私人微信 / 身份证号 / 家庭住址等敏感信息。
- 字段级约束：name 长度 ≤ 64，notes 提示词中禁止出现"手机号""身份证"等关键词。
- MVP 阶段以角色为主，name 字段允许为空。

### 3.2 索引建议

```sql
CREATE INDEX idx_contacts_company ON contacts(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_role ON contacts(role);
CREATE INDEX idx_contacts_priority ON contacts(company_id, priority);
```

### 3.3 示例数据

| id | company_id | name | role | role_label | influence_level | attitude | is_champion | priority |
| - | - | - | - | - | - | - | - | - |
| ct-0001 | c-0001 | 张某某 | sales_lead | 销售负责人 | 高 | 支持 | true | 1 |
| ct-0002 | c-0001 | NULL | it_lead | IT 负责人 | 中 | 未知 | false | 3 |
| ct-0003 | c-0001 | 李某某 | ceo | CEO | 高 | 未知 | false | 6 |

### 3.4 DDL

```sql
CREATE TABLE contacts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES companies(id),
  name              varchar(64),
  role              varchar(32) NOT NULL,
  role_label        varchar(64) NOT NULL,
  department        varchar(64),
  influence_level   varchar(8) NOT NULL DEFAULT 'medium',
  attitude          varchar(8) NOT NULL DEFAULT 'unknown',
  is_champion       boolean NOT NULL DEFAULT false,
  contact_source    varchar(32) NOT NULL DEFAULT 'manual',
  public_profile_url varchar(256),
  linkedin_url      varchar(256),
  notes             text,
  priority          smallint NOT NULL DEFAULT 5,
  last_contact_at   timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        varchar(64) NOT NULL,
  updated_by        varchar(64) NOT NULL,
  deleted_at        timestamptz,
  CONSTRAINT chk_contact_influence CHECK (influence_level IN ('high','medium','low')),
  CONSTRAINT chk_contact_attitude CHECK (attitude IN ('supportive','neutral','opposed','unknown')),
  CONSTRAINT chk_contact_role CHECK (role IN
    ('ceo','coo','sales_lead','marketing_lead','it_lead','hr_lead','procurement','finance','other'))
);
```

---

## 表 4：opportunities（机会表）

### 4.1 字段定义

| 字段名 | 字段类型 | 是否必填 | 默认值 | 字段说明 |
| - | - | - | - | - |
| id | uuid | 是 | gen_random_uuid() | 主键 |
| company_id | uuid | 是 | - | 企业 ID（外键） |
| opportunity_name | varchar(128) | 是 | - | 商机名称，如"WorkBuddy 销售部试点 50 人" |
| product | varchar(32) | 是 | 'WorkBuddy' | 产品（首期固定 WorkBuddy） |
| scenario | varchar(32) | 否 | NULL | 试点场景，来自场景字典 |
| estimated_users | integer | 否 | NULL | 预计使用人数 |
| unit_price | numeric(10,2) | 否 | NULL | 预计单价（元/人/年） |
| estimated_amount | numeric(14,2) | 否 | NULL | 预计金额 |
| stage | varchar(32) | 是 | 'requirement' | 商机阶段（同 companies.current_stage 字典） |
| probability | smallint | 是 | 30 | 成交概率 0-100 |
| expected_close_date | date | 否 | NULL | 预计成交日期 |
| key_risks | text[] | 是 | '{}' | 关键风险标签 |
| champion_contact_id | uuid | 否 | NULL | 内部 Champion KP ID（外键 → contacts.id） |
| next_action | text | 否 | NULL | 下一步动作 |
| created_at | timestamptz | 是 | now() | |
| updated_at | timestamptz | 是 | now() | |
| created_by | varchar(64) | 是 | - | |
| updated_by | varchar(64) | 是 | - | |
| deleted_at | timestamptz | 否 | NULL | |

### 4.2 索引建议

```sql
CREATE INDEX idx_opps_company ON opportunities(company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_opps_stage ON opportunities(stage);
CREATE INDEX idx_opps_amount ON opportunities(estimated_amount DESC);
CREATE INDEX idx_opps_close_date ON opportunities(expected_close_date) WHERE expected_close_date IS NOT NULL;
```

### 4.3 示例数据

| id | company_id | opportunity_name | scenario | estimated_users | estimated_amount | stage | probability | expected_close_date |
| - | - | - | - | - | - | - | - | - |
| op-0001 | c-0001 | 丰年互动 WorkBuddy 客服知识助手 POC | cs_assistant | 30 | 180000.00 | poc | 50 | 2026-08-15 |
| op-0002 | c-0002 | 元象大模型 销售方案生成试点 | sales_proposal | 15 | 90000.00 | quote | 70 | 2026-07-20 |

### 4.4 DDL

```sql
CREATE TABLE opportunities (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          uuid NOT NULL REFERENCES companies(id),
  opportunity_name    varchar(128) NOT NULL,
  product             varchar(32) NOT NULL DEFAULT 'WorkBuddy',
  scenario            varchar(32),
  estimated_users     integer,
  unit_price          numeric(10,2),
  estimated_amount    numeric(14,2),
  stage               varchar(32) NOT NULL DEFAULT 'requirement',
  probability         smallint NOT NULL DEFAULT 30,
  expected_close_date date,
  key_risks           text[] NOT NULL DEFAULT '{}',
  champion_contact_id uuid REFERENCES contacts(id),
  next_action         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          varchar(64) NOT NULL,
  updated_by          varchar(64) NOT NULL,
  deleted_at          timestamptz,
  CONSTRAINT chk_opp_probability CHECK (probability BETWEEN 0 AND 100)
);
```

---

## 表 5：followups（跟进记录表）

### 5.1 字段定义

| 字段名 | 字段类型 | 是否必填 | 默认值 | 字段说明 |
| - | - | - | - | - |
| id | uuid | 是 | gen_random_uuid() | 主键 |
| company_id | uuid | 是 | - | 企业 ID（外键） |
| opportunity_id | uuid | 否 | NULL | 机会 ID（外键） |
| followup_time | timestamptz | 是 | now() | 沟通时间 |
| contact_id | uuid | 否 | NULL | 沟通 KP（外键 → contacts.id） |
| contact_role | varchar(32) | 是 | - | 沟通对象角色（即使 contact_id 为空也必填） |
| contact_name | varchar(64) | 否 | NULL | 沟通对象姓名（可空） |
| channel | varchar(16) | 是 | - | phone / wechat / meeting / email / offline |
| summary | text | 是 | - | 销售录入的自然语言摘要 |
| ai_structured | jsonb | 否 | NULL | AI 总结的结构化字段 |
| customer_interest | text[] | 是 | '{}' | 客户关注点 |
| objections | text[] | 是 | '{}' | 客户异议 |
| stage_after | varchar(32) | 否 | NULL | 本次沟通后客户阶段 |
| next_action | text | 否 | NULL | 下一步动作 |
| next_followup_date | date | 否 | NULL | 下次跟进时间 |
| materials_needed | text[] | 是 | '{}' | 需要准备的材料 |
| sentiment | varchar(8) | 是 | 'neutral' | 客户情绪 positive / neutral / negative |
| created_at | timestamptz | 是 | now() | |
| updated_at | timestamptz | 是 | now() | |
| created_by | varchar(64) | 是 | - | |
| updated_by | varchar(64) | 是 | - | |
| deleted_at | timestamptz | 否 | NULL | |

**ai_structured JSON 结构**

```json
{
  "interest_tags": ["销售方案生成", "会议纪要"],
  "objection_tags": ["价格", "数据安全"],
  "implied_stage": "requirement",
  "stage_change_reason": "客户主动要求 demo",
  "next_action": "准备安全说明材料，并约 IT 负责人参加下一次会议",
  "next_followup_days": 3,
  "materials": ["WorkBuddy 安全白皮书", "销售提效场景案例集", "15 人试点方案"],
  "risk_level": "medium"
}
```

### 5.2 索引建议

```sql
CREATE INDEX idx_followups_company ON followups(company_id, followup_time DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_followups_contact ON followups(contact_id);
CREATE INDEX idx_followups_opportunity ON followups(opportunity_id);
CREATE INDEX idx_followups_next_date ON followups(next_followup_date) WHERE next_followup_date IS NOT NULL;
```

### 5.3 示例数据

```json
{
  "id": "fu-0001",
  "company_id": "c-0001",
  "opportunity_id": "op-0001",
  "followup_time": "2026-07-01 10:30:00+08",
  "contact_id": "ct-0001",
  "contact_role": "sales_lead",
  "contact_name": "张某某",
  "channel": "wechat",
  "summary": "今天和丰年互动销售负责人张总微信沟通 30 分钟。对方对 WorkBuddy 销售方案自动生成和多语言营销内容比较感兴趣；提到目前销售团队 20 人每周要产出 30+ 份定制方案，重复劳动严重。担心两点：一是价格（按席位收费怕成本高），二是数据安全（客户资料能不能私有化）。对方建议下周拉 IT 负责人一起沟通，并愿意推荐给 COO。",
  "ai_structured": {
    "interest_tags": ["销售方案自动生成", "多语言营销内容"],
    "objection_tags": ["价格", "数据安全"],
    "implied_stage": "requirement",
    "next_action": "准备安全白皮书 + 销售提效场景案例 + 15 人试点方案",
    "next_followup_days": 3,
    "materials": ["WorkBuddy 安全白皮书", "销售提效场景案例集", "15 人试点方案"],
    "risk_level": "medium"
  },
  "customer_interest": ["销售方案自动生成", "多语言营销内容"],
  "objections": ["价格", "数据安全"],
  "stage_after": "requirement",
  "next_action": "准备安全白皮书 + 销售提效场景案例 + 15 人试点方案",
  "next_followup_date": "2026-07-04",
  "materials_needed": ["WorkBuddy 安全白皮书", "销售提效场景案例集", "15 人试点方案"],
  "sentiment": "positive"
}
```

### 5.4 DDL

```sql
CREATE TABLE followups (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id        uuid NOT NULL REFERENCES companies(id),
  opportunity_id    uuid REFERENCES opportunities(id),
  followup_time     timestamptz NOT NULL DEFAULT now(),
  contact_id        uuid REFERENCES contacts(id),
  contact_role      varchar(32) NOT NULL,
  contact_name      varchar(64),
  channel           varchar(16) NOT NULL,
  summary           text NOT NULL,
  ai_structured     jsonb,
  customer_interest text[] NOT NULL DEFAULT '{}',
  objections        text[] NOT NULL DEFAULT '{}',
  stage_after       varchar(32),
  next_action       text,
  next_followup_date date,
  materials_needed  text[] NOT NULL DEFAULT '{}',
  sentiment         varchar(8) NOT NULL DEFAULT 'neutral',
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  created_by        varchar(64) NOT NULL,
  updated_by        varchar(64) NOT NULL,
  deleted_at        timestamptz,
  CONSTRAINT chk_followup_channel CHECK (channel IN ('phone','wechat','meeting','email','offline')),
  CONSTRAINT chk_followup_sentiment CHECK (sentiment IN ('positive','neutral','negative'))
);
```

---

## 表 6：sales_scripts（话术库表）

### 6.1 字段定义

| 字段名 | 字段类型 | 是否必填 | 默认值 | 字段说明 |
| - | - | - | - | - |
| id | uuid | 是 | gen_random_uuid() | 主键 |
| industry | varchar(64) | 否 | NULL | 行业（如不填则为通用） |
| kp_role | varchar(32) | 否 | NULL | KP 角色 |
| scenario | varchar(32) | 否 | NULL | 适用场景 |
| stage | varchar(32) | 否 | NULL | 适用阶段 |
| script_type | varchar(32) | 是 | - | 话术类型 |
| content | text | 是 | - | 话术正文 |
| variables | jsonb | 否 | NULL | 占位符定义，如 `["{{company_name}}","{{pain_point}}"]` |
| effectiveness_score | numeric(4,2) | 是 | 0.00 | 效果评分 0-5 |
| usage_count | integer | 是 | 0 | 使用次数 |
| version | smallint | 是 | 1 | 版本号（重新生成会递增） |
| parent_script_id | uuid | 否 | NULL | 父版本（用于追溯演进） |
| is_template | boolean | 是 | true | 是否为通用模板 |
| tags | text[] | 是 | '{}' | 标签 |
| created_at | timestamptz | 是 | now() | |
| updated_at | timestamptz | 是 | now() | |
| created_by | varchar(64) | 是 | - | |
| updated_by | varchar(64) | 是 | - | |
| deleted_at | timestamptz | 否 | NULL | |

**枚举：script_type**

```
wechat_first       微信首次触达
phone_open         电话开场
email_outreach     邮件触达
meeting_invite     会议邀约
followup           复访跟进
objection          异议回应
ceo_brief          CEO 简报
it_security        IT 安全说明
procurement_roi    采购 ROI
```

### 6.2 索引建议

```sql
CREATE INDEX idx_scripts_industry_role ON scripts(industry, kp_role) WHERE deleted_at IS NULL;
CREATE INDEX idx_scripts_type ON scripts(script_type);
CREATE INDEX idx_scripts_score ON scripts(effectiveness_score DESC) WHERE deleted_at IS NULL;
```

### 6.3 示例数据

**示例 1：跨境电商 - 销售负责人 - 微信首次触达**

```json
{
  "id": "sc-0001",
  "industry": "跨境电商",
  "kp_role": "sales_lead",
  "scenario": "sales_proposal",
  "stage": "untouched",
  "script_type": "wechat_first",
  "content": "您好 {{contact_name}}，我是腾讯云的 Andrew，目前主要负责企业 AI 办公和 WorkBuddy 相关方案。我关注到贵司在 {{industry_sub}} 方面发展很快，这类团队通常在 {{pain_point_1}}、{{pain_point_2}} 上有较多重复工作。我们现在可以基于 WorkBuddy 帮企业先做一个小范围试点，比如 {{scenario_label}}，20 分钟简单交流一下，看看是否有适合贵司的切入场景。",
  "variables": ["contact_name", "industry_sub", "pain_point_1", "pain_point_2", "scenario_label"],
  "effectiveness_score": 4.20,
  "usage_count": 12,
  "version": 2,
  "is_template": true,
  "tags": ["A类客户", "高潜"]
}
```

**示例 2：通用 - IT 负责人 - 数据安全异议回应**

```json
{
  "id": "sc-0002",
  "industry": null,
  "kp_role": "it_lead",
  "scenario": "knowledge_qa",
  "stage": "requirement",
  "script_type": "it_security",
  "content": "感谢 {{contact_name}} 关注数据安全，这一点我们非常重视。WorkBuddy 提供三种部署模式：SaaS 共享版、专属租户版、本地化私有部署版。客户资料可全程加密存储，支持细粒度权限控制和审计日志。已通过 ISO 27001 / 等保三级认证。我可以单独约 30 分钟让我们的安全工程师一起参与答疑。",
  "effectiveness_score": 4.50,
  "usage_count": 8,
  "is_template": true,
  "tags": ["异议回应", "数据安全"]
}
```

### 6.4 DDL

```sql
CREATE TABLE sales_scripts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  industry            varchar(64),
  kp_role             varchar(32),
  scenario            varchar(32),
  stage               varchar(32),
  script_type         varchar(32) NOT NULL,
  content             text NOT NULL,
  variables           jsonb,
  effectiveness_score numeric(4,2) NOT NULL DEFAULT 0.00,
  usage_count         integer NOT NULL DEFAULT 0,
  version             smallint NOT NULL DEFAULT 1,
  parent_script_id    uuid REFERENCES sales_scripts(id),
  is_template         boolean NOT NULL DEFAULT true,
  tags                text[] NOT NULL DEFAULT '{}',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  created_by          varchar(64) NOT NULL,
  updated_by          varchar(64) NOT NULL,
  deleted_at          timestamptz,
  CONSTRAINT chk_script_type CHECK (script_type IN
    ('wechat_first','phone_open','email_outreach','meeting_invite','followup',
     'objection','ceo_brief','it_security','procurement_roi')),
  CONSTRAINT chk_script_score CHECK (effectiveness_score BETWEEN 0 AND 5)
);
```

---

## 表关系总览（ER 图）

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

## 触发器与自动化（建议）

### T1：客户等级自动计算

```sql
CREATE OR REPLACE FUNCTION auto_set_customer_level() RETURNS trigger AS $$
BEGIN
  NEW.customer_level := CASE
    WHEN NEW.workbuddy_score >= 80 THEN 'A'
    WHEN NEW.workbuddy_score >= 60 THEN 'B'
    ELSE 'C'
  END;
  NEW.score_updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_level
BEFORE INSERT OR UPDATE OF workbuddy_score ON companies
FOR EACH ROW EXECUTE FUNCTION auto_set_customer_level();
```

### T2：商区统计自动刷新

```sql
CREATE OR REPLACE FUNCTION refresh_district_stats() RETURNS trigger AS $$
BEGIN
  UPDATE business_districts d SET
    company_count   = (SELECT count(*) FROM companies WHERE business_district_id = d.id AND deleted_at IS NULL),
    high_score_count= (SELECT count(*) FROM companies WHERE business_district_id = d.id AND workbuddy_score >= 80 AND deleted_at IS NULL),
    touched_count   = (SELECT count(*) FROM companies WHERE business_district_id = d.id AND current_stage NOT IN ('untouched') AND deleted_at IS NULL),
    followup_count  = (SELECT count(*) FROM companies WHERE business_district_id = d.id AND current_stage IN ('touched','replied','requirement','demo') AND deleted_at IS NULL),
    avg_workbuddy_score = (SELECT avg(workbuddy_score) FROM companies WHERE business_district_id = d.id AND deleted_at IS NULL),
    updated_at = now()
  WHERE d.id = NEW.business_district_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_companies_refresh_district
AFTER INSERT OR UPDATE OR DELETE ON companies
FOR EACH ROW EXECUTE FUNCTION refresh_district_stats();
```

### T3：敏感信息拦截

```sql
CREATE OR REPLACE FUNCTION check_contact_compliance() RETURNS trigger AS $$
BEGIN
  -- 禁止手机号
  IF NEW.name ~ '1[3-9][0-9]{9}' THEN
    RAISE EXCEPTION '禁止在联系人姓名中存放手机号';
  END IF;
  -- 禁止身份证号
  IF NEW.notes ~ '[0-9]{17}[0-9Xx]' THEN
    RAISE EXCEPTION '禁止在联系人备注中存放身份证号';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_contacts_compliance
BEFORE INSERT OR UPDATE ON contacts
FOR EACH ROW EXECUTE FUNCTION check_contact_compliance();
```

---

## 存储选型建议

| 阶段 | 推荐方案 | 理由 |
| - | - | - |
| MVP（0–4 周） | 飞书多维表格 / Notion 数据库 | 0 代码、可分享、字段可视化 |
| 内部版（1–3 月） | Airtable + Zapier | 视图丰富、轻自动化 |
| 正式版（3 月+） | PostgreSQL 14+ + PostGIS | 空间查询、并发、可控 |

### 飞书多维表格字段映射

| 业务表 | 飞书表名 | 关键字段类型 |
| - | - | - |
| business_districts | 商区 | 单选（类型）、多选（行业）、数字、地理位置 |
| companies | 目标企业 | 单选/多选、评分（数字）、地理、自动编号 |
| contacts | 联系人 | 单向关联（企业）、单选（角色） |
| opportunities | 商机 | 双向关联、数字（金额）、日期 |
| followups | 跟进记录 | 双向关联、多选、JSON（用多行文本） |
| sales_scripts | 话术库 | 多选（行业/角色）、评分 |

---

> 下一份交付物：任务三 · AI 提示词库（7 个 Agent 完整 Prompt）。
