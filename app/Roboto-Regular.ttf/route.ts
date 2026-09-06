import { NextResponse } from 'next/server';

export async function GET() {
  return new NextResponse(new Uint8Array(0), {
    status: 200,
    headers: {
      'Content-Type': 'font/ttf',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
