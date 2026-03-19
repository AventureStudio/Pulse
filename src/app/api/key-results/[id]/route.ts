import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { toKeyResult, toCheckIn } from "@/lib/utils/mappers";

type RouteContext = { params: Promise<{ id: string }> };

/* ── GET /api/key-results/[id] ── */
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
    .from("key_results")
    .select("*, check_ins(*)")
    .eq("id", id)
    .order("created_at", {
      ascending: false,
      referencedTable: "check_ins",
    })
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error(`GET /api/key-results/${id} error:`, error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  const checkIns = Array.isArray(data.check_ins)
    ? data.check_ins.map((ci: Record<string, unknown>) => toCheckIn(ci))
    : [];

  const keyResult = {
    ...toKeyResult(data as Record<string, unknown>),
    checkIns,
  };

  return NextResponse.json(keyResult);
}

/* ── PUT /api/key-results/[id] ── */
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
  if (body.metricType !== undefined) updateFields.metric_type = body.metricType;
  if (body.startValue !== undefined) updateFields.start_value = body.startValue;
  if (body.currentValue !== undefined) updateFields.current_value = body.currentValue;
  if (body.targetValue !== undefined) updateFields.target_value = body.targetValue;
  if (body.unit !== undefined) updateFields.unit = body.unit;
  if (body.progress !== undefined) updateFields.progress = body.progress;
  if (body.confidence !== undefined) updateFields.confidence = body.confidence;
  if (body.ownerId !== undefined) updateFields.owner_id = body.ownerId;
  if (body.sortOrder !== undefined) updateFields.sort_order = body.sortOrder;

  const { data, error } = await supabaseAdmin
    .from("key_results")
    .update(updateFields)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error(`PUT /api/key-results/${id} error:`, error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  return NextResponse.json(toKeyResult(data as Record<string, unknown>));
}

/* ── DELETE /api/key-results/[id] ── */
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
    .from("key_results")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`DELETE /api/key-results/${id} error:`, error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
