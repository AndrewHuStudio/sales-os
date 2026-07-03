import { COMPANIES } from '@/lib/data/companies';
import { DISTRICTS } from '@/lib/data/districts';
import { FOLLOWUPS } from '@/lib/data/followups';
import { FUNNEL_STATS, FUNNEL_TOTAL } from '@/lib/data/funnel';
import { REVIEW_METRICS, REVIEW_SUMMARY } from '@/lib/data/review';
import { TODAY_ROUTE } from '@/lib/data/route';
import type { Company, District, Followup, FunnelStats, ReviewMetric, TodayRoute } from '@/types';

export type BootstrapData = {
  companies: Company[];
  districts: District[];
  todayRoute: TodayRoute;
};

export type FunnelData = {
  stats: FunnelStats[];
  total: typeof FUNNEL_TOTAL;
};

export type ReviewData = {
  metrics: ReviewMetric[];
  summary: typeof REVIEW_SUMMARY;
};

export const FALLBACK_BOOTSTRAP: BootstrapData = {
  companies: COMPANIES,
  districts: DISTRICTS,
  todayRoute: TODAY_ROUTE,
};

export const FALLBACK_FUNNEL: FunnelData = {
  stats: FUNNEL_STATS,
  total: FUNNEL_TOTAL,
};

export const FALLBACK_REVIEW: ReviewData = {
  metrics: REVIEW_METRICS,
  summary: REVIEW_SUMMARY,
};

const API_BASE = (process.env.FASTAPI_BASE_URL || process.env.BACKEND_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

function normalizePath(path: string) {
  const [rawPath, query = ''] = path.split('?');
  const clean = rawPath.replace(/^\/+/, '').replace(/^api\//, '');
  return { clean, query };
}

export async function readBackend<T>(path: string, fallback: T): Promise<T> {
  const { clean, query } = normalizePath(path);
  const suffix = query ? `?${query}` : '';
  const url = typeof window === 'undefined'
    ? `${API_BASE}/api/${clean}${suffix}`
    : `/api/backend/${clean}${suffix}`;

  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return fallback;
    return await res.json() as T;
  } catch {
    return fallback;
  }
}

export const getBootstrap = () => readBackend<BootstrapData>('bootstrap', FALLBACK_BOOTSTRAP);
export const getCompanies = () => readBackend<Company[]>('companies', COMPANIES);
export const getDistricts = () => readBackend<District[]>('districts', DISTRICTS);
export const getTodayRoute = () => readBackend<TodayRoute>('today-route', TODAY_ROUTE);
export const getFunnel = () => readBackend<FunnelData>('funnel', FALLBACK_FUNNEL);
export const getReview = () => readBackend<ReviewData>('review', FALLBACK_REVIEW);
export const getFollowups = (companyId?: string) => readBackend<Followup[]>(companyId ? `followups?company_id=${encodeURIComponent(companyId)}` : 'followups', companyId ? FOLLOWUPS.filter(f => f.companyId === companyId) : FOLLOWUPS);
export const getCompanyFromBackend = (id: string) => readBackend<Company | null>(`companies/${encodeURIComponent(id)}`, COMPANIES.find(c => c.id === id) ?? null);
