import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/signup', '/onboarding'];
  const isPublic = publicRoutes.some(route => pathname === route);
  const isApiRoute = pathname.startsWith('/api/');
  const isStaticFile = pathname.startsWith('/_next/') || pathname.startsWith('/favicon') || pathname.includes('.');

  // Skip middleware for API routes, static files, and public routes
  if (isApiRoute || isStaticFile || isPublic) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection (basic check — full auth check happens in API)
  if (pathname.startsWith('/admin')) {
    // We'll let the page handle the admin check using the API
    // This is just a basic guard
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
