'use client';

import { useEffect } from 'react';
import { Navigation, Clock, MapPin, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRoute } from '@/hooks/useTencentMap';
import type { LatLng } from '@/types/maps';

interface Props {
  from: LatLng;
  to: LatLng;
  waypoints?: LatLng[];
  mode?: 'driving' | 'walking' | 'bicycling';
  showPolyline?: boolean; // 是否在控制台打印 path
}

export function RouteBadge({ from, to, waypoints = [], mode = 'driving' }: Props) {
  const { data, loading, from: src, plan } = useRoute();

  useEffect(() => {
    plan(from, to, waypoints, mode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.lat, from.lng, to.lat, to.lng, mode]);

  if (loading) {
    return (
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-3 flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin" /> 正在规划路线…
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const km = (data.distance / 1000).toFixed(1);
  const min = data.duration;
  const modeLabel = { driving: '驾车', walking: '步行', bicycling: '骑行' }[mode];

  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold">{modeLabel}路线</span>
            <Badge variant="secondary" className="text-[10px]">
              {src === 'tencent-map' ? '腾讯实时' : '离线估算'}
            </Badge>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold">{km}<span className="text-xs font-normal text-zinc-500">km</span></div>
            <div className="text-[10px] text-zinc-500">距离</div>
          </div>
          <div>
            <div className="text-lg font-bold">{min}<span className="text-xs font-normal text-zinc-500">min</span></div>
            <div className="text-[10px] text-zinc-500 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" />用时
            </div>
          </div>
          <div>
            <div className="text-lg font-bold">{data.traffic_light_count ?? '-'}</div>
            <div className="text-[10px] text-zinc-500">红绿灯</div>
          </div>
        </div>
        {data.toll !== undefined && data.toll > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-3 h-3" />
            预计过路费 ¥{data.toll}
          </div>
        )}
        {waypoints.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <MapPin className="w-3 h-3" />
            途经 {waypoints.length} 个点 · 共 {data.steps_count} 段
          </div>
        )}
      </CardContent>
    </Card>
  );
}
