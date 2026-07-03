'use client';
import { useEffect, useState } from 'react';
import { TodayRouteHeader } from '@/components/dashboard/TodayRouteHeader';
import { VisitCard } from '@/components/dashboard/VisitCard';
import { RouteMiniMap } from '@/components/dashboard/RouteMiniMap';
import { AIRecommendation } from '@/components/dashboard/AIRecommendation';
import { TodayStats } from '@/components/dashboard/TodayStats';
import { useRoute } from '@/hooks/useTencentMap';
import { TODAY_ROUTE } from '@/lib/data/route';
import type { TodayRoute } from '@/types';

export default function DashboardPage() {
  const [route, setRoute] = useState<TodayRoute>(TODAY_ROUTE);
  const { data: realRoute, plan } = useRoute();

  useEffect(() => {
    const sp = TODAY_ROUTE.startPoint;
    const wps = TODAY_ROUTE.stops.map(s => ({ lat: s.company.lat, lng: s.company.lng }));
    const last = wps[wps.length - 1];
    if (!last) return;
    void plan({ lat: sp.lat, lng: sp.lng }, last, wps.slice(0, -1), 'driving');
  }, [plan]);

  const handleStart = (companyId: string) => {
    setRoute(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.company.id === companyId ? { ...s, status: 'in_progress' as const } : s),
    }));
  };

  const handleComplete = (companyId: string) => {
    setRoute(prev => ({
      ...prev,
      stops: prev.stops.map(s => s.company.id === companyId ? { ...s, status: 'done' as const } : s),
    }));
  };

  return (
    <div className="space-y-6 p-4 md:p-6 animate-fade-in">
      <TodayRouteHeader route={route} realRoute={realRoute ?? null} />
      <TodayStats />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            🎯 今日拜访清单
            <span className="text-[10px] font-normal">按地理位置 + 优先级 AI 排序</span>
          </h2>
          <div className="space-y-4">
            {route.stops.map(stop => (
              <VisitCard key={stop.company.id} stop={stop} onStart={handleStart} onComplete={handleComplete} />
            ))}
          </div>
          <AIRecommendation advice={route.aiAdvice} />
        </div>
        <div className="space-y-4">
          <RouteMiniMap route={route} realPath={realRoute?.path} />
        </div>
      </div>
    </div>
  );
}
