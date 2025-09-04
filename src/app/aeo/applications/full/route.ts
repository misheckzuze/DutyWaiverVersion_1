import { NextResponse } from 'next/server';

// Simple in-memory store for demo purposes
let store: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Basic server-side checks
    if (!body?.tin) {
      return NextResponse.json({ success: false, message: 'TIN is required' }, { status: 400 });
    }

    const id = store.length + 1;
    const record = { id, ...body };
    store.push(record);

    return NextResponse.json({ success: true, message: 'AEO application received', data: record }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Server error' }, { status: 500 });
  }
}
