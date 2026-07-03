// 首页：客户端跳转到工作台
// 注意：静态导出（next export）不支持 server-side redirect()，
// 必须用客户端 router.replace() 配合友好 loading 提示。
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="animate-spin h-10 w-10 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">正在进入工作台…</p>
      </div>
    </div>
  );
}
