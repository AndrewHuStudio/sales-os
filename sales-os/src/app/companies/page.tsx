// 客户列表页 - 表格 + 筛选 + 排序
// 行数目标：≤150
'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Building2, MapPin, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { FALLBACK_BOOTSTRAP, getBootstrap } from '@/lib/backend-api';
import { cn } from '@/lib/utils';
import type { Company, District } from '@/types';

type SortKey = 'score' | 'name' | 'headcount';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>(FALLBACK_BOOTSTRAP.companies);
  const [districts, setDistricts] = useState<District[]>(FALLBACK_BOOTSTRAP.districts);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [district, setDistrict] = useState('all');
  const [sort, setSort] = useState<SortKey>('score');

  useEffect(() => {
    let mounted = true;
    void getBootstrap().then(data => {
      if (!mounted) return;
      setCompanies(data.companies);
      setDistricts(data.districts);
    });
    return () => { mounted = false; };
  }, []);

  const list = useMemo(() => {
    let l = companies;
    if (tier !== 'all') l = l.filter(c => c.tier === tier);
    if (district !== 'all') l = l.filter(c => c.districtId === district);
    if (search) {
      const s = search.toLowerCase();
      l = l.filter(c => c.name.toLowerCase().includes(s) || c.industry.toLowerCase().includes(s));
    }
    l = [...l].sort((a, b) =>
      sort === 'score' ? b.score - a.score :
      sort === 'name' ? a.name.localeCompare(b.name) :
      b.headcount - a.headcount
    );
    return l;
  }, [companies, search, tier, district, sort]);

  const stats = {
    total: companies.length,
    A: companies.filter(c => c.tier === 'A').length,
    B: companies.filter(c => c.tier === 'B').length,
    C: companies.filter(c => c.tier === 'C').length,
  };

  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">客户列表</h1>
        <p className="text-sm text-muted-foreground">深圳 {districts.length} 大商区 · {companies.length} 家目标企业 · AI 智能评分</p>
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: '总数', value: stats.total, color: 'text-foreground' },
          { label: 'A 类（重点）', value: stats.A, color: 'text-primary' },
          { label: 'B 类（培养）', value: stats.B, color: 'text-warning' },
          { label: 'C 类（观察）', value: stats.C, color: 'text-muted-foreground' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-3 text-center">
              <div className={cn('text-2xl font-bold', s.color)}>{s.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 筛选器 */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索客户名 / 行业…"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">排序：</span>
              {(['score', 'name', 'headcount'] as const).map(k => (
                <button
                  key={k}
                  onClick={() => setSort(k)}
                  className={cn('rounded-md px-2.5 py-1 text-xs', sort === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
                >
                  {k === 'score' ? '评分' : k === 'name' ? '名称' : '规模'}
                </button>
              ))}
            </div>
          </div>
          <Tabs value={tier} onValueChange={v => setTier(v as any)}>
            <TabsList>
              <TabsTrigger value="all">全部 ({stats.total})</TabsTrigger>
              <TabsTrigger value="A">A 类 ({stats.A})</TabsTrigger>
              <TabsTrigger value="B">B 类 ({stats.B})</TabsTrigger>
              <TabsTrigger value="C">C 类 ({stats.C})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setDistrict('all')}
              className={cn('rounded-md px-2.5 py-1 text-xs whitespace-nowrap', district === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
            >
              全部商区
            </button>
            {districts.map(d => (
              <button
                key={d.id}
                onClick={() => setDistrict(d.id)}
                className={cn('rounded-md px-2.5 py-1 text-xs whitespace-nowrap', district === d.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground')}
              >
                {d.shortName}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 列表 */}
      <div className="text-xs text-muted-foreground">共 {list.length} 家</div>
      <div className="grid gap-3">
        {list.map(c => {
          const d = districts.find(x => x.id === c.districtId);
          return (
            <Link key={c.id} href={`/company/${c.id}`}>
              <Card className="transition-all hover:shadow-soft hover:border-primary/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={cn('text-sm font-bold',
                        c.tier === 'A' ? 'bg-gradient-to-br from-blue-600 to-cyan-500' :
                        c.tier === 'B' ? 'bg-gradient-to-br from-orange-500 to-yellow-500' :
                        'bg-gradient-to-br from-slate-500 to-slate-400'
                      )}>
                        {c.shortName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{c.name}</h3>
                        <Badge variant={c.tier === 'A' ? 'success' : c.tier === 'B' ? 'warning' : 'muted'} className="text-[10px]">
                          {c.tier} 类
                        </Badge>
                        {c.tags.slice(0, 2).map(t => (
                          <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.industry}</span>
                        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{c.headcount} 人</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{d?.shortName}</span>
                        {c.fundingRound && <span>· {c.fundingRound}</span>}
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-end gap-1 w-32">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-muted-foreground">适配分</span>
                        <span className="font-bold text-primary">{c.score}</span>
                      </div>
                      <Progress value={c.score} className="h-1.5 w-28" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
