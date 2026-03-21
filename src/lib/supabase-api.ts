import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

/**
 * Create a Supabase client pointed at the CENTRAL auth project
 * that reads the session from request cookies.
 * Use this in API routes to identify the authenticated user.
 */
function createAuthFromRequest(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              domain: AUTH_COOKIE_DOMAIN,
              path: "/",
              sameSite: "lax",
              secure: process.env.NODE_ENV === "production",
            })
          );
        },
      },
    }
  );
  return supabase;
}

/**
 * Extract the authenticated user from the request.
 * Returns the user or throws a 401 response.
 */
export async function requireAuth(request: NextRequest) {
  const supabase = createAuthFromRequest(request);
  
  // Add timeout to auth check
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Auth timeout')), 3000);
  });
  
  try {
    const authPromise = supabase.auth.getUser();
    const { data: { user }, error } = await Promise.race([
      authPromise,
      timeoutPromise
    ]) as any;

    if (error || !user) {
      throw NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return user;
  } catch (err) {
    if (err instanceof NextResponse) {
      throw err;
    }
    
    throw NextResponse.json(
      { error: "Erreur d'authentification" },
      { status: 500 }
    );
  }
}