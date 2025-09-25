import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const TIN: string | undefined = body?.TIN || body?.tin;

    if (!TIN || !/^\d{8}$/.test(String(TIN))) {
      return NextResponse.json({ message: 'Invalid or missing TIN (8 digits required)' }, { status: 400 });
    }

    const base = (process.env.NEXT_PUBLIC_ESB_API_URL || '').replace(/\/$/, '');
    const url = `${base}/api/ValidateTIN?TIN=${encodeURIComponent(String(TIN))}`;

    const esbResp = await fetch(url, {
      method: 'POST',
      headers: {
        'access-key': String(process.env.NEXT_PUBLIC_ESB_API_ACCESS_KEY || ''),
      },
      cache: 'no-store',
    });

    const contentType = esbResp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await esbResp.json();
      return NextResponse.json(data, { status: esbResp.status });
    }

    const text = await esbResp.text();
    return new NextResponse(text, {
      status: esbResp.status,
      headers: { 'content-type': 'text/plain' },
    });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Proxy error' }, { status: 500 });
  }
}


