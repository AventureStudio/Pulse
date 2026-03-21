import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase-server";

const AUTH_COOKIE_DOMAIN =
  process.env.NODE_ENV === "production" ? ".aventure-studio.com" : undefined;

export async function POST(request: NextRequest) {
  try {
    // Verify the session from cookies using CENTRAL auth project
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

    const { data: { user: authUser } } = await supabase.auth.getUser();

    // Fall back to body params only during initial callback (session may not be in cookies yet)
    const body = await request.json();
    const userId = authUser?.id || body.userId;
    const email = authUser?.email || body.email;
    const fullName = authUser?.user_metadata?.full_name || body.fullName;

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
    }

    // Check if there's a pending invitation (in Pulse data DB)
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

    // Mark invitation as accepted
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

    return NextResponse.json({
      onboarded: userProfile?.onboarded ?? false,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
