import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-server";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

/**
 * Server-side callback for OAuth and PKCE flows.
 * Supabase redirects here with ?code=xxx after successful OAuth / magic link.
 * We exchange the code for a session using the CENTRAL auth project.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") || "/dashboard";
  const origin = request.nextUrl.origin;

  // Collect cookies set by Supabase during auth exchange
  const cookiesToApply: { name: string; value: string; options: CookieOptions }[] = [];

  // Use CENTRAL Supabase for auth exchange
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach((cookie) => cookiesToApply.push(cookie));
        },
      },
    }
  );

  let userId: string | undefined;
  let email: string | undefined;
  let fullName: string | undefined;

  try {
    if (code) {
      // PKCE / OAuth flow — exchange authorization code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
      userId = data.user?.id;
      email = data.user?.email;
      fullName = data.user?.user_metadata?.full_name;
    } else if (token_hash && type) {
      // OTP / token_hash flow
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as "magiclink" | "email",
      });
      if (error) throw error;
      userId = data.user?.id;
      email = data.user?.email;
      fullName = data.user?.user_metadata?.full_name;
    }
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  if (!userId || !email) {
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  // Determine redirect destination
  let redirectPath = next;

  try {
    // Check for pending invitation in Pulse data DB
    const { data: invitation } = await supabaseAdmin
      .from("invitations")
      .select("*")
      .eq("email", email.toLowerCase())
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const upsertData: Record<string, unknown> = {
      id: userId,
      email,
      full_name: fullName || email.split("@")[0] || "User",
      role: invitation?.role || "member",
    };

    if (invitation?.team_id) {
      upsertData.team_id = invitation.team_id;
    }

    await supabaseAdmin.from("users").upsert(upsertData, { onConflict: "id" });

    if (invitation) {
      await supabaseAdmin
        .from("invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);
    }

    // Check onboarding status
    const { data: userProfile } = await supabaseAdmin
      .from("users")
      .select("onboarded")
      .eq("id", userId)
      .single();

    if (!userProfile?.onboarded) {
      redirectPath = "/onboarding";
    }
  } catch (err) {
    console.error("User setup error:", err);
  }

  // Build final response with all session cookies (cross-domain)
  const response = NextResponse.redirect(new URL(redirectPath, origin));
  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, {
      ...options,
      domain: AUTH_COOKIE_DOMAIN,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  });

  return response;
}
