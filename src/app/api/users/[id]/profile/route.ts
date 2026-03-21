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

  // Users can only update their own profile
  if (user.id !== id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  try {
    const { fullName, activity, roleDescription } = await request.json();

    const updateFields: Record<string, unknown> = {};
    if (fullName !== undefined) updateFields.full_name = fullName;
    if (activity !== undefined) updateFields.activity = activity;
    if (roleDescription !== undefined) updateFields.role_description = roleDescription;

    const { error } = await supabaseAdmin
      .from("users")
      .update(updateFields)
      .eq("id", id);

    if (error) {
      console.error(`PUT /api/users/${id}/profile error:`, error.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
