// 跟进统计
// 行数目标：≤80
'use client';
import { Calendar, TrendingUp, Smile, Frown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { FOLLOWUPS } from '@/lib/data/followups';

export function FollowupStats() {
  const total = FOLLOWUPS.length;
  const positive = FOLLOWUPS.filter(f => f.mood === '正面').length;
  const rate = Math.round((positive / total) * 100);
  const thisWeek = FOLLOWUPS.filter(f => {
    const d = new Date(f.happenedAt);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 7 * 24 * 3600 * 1000;
  }).length;
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat label="本周跟进" value={thisWeek} icon={<Calendar className="h-4 w-4" />} color="text-primary" />
      <Stat label="累计跟进" value={total} icon={<TrendingUp className="h-4 w-4" />} color="text-cyan-500" />
      <Stat label="正面反馈" value={positive} icon={<Smile className="h-4 w-4" />} color="text-success" />
      <Stat label="正面率" value={`${rate}%`} icon={<Frown className="h-4 w-4" />} color="text-warning" />
    </div>
  );
}

function Stat({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60 ${color} mb-2`}>{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{label}</div>
      </CardContent>
    </Card>
  );
}
