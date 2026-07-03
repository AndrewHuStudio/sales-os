// 客户详情 - 评分雷达
// 行数目标：≤80
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScoreBreakdown } from '@/types';

const DIMS: { key: keyof ScoreBreakdown; label: string }[] = [
  { key: 'industry', label: '行业适配' },
  { key: 'scale', label: '企业规模' },
  { key: 'budget', label: '预算明确' },
  { key: 'urgency', label: '需求紧迫' },
  { key: 'decisionMaker', label: '决策人' },
  { key: 'techMatch', label: '技术匹配' },
  { key: 'competition', label: '竞争格局' },
  { key: 'caseStudy', label: '案例背书' },
];

export function ScoreRadar({ breakdown }: { breakdown: ScoreBreakdown }) {
  const cx = 100, cy = 100, r = 70;
  const n = DIMS.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const points = DIMS.map((d, i) => {
    const v = breakdown[d.key] / 100;
    return { x: cx + Math.cos(angle(i)) * r * v, y: cy + Math.sin(angle(i)) * r * v, dim: d };
  });
  const polygon = points.map(p => `${p.x},${p.y}`).join(' ');
  const gridPolygons = [0.25, 0.5, 0.75, 1].map(scale =>
    DIMS.map((_, i) => `${cx + Math.cos(angle(i)) * r * scale},${cy + Math.sin(angle(i)) * r * scale}`).join(' ')
  );
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">8 维评分雷达</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <svg viewBox="0 0 200 200" className="h-44 w-44">
            {gridPolygons.map((p, i) => (
              <polygon key={i} points={p} fill="none" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground/40" />
            ))}
            {DIMS.map((_, i) => (
              <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(angle(i)) * r} y2={cy + Math.sin(angle(i)) * r} stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground/30" />
            ))}
            <polygon points={polygon} fill="url(#radarFill)" stroke="#0052D9" strokeWidth="1.5" />
            <defs>
              <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0052D9" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00C7BE" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {points.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="2" fill="#0052D9" />
            ))}
          </svg>
          <div className="flex-1 grid grid-cols-2 gap-1.5 text-xs">
            {DIMS.map((d, i) => (
              <div key={d.key} className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">{d.label}</span>
                <span className="font-mono font-medium">{breakdown[d.key]}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
