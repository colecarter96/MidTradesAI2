import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  try {
    // Create a response to modify
    const res = NextResponse.next();
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req, res });

    // Just set up the Supabase context without any session checks
    return res;
  } catch (error) {
    console.error('❌ Middleware error:', error);
    return NextResponse.next();
  }
}

// Keep the matcher for future use if needed
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/sign-in',
    '/sign-up',
  ],
}; 