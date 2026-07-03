// 客户详情 - 销售话术卡
// 行数目标：≤80
'use client';
import { MessageCircle, Target, Zap, Shield, Hand } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Company } from '@/types';

const TEMPLATE = {
  opener: `注意到贵司近期在「{industry}」方向动作频繁，恭喜！我们做了一份针对 {shortName} 的 AI 转型方案，今天过来想先听听您这边最关心什么。`,
  painHook: `您提到的「{pain1}」是我们客户最常见的痛点。WorkBuddy 平台在 {shortName} 同行业已落地 3 个标杆，平均 ROI 提升 40%。`,
  valueProp: `方案核心：用 WorkBuddy Agent 编排平台 + 混元大模型，把您 {industry} 场景的 3 个核心工作流从「人工串联」变成「AI 自动协同」。`,
  objection: [
    { q: '价格会不会很贵？', a: '我们是按效果付费，POC 阶段免费，效果验证后再分阶段签约。' },
    { q: '数据安全怎么保证？', a: '支持私有化部署 + 国密算法 + 等保三级，已经服务过 5 家金融客户。' },
  ],
  closeAsk: `今天我们可以先把「{pain1}」拆解成 2 周 POC，您看周三或周四哪个时间方便？`,
};

export function SalesScriptCard({ c }: { c: Company }) {
  const fill = (s: string) => s.replace('{shortName}', c.shortName).replace('{industry}', c.industry).replace('{pain1}', c.painPoints[0] || '业务效率');
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-cyan-500/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-primary" />AI 销售话术模板
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ScriptRow icon={<MessageCircle className="h-3.5 w-3.5" />} label="开场白" content={fill(TEMPLATE.opener)} />
        <ScriptRow icon={<Target className="h-3.5 w-3.5" />} label="痛点钩子" content={fill(TEMPLATE.painHook)} />
        <ScriptRow icon={<Zap className="h-3.5 w-3.5" />} label="价值主张" content={fill(TEMPLATE.valueProp)} />
        <div className="rounded-lg bg-warning/10 p-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-warning mb-1.5">
            <Shield className="h-3.5 w-3.5" />常见异议处理
          </div>
          <div className="space-y-1.5">
            {TEMPLATE.objection.map((o, i) => (
              <div key={i} className="text-xs">
                <div className="text-muted-foreground">Q: {o.q}</div>
                <div className="text-foreground">A: {o.a}</div>
              </div>
            ))}
          </div>
        </div>
        <ScriptRow icon={<Hand className="h-3.5 w-3.5" />} label="收尾推进" content={fill(TEMPLATE.closeAsk)} />
      </CardContent>
    </Card>
  );
}

function ScriptRow({ icon, label, content }: { icon: React.ReactNode; label: string; content: string }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
        <div className="text-sm leading-relaxed">{content}</div>
      </div>
    </div>
  );
}
