// 今日销售路线
// 行数目标：≤150
import type { TodayRoute } from '@/types';
import { COMPANIES } from './companies';

const todayISO = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const TODAY_ROUTE: TodayRoute = {
  date: new Date().toISOString().slice(0, 10),
  startPoint: {
    name: '腾讯大厦',
    address: '深圳市南山区深南大道 10000 号',
    lng: 113.9528,
    lat: 22.5431,
  },
  totalDistance: 18.4,
  totalDuration: 65,
  kpiTarget: { visits: 3, opportunities: 1, revenue: 50 },
  aiAdvice: '今日三站都是 A 类高潜客户，建议上午 10 点准时出发（避早高峰）。第一站瀚云智联是 B+ 融资的 AI Agent 平台客户，痛点与你上次 Demo 完全匹配，可直接推 WorkBuddy 行业模板；第二站汇金通是金融科技客户，建议带合规方案而非纯技术 demo；第三站深海跨境是已 Demo 客户，准备好合同收尾。',
  stops: [
    {
      order: 1,
      company: COMPANIES[0]!, // 瀚云智联
      estimatedArrival: todayISO(10, 30),
      estimatedDuration: 60,
      travelFromPrev: 0,
      travelTime: 0,
      reason: 'A 类 B+ 融资客户，痛点"Agent 协同成本高"与你上次 Demo 完美匹配',
      status: 'pending',
    },
    {
      order: 2,
      company: COMPANIES[2]!, // 汇金通
      estimatedArrival: todayISO(13, 0),
      estimatedDuration: 90,
      travelFromPrev: 5.2,
      travelTime: 18,
      reason: 'A 类金融科技客户，需带天御合规方案 + 私域 SCRM 案例',
      status: 'pending',
    },
    {
      order: 3,
      company: COMPANIES[1]!, // 深海跨境
      estimatedArrival: todayISO(15, 30),
      estimatedDuration: 60,
      travelFromPrev: 13.2,
      travelTime: 32,
      reason: 'A 类已 Demo 客户，准备合同收尾，60% 成本下降是核心钩子',
      status: 'pending',
    },
  ],
};
