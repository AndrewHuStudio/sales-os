// 复盘 - 每日活动折线（简化）
// 行数目标：≤100
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { REVIEW_METRICS } from '@/lib/data/review';

export function DailyTrend() {
  const last7 = REVIEW_METRICS.slice(0, 7).reverse();
  const max = Math.max(...last7.map(m => m.visits));
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">最近 7 天活动</CardTitle>
          <Badge variant="outline" className="text-[10px]">折线图占位</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 h-32 items-end">
          {last7.map(m => (
            <div key={m.date} className="flex flex-col items-center gap-1">
              <div className="w-full flex flex-col items-center justify-end h-24 gap-0.5">
                <div
                  className="w-full rounded-t bg-gradient-to-t from-primary to-cyan-500"
                  style={{ height: `${(m.visits / max) * 100}%`, minHeight: m.visits > 0 ? '4px' : '0' }}
                  title={`${m.visits} 拜访`}
                />
                <div
                  className="w-full rounded-t bg-gradient-to-t from-warning to-yellow-400"
                  style={{ height: `${(m.demos / max) * 100}%`, minHeight: m.demos > 0 ? '4px' : '0' }}
                  title={`${m.demos} Demo`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{m.date.slice(5)}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-primary" />拜访</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-sm bg-warning" />Demo</span>
        </div>
      </CardContent>
    </Card>
  );
}
