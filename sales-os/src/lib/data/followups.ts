// 跟进记录
// 行数目标：≤200
import type { Followup } from '@/types';

const ago = (h: number) => new Date(Date.now() - h * 3600000).toISOString();
const later = (h: number) => new Date(Date.now() + h * 3600000).toISOString();

export const FOLLOWUPS: Followup[] = [
  {
    id: 'fu-01', companyId: 'ns-01', contactId: 'ct-01',
    type: '拜访', direction: 'outbound', happenedAt: ago(48),
    summary: '瀚云智联 CEO 对 WorkBuddy Agent 编排非常感兴趣，特别是行业模板复用。',
    nextStep: '准备 POC 方案 + 客户行业案例', nextAt: later(24),
    ownerName: '时利', mood: '正面',
  },
  {
    id: 'fu-02', companyId: 'ns-02', contactId: 'ct-02',
    type: '会议', direction: 'outbound', happenedAt: ago(72),
    summary: '深海跨境 TRTC 东南亚延迟测试，从 1.8s 降到 0.8s，客户惊呼。',
    nextStep: '商务谈判 + 合同条款', nextAt: later(6),
    ownerName: '时利', mood: '正面',
  },
  {
    id: 'fu-03', companyId: 'ns-03', contactId: 'ct-03',
    type: '电话', direction: 'outbound', happenedAt: ago(24),
    summary: '汇金通 CTO 提出合规优先，需要私有化部署方案。',
    nextStep: '约下周二实地拜访 + 拉合规架构师', nextAt: later(48),
    ownerName: '时利', mood: '中性',
  },
  {
    id: 'fu-04', companyId: 'ns-04', contactId: 'ct-04',
    type: 'Demo', direction: 'outbound', happenedAt: ago(120),
    summary: '影游互娱 Demo 全场鼓掌，剧本生成从 2 周降到 2 天。',
    nextStep: '方案 + 报价', nextAt: later(72),
    ownerName: '时利', mood: '正面',
  },
  {
    id: 'fu-05', companyId: 'ft-05', contactId: 'ct-05',
    type: '微信', direction: 'inbound', happenedAt: ago(6),
    summary: '保查儿（香港）主动询问混元大模型跨境合规方案。',
    nextStep: '提供合规白皮书 + 案例', nextAt: later(12),
    ownerName: '时利', mood: '正面',
  },
  {
    id: 'fu-06', companyId: 'ns-05', contactId: 'ct-06',
    type: '邮件', direction: 'outbound', happenedAt: ago(168),
    summary: '漫剧 AI 反馈 TTS 配音效果不错，但视频渲染成本仍高。',
    nextStep: '云渲染 POC', nextAt: later(96),
    ownerName: '时利', mood: '中性',
  },
  {
    id: 'fu-07', companyId: 'ft-01', contactId: 'ct-07',
    type: '拜访', direction: 'outbound', happenedAt: ago(240),
    summary: '华兴证券提出高管路线，准备约董事长。',
    nextStep: '约董事长时间', nextAt: later(168),
    ownerName: '时利', mood: '正面',
  },
  {
    id: 'fu-08', companyId: 'lh2-01', contactId: 'ct-08',
    type: '电话', direction: 'outbound', happenedAt: ago(360),
    summary: '超级 MCN 数字人主播需求强烈，价格敏感。',
    nextStep: '提供阶梯报价', nextAt: later(120),
    ownerName: '时利', mood: '中性',
  },
  {
    id: 'fu-09', companyId: 'lg-01', contactId: 'ct-09',
    type: 'Demo', direction: 'outbound', happenedAt: ago(720),
    summary: '机器人谷 Demo 客户满意，谈到云渲染远程操控。',
    nextStep: 'POC 试点一台设备', nextAt: later(240),
    ownerName: '时利', mood: '正面',
  },
  {
    id: 'fu-10', companyId: 'ns-08', contactId: 'ct-10',
    type: '拜访', direction: 'outbound', happenedAt: ago(1000),
    summary: '丰年互动嘀觅产品增长放缓，决策人观望 TRTC 替代方案。',
    nextStep: 'TRTC 接入 Demo', nextAt: later(720),
    ownerName: '时利', mood: '中性',
  },
];

export const getFollowupsByCompany = (companyId: string) =>
  FOLLOWUPS.filter(f => f.companyId === companyId).sort(
    (a, b) => new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime()
  );
