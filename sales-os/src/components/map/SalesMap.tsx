// 销售地图主组件 - mapcn marker popup + 腾讯路线能力
// 行数目标：≤240
'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Building2, Clock, ExternalLink, MapPin, Navigation, Star, Users } from 'lucide-react';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MapPopup,
  MapRoute,
  type MapRef,
} from '@/components/ui/mapcn-marker-popup';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FALLBACK_BOOTSTRAP, getBootstrap } from '@/lib/backend-api';
import { getCompanyVerification, locationLabel, verificationLabel, type VerificationStatus } from '@/lib/data/company-verification';
import { SZ_CENTER } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useRoute } from '@/hooks/useTencentMap';
import type { Company, CompanyTier, District, TodayRoute } from '@/types';
import type { TMapPOI } from '@/types/maps';

const TIER_STYLE: Record<CompanyTier, { dot: string; ring: string; text: string; label: string }> = {
  A: { dot: 'bg-blue-600', ring: 'ring-blue-100', text: 'text-blue-600', label: 'A 类高潜' },
  B: { dot: 'bg-orange-500', ring: 'ring-orange-100', text: 'text-orange-600', label: 'B 类推进' },
  C: { dot: 'bg-slate-500', ring: 'ring-slate-100', text: 'text-slate-600', label: 'C 类培育' },
};

const INDUSTRY_IMAGE: Record<string, string> = {
  金融科技: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500&h=280&fit=crop',
  金融: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&h=280&fit=crop',
  电商直播: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=280&fit=crop',
  互动影游: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&h=280&fit=crop',
  'AI Agent 平台': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&h=280&fit=crop',
  元宇宙: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=280&fit=crop',
  'AI 漫剧': 'https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=500&h=280&fit=crop',
  'XR 内容': 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=280&fit=crop',
};

function companyImage(c: Company) {
  return INDUSTRY_IMAGE[c.industry] ?? 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=500&h=280&fit=crop';
}

function verificationVariant(status: VerificationStatus): 'success' | 'default' | 'warning' | 'destructive' | 'muted' {
  if (status === 'verified') return 'success';
  if (status === 'candidate') return 'default';
  if (status === 'ambiguous') return 'warning';
  if (status === 'unmatched') return 'destructive';
  return 'muted';
}

function routeToCoordinates(todayRoute: TodayRoute, path?: { lat: number; lng: number }[]): [number, number][] {
  if (path && path.length > 1) return path.map(p => [p.lng, p.lat]);
  return [
    [todayRoute.startPoint.lng, todayRoute.startPoint.lat],
    ...todayRoute.stops.map(s => [s.company.lng, s.company.lat] as [number, number]),
  ];
}

export function SalesMap() {
  const searchParams = useSearchParams();
  const companyFromQuery = searchParams.get('company');
  const mapRef = useRef<MapRef | null>(null);
  const [companies, setCompanies] = useState<Company[]>(FALLBACK_BOOTSTRAP.companies);
  const [districts, setDistricts] = useState<District[]>(FALLBACK_BOOTSTRAP.districts);
  const [todayRoute, setTodayRoute] = useState<TodayRoute>(FALLBACK_BOOTSTRAP.todayRoute);
  const [filter, setFilter] = useState<'all' | CompanyTier>('all');
  const [activeId, setActiveId] = useState<string | null>(FALLBACK_BOOTSTRAP.todayRoute.stops[0]?.company.id ?? null);
  const [popupCompanyId, setPopupCompanyId] = useState<string | null>(null);
  const [poi, setPoi] = useState<TMapPOI | null>(null);
  const { data: routeData, from: routeFrom, plan } = useRoute();

  useEffect(() => {
    let mounted = true;
    void getBootstrap().then(data => {
      if (!mounted) return;
      setCompanies(data.companies);
      setDistricts(data.districts);
      setTodayRoute(data.todayRoute);
      setActiveId(current => current ?? data.todayRoute.stops[0]?.company.id ?? null);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const sp = todayRoute.startPoint;
    const stops = todayRoute.stops.map(s => ({ lat: s.company.lat, lng: s.company.lng }));
    const last = stops[stops.length - 1];
    if (!last) return;
    void plan({ lat: sp.lat, lng: sp.lng }, last, stops.slice(0, -1), 'driving');
  }, [plan, todayRoute]);

  useEffect(() => {
    if (!companyFromQuery) return;
    const company = companies.find(c => c.id === companyFromQuery);
    if (!company) return;
    setFilter('all');
    setActiveId(company.id);
    setPopupCompanyId(company.id);
    const timer = window.setTimeout(() => {
      mapRef.current?.flyTo({ center: [company.lng, company.lat], zoom: 13.5, duration: 1000 });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [companies, companyFromQuery]);

  useEffect(() => {
    const onFlyToPoi = (e: Event) => {
      const next = (e as CustomEvent<TMapPOI>).detail;
      if (!next?.location) return;
      setPoi(next);
      mapRef.current?.flyTo({ center: [next.location.lng, next.location.lat], zoom: 14, duration: 1200 });
    };
    const onSetMyLocation = (e: Event) => {
      const loc = (e as CustomEvent<{ lat: number; lng: number }>).detail;
      if (loc) mapRef.current?.flyTo({ center: [loc.lng, loc.lat], zoom: 13, duration: 1200 });
    };
    window.addEventListener('fly-to-poi', onFlyToPoi);
    window.addEventListener('set-my-location', onSetMyLocation);
    return () => {
      window.removeEventListener('fly-to-poi', onFlyToPoi);
      window.removeEventListener('set-my-location', onSetMyLocation);
    };
  }, []);

  const visibleCompanies = useMemo(
    () => companies.filter(c => filter === 'all' || c.tier === filter),
    [companies, filter],
  );
  const activeCompany = activeId ? companies.find(c => c.id === activeId) : null;
  const popupCompany = popupCompanyId ? companies.find(c => c.id === popupCompanyId) : null;
  const routeCoordinates = useMemo(() => routeToCoordinates(todayRoute, routeData?.path), [routeData, todayRoute]);
  const todayIds = new Set(todayRoute.stops.map(s => s.company.id));
  const focusCompany = (company: Company) => {
    setActiveId(company.id);
    setPopupCompanyId(company.id);
    mapRef.current?.flyTo({ center: [company.lng, company.lat], zoom: 13.5, duration: 900 });
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden bg-background">
      <Map
        ref={mapRef}
        center={[SZ_CENTER.lng, SZ_CENTER.lat]}
        zoom={10.5}
        minZoom={9}
        maxZoom={17}
        className="absolute inset-0"
      >
        <MapRoute
          id="today-sales-route"
          coordinates={routeCoordinates}
          color="#0052D9"
          width={4}
          opacity={0.86}
          dashArray={routeFrom === 'mock' ? [2, 1.5] : undefined}
        />
        <DistrictMarkers districts={districts} />
        {visibleCompanies.map(c => (
          <CompanyMarker
            key={c.id}
            company={c}
            active={c.id === activeId}
            inTodayRoute={todayIds.has(c.id)}
            onActivate={() => focusCompany(c)}
          />
        ))}
        <StartMarker startPoint={todayRoute.startPoint} />
        {poi && <PoiMarker poi={poi} />}
        {popupCompany && (
          <MapPopup
            longitude={popupCompany.lng}
            latitude={popupCompany.lat}
            closeButton
            onClose={() => setPopupCompanyId(null)}
            className="w-72 p-0"
          >
            <CompanyPopup company={popupCompany} />
          </MapPopup>
        )}
        <MapControls position="bottom-right" showZoom showCompass showLocate showFullscreen />
      </Map>

      <MapToolbar filter={filter} onFilter={setFilter} routeFrom={routeFrom} routeData={routeData} visibleCount={visibleCompanies.length} />
      {activeCompany && <FloatingCompanyCard company={activeCompany} />}
    </div>
  );
}

function MapToolbar({
  filter,
  onFilter,
  routeFrom,
  routeData,
  visibleCount,
}: {
  filter: 'all' | CompanyTier;
  onFilter: (v: 'all' | CompanyTier) => void;
  routeFrom?: 'tencent-map' | 'mock';
  routeData?: { distance: number; duration: number; traffic_light_count?: number };
  visibleCount: number;
}) {
  return (
    <div className="absolute left-4 top-4 z-10 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl border bg-background/95 p-3 shadow-glass backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">深圳销售地图</div>
          <div className="mt-0.5 text-xs text-muted-foreground">客户地图 · 商区路线 · 富信息弹窗</div>
        </div>
        <Badge variant={routeFrom === 'tencent-map' ? 'success' : 'muted'} className="shrink-0 text-[10px]">
          {routeFrom === 'tencent-map' ? '腾讯路线' : 'Mock 路线'}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <MiniStat label="当前显示" value={`${visibleCount}`} />
        <MiniStat label="路线距离" value={routeData ? `${(routeData.distance / 1000).toFixed(1)}km` : '计算中'} />
        <MiniStat label="预计耗时" value={routeData ? `${routeData.duration}min` : '—'} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {(['all', 'A', 'B', 'C'] as const).map(t => (
          <button
            key={t}
            onClick={() => onFilter(t)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-all',
              filter === t ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background/80 text-muted-foreground hover:bg-muted',
            )}
          >
            {t === 'all' ? '全部客户' : `${t} 类客户`}
          </button>
        ))}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/60 p-2">
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}

function CompanyMarker({ company, active, inTodayRoute, onActivate }: { company: Company; active: boolean; inTodayRoute: boolean; onActivate: () => void }) {
  const style = TIER_STYLE[company.tier];
  return (
    <MapMarker longitude={company.lng} latitude={company.lat} onClick={onActivate}>
      <MarkerContent>
        <div className={cn('relative flex size-7 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-lg ring-4 transition-transform hover:scale-110', style.dot, style.ring, active && 'scale-125')}>
          {company.tier}
          {inTodayRoute && <span className="absolute -right-1 -top-1 size-2.5 rounded-full border border-white bg-success" />}
        </div>
        {(active || company.tier === 'A') && <MarkerLabel position="bottom">{company.shortName}</MarkerLabel>}
      </MarkerContent>
    </MapMarker>
  );
}

function CompanyPopup({ company }: { company: Company }) {
  const style = TIER_STYLE[company.tier];
  const verification = getCompanyVerification(company.id);
  return (
    <div className="overflow-hidden rounded-md">
      <div className="relative h-32 overflow-hidden rounded-t-md">
        <img src={companyImage(company)} alt={company.name} className="h-full w-full object-cover" />
        <div className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground">{company.industry}</div>
      </div>
      <div className="space-y-3 p-3">
        <div>
          <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-muted-foreground">
            <Building2 className="size-3" />{style.label}
          </div>
          <h3 className="mt-1 text-base font-semibold leading-tight text-foreground">{company.shortName}</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            <Badge variant={verificationVariant(verification.businessStatus)} className="text-[10px]">
              {verificationLabel(verification.businessStatus)}
            </Badge>
            <Badge variant={verification.locationStatus === 'verified' ? 'success' : 'muted'} className="text-[10px]">
              {locationLabel(verification.locationStatus)}
            </Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{company.wbFit}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-lg bg-muted/60 p-2"><div className={cn('text-sm font-semibold', style.text)}>{company.score}</div><div className="text-[10px] text-muted-foreground">适配分</div></div>
          <div className="rounded-lg bg-muted/60 p-2"><div className="text-sm font-semibold">{company.fundingRound || '—'}</div><div className="text-[10px] text-muted-foreground">融资</div></div>
          <div className="rounded-lg bg-muted/60 p-2"><div className="text-sm font-semibold">{company.headcount}</div><div className="text-[10px] text-muted-foreground">人数</div></div>
        </div>
        <div className="flex flex-wrap gap-1">
          {company.painPoints.slice(0, 3).map(p => <Badge key={p} variant="muted" className="text-[10px]">{p}</Badge>)}
        </div>
        <div className="rounded-lg bg-muted/50 p-2 text-[11px] leading-relaxed text-muted-foreground">
          {verification.note}
          {verification.qccCandidates?.[0] && (
            <div className="mt-1 font-medium text-foreground">候选：{verification.qccCandidates[0].name}</div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Link href={`/company/${company.id}`} className="flex-1">
            <Button size="sm" variant="gradient" className="w-full"><Navigation className="size-3.5" />查看作战卡</Button>
          </Link>
          <a href={`https://apis.map.qq.com/uri/v1/marker?marker=coord:${company.lat},${company.lng};title:${encodeURIComponent(company.shortName)}`} target="_blank" rel="noreferrer">
            <Button size="sm" variant="outline" className="px-2"><ExternalLink className="size-3.5" /></Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function DistrictMarkers({ districts }: { districts: District[] }) {
  return (
    <>
      {districts.map(d => (
        <MapMarker key={d.id} longitude={d.center[0]} latitude={d.center[1]}>
          <MarkerContent>
            <div className="flex size-10 items-center justify-center rounded-full border border-blue-200 bg-blue-500/15 text-[11px] font-semibold text-blue-700 backdrop-blur">
              {d.companyCount}
            </div>
            <MarkerLabel position="bottom" className="rounded bg-background/80 px-1.5 py-0.5">{d.shortName}</MarkerLabel>
          </MarkerContent>
          <MarkerPopup className="w-64">
            <div className="space-y-2">
              <div className="font-semibold">{d.name}</div>
              <p className="text-xs leading-relaxed text-muted-foreground">{d.description}</p>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <MiniStat label="目标客户" value={`${d.companyCount}`} />
                <MiniStat label="热度" value={`${d.hotScore}`} />
              </div>
            </div>
          </MarkerPopup>
        </MapMarker>
      ))}
    </>
  );
}

function StartMarker({ startPoint }: { startPoint: TodayRoute['startPoint'] }) {
  const sp = startPoint;
  return (
    <MapMarker longitude={sp.lng} latitude={sp.lat}>
      <MarkerContent>
        <div className="flex size-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-lg"><MapPin className="size-4" /></div>
        <MarkerLabel position="top" className="rounded bg-background/90 px-1.5 py-0.5">腾讯大厦</MarkerLabel>
      </MarkerContent>
      <MarkerPopup className="w-56">
        <div className="space-y-1.5">
          <div className="font-semibold">今日出发点</div>
          <div className="text-xs text-muted-foreground">{sp.address}</div>
          <div className="flex items-center gap-1.5 text-xs text-primary"><Clock className="size-3" />建议 10:00 后出发</div>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}

function PoiMarker({ poi }: { poi: TMapPOI }) {
  return (
    <MapMarker longitude={poi.location.lng} latitude={poi.location.lat}>
      <MarkerContent>
        <div className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-white shadow-lg"><Star className="size-4 fill-white" /></div>
        <MarkerLabel position="bottom" className="rounded bg-background/90 px-1.5 py-0.5">{poi.title}</MarkerLabel>
      </MarkerContent>
      <MarkerPopup className="w-64" closeButton>
        <div className="space-y-2">
          <div className="font-semibold">{poi.title}</div>
          <div className="text-xs text-muted-foreground">{poi.address}</div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="size-3" />腾讯地图搜索结果</div>
        </div>
      </MarkerPopup>
    </MapMarker>
  );
}

function FloatingCompanyCard({ company }: { company: Company }) {
  return (
    <div className="absolute bottom-4 left-4 z-10 hidden w-[360px] rounded-2xl border bg-background/95 p-4 shadow-glass backdrop-blur lg:block">
      <div className="flex items-start gap-3">
        <img src={companyImage(company)} alt={company.shortName} className="size-16 rounded-xl object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><h3 className="truncate text-sm font-semibold">{company.shortName}</h3><Badge variant={company.tier === 'A' ? 'success' : company.tier === 'B' ? 'warning' : 'muted'}>{company.tier} 类</Badge></div>
          <p className="mt-1 text-xs text-muted-foreground">{company.industry} · {company.headcount} 人 · {company.score} 分</p>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{company.wbFit}</p>
        </div>
      </div>
      <Link href={`/company/${company.id}`} className="mt-3 block">
        <Button size="sm" variant="outline" className="w-full">进入完整作战卡 <ArrowRight className="size-3.5" /></Button>
      </Link>
    </div>
  );
}
