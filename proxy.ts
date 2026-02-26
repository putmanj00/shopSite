// proxy.ts — project root (Next.js 16 convention, replaces middleware.ts)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Redirect bare /collections to /collections/all
// Preserves query strings: /collections?sort=price-asc → /collections/all?sort=price-asc
// Uses 301 Permanent as required by NAV-01 success criteria
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Match exact /collections and /collections/ (trailing slash only)
  // Does NOT match /collections/all or /collections/[handle]
  if (pathname === '/collections' || pathname === '/collections/') {
    const destination = new URL(`/collections/all${search}`, request.url);
    return NextResponse.redirect(destination, { status: 301 });
  }

  return NextResponse.next();
}

export const config = {
  // Exact matchers — avoids intercepting /collections/all or /collections/[handle]
  matcher: ['/collections', '/collections/'],
};
