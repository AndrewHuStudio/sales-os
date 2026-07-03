// 今日路线面板 - 顶部 KPI + 总览
// 行数目标：≤120
'use client';
import { Navigation, Target, TrendingUp, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import type { TodayRoute } from '@/types';
import type { RouteData } from '@/app/api/maps/route/route';

interface Props {
  route: TodayRoute;
  realRoute: RouteData | null;
}

export function TodayRouteHeader({ route, realRoute }: Props) {
  // 优先显示真实路线，否则用 mock 总数
  const km = realRoute ? (realRoute.distance / 1000).toFixed(1) : route.totalDistance.toFixed(1);
  const min = realRoute?.duration ?? route.totalDuration;
  const isLive = !!realRoute;
  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5" />
      <CardContent className="relative p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="default" className="gap-1">
                <Sparkles className="h-3 w-3" />AI 已规划路线
              </Badge>
              {isLive ? (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <MapPin className="h-3 w-3" />腾讯实时路线
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-[10px] text-zinc-500">
                  <Loader2 className="h-3 w-3" />路线计算中
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">{formatDate(route.date)} 周四</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">今日 3 站 · {km} km · {min} 分钟</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              从 <span className="font-medium text-foreground">{route.startPoint.name}</span> 出发
              {realRoute?.traffic_light_count !== undefined && (
                <span className="text-xs text-zinc-500">· {realRoute.traffic_light_count} 个红绿灯</span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <KPIBox icon={<Target className="h-4 w-4" />} label="拜访目标" value={`${route.kpiTarget.visits} 家`} />
            <KPIBox icon={<TrendingUp className="h-4 w-4" />} label="商机目标" value={`${route.kpiTarget.opportunities} 个`} />
            <KPIBox icon={<Navigation className="h-4 w-4" />} label="签单目标" value={`${route.kpiTarget.revenue} 万`} />
            <Button variant="gradient" size="lg" className="shadow-glow">
              <Navigation className="h-4 w-4" />开始今日路线
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KPIBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card/60 px-4 py-2 min-w-[100px]">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-0.5">
        {icon}{label}
      </div>
      <div className="text-lg font-bold text-foreground">{value}</div>
    </div>
  );
}
