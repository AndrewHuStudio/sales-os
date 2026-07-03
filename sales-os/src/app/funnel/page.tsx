// 销售漏斗页
// 行数目标：≤25
import { FunnelChart } from '@/components/funnel/FunnelChart';
import { FunnelKPI } from '@/components/funnel/FunnelKPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FUNNEL_STATS, FUNNEL_TOTAL } from '@/lib/data/funnel';

export default function FunnelPage() {
  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">销售漏斗</h1>
        <p className="text-sm text-muted-foreground">线索 → 签约全流程分析 · 阶段转化与金额分布</p>
      </div>
      <FunnelKPI />
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">阶段漏斗</CardTitle>
            <Badge variant="outline" className="text-[10px]">截止今日</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <FunnelChart stats={FUNNEL_STATS} total={FUNNEL_TOTAL.totalLeads} />
        </CardContent>
      </Card>
    </div>
  );
}
