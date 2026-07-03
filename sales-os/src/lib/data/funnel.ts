// 销售漏斗
// 行数目标：≤100
import type { FunnelStats, FunnelStage } from '@/types';

export const FUNNEL_STATS: FunnelStats[] = [
  { stage: 'lead',        label: '线索',     count: 40,  amount: 0,     conversionFromPrev: 100 },
  { stage: 'qualified',   label: '已验证',   count: 18,  amount: 320,   conversionFromPrev: 45 },
  { stage: 'demo',        label: 'Demo',     count: 9,   amount: 480,   conversionFromPrev: 50 },
  { stage: 'proposal',    label: '方案',     count: 5,   amount: 380,   conversionFromPrev: 56 },
  { stage: 'negotiation', label: '商务谈判', count: 3,   amount: 220,   conversionFromPrev: 60 },
  { stage: 'closed',      label: '已签约',   count: 1,   amount: 80,    conversionFromPrev: 33 },
];

export const FUNNEL_TOTAL = {
  totalLeads: 40,
  qualified: 18,
  demos: 9,
  proposals: 5,
  negotiations: 3,
  closed: 1,
  totalAmount: 1480,  // 万元
  winRate: 33,        // 谈判 → 签约
  avgDealSize: 80,
  salesCycle: 45,     // 天
};

export const STAGE_LABEL: Record<FunnelStage, string> = {
  lead: '线索', qualified: '已验证', demo: 'Demo',
  proposal: '方案', negotiation: '谈判', closed: '签约',
};
