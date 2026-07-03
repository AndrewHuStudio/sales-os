// 销售复盘页
// 行数目标：≤30
import { KPISummary } from '@/components/review/KPISummary';
import { WinLossAnalysis } from '@/components/review/WinLossAnalysis';
import { DailyTrend } from '@/components/review/DailyTrend';
import { REVIEW_SUMMARY } from '@/lib/data/review';

export default function ReviewPage() {
  const items = [
    { label: '拜访数', this: REVIEW_SUMMARY.thisWeek.visits, last: REVIEW_SUMMARY.lastWeek.visits },
    { label: 'Demo 数', this: REVIEW_SUMMARY.thisWeek.demos, last: REVIEW_SUMMARY.lastWeek.demos },
    { label: '商机数', this: REVIEW_SUMMARY.thisWeek.opportunities, last: REVIEW_SUMMARY.lastWeek.opportunities },
    { label: '签单金额', this: REVIEW_SUMMARY.thisWeek.revenue, last: REVIEW_SUMMARY.lastWeek.revenue, unit: '万' },
  ];
  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">销售复盘</h1>
        <p className="text-sm text-muted-foreground">本周表现 · 胜败归因 · 下周重点</p>
      </div>
      <KPISummary items={items} />
      <DailyTrend />
      <WinLossAnalysis />
    </div>
  );
}
