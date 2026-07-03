// 复盘胜败分析
// 行数目标：≤80
'use client';
import { ThumbsUp, ThumbsDown, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { REVIEW_SUMMARY } from '@/lib/data/review';

export function WinLossAnalysis() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-success">
            <ThumbsUp className="h-4 w-4" />赢单关键
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {REVIEW_SUMMARY.topWinReasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold">{i + 1}</span>
                <span className="text-foreground/90 leading-relaxed">{r}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-destructive">
            <ThumbsDown className="h-4 w-4" />失单反思
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {REVIEW_SUMMARY.topLossReasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">{i + 1}</span>
                <span className="text-foreground/90 leading-relaxed">{r}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-cyan-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-primary">
            <Lightbulb className="h-4 w-4" />下周重点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm">
            {REVIEW_SUMMARY.nextWeekFocus.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
                <span className="text-foreground/90 leading-relaxed">{r}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
