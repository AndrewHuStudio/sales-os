// 销售复盘页
// 行数目标：≤30
import { KPISummary } from '@/components/review/KPISummary';
import { WinLossAnalysis } from '@/components/review/WinLossAnalysis';
import { DailyTrend } from '@/components/review/DailyTrend';
import { getReview } from '@/lib/backend-api';

export default async function ReviewPage() {
  const review = await getReview();
  const items = [
    { label: '拜访数', this: review.summary.thisWeek.visits, last: review.summary.lastWeek.visits },
    { label: 'Demo 数', this: review.summary.thisWeek.demos, last: review.summary.lastWeek.demos },
    { label: '商机数', this: review.summary.thisWeek.opportunities, last: review.summary.lastWeek.opportunities },
    { label: '签单金额', this: review.summary.thisWeek.revenue, last: review.summary.lastWeek.revenue, unit: '万' },
  ];
  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">销售复盘</h1>
        <p className="text-sm text-muted-foreground">本周表现 · 胜败归因 · 下周重点</p>
      </div>
      <KPISummary items={items} />
      <DailyTrend metrics={review.metrics} />
      <WinLossAnalysis summary={review.summary} />
    </div>
  );
}
