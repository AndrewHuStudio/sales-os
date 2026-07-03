// 侧边栏导航
// 行数目标：≤120
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Users, UserCheck, Calendar, TrendingDown, Sparkles, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: '工作台', icon: LayoutDashboard, desc: '今日任务' },
  { href: '/map', label: '销售地图', icon: Map, desc: '8 大商区' },
  { href: '/companies', label: '客户列表', icon: Users, desc: '40 家企业' },
  { href: '/followups', label: '跟进记录', icon: Calendar, desc: '客户互动' },
  { href: '/funnel', label: '销售漏斗', icon: TrendingDown, desc: '阶段分析' },
  { href: '/review', label: '销售复盘', icon: Sparkles, desc: '周报月报' },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-border/50">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
          <Compass className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">WorkBuddy</h1>
          <p className="text-[10px] text-muted-foreground leading-tight">GeoSales OS</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {NAV.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                active
                  ? 'bg-primary/10 text-primary font-medium shadow-soft'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="leading-tight">{item.label}</div>
                <div className="text-[10px] opacity-70 leading-tight">{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border/50 p-3">
        <div className="rounded-lg bg-gradient-card p-3 text-xs">
          <div className="font-medium text-primary mb-1">💎 销售铁军</div>
          <div className="text-muted-foreground text-[11px] leading-relaxed">
            拜访前先了解客户痛点，再谈产品。
          </div>
        </div>
      </div>
    </aside>
  );
}
