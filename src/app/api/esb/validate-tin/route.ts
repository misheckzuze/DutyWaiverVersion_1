import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tin = searchParams.get('tin') || searchParams.get('TIN');
    if (!tin) {
      return NextResponse.json({ message: 'Missing tin' }, { status: 400 });
    }

    const base = (process.env.NEXT_PUBLIC_ESB_API_URL || '').replace(/\/$/, '');
    const url = `${base}/api/ValidateTIN?TIN=${encodeURIComponent(tin)}`;

    const esbResp = await fetch(url, {
      headers: {
        'access-key': String(process.env.NEXT_PUBLIC_ESB_API_ACCESS_KEY || ''),
      },
      // Prevent Next from caching
      cache: 'no-store',
    });

    // If ESB returns JSON
    const contentType = esbResp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await esbResp.json();
      return NextResponse.json(data, { status: esbResp.status });
    }

    // Handle text responses like 404 "TIN was not found"
    const text = await esbResp.text();
    return new NextResponse(text, {
      status: esbResp.status,
      headers: { 'content-type': 'text/plain' },
    });
  } catch (e: any) {
    return NextResponse.json({ message: e?.message || 'Proxy error' }, { status: 500 });
  }
}


