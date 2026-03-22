import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

// Cache pour éviter les redirections multiples
const redirectCache = new Map<string, { timestamp: number; result: string }>();
const CACHE_TTL = 30000; // 30 secondes

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
  // Optimisations de performance
  response.headers.set("Cache-Control", "public, max-age=0, must-revalidate");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  return response;
}

// Fonction pour vérifier le cache de redirection
function getCachedRedirect(key: string): string | null {
  const cached = redirectCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  redirectCache.delete(key);
  return null;
}

// Fonction pour mettre en cache une redirection
function setCachedRedirect(key: string, result: string) {
  redirectCache.set(key, { timestamp: Date.now(), result });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Optimisation: skip middleware pour les ressources statiques
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Vérifier le cache de redirection pour éviter les appels multiples
  const userId = request.cookies.get('sb-access-token')?.value;
  const cacheKey = `${pathname}-${userId || 'anonymous'}`;
  const cachedResult = getCachedRedirect(cacheKey);
  
  if (cachedResult) {
    if (cachedResult === 'continue') {
      return NextResponse.next();
    } else {
      const url = request.nextUrl.clone();
      url.pathname = cachedResult;
      return NextResponse.redirect(url);
    }
  }

  let supabaseResponse = NextResponse.next({ request });

  // Use CENTRAL Supabase for auth validation avec timeout
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

  // Refresh session avec timeout de 3 secondes
  let user = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const authPromise = supabase.auth.getUser();
    const { data } = await Promise.race([
      authPromise,
      new Promise((_, reject) => {
        controller.signal.addEventListener('abort', () => 
          reject(new Error('Auth timeout'))
        );
      })
    ]) as { data: { user: any } };
    
    clearTimeout(timeoutId);
    user = data.user;
  } catch (error) {
    console.warn('Auth check timeout, allowing request to continue');
    // En cas de timeout, on laisse passer pour éviter de bloquer
    setCachedRedirect(cacheKey, 'continue');
    return applySecurityHeaders(supabaseResponse);
  }

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

    setCachedRedirect(cacheKey, '/login');
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/")) {
    setCachedRedirect(cacheKey, '/dashboard');
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  setCachedRedirect(cacheKey, 'continue');
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