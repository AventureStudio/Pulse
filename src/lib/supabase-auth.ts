import { createAuthClient } from "./supabase-auth-client";

const AUTH_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operation: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => {
        console.error(`[Supabase Auth] Timeout after ${timeoutMs}ms for operation: ${operation}`);
        reject(new Error(`Operation timeout: ${operation}`));
      }, timeoutMs)
    )
  ]);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  operation: string,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Supabase Auth] ${operation} - Attempt ${attempt}/${maxRetries}`);
      const startTime = Date.now();
      
      const result = await withTimeout(fn(), AUTH_TIMEOUT, operation);
      
      const duration = Date.now() - startTime;
      console.log(`[Supabase Auth] ${operation} - Success in ${duration}ms`);
      
      return result;
    } catch (error) {
      lastError = error as Error;
      const isLastAttempt = attempt === maxRetries;
      
      console.error(`[Supabase Auth] ${operation} - Attempt ${attempt} failed:`, {
        error: lastError.message,
        stack: lastError.stack,
        isLastAttempt
      });
      
      if (isLastAttempt) {
        console.error(`[Supabase Auth] ${operation} - All ${maxRetries} attempts failed`);
        throw lastError;
      }
      
      // Wait before retry (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`[Supabase Auth] ${operation} - Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

export async function signInWithMagicLink(email: string) {
  console.log(`[Supabase Auth] Starting magic link sign in for: ${email}`);
  
  return withRetry(async () => {
    const supabase = createAuthClient();
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/confirm` : "";
    
    console.log(`[Supabase Auth] Magic link redirect URL: ${redirectTo}`);
    
    const result = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (result.error) {
      console.error(`[Supabase Auth] Magic link error:`, result.error);
      throw new Error(result.error.message);
    }
    
    console.log(`[Supabase Auth] Magic link sent successfully`);
    return result;
  }, "signInWithMagicLink");
}

export async function signInWithGoogle() {
  console.log(`[Supabase Auth] Starting Google OAuth sign in`);
  
  if (typeof window === "undefined") {
    console.error(`[Supabase Auth] Google OAuth called on server side`);
    throw new Error("Google OAuth can only be used on client side");
  }
  
  return withRetry(async () => {
    const supabase = createAuthClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    
    console.log(`[Supabase Auth] Google OAuth redirect URL: ${redirectTo}`);
    
    const result = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
    
    if (result.error) {
      console.error(`[Supabase Auth] Google OAuth error:`, result.error);
      throw new Error(result.error.message);
    }
    
    console.log(`[Supabase Auth] Google OAuth initiated successfully`);
    return result;
  }, "signInWithGoogle");
}

export async function signOut() {
  console.log(`[Supabase Auth] Starting sign out`);
  
  return withRetry(async () => {
    const supabase = createAuthClient();
    
    const result = await supabase.auth.signOut();
    
    if (result.error) {
      console.error(`[Supabase Auth] Sign out error:`, result.error);
      throw new Error(result.error.message);
    }
    
    console.log(`[Supabase Auth] Sign out successful`);
    return result;
  }, "signOut");
}

export async function getSession() {
  console.log(`[Supabase Auth] Getting session`);
  
  return withRetry(async () => {
    const supabase = createAuthClient();
    
    const result = await supabase.auth.getSession();
    
    if (result.error) {
      console.error(`[Supabase Auth] Get session error:`, result.error);
      throw new Error(result.error.message);
    }
    
    const hasSession = !!result.data.session;
    const userId = result.data.session?.user?.id;
    
    console.log(`[Supabase Auth] Session retrieved:`, {
      hasSession,
      userId: userId ? `${userId.substring(0, 8)}...` : null,
      expiresAt: result.data.session?.expires_at
    });
    
    return result;
  }, "getSession");
}

export async function getSessionWithFallback() {
  try {
    console.log(`[Supabase Auth] Getting session with fallback`);
    return await getSession();
  } catch (error) {
    console.error(`[Supabase Auth] Session fallback - returning null session:`, error);
    return {
      data: { session: null },
      error: null
    };
  }
}