// 销售地图页
// 行数目标：≤30
'use client';
import dynamic from 'next/dynamic';
import { AddressSearch } from '@/components/maps/AddressSearch';
import { LocationPin } from '@/components/maps/LocationPin';
import { Compass } from 'lucide-react';

const SalesMap = dynamic(
  () => import('@/components/map/SalesMap').then(m => m.SalesMap),
  { ssr: false, loading: () => <div className="h-[calc(100vh-4rem)] flex items-center justify-center text-muted-foreground">地图加载中…</div> }
);

export default function MapPage() {
  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b bg-background/95 backdrop-blur space-y-3">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary" />
          <h1 className="text-lg font-semibold">销售地图</h1>
          <span className="text-xs text-muted-foreground">· 8 商区 · 40 企业 · 腾讯地图实时驱动</span>
        </div>
        <AddressSearch onPick={(poi) => {
          // 触发 SalesMap 飞到该位置
          window.dispatchEvent(new CustomEvent('fly-to-poi', { detail: poi }));
        }} />
        <LocationPin onLocate={(loc, city) => {
          // 初始化地图中心
          window.dispatchEvent(new CustomEvent('set-my-location', { detail: { ...loc, city } }));
        }} />
      </div>
      <div className="flex-1">
        <SalesMap />
      </div>
    </div>
  );
}
