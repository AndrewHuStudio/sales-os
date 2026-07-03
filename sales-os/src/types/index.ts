// 项目全部 TS 类型定义（叶子模块，零依赖）
// 行数目标：≤200

export type CompanyTier = 'A' | 'B' | 'C';
export type CompanyStatus = 'prospecting' | 'contacted' | 'demo' | 'negotiation' | 'won' | 'lost';
export type FunnelStage = 'lead' | 'qualified' | 'demo' | 'proposal' | 'negotiation' | 'closed';

export interface ScoreBreakdown {
  industry: number;       // 行业适配 0-100
  scale: number;          // 企业规模 0-100
  budget: number;         // 预算明确度 0-100
  urgency: number;        // 紧迫性 0-100
  decisionMaker: number;  // 决策人清晰度 0-100
  techMatch: number;      // 技术匹配度 0-100
  competition: number;    // 竞争格局 0-100
  caseStudy: number;      // 案例背书 0-100
}

export interface Company {
  id: string;
  name: string;
  shortName: string;
  industry: string;
  tier: CompanyTier;
  status: CompanyStatus;
  score: number;          // 总分 0-100
  scoreBreakdown: ScoreBreakdown;
  districtId: string;
  address: string;
  lng: number;
  lat: number;
  headcount: number;
  revenue?: string;       // 年营收
  fundingRound?: string;
  homepage?: string;
  painPoints: string[];   // 业务痛点
  wbFit: string;          // WorkBuddy 适配理由
  lastContactAt?: string; // ISO
  nextActionAt?: string;
  ownerName: string;
  source: string;         // 客户来源
  tags: string[];
}

export interface District {
  id: string;
  name: string;
  shortName: string;
  description: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  companyCount: number;
  hotScore: number;       // 0-100
  characteristics: string[];
  targetIndustries: string[];
  businessTips: string;
}

export interface Contact {
  id: string;
  companyId: string;
  name: string;
  title: string;
  role: '决策人' | '影响人' | '使用者' | '信息门';
  phone?: string;
  wechat?: string;
  email?: string;
  influence: number;      // 1-10
  attitude: '支持' | '中立' | '观望' | '反对';
  notes?: string;
}

export interface Opportunity {
  id: string;
  companyId: string;
  title: string;
  stage: FunnelStage;
  amount: number;         // 万元
  probability: number;    // 0-100
  expectedCloseAt: string; // ISO
  products: string[];     // TRTC / CSS / 云渲染 / 混元 / WorkBuddy
  notes?: string;
}

export interface Followup {
  id: string;
  companyId: string;
  contactId?: string;
  type: '拜访' | '电话' | '微信' | '邮件' | '会议' | 'Demo' | '其他';
  direction: 'outbound' | 'inbound';
  happenedAt: string;     // ISO
  summary: string;
  nextStep?: string;
  nextAt?: string;
  ownerName: string;
  mood: '正面' | '中性' | '负面';
  attachments?: string[];
}

export interface SalesScript {
  companyId: string;
  opener: string;          // 开场白
  painHook: string;        // 痛点钩子
  valueProp: string;       // 价值主张
  objection: { q: string; a: string }[]; // 异议处理
  closeAsk: string;        // 收尾推进
}

export interface RouteStop {
  order: number;
  company: Company;
  estimatedArrival: string;
  estimatedDuration: number; // 分钟
  travelFromPrev: number;     // 公里
  travelTime: number;         // 分钟
  reason: string;
  status: 'pending' | 'in_progress' | 'done' | 'skipped';
}

export interface TodayRoute {
  date: string;
  startPoint: { name: string; address: string; lng: number; lat: number };
  totalDistance: number;  // km
  totalDuration: number;  // min
  stops: RouteStop[];
  aiAdvice: string;       // AI 销售建议
  kpiTarget: { visits: number; opportunities: number; revenue: number };
}

export interface FunnelStats {
  stage: FunnelStage;
  label: string;
  count: number;
  amount: number;         // 万元
  conversionFromPrev: number; // 0-100
}

export interface ReviewMetric {
  date: string;
  visits: number;
  demos: number;
  opportunities: number;
  revenue: number; // 万元
  winRate: number; // 0-100
}
