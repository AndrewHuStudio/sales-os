import { NextRequest, NextResponse } from 'next/server';
import { ipLocate, isMockMode, TMapError } from '@/lib/tencent-map';
import type { ApiResp } from '@/types/maps';

export const dynamic = 'force-dynamic';

export interface IPLocData {
  ip: string;
  location: { lat: number; lng: number };
  ad_info: {
    nation: string; province: string; city: string;
    adcode: string; district?: string;
  };
  from: 'tencent-map' | 'mock';
}

export async function GET(req: NextRequest) {
  // 降级默认深圳
  const fallback: IPLocData = {
    ip: '127.0.0.1',
    location: { lat: 22.5431, lng: 114.0579 },
    ad_info: { nation: '中国', province: '广东省', city: '深圳市', adcode: '440300' },
    from: 'mock',
  };

  if (isMockMode()) {
    return NextResponse.json<ApiResp<IPLocData>>({ ok: true, from: 'mock', data: fallback });
  }

  // 尝试从 CF/请求头取客户端 IP
  const clientIp = req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? undefined;

  try {
    const r = await ipLocate(clientIp);
    return NextResponse.json<ApiResp<IPLocData>>({
      ok: true, from: 'tencent-map',
      data: { ...r.result, from: 'tencent-map' },
    });
  } catch (e) {
    if (e instanceof TMapError) {
      return NextResponse.json<ApiResp<IPLocData>>({ ok: true, from: 'mock', data: fallback });
    }
    return NextResponse.json<ApiResp<IPLocData>>({
      ok: false, code: 500, error: String(e),
    }, { status: 500 });
  }
}
