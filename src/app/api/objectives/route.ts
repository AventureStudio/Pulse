import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { toObjective } from "@/lib/utils/mappers";

/* ── GET /api/objectives ── */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const periodId = params.get("periodId");
  const level = params.get("level");
  const status = params.get("status");
  const teamId = params.get("teamId");
  const ownerId = params.get("ownerId");
  const parentObjectiveId = params.get("parentObjectiveId");
  const search = params.get("search");

  let query = supabaseAdmin
    .from("objectives")
    .select("*, key_results(count)")
    .order("sort_order", { ascending: true });

  if (periodId) query = query.eq("period_id", periodId);
  if (level) query = query.eq("level", level);
  if (status) query = query.eq("status", status);
  if (teamId) query = query.eq("team_id", teamId);
  if (ownerId) query = query.eq("owner_id", ownerId);
  if (parentObjectiveId) query = query.eq("parent_objective_id", parentObjectiveId);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const objectives = (data ?? []).map((row) => {
    const keyResultsCount =
      Array.isArray(row.key_results) && row.key_results.length > 0
        ? (row.key_results[0] as { count: number }).count
        : 0;

    return {
      ...toObjective(row as Record<string, unknown>),
      keyResultsCount,
    };
  });

  return NextResponse.json(objectives);
}

/* ── POST /api/objectives ── */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("objectives")
    .insert({
      title: body.title,
      description: body.description ?? "",
      level: body.level,
      owner_id: body.ownerId,
      team_id: body.teamId ?? null,
      period_id: body.periodId,
      parent_objective_id: body.parentObjectiveId ?? null,
      status: body.status ?? "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toObjective(data as Record<string, unknown>), {
    status: 201,
  });
}
