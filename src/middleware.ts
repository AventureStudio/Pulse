import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

function applySecurityHeaders(response: NextResponse) {
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  return response;
}

function applyPerformanceHeaders(response: NextResponse, pathname: string) {
  // Cache static assets aggressively
  if (pathname.startsWith('/_next/static') || pathname.includes('.')) {
    response.headers.set(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );
  }
  
  // Cache API responses briefly
  if (pathname.startsWith('/api/')) {
    response.headers.set(
      "Cache-Control",
      "private, max-age=0, s-maxage=30, stale-while-revalidate=60"
    );
  }
  
  // Prefetch DNS for external resources
  response.headers.set(
    "Link",
    "<https://fonts.googleapis.com>; rel=dns-prefetch, <https://fonts.gstatic.com>; rel=dns-prefetch"
  );
  
  // Enable early hints for critical resources
  if (pathname === '/dashboard' || pathname.startsWith('/objectives')) {
    response.headers.set(
      "Link",
      "</api/periods>; rel=prefetch, </api/objectives>; rel=prefetch"
    );
  }

  return response;
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Use CENTRAL Supabase for auth validation with timeout
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, {
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

  // Add timeout to auth check
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ data: { user: null } }), 2000);
  });

  let user = null;
  try {
    const authPromise = supabase.auth.getUser();
    const result = await Promise.race([authPromise, timeoutPromise]) as any;
    user = result.data?.user || null;
  } catch (error) {
    console.warn('Auth check timeout or error:', error);
    user = null;
  }

  const { pathname } = request.nextUrl;

  // Public routes that don't require auth
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/callback" ||
    pathname.startsWith("/auth/confirm") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/api/auth/setup";

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    // For API routes, return 401 instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    applySecurityHeaders(redirectResponse);
    return redirectResponse;
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    applySecurityHeaders(redirectResponse);
    applyPerformanceHeaders(redirectResponse, pathname);
    return redirectResponse;
  }

  applySecurityHeaders(supabaseResponse);
  applyPerformanceHeaders(supabaseResponse, pathname);
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};