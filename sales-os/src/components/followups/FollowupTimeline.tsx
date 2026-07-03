// 跟进时间线
// 行数目标：≤120
'use client';
import { MapPin, Phone, MessageSquare, Mail, Users, FileText, Calendar, Sparkles, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { relativeTime, formatDate } from '@/lib/utils';
import { FOLLOWUPS } from '@/lib/data/followups';
import { getCompany } from '@/lib/data/companies';

const TYPE_ICON: Record<string, React.ReactNode> = {
  拜访: <MapPin className="h-3 w-3" />, 电话: <Phone className="h-3 w-3" />,
  微信: <MessageSquare className="h-3 w-3" />, 邮件: <Mail className="h-3 w-3" />,
  会议: <Users className="h-3 w-3" />, Demo: <FileText className="h-3 w-3" />,
  其他: <FileText className="h-3 w-3" />,
};

const MOOD_VARIANT: Record<string, 'success' | 'muted' | 'destructive'> = {
  正面: 'success', 中性: 'muted', 负面: 'destructive',
};

export function FollowupTimeline() {
  const sorted = [...FOLLOWUPS].sort((a, b) =>
    new Date(b.happenedAt).getTime() - new Date(a.happenedAt).getTime()
  );
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-primary" />全部跟进记录
            <span className="text-xs text-muted-foreground font-normal">({sorted.length} 条)</span>
          </CardTitle>
          <Button variant="gradient" size="sm">
            <Plus className="h-3.5 w-3.5" />新增跟进
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 space-y-3">
          <div className="absolute left-2 top-1 bottom-1 w-px bg-border" />
          {sorted.map(f => {
            const c = getCompany(f.companyId);
            return (
              <div key={f.id} className="relative">
                <div className="absolute -left-[18px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-card border-2 border-primary text-primary">
                  {TYPE_ICON[f.type]}
                </div>
                <div className="rounded-lg border border-border/50 p-3 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px] gap-1">{TYPE_ICON[f.type]}{f.type}</Badge>
                    {c && <a href={`/company/${c.id}`} className="text-sm font-medium hover:text-primary">{c.shortName}</a>}
                    <span className="text-[10px] text-muted-foreground">{formatDate(f.happenedAt, true)}</span>
                    <span className="text-[10px] text-muted-foreground">· {relativeTime(f.happenedAt)}</span>
                    <Badge variant={MOOD_VARIANT[f.mood]} className="text-[10px] ml-auto">{f.mood}</Badge>
                  </div>
                  <p className="text-sm leading-relaxed mb-1.5">{f.summary}</p>
                  {f.nextStep && (
                    <div className="text-xs rounded bg-primary/5 p-2">
                      <span className="font-medium text-primary">下一步：</span>
                      <span className="text-muted-foreground ml-1">{f.nextStep}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
