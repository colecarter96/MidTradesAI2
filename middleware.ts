import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Protected routes
    const protectedRoutes = ['/dashboard', '/profile'];
    const isProtectedRoute = protectedRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    // Auth routes that should redirect if user is already logged in
    const authRoutes = ['/sign-in', '/sign-up'];
    const isAuthRoute = authRoutes.some(route => req.nextUrl.pathname.startsWith(route));

    // If accessing a protected route without being logged in
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/sign-in', req.url);
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // If accessing auth routes while logged in
    if (isAuthRoute && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
  } catch (e) {
    // If there's an error, allow the request to continue
    return NextResponse.next();
  }
}

// Update matcher to be more specific about which routes to handle
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/sign-in',
    '/sign-up',
  ],
}; 