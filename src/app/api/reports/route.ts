import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { generateReport } from "@/lib/reports/generator";

/* ── GET /api/reports ── */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const { data, error } = await supabaseAdmin
    .from("report_configs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("GET /api/reports error:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  const reports = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    periodId: row.period_id,
    teamIds: row.team_ids || [],
    format: row.format,
    schedule: row.schedule_config ? {
      frequency: row.schedule_config.frequency,
      dayOfWeek: row.schedule_config.dayOfWeek,
      dayOfMonth: row.schedule_config.dayOfMonth,
      recipients: row.schedule_config.recipients || [],
    } : undefined,
    createdAt: row.created_at,
    lastRun: row.last_run_at,
  }));

  return NextResponse.json(reports, {
    headers: {
      "Cache-Control": "private, max-age=0, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

/* ── POST /api/reports ── */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    // Save report configuration
    const { data: configData, error: configError } = await supabaseAdmin
      .from("report_configs")
      .insert({
        name: body.name,
        type: body.type,
        period_id: body.periodId,
        team_ids: body.teamIds || null,
        format: body.format,
        schedule_config: body.schedule || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (configError) {
      console.error("POST /api/reports config error:", configError.message);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    return NextResponse.json({
      id: configData.id,
      name: configData.name,
      type: configData.type,
      periodId: configData.period_id,
      teamIds: configData.team_ids || [],
      format: configData.format,
      schedule: configData.schedule_config,
      createdAt: configData.created_at,
    }, { status: 201 });
  } catch (res) {
    return res as NextResponse;
  }
}

/* ── POST /api/reports/generate ── */
export async function generateHandler(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();

    const reportData = await generateReport({
      type: body.type,
      periodId: body.periodId,
      teamIds: body.teamIds,
      format: body.format,
      userId: user.id,
    });

    const contentType = {
      pdf: "application/pdf",
      excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      json: "application/json",
    }[body.format];

    return new NextResponse(reportData, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="report-${Date.now()}.${body.format}"`,
      },
    });
  } catch (res) {
    return res as NextResponse;
  }
}