// 客户详情 - 行动建议
// 行数目标：≤100
'use client';
import { CheckSquare, Square, Clock, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const STEPS = [
  { day: 'Day 1', title: '深度调研 + 决策人画像', desc: '完成企业工商信息 / 竞品 / 决策链梳理', status: 'done' },
  { day: 'Day 2', title: '关键人触达', desc: '通过行业活动 / 老客户引荐触达 CTO', status: 'done' },
  { day: 'Day 3-5', title: '首次拜访 + 需求诊断', desc: '带行业模板 Demo，挖掘 3 个核心痛点', status: 'in_progress' },
  { day: 'Day 6-10', title: 'POC 方案设计', desc: '针对痛点设计 2 周 POC，量化 ROI', status: 'pending' },
  { day: 'Day 11-14', title: 'POC 启动 + 商务谈判', desc: '签约 POC 协议，明确效果指标', status: 'pending' },
  { day: 'Day 15+', title: '商务谈判 + 落地', desc: '推动正式合同 + 私有化部署', status: 'pending' },
];

const STATUS_STYLE = {
  done: { variant: 'success' as const, icon: CheckSquare, color: 'text-success' },
  in_progress: { variant: 'warning' as const, icon: Clock, color: 'text-warning' },
  pending: { variant: 'muted' as const, icon: Square, color: 'text-muted-foreground' },
};

export function ActionPlan() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />AI 推荐行动路径
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {STEPS.map((s, i) => {
            const style = STATUS_STYLE[s.status as keyof typeof STATUS_STYLE];
            const Icon = style.icon;
            return (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border/50 p-3">
                <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${style.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-[10px] font-mono">{s.day}</Badge>
                    <span className="text-sm font-medium">{s.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
                {s.status === 'in_progress' && (
                  <Button variant="outline" size="sm" className="text-[10px] h-6">更新</Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
