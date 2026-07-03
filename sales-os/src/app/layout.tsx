// 全局根布局
// 行数目标：≤40
import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { MobileTabbar } from '@/components/layout/MobileTabbar';

export const metadata: Metadata = {
  title: 'WorkBuddy GeoSales OS',
  description: '地图驱动的销售作战系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen mesh-bg">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <Topbar />
            <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">{children}</main>
          </div>
        </div>
        <MobileTabbar />
      </body>
    </html>
  );
}
