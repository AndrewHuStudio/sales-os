// 路线小地图 - SVG 简化版（不依赖 maplibre，启动快）
// 行数目标：≤150
'use client';
import { useMemo } from 'react';
import { MapPin, Navigation, Route as RouteIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { TodayRoute } from '@/types';
import type { LatLng } from '@/types/maps';

interface Props {
  route: TodayRoute;
  /** 来自腾讯地图 BFF 解压后的真实路线 */
  realPath?: LatLng[];
}

function project(lng: number, lat: number, minLng: number, maxLng: number, minLat: number, maxLat: number) {
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * 100,
    y: 100 - ((lat - minLat) / (maxLat - minLat)) * 100,
  };
}

export function RouteMiniMap({ route, realPath }: Props) {
  const { stops, startPoint } = route;
  // 计算投影范围：优先用真实路径，否则用站点
  const allPoints = realPath && realPath.length > 0
    ? [startPoint, ...realPath]
    : [startPoint, ...stops.map(s => ({ lng: s.company.lng, lat: s.company.lat }))];
  const lngs = allPoints.map(p => p.lng);
  const lats = allPoints.map(p => p.lat);
  const minLng = Math.min(...lngs) - 0.01;
  const maxLng = Math.max(...lngs) + 0.01;
  const minLat = Math.min(...lats) - 0.01;
  const maxLat = Math.max(...lats) + 0.01;

  const start = project(startPoint.lng, startPoint.lat, minLng, maxLng, minLat, maxLat);
  const points = useMemo(
    () => stops.map(s => ({ ...s, pos: project(s.company.lng, s.company.lat, minLng, maxLng, minLat, maxLat) })),
    [stops, minLng, maxLng, minLat, maxLat]
  );

  // 路线 path：真实路径优先（曲线），否则直线
  const pathD = useMemo(() => {
    if (realPath && realPath.length > 1) {
      const segs = realPath.map(p => {
        const q = project(p.lng, p.lat, minLng, maxLng, minLat, maxLat);
        return `${q.x.toFixed(2)},${q.y.toFixed(2)}`;
      });
      return `M ${segs.join(' L ')}`;
    }
    return [`M ${start.x} ${start.y}`, ...points.map(p => `L ${p.pos.x} ${p.pos.y}`)].join(' ');
  }, [realPath, start, points, minLng, maxLng, minLat, maxLat]);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Navigation className="h-4 w-4 text-primary" />
            今日路线
          </CardTitle>
          <Badge variant="muted" className="text-[10px] gap-1">
            {realPath ? <><RouteIcon className="h-3 w-3" />腾讯实时</> : '直线估算'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 via-cyan-50 to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <svg className="absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.2" className="text-muted-foreground" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0052D9" />
                <stop offset="100%" stopColor="#00C7BE" />
              </linearGradient>
            </defs>
            <path
              d={pathD}
              fill="none"
              stroke="url(#routeGradient)"
              strokeWidth="0.8"
              strokeDasharray={realPath ? undefined : '2,1'}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="absolute" style={{ left: `${start.x}%`, top: `${start.y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-slate-700 px-1.5 py-0.5 text-[8px] font-medium text-white">起点</div>
              <MapPin className="h-4 w-4 text-slate-700 -mt-0.5" />
            </div>
          </div>
          {points.map((p, i) => (
            <div
              key={p.company.id}
              className="absolute group"
              style={{ left: `${p.pos.x}%`, top: `${p.pos.y}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-background shadow-glow',
                p.status === 'done' ? 'bg-success text-white' :
                p.status === 'in_progress' ? 'bg-primary text-white animate-pulse-soft' :
                'bg-white text-primary'
              )}>
                {p.order}
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap rounded bg-foreground/90 px-1.5 py-0.5 text-[9px] font-medium text-background opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {p.company.shortName} · {p.company.score}分
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 space-y-1.5">
          {stops.map(s => (
            <div key={s.company.id} className="flex items-center gap-2 text-xs">
              <span className={cn('h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                s.status === 'done' ? 'bg-success text-white' :
                s.status === 'in_progress' ? 'bg-primary text-white' :
                'bg-muted text-muted-foreground'
              )}>
                {s.order}
              </span>
              <span className="font-medium">{s.company.shortName}</span>
              <span className="text-muted-foreground">· {s.company.industry}</span>
              <span className="ml-auto text-primary font-mono">{s.company.score} 分</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
