import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/supabase-api";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  let user;
  try {
    user = await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = params;

  // Users can only complete their own onboarding
  if (user.id !== id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { activity, roleDescription } = await request.json();

    const { error } = await supabaseAdmin
      .from("users")
      .update({
        activity,
        role_description: roleDescription,
        onboarded: true,
      })
      .eq("id", id);

    if (error) {
      console.error(`PUT /api/users/${id}/onboarding error:`, error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
