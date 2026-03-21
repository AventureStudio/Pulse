import { createAuthClient } from "./supabase-auth-client";

export async function signInWithMagicLink(email: string) {
  const supabase = createAuthClient();
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/confirm`,
    },
  });
}

export async function signInWithGoogle() {
  const supabase = createAuthClient();
  return supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function signOut() {
  const supabase = createAuthClient();
  return supabase.auth.signOut();
}

export async function getSession() {
  const supabase = createAuthClient();
  return supabase.auth.getSession();
}
