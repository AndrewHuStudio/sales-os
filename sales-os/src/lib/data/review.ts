// 销售复盘指标
// 行数目标：≤100
import type { ReviewMetric } from '@/types';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export const REVIEW_METRICS: ReviewMetric[] = [
  { date: daysAgo(13), visits: 2, demos: 1, opportunities: 0, revenue: 0,  winRate: 0 },
  { date: daysAgo(12), visits: 3, demos: 1, opportunities: 1, revenue: 0,  winRate: 0 },
  { date: daysAgo(11), visits: 1, demos: 0, opportunities: 0, revenue: 0,  winRate: 0 },
  { date: daysAgo(10), visits: 4, demos: 2, opportunities: 1, revenue: 0,  winRate: 0 },
  { date: daysAgo(9),  visits: 3, demos: 1, opportunities: 0, revenue: 0,  winRate: 0 },
  { date: daysAgo(8),  visits: 2, demos: 1, opportunities: 1, revenue: 0,  winRate: 0 },
  { date: daysAgo(7),  visits: 3, demos: 2, opportunities: 2, revenue: 0,  winRate: 0 },
  { date: daysAgo(6),  visits: 4, demos: 2, opportunities: 1, revenue: 0,  winRate: 0 },
  { date: daysAgo(5),  visits: 2, demos: 1, opportunities: 1, revenue: 30, winRate: 100 },
  { date: daysAgo(4),  visits: 3, demos: 1, opportunities: 0, revenue: 0,  winRate: 0 },
  { date: daysAgo(3),  visits: 5, demos: 3, opportunities: 2, revenue: 50, winRate: 50 },
  { date: daysAgo(2),  visits: 4, demos: 2, opportunities: 1, revenue: 0,  winRate: 0 },
  { date: daysAgo(1),  visits: 3, demos: 1, opportunities: 1, revenue: 0,  winRate: 0 },
  { date: daysAgo(0),  visits: 0, demos: 0, opportunities: 0, revenue: 0,  winRate: 0 },
];

export const REVIEW_SUMMARY = {
  thisWeek: { visits: 21, demos: 11, opportunities: 7, revenue: 80, winRate: 28 },
  lastWeek: { visits: 17, demos: 8,  opportunities: 4, revenue: 30, winRate: 25 },
  monthToDate: { visits: 73, demos: 35, opportunities: 18, revenue: 250, winRate: 31 },
  topWinReasons: [
    '决策人路线明确（董事长 / CTO 直接对接）',
    'Demo 中延迟数字冲击力强（< 1s）',
    '合规方案完整（私有化 + 国密）',
  ],
  topLossReasons: [
    '价格敏感型客户，未提供阶梯报价',
    '竞品已签长约（Agora / 声网）',
    '客户预算冻结，决策推迟到 Q4',
  ],
  nextWeekFocus: [
    '重点突破 3 个 A 类金融客户（合规包）',
    '建立数字人主播阶梯报价模板',
    '完成瀚云智联 POC 启动',
  ],
};
