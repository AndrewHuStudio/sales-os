'use client';

import { useEffect, useState } from 'react';
import { MapPin, Loader2, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeocode } from '@/hooks/useTencentMap';

interface Props {
  address: string;
  city?: string;
  /** 已传坐标时直接展示，不调 API */
  coords?: { lat: number; lng: number };
}

/**
 * 地址 → 坐标 解析卡片
 * 调用 /api/maps/geocode
 */
export function CoordTag({ address, city = '深圳', coords }: Props) {
  const { data, loading, from, geocode } = useGeocode();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!coords) geocode(address, city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, city, coords?.lat, coords?.lng]);

  const loc = coords ?? data?.location;
  if (loading || !loc) {
    return (
      <Badge variant="secondary" className="text-[10px] gap-1">
        <Loader2 className="w-3 h-3 animate-spin" /> 解析地址…
      </Badge>
    );
  }

  const copy = () => {
    navigator.clipboard.writeText(`${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Card className="border-zinc-200 dark:border-zinc-800">
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-rose-500" />
          <span className="text-xs font-medium truncate flex-1">{address}</span>
          <Badge variant="secondary" className="text-[9px]">
            {from === 'tencent-map' ? '腾讯' : '离线'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <span>lat {loc.lat.toFixed(6)}</span>
          <span>lng {loc.lng.toFixed(6)}</span>
          <button onClick={copy}
            className="ml-auto p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition">
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
        {data?.ad_info?.district && (
          <div className="text-[10px] text-zinc-500">
            所属：{data.ad_info.province} · {data.ad_info.city} · {data.ad_info.district}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
