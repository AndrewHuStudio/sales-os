// 客户详情 - 痛点与 WB 适配
// 行数目标：≤80
'use client';
import { AlertCircle, Lightbulb, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function PainAndFit({ painPoints, wbFit }: { painPoints: string[]; wbFit: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />痛点 × WorkBuddy 适配
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-destructive mb-2">
            <AlertCircle className="h-3.5 w-3.5" />客户核心痛点
          </div>
          <div className="space-y-1.5">
            {painPoints.map((p, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="text-destructive font-bold shrink-0">{i + 1}.</span>
                <span className="text-foreground/90">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-cyan-500/5 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
            <Lightbulb className="h-3.5 w-3.5" />WorkBuddy 适配理由
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">{wbFit}</p>
        </div>
      </CardContent>
    </Card>
  );
}
