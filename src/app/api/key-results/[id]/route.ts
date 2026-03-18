import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { toKeyResult, toCheckIn } from "@/lib/utils/mappers";

type RouteContext = { params: Promise<{ id: string }> };

/* ── GET /api/key-results/[id] ── */
export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
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
    return NextResponse.json({ error: error.message }, { status });
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
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json(toKeyResult(data as Record<string, unknown>));
}

/* ── DELETE /api/key-results/[id] ── */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  const { id } = await context.params;

  const { error } = await supabaseAdmin
    .from("key_results")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
