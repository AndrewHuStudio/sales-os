// 今日数据统计 - 4 个指标卡
// 行数目标：≤100
'use client';
import { Users, FileText, TrendingUp, Trophy, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Metric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

const METRICS: Metric[] = [
  { label: '今日拜访', value: '3', delta: '2 家待办', trend: 'up', icon: <Users className="h-4 w-4" />, color: 'text-primary' },
  { label: '本周 Demo', value: '11', delta: '+38%', trend: 'up', icon: <FileText className="h-4 w-4" />, color: 'text-cyan-500' },
  { label: '进行中商机', value: '7', delta: '+3', trend: 'up', icon: <TrendingUp className="h-4 w-4" />, color: 'text-success' },
  { label: '本周签单', value: '80 万', delta: '+167%', trend: 'up', icon: <Trophy className="h-4 w-4" />, color: 'text-warning' },
];

export function TodayStats() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {METRICS.map(m => (
        <Card key={m.label} className="hover:shadow-soft transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60', m.color)}>
                {m.icon}
              </div>
              <div className={cn('flex items-center gap-0.5 text-xs font-medium', m.trend === 'up' ? 'text-success' : 'text-destructive')}>
                {m.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {m.delta}
              </div>
            </div>
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="text-xl font-bold mt-0.5">{m.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
