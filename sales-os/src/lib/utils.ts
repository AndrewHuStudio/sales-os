// 通用工具函数
// 行数目标：≤100
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${day}`;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${hh}:${mm}`;
}

export function relativeTime(iso: string): string {
  const now = Date.now();
  const t = new Date(iso).getTime();
  const diff = now - t;
  const min = Math.floor(diff / 60000);
  if (min < 1) return '刚刚';
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day} 天前`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo} 个月前`;
  return `${Math.floor(mo / 12)} 年前`;
}

export function tierColor(tier: 'A' | 'B' | 'C'): string {
  if (tier === 'A') return 'success';
  if (tier === 'B') return 'warning';
  return 'muted';
}

export function statusLabel(s: string): string {
  const map: Record<string, string> = {
    prospecting: '线索',
    contacted: '已接触',
    demo: 'Demo',
    negotiation: '谈判中',
    won: '已签约',
    lost: '已流失',
  };
  return map[s] || s;
}
