// 漏斗 SVG 渲染
// 行数目标：≤100
'use client';
import { FUNNEL_LABEL, FUNNEL_COLOR } from '@/lib/constants';
import type { FunnelStats } from '@/types';

interface Props { stats: FunnelStats[]; total: number; }

export function FunnelChart({ stats, total }: Props) {
  const max = Math.max(...stats.map(s => s.count));
  return (
    <div className="space-y-2">
      {stats.map((s, i) => {
        const w = (s.count / max) * 100;
        const isLast = i === stats.length - 1;
        return (
          <div key={s.stage} className="flex items-center gap-3">
            <div className="w-20 shrink-0 text-right text-xs text-muted-foreground">
              {FUNNEL_LABEL[s.stage]}
            </div>
            <div className="flex-1 relative h-12 rounded-lg overflow-hidden bg-muted/30">
              <div
                className="absolute inset-y-0 left-0 flex items-center justify-between px-3 rounded-lg transition-all"
                style={{
                  width: `${Math.max(w, 8)}%`,
                  background: `linear-gradient(90deg, ${FUNNEL_COLOR[s.stage]}cc 0%, ${FUNNEL_COLOR[s.stage]}88 100%)`,
                }}
              >
                <span className="text-xs font-medium text-white whitespace-nowrap">{s.count} 家</span>
                {s.amount > 0 && (
                  <span className="text-xs font-medium text-white/90 whitespace-nowrap">{s.amount} 万</span>
                )}
              </div>
            </div>
            <div className="w-16 text-right">
              <div className="text-sm font-bold">{s.conversionFromPrev}%</div>
              <div className="text-[10px] text-muted-foreground">转化</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
