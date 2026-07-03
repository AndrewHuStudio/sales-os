// 拜访卡 - 单个客户拜访任务
// 行数目标：≤150
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn, formatDate } from '@/lib/utils';
import type { RouteStop } from '@/types';

interface Props {
  stop: RouteStop;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
}

const STATUS_STYLE = {
  pending: { label: '待拜访', variant: 'muted' as const, dot: 'bg-muted-foreground' },
  in_progress: { label: '进行中', variant: 'warning' as const, dot: 'bg-warning animate-pulse' },
  done: { label: '已完成', variant: 'success' as const, dot: 'bg-success' },
  skipped: { label: '已跳过', variant: 'destructive' as const, dot: 'bg-destructive' },
};

export function VisitCard({ stop, onStart, onComplete }: Props) {
  const router = useRouter();
  const { company, order } = stop;
  const style = STATUS_STYLE[stop.status];

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/map?company=${company.id}`)}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/map?company=${company.id}`); }}
      className={cn('group relative overflow-hidden cursor-pointer transition-all hover:shadow-glow', stop.status === 'in_progress' && 'ring-2 ring-primary')}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-hero" />
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold', company.tier === 'A' ? 'bg-primary text-primary-foreground' : company.tier === 'B' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground')}>
              {order}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                <h3 className="text-base font-bold leading-tight">{company.shortName}</h3>
                <Badge variant={company.tier === 'A' ? 'success' : company.tier === 'B' ? 'warning' : 'muted'} className="text-[10px]">
                  {company.tier} 类
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{company.industry} · {company.headcount} 人 · {company.fundingRound || '未融资'}</p>
            </div>
          </div>
          <Badge variant={style.variant} className="gap-1">
            <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
            {style.label}
          </Badge>
        </div>

        <div className="rounded-lg bg-muted/40 p-3 mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
            <Clock className="h-3 w-3" />
            <span>预计 {formatDate(stop.estimatedArrival, true)} 到达</span>
            <span className="text-border">|</span>
            <span>停留 {stop.estimatedDuration} 分钟</span>
            {stop.travelFromPrev > 0 && (
              <>
                <span className="text-border">|</span>
                <Navigation className="h-3 w-3" />
                <span>距上一站 {stop.travelFromPrev} km / {stop.travelTime} 分钟</span>
              </>
            )}
          </div>
          <div className="text-xs leading-relaxed">
            <span className="font-medium text-foreground">拜访理由：</span>
            <span className="text-muted-foreground">{stop.reason}</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground">WorkBuddy 适配度</span>
            <span className="font-bold text-primary">{company.score} 分</span>
          </div>
          <Progress value={company.score} className="h-1.5" />
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/company/${company.id}`} className="flex-1" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="w-full">
              <MapPin className="h-3 w-3" />查看作战卡
            </Button>
          </Link>
          {stop.status === 'pending' && (
            <Button variant="gradient" size="sm" onClick={(e) => { e.stopPropagation(); onStart?.(stop.company.id); }}>
              出发
            </Button>
          )}
          {stop.status === 'in_progress' && (
            <Button variant="default" size="sm" onClick={(e) => { e.stopPropagation(); onComplete?.(stop.company.id); }}>
              <CheckCircle2 className="h-3 w-3" />完成拜访
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
