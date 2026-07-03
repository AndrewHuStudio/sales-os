// 客户详情页
// 行数目标：≤40
import { notFound } from 'next/navigation';
import { CompanyHeader } from '@/components/company/CompanyHeader';
import { ScoreRadar } from '@/components/company/ScoreRadar';
import { PainAndFit } from '@/components/company/PainAndFit';
import { FollowupTimeline } from '@/components/company/FollowupTimeline';
import { SalesScriptCard } from '@/components/company/SalesScriptCard';
import { ActionPlan } from '@/components/company/ActionPlan';
import { CoordTag } from '@/components/maps/CoordTag';
import { RouteBadge } from '@/components/maps/RouteBadge';
import { getCompany, COMPANIES } from '@/lib/data/companies';
import { getDistrict } from '@/lib/data/districts';
import { MapPin } from 'lucide-react';

export function generateStaticParams() {
  return COMPANIES.map(c => ({ id: c.id }));
}

export default function CompanyDetailPage({ params }: { params: { id: string } }) {
  const c = getCompany(params.id);
  if (!c) notFound();
  // 假设从腾讯大厦出发到本客户
  const start = { lat: 22.5431, lng: 113.9528 };
  const end = { lat: c.lat, lng: c.lng };
  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      <CompanyHeader c={c} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-4 lg:grid-cols-2">
          <ScoreRadar breakdown={c.scoreBreakdown} />
          <PainAndFit painPoints={c.painPoints} wbFit={c.wbFit} />
        </div>
        <div className="space-y-3">
          <div className="text-sm font-semibold flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary" /> 位置 · 路线
          </div>
          <CoordTag address={c.address} coords={{ lat: c.lat, lng: c.lng }} />
          <RouteBadge from={start} to={end} mode="driving" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <SalesScriptCard c={c} />
        <ActionPlan />
      </div>
      <FollowupTimeline companyId={c.id} />
    </div>
  );
}
