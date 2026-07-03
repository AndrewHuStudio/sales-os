// AI 销售建议 - 基于今日客户画像
// 行数目标：≤80
'use client';
import { Sparkles, Bot } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function AIRecommendation({ advice }: { advice: string }) {
  // 把建议按句号拆成段
  const points = advice.split(/[。]/).filter(s => s.trim().length > 0);
  return (
    <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-cyan-500/5 to-transparent">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-hero">
              <Bot className="h-4 w-4 text-white" />
            </div>
            AI 销售教练建议
          </CardTitle>
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" />基于 40 家客户画像
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2.5">
          {points.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-foreground/90">{p.trim()}。</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
