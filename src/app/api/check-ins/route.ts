import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { toCheckIn } from "@/lib/utils/mappers";

/* ── GET /api/check-ins ── */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const keyResultId = params.get("keyResultId");

  let query = supabaseAdmin
    .from("check_ins")
    .select("*")
    .order("created_at", { ascending: false });

  if (keyResultId) query = query.eq("key_result_id", keyResultId);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const checkIns = (data ?? []).map((row) =>
    toCheckIn(row as Record<string, unknown>),
  );

  return NextResponse.json(checkIns);
}

/* ── POST /api/check-ins ── */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("check_ins")
    .insert({
      key_result_id: body.keyResultId,
      author_id: body.authorId,
      previous_value: body.previousValue,
      new_value: body.newValue,
      confidence: body.confidence,
      note: body.note ?? "",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toCheckIn(data as Record<string, unknown>), {
    status: 201,
  });
}
