// 客户详情 - 跟进时间线
// 行数目标：≤100
'use client';
import { Phone, MessageSquare, Mail, Users, FileText, MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { relativeTime } from '@/lib/utils';
import { getFollowupsByCompany } from '@/lib/data/followups';
import type { Followup } from '@/types';

const TYPE_ICON: Record<string, React.ReactNode> = {
  拜访: <MapPin className="h-3.5 w-3.5" />,
  电话: <Phone className="h-3.5 w-3.5" />,
  微信: <MessageSquare className="h-3.5 w-3.5" />,
  邮件: <Mail className="h-3.5 w-3.5" />,
  会议: <Users className="h-3.5 w-3.5" />,
  Demo: <FileText className="h-3.5 w-3.5" />,
};

const MOOD_VARIANT: Record<string, 'success' | 'muted' | 'destructive'> = {
  正面: 'success', 中性: 'muted', 负面: 'destructive',
};

export function FollowupTimeline({ companyId }: { companyId: string }) {
  const list = getFollowupsByCompany(companyId);
  if (list.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">跟进记录</CardTitle></CardHeader>
        <CardContent><p className="text-sm text-muted-foreground">暂无跟进记录</p></CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />跟进记录
          <span className="text-xs text-muted-foreground font-normal">({list.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-3 pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
          {list.map(f => <FollowupItem key={f.id} f={f} />)}
        </div>
      </CardContent>
    </Card>
  );
}

function FollowupItem({ f }: { f: Followup }) {
  return (
    <div className="relative">
      <div className="absolute -left-[18px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-card border-2 border-primary text-primary">
        {TYPE_ICON[f.type] || <FileText className="h-2.5 w-2.5" />}
      </div>
      <div className="rounded-lg border border-border/50 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <Badge variant="outline" className="text-[10px] gap-1">{TYPE_ICON[f.type]} {f.type}</Badge>
          <span className="text-[10px] text-muted-foreground">{relativeTime(f.happenedAt)}</span>
          <Badge variant={MOOD_VARIANT[f.mood]} className="text-[10px] ml-auto">{f.mood}</Badge>
        </div>
        <p className="text-sm leading-relaxed">{f.summary}</p>
        {f.nextStep && (
          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-primary">下一步：</span>{f.nextStep}
          </div>
        )}
      </div>
    </div>
  );
}
