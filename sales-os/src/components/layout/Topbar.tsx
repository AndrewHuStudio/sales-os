// 顶部栏 + 主题切换 + 移动端菜单
// 行数目标：≤120
'use client';
import { Sun, Moon, MonitorSmartphone, Bell, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export function Topbar() {
  const { theme, setTheme } = useTheme();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/50 bg-background/60 px-4 backdrop-blur-xl md:px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索客户、商区、跟进记录…"
            className="pl-9 h-9 bg-card/50 border-border/50"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center rounded-lg border border-border/50 bg-card/50 p-0.5">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-md transition-all',
                theme === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={t}
            >
              {t === 'light' && <Sun className="h-3.5 w-3.5" />}
              {t === 'dark' && <Moon className="h-3.5 w-3.5" />}
              {t === 'system' && <MonitorSmartphone className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border/50 bg-card/50 hover:bg-accent">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-soft" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/50 px-2 py-1">
          <Avatar className="h-7 w-7">
            <AvatarFallback>时利</AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <div className="text-xs font-medium leading-tight">胡时利</div>
            <div className="text-[10px] text-muted-foreground leading-tight">腾讯云 · 售前</div>
          </div>
        </div>
      </div>
    </header>
  );
}
