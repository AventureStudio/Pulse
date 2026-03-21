import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase-api";
import { supabaseAdmin, supabaseAuthAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const { emails, teamId } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "No emails provided" }, { status: 400 });
    }

    // Use authenticated user's ID as inviter instead of trusting client
    const invitations = emails.map((email: string) => ({
      email: email.toLowerCase().trim(),
      invited_by: user.id,
      team_id: teamId || null,
      role: "member",
      status: "pending",
    }));

    // Store invitations in Pulse data DB
    const { data, error } = await supabaseAdmin
      .from("invitations")
      .insert(invitations)
      .select();

    if (error) {
      console.error("POST /api/invitations error:", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    // Send magic link invitations via CENTRAL auth project
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const sendResults = await Promise.allSettled(
      emails.map((email: string) =>
        supabaseAuthAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: email.toLowerCase().trim(),
          options: {
            redirectTo: `${origin}/auth/confirm?next=/dashboard`,
          },
        })
      )
    );

    const sentCount = sendResults.filter((r) => r.status === "fulfilled").length;

    return NextResponse.json({ invitations: data, sentCount });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let query = supabaseAdmin.from("invitations").select("*").order("created_at", { ascending: false });
    if (email) {
      query = query.eq("email", email.toLowerCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error("GET /api/invitations error:", error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
