import { createBrowserClient } from "@supabase/ssr";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

export function createAuthClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: AUTH_COOKIE_DOMAIN,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
    }
  );
}
