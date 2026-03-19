import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { toTeam, toObjective, toUser } from "@/lib/utils/mappers";

type RouteContext = { params: Promise<{ id: string }> };

/* ── GET /api/teams/[id] ── */
export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("teams")
    .select("*, users(*), objectives(*)")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error(`GET /api/teams/${id} error:`, error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  const members = Array.isArray(data.users)
    ? data.users.map((u: Record<string, unknown>) => toUser(u))
    : [];

  const objectives = Array.isArray(data.objectives)
    ? data.objectives.map((o: Record<string, unknown>) => toObjective(o))
    : [];

  const team = {
    ...toTeam(data as Record<string, unknown>),
    members,
    objectives,
  };

  return NextResponse.json(team);
}

/* ── PUT /api/teams/[id] ── */
export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await context.params;
  const body = await request.json();

  const updateFields: Record<string, unknown> = {};
  if (body.name !== undefined) updateFields.name = body.name;
  if (body.description !== undefined) updateFields.description = body.description;
  if (body.parentTeamId !== undefined)
    updateFields.parent_team_id = body.parentTeamId;

  const { data, error } = await supabaseAdmin
    .from("teams")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error(`PUT /api/teams/${id} error:`, error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  return NextResponse.json(toTeam(data as Record<string, unknown>));
}

/* ── DELETE /api/teams/[id] ── */
export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { id } = await context.params;

  const { error } = await supabaseAdmin
    .from("teams")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`DELETE /api/teams/${id} error:`, error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
