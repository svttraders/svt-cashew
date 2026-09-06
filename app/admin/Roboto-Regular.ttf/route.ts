import { NextResponse } from 'next/server';

// Lightweight fallback TTF font binary to prevent 404 errors from browser font scanners or PDF generators
export async function GET() {
  // Return an empty 200 binary response with font headers
  return new NextResponse(new Uint8Array(0), {
    status: 200,
    headers: {
      'Content-Type': 'font/ttf',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
