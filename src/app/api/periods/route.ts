import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { toPeriod } from "@/lib/utils/mappers";

/* ── GET /api/periods ── */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { data, error } = await supabaseAdmin
    .from("periods")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) {
    console.error("GET /api/periods error:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  const periods = (data ?? []).map((row) =>
    toPeriod(row as Record<string, unknown>),
  );

  return NextResponse.json(periods);
}

/* ── POST /api/periods ── */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const body = await request.json();

  if (body.isActive) {
    const { error: deactivateError } = await supabaseAdmin
      .from("periods")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      console.error("POST /api/periods deactivate error:", deactivateError.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }

  const { data, error } = await supabaseAdmin
    .from("periods")
    .insert({
      label: body.label,
      start_date: body.startDate,
      end_date: body.endDate,
      is_active: body.isActive ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("POST /api/periods error:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  return NextResponse.json(toPeriod(data as Record<string, unknown>), {
    status: 201,
  });
}

/* ── PUT /api/periods ── */
export async function PUT(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const body = await request.json();

  if (!body.id) {
    return NextResponse.json(
      { error: "id is required in the request body" },
      { status: 400 },
    );
  }

  if (body.isActive) {
    const { error: deactivateError } = await supabaseAdmin
      .from("periods")
      .update({ is_active: false })
      .eq("is_active", true);

    if (deactivateError) {
      console.error("PUT /api/periods deactivate error:", deactivateError.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
  }

  const updateFields: Record<string, unknown> = {};
  if (body.label !== undefined) updateFields.label = body.label;
  if (body.startDate !== undefined) updateFields.start_date = body.startDate;
  if (body.endDate !== undefined) updateFields.end_date = body.endDate;
  if (body.isActive !== undefined) updateFields.is_active = body.isActive;

  const { data, error } = await supabaseAdmin
    .from("periods")
    .update(updateFields)
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    const status = error.code === "PGRST116" ? 404 : 500;
    console.error("PUT /api/periods error:", error.message);
    return NextResponse.json({ error: status === 404 ? "Non trouvé" : "Erreur serveur" }, { status });
  }

  return NextResponse.json(toPeriod(data as Record<string, unknown>));
}
