import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    console.log('🔒 Middleware executing for path:', req.nextUrl.pathname);
    
    // Log all cookies in the request
    console.log('🍪 Request cookies:', req.cookies.getAll().map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 10) + '...' // Only show first 10 chars for security
    })));

    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh session if expired - required for Server Components
    const { data: { session }, error } = await supabase.auth.getSession();
    console.log('🔑 Session check:', { 
      hasSession: !!session, 
      error: error?.message,
      userEmail: session?.user?.email,
      expiresAt: session?.expires_at
    });

    // Log cookies in the response
    console.log('🍪 Response cookies:', res.cookies.getAll().map(cookie => ({
      name: cookie.name,
      value: cookie.value.substring(0, 10) + '...' // Only show first 10 chars for security
    })));

    return res;
  } catch (e) {
    console.error('❌ Middleware error:', e);
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