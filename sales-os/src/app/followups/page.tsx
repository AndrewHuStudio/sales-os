// 跟进页
// 行数目标：≤20
import { FollowupTimeline } from '@/components/followups/FollowupTimeline';
import { FollowupStats } from '@/components/followups/FollowupStats';

export default function FollowupsPage() {
  return (
    <div className="space-y-4 p-4 md:p-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">跟进记录</h1>
        <p className="text-sm text-muted-foreground">所有客户互动时间线 · 客户详情页可查看单家历史</p>
      </div>
      <FollowupStats />
      <FollowupTimeline />
    </div>
  );
}
