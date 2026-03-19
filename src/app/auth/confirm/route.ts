import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Server-side callback for PKCE magic link flow.
 * Supabase redirects here with ?code=xxx after the user clicks the magic link.
 * We exchange the code for a session using cookies (where the code_verifier lives).
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
    },
  );

  let userId: string | undefined;
  let email: string | undefined;
  let fullName: string | undefined;

  try {
    if (code) {
      // PKCE flow — exchange authorization code for session
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
    console.error("Auth confirm error:", err);
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  if (!userId || !email) {
    return NextResponse.redirect(new URL("/login?error=auth", origin));
  }

  // Determine redirect destination
  let redirectPath = next;

  try {
    // Check for pending invitation
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

  // Build final response with all session cookies
  const response = NextResponse.redirect(new URL(redirectPath, origin));
  cookiesToApply.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options);
  });

  return response;
}
