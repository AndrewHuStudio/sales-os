// 复盘 KPI
// 行数目标：≤60
'use client';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Metric { label: string; this: number; last: number; unit?: string; }
interface Props { items: Metric[]; }

export function KPISummary({ items }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map(m => {
        const change = m.last === 0 ? 100 : Math.round(((m.this - m.last) / m.last) * 100);
        const up = change >= 0;
        return (
          <Card key={m.label}>
            <CardContent className="p-4">
              <div className="text-[10px] text-muted-foreground">{m.label}</div>
              <div className="text-2xl font-bold mt-0.5">
                {m.this}{m.unit && <span className="text-sm text-muted-foreground ml-1">{m.unit}</span>}
              </div>
              <div className={cn('mt-1 flex items-center gap-0.5 text-xs font-medium', up ? 'text-success' : 'text-destructive')}>
                {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {up ? '+' : ''}{change}% vs 上周
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
