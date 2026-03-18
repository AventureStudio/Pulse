import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { toTeam } from "@/lib/utils/mappers";

/* ── GET /api/teams ── */
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("teams")
    .select("*, users(count)")
    .order("name", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const teams = (data ?? []).map((row) => {
    const memberCount =
      Array.isArray(row.users) && row.users.length > 0
        ? (row.users[0] as { count: number }).count
        : 0;

    return {
      ...toTeam(row as Record<string, unknown>),
      memberCount,
    };
  });

  return NextResponse.json(teams);
}

/* ── POST /api/teams ── */
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("teams")
    .insert({
      name: body.name,
      description: body.description ?? "",
      parent_team_id: body.parentTeamId ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(toTeam(data as Record<string, unknown>), {
    status: 201,
  });
}
