import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { toKeyResult } from "@/lib/utils/mappers";

/* ── POST /api/key-results ── */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("key_results")
    .insert({
      objective_id: body.objectiveId,
      title: body.title,
      description: body.description ?? "",
      metric_type: body.metricType,
      start_value: body.startValue ?? 0,
      target_value: body.targetValue,
      unit: body.unit ?? "",
      owner_id: body.ownerId,
    })
    .select()
    .single();

  if (error) {
    console.error("POST /api/key-results error:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(toKeyResult(data as Record<string, unknown>), {
    status: 201,
  });
}
