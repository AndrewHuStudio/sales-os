// 客户详情 - 头部
// 行数目标：≤80
'use client';
import { Building2, MapPin, Users, Briefcase, Globe, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getDistrict } from '@/lib/data/districts';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';

export function CompanyHeader({ c }: { c: Company }) {
  const d = getDistrict(c.districtId);
  return (
    <Card className="relative overflow-hidden border-primary/20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-cyan-500/5 to-transparent" />
      <CardContent className="relative p-6">
        <Link href="/companies" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3 w-3" />返回列表
        </Link>
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarFallback className={cn('text-xl font-bold text-white',
              c.tier === 'A' ? 'bg-gradient-to-br from-blue-600 to-cyan-500' :
              c.tier === 'B' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
              'bg-gradient-to-br from-slate-500 to-slate-400'
            )}>
              {c.shortName.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold">{c.name}</h1>
              <Badge variant={c.tier === 'A' ? 'success' : c.tier === 'B' ? 'warning' : 'muted'}>{c.tier} 类</Badge>
              {c.tags.map(t => <Badge key={t} variant="outline">{t}</Badge>)}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{c.industry}</span>
              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{c.headcount} 人</span>
              <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{c.fundingRound || '未融资'}</span>
              <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{d?.name}</span>
              {c.revenue && <span>· 年营收 {c.revenue}</span>}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-xl bg-card/80 backdrop-blur px-4 py-2 text-center">
              <div className="text-3xl font-bold text-primary">{c.score}</div>
              <div className="text-[10px] text-muted-foreground">WB 适配分</div>
            </div>
            <Button variant="gradient" size="sm">
              <Sparkles className="h-3.5 w-3.5" />AI 拜访建议
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
