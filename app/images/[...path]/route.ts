import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

/**
 * Fallback image handler:
 * If an image requested at /images/... does not exist on disk,
 * serves a valid default cashew image (image/webp) instead of 404 HTML,
 * preventing Next.js imageOptimizer 400 crashes.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const filePathSegment = params.path ? params.path.join('/') : '';
    const publicImagesDir = path.join(process.cwd(), 'public', 'images');
    const requestedFilePath = path.join(publicImagesDir, filePathSegment);

    // If requested file exists, serve it with proper content type
    if (fs.existsSync(requestedFilePath) && fs.statSync(requestedFilePath).isFile()) {
      const fileBuffer = fs.readFileSync(requestedFilePath);
      const ext = path.extname(requestedFilePath).toLowerCase();
      let contentType = 'image/webp';
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.svg') contentType = 'image/svg+xml';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Fallback image: raw_cashews_hero.webp
    const fallbackPath = path.join(publicImagesDir, 'raw_cashews_hero.webp');
    if (fs.existsSync(fallbackPath)) {
      const fallbackBuffer = fs.readFileSync(fallbackPath);
      return new NextResponse(fallbackBuffer, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    // Secondary fallback: Header-logo.png
    const logoFallback = path.join(publicImagesDir, 'Header-logo.png');
    if (fs.existsSync(logoFallback)) {
      const logoBuffer = fs.readFileSync(logoFallback);
      return new NextResponse(logoBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new NextResponse(null, { status: 404 });
  } catch (err: any) {
    console.error('Dynamic image route error:', err);
    return new NextResponse(null, { status: 404 });
  }
}
