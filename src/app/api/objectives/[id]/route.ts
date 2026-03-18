import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { toObjective, toKeyResult } from "@/lib/utils/mappers";

type RouteContext = { params: Promise<{ id: string }> };

/* ── GET /api/objectives/[id] ── */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("objectives")
    .select("*, key_results(*)")
    .eq("id", id)
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
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
  const { id } = await context.params;
  const body = await request.json();

  // Map camelCase body keys to snake_case columns
  const updateFields: Record<string, unknown> = {};
  if (body.title !== undefined) updateFields.title = body.title;
  if (body.description !== undefined) updateFields.description = body.description;
  if (body.level !== undefined) updateFields.level = body.level;
  if (body.ownerId !== undefined) updateFields.owner_id = body.ownerId;
  if (body.teamId !== undefined) updateFields.team_id = body.teamId;
  if (body.periodId !== undefined) updateFields.period_id = body.periodId;
  if (body.parentObjectiveId !== undefined)
    updateFields.parent_objective_id = body.parentObjectiveId;
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
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(toObjective(data as Record<string, unknown>));
}

/* ── DELETE /api/objectives/[id] ── */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const { error } = await supabaseAdmin
    .from("objectives")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
