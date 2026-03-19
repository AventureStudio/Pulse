import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { toObjective, toKeyResult } from "@/lib/utils/mappers";

type RouteContext = { params: Promise<{ id: string }> };

/* ── GET /api/objectives/[id] ── */
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
    .from("objectives")
    .select("*, key_results(*)")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error(`GET /api/objectives/${id} error:`, error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  const keyResults = Array.isArray(data.key_results)
    ? data.key_results.map((kr: Record<string, unknown>) => toKeyResult(kr))
    : [];

  const objective = {
    ...toObjective(data as Record<string, unknown>),
    keyResults,
  };

  return NextResponse.json(objective);
}

/* ── PUT /api/objectives/[id] ── */
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
  if (body.title !== undefined) updateFields.title = body.title;
  if (body.description !== undefined) updateFields.description = body.description;
  if (body.level !== undefined) updateFields.level = body.level;
  if (body.ownerId !== undefined) updateFields.owner_id = body.ownerId || null;
  if (body.teamId !== undefined) updateFields.team_id = body.teamId || null;
  if (body.periodId !== undefined) updateFields.period_id = body.periodId;
  if (body.parentObjectiveId !== undefined)
    updateFields.parent_objective_id = body.parentObjectiveId || null;
  if (body.status !== undefined) updateFields.status = body.status;
  if (body.progress !== undefined) updateFields.progress = body.progress;
  if (body.confidence !== undefined) updateFields.confidence = body.confidence;
  if (body.sortOrder !== undefined) updateFields.sort_order = body.sortOrder;

  const { data, error } = await supabaseAdmin
    .from("objectives")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error(`PUT /api/objectives/${id} error:`, error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  return NextResponse.json(toObjective(data as Record<string, unknown>));
}

/* ── DELETE /api/objectives/[id] ── */
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
    .from("objectives")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`DELETE /api/objectives/${id} error:`, error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
