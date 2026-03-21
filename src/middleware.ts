import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

// Valid routes to prevent broken links
const VALID_ROUTES = new Set([
  "/",
  "/login",
  "/dashboard",
  "/objectives",
  "/alignment",
  "/teams",
  "/periods",
  "/settings",
  "/onboarding",
  "/callback",
  "/auth/confirm",
  "/auth/callback",
]);

// API routes pattern
const API_ROUTES_PATTERN = /^\/api\//;
const AUTH_ROUTES_PATTERN = /^\/auth\//;
const STATIC_FILES_PATTERN = /\.(ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot)$/;

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

function isValidRoute(pathname: string): boolean {
  // Check exact matches first
  if (VALID_ROUTES.has(pathname)) return true;
  
  // Check pattern matches
  if (API_ROUTES_PATTERN.test(pathname) || 
      AUTH_ROUTES_PATTERN.test(pathname) || 
      STATIC_FILES_PATTERN.test(pathname)) return true;
      
  // Check dynamic routes
  if (pathname.startsWith("/onboarding/") ||
      pathname.startsWith("/dashboard/") ||
      pathname.startsWith("/objectives/") ||
      pathname.startsWith("/teams/") ||
      pathname.startsWith("/periods/")) return true;
      
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (pathname.startsWith("/_next") || 
      pathname.startsWith("/favicon") ||
      STATIC_FILES_PATTERN.test(pathname)) {
    return NextResponse.next();
  }
  
  // Validate route existence to prevent broken internal links
  if (!isValidRoute(pathname)) {
    console.warn(`Invalid route accessed: ${pathname}`);
    
    // For API routes, return 404
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Route non trouvée" },
        { status: 404 }
      );
    }
    
    // For other routes, redirect to dashboard or login
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  let supabaseResponse = NextResponse.next({ request });

  try {
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

    // Refresh session with timeout to prevent hanging
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Auth timeout")), 5000)
    );
    
    const { data: { user } } = await Promise.race([
      authPromise,
      timeoutPromise
    ]) as any;

    // Public routes that don't require auth
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/login" ||
      pathname === "/callback" ||
      pathname.startsWith("/auth/confirm") ||
      pathname.startsWith("/auth/callback") ||
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
      return NextResponse.redirect(url);
    }

    // If user is logged in and trying to access login page, redirect to dashboard
    if (user && (pathname === "/login" || pathname === "/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

  } catch (error) {
    console.error("Middleware auth error:", error);
    
    // On auth error, allow public routes and redirect others to login
    const isPublicRoute = pathname === "/" || pathname === "/login" || pathname.startsWith("/auth/");
    
    if (!isPublicRoute && !pathname.startsWith("/api/")) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
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