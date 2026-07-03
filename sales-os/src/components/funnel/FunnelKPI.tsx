// 漏斗顶部 KPI
// 行数目标：≤80
'use client';
import { Target, DollarSign, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FUNNEL_TOTAL } from '@/lib/data/funnel';

export function FunnelKPI() {
  const items = [
    { label: '总线索', value: FUNNEL_TOTAL.totalLeads, unit: '家', icon: <Target className="h-4 w-4" />, color: 'text-primary' },
    { label: '总金额', value: FUNNEL_TOTAL.totalAmount, unit: '万', icon: <DollarSign className="h-4 w-4" />, color: 'text-cyan-500' },
    { label: '赢率', value: FUNNEL_TOTAL.winRate, unit: '%', icon: <Award className="h-4 w-4" />, color: 'text-success' },
    { label: '平均成交', value: FUNNEL_TOTAL.avgDealSize, unit: '万', icon: <TrendingUp className="h-4 w-4" />, color: 'text-warning' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(it => (
        <Card key={it.label}>
          <CardContent className="p-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 ${it.color} mb-2`}>
              {it.icon}
            </div>
            <div className="text-2xl font-bold">
              {it.value}<span className="text-sm text-muted-foreground ml-1">{it.unit}</span>
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{it.label}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
