import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

// Cache pour les requêtes API fréquentes
const apiCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Système de cache simple pour les données API
 */
export function getCachedData<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data as T;
  }
  apiCache.delete(key);
  return null;
}

export function setCachedData(key: string, data: any, ttlMs: number = 30000) {
  apiCache.set(key, { data, timestamp: Date.now(), ttl: ttlMs });
}

/**
 * Wrapper pour les requêtes Supabase avec timeout et retry
 */
export async function executeWithTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number = 10000,
  maxRetries: number = 2
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => {
          controller.signal.addEventListener('abort', () => 
            reject(new Error(`Operation timeout after ${timeoutMs}ms`))
          );
        })
      ]);
      
      clearTimeout(timeoutId);
      return result;
    } catch (error) {
      lastError = error as Error;
      console.warn(`API attempt ${attempt + 1} failed:`, error);
      
      // Si ce n'est pas le dernier essai, attendre avant de réessayer
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }
  
  throw lastError!;
}

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
 * Extract the authenticated user from the request with timeout.
 * Returns the user or throws a 401 response.
 */
export async function requireAuth(request: NextRequest) {
  const supabase = createAuthFromRequest(request);
  
  try {
    const { data: { user }, error } = await executeWithTimeout(
      () => supabase.auth.getUser(),
      5000, // 5 secondes de timeout
      1 // 1 seul retry
    );

    if (error || !user) {
      throw NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    return user;
  } catch (error) {
    console.error('Auth error:', error);
    throw NextResponse.json(
      { error: "Erreur d'authentification" },
      { status: 401 }
    );
  }
}

/**
 * Fonction utilitaire pour les requêtes API avec cache et timeout
 */
export async function cachedApiRequest<T>(
  cacheKey: string,
  operation: () => Promise<T>,
  cacheTtlMs: number = 30000
): Promise<T> {
  // Vérifier le cache d'abord
  const cached = getCachedData<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Exécuter l'opération avec timeout
  const result = await executeWithTimeout(operation, 8000, 1);
  
  // Mettre en cache le résultat
  setCachedData(cacheKey, result, cacheTtlMs);
  
  return result;
}