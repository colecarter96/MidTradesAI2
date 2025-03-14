import { createClient } from '@supabase/supabase-js';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: {
        getItem: async (key) => {
          if (typeof window === 'undefined') {
            return null;
          }
          // Try localStorage first
          const localValue = localStorage.getItem(key);
          if (localValue) {
            // Also sync to cookies for server-side
            document.cookie = `${key}=${encodeURIComponent(localValue)}; path=/; max-age=2592000; SameSite=Lax; secure`;
            return localValue;
          }
          // Fall back to cookies
          const cookie = document.cookie.split(';').find(c => c.trim().startsWith(`${key}=`));
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
        },
        setItem: async (key, value) => {
          if (typeof window === 'undefined') {
            return;
          }
          // Store in both localStorage and cookies
          localStorage.setItem(key, value);
          document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax; secure`;
        },
        removeItem: async (key) => {
          if (typeof window === 'undefined') {
            return;
          }
          // Remove from both localStorage and cookies
          localStorage.removeItem(key);
          document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        }
      }
    }
  }
); 