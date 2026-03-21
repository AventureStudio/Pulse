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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static assets and special paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  // Use CENTRAL Supabase for auth validation
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

  // Public routes that don't require auth
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/callback" ||
    pathname.startsWith("/auth/confirm") ||
    pathname.startsWith("/auth/callback") ||
    pathname === "/api/auth/setup";

  // Skip auth check for public routes to prevent unnecessary redirects
  if (isPublicRoute) {
    applySecurityHeaders(supabaseResponse);
    return supabaseResponse;
  }

  try {
    // Refresh session — IMPORTANT: do not remove this call
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // If no user and trying to access protected route, redirect to login
    if (!user) {
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
    // Only redirect if explicitly on /login to avoid redirect loops
    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      const redirectResponse = NextResponse.redirect(url);
      applySecurityHeaders(redirectResponse);
      return redirectResponse;
    }
  } catch (error) {
    console.error("Middleware auth error:", error);
    // On error, allow request to continue to prevent blocking
  }

  applySecurityHeaders(supabaseResponse);
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