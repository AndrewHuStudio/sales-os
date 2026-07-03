'use client';

import { useState } from 'react';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { usePOISearch } from '@/hooks/useTencentMap';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { TMapPOI } from '@/types/maps';

interface Props {
  onPick?: (poi: TMapPOI) => void;
  placeholder?: string;
}

export function AddressSearch({ onPick, placeholder = '搜索深圳商区、公司、地标…' }: Props) {
  const [q, setQ] = useState('');
  const { data, loading, from, search } = usePOISearch();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) search(q.trim());
  };

  return (
    <div className="space-y-2">
      <form onSubmit={submit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 h-9 rounded-lg border border-zinc-200 dark:border-zinc-800
                       bg-white dark:bg-zinc-950 text-sm
                       focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-200"
          />
          {q && (
            <button type="button" onClick={() => setQ('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button type="submit" disabled={!q.trim() || loading}
          className="px-4 h-9 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900
                     text-sm font-medium disabled:opacity-50 flex items-center gap-1">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          搜索
        </button>
      </form>

      {data && (
        <Card className="border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-2">
            <div className="flex items-center gap-2 mb-2 px-2 pt-1">
              <Badge variant="secondary" className="text-[10px]">
                {from === 'tencent-map' ? '腾讯地图' : '离线 Mock'}
              </Badge>
              <span className="text-xs text-zinc-500">{data.length} 个结果</span>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {data.map(poi => (
                <button key={poi.id} onClick={() => onPick?.(poi)}
                  className="w-full text-left p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 transition flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-zinc-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{poi.title}</div>
                    <div className="text-xs text-zinc-500 truncate">{poi.address}</div>
                  </div>
                  {poi._distance !== undefined && (
                    <span className="text-xs text-zinc-400 flex-shrink-0">
                      {(poi._distance / 1000).toFixed(1)}km
                    </span>
                  )}
                </button>
              ))}
              {data.length === 0 && (
                <div className="text-center text-xs text-zinc-400 py-4">无结果</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
