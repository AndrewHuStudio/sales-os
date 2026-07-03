// 移动端底部 Tab 栏
// 行数目标：≤60
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Map, Users, Calendar, TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TABS = [
  { href: '/dashboard', label: '工作台', icon: LayoutDashboard },
  { href: '/map', label: '地图', icon: Map },
  { href: '/companies', label: '客户', icon: Users },
  { href: '/followups', label: '跟进', icon: Calendar },
  { href: 'more', label: '更多', icon: TrendingDown },
];

export function MobileTabbar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-border/50 bg-background/90 backdrop-blur-xl">
      {TABS.map(t => {
        const Icon = t.icon;
        const active = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href === 'more' ? '/funnel' : t.href}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1 text-[10px]',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
