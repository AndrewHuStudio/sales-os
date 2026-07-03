'use client';

import { useEffect } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useIPLoc } from '@/hooks/useTencentMap';
import type { LatLng } from '@/types/maps';

interface Props {
  onLocate?: (loc: LatLng, city: string) => void;
}

/**
 * IP 定位组件 - 启动时自动定位
 * 调用 /api/maps/ip-loc
 */
export function LocationPin({ onLocate }: Props) {
  const { data, loading, from, locate } = useIPLoc();

  useEffect(() => {
    locate();
  }, [locate]);

  useEffect(() => {
    if (data && onLocate) {
      onLocate(data.location, data.ad_info.city);
    }
  }, [data, onLocate]);

  if (loading) {
    return (
      <Badge variant="secondary" className="text-[10px] gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> 定位中…
      </Badge>
    );
  }
  if (!data) return null;

  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-3 flex items-center gap-2">
        <div className="p-1.5 rounded-full bg-blue-50 dark:bg-blue-950">
          <MapPin className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">
            {data.ad_info.city}
            {data.ad_info.district && ` · ${data.ad_info.district}`}
          </div>
          <div className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {data.location.lat.toFixed(4)}, {data.location.lng.toFixed(4)}
            <Badge variant="secondary" className="text-[9px] ml-1">
              {from === 'tencent-map' ? '腾讯 IP' : '默认'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
