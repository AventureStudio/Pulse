import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { requireAuth } from "@/lib/supabase-api";
import { generateProgressReport, sendReport } from "@/lib/reports/generator";
import type { Report, ReportConfig, AlertThresholds } from "@/types";

/* ── GET /api/reports ── */
export async function GET(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const params = request.nextUrl.searchParams;
  const periodId = params.get("periodId");
  const action = params.get("action");

  // Generate new report
  if (action === "generate" && periodId) {
    try {
      const defaultThresholds: AlertThresholds = {
        behindSchedule: 15, // 15% behind expected
        noProgressDays: 7, // 7 days without updates
        decliningConfidence: true,
        overdueCheckin: 14 // 14 days since last check-in
      };

      const { metrics, alerts } = await generateProgressReport(periodId, defaultThresholds);
      
      // Save report to database
      const { data: reportData, error } = await supabaseAdmin
        .from('reports')
        .insert({
          period_id: periodId,
          title: `Rapport OKR - ${new Date().toLocaleDateString('fr-FR')}`,
          status: 'ready',
          data: metrics,
          alerts: alerts,
          generated_at: new Date().toISOString(),
          recipients: []
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving report:', error);
        return NextResponse.json({ error: "Erreur lors de la sauvegarde" }, { status: 500 });
      }

      const report: Report = {
        id: reportData.id,
        periodId: reportData.period_id,
        title: reportData.title,
        status: reportData.status,
        data: reportData.data,
        alerts: reportData.alerts,
        generatedAt: reportData.generated_at,
        sentAt: reportData.sent_at,
        recipients: reportData.recipients
      };

      return NextResponse.json(report);
    } catch (error) {
      console.error('Error generating report:', error);
      return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
    }
  }

  // List existing reports
  if (periodId) {
    const { data, error } = await supabaseAdmin
      .from('reports')
      .select('*')
      .eq('period_id', periodId)
      .order('generated_at', { ascending: false });

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    const reports: Report[] = (data || []).map(r => ({
      id: r.id,
      periodId: r.period_id,
      title: r.title,
      status: r.status,
      data: r.data,
      alerts: r.alerts,
      generatedAt: r.generated_at,
      sentAt: r.sent_at,
      recipients: r.recipients
    }));

    return NextResponse.json(reports);
  }

  return NextResponse.json({ error: "Period ID required" }, { status: 400 });
}

/* ── POST /api/reports ── */
export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const body = await request.json();
  const { reportId, action, recipients } = body;

  if (action === "send" && reportId && recipients) {
    try {
      // Fetch the report
      const { data: reportData, error } = await supabaseAdmin
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (error || !reportData) {
        return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
      }

      const report: Report = {
        id: reportData.id,
        periodId: reportData.period_id,
        title: reportData.title,
        status: reportData.status,
        data: reportData.data,
        alerts: reportData.alerts,
        generatedAt: reportData.generated_at,
        sentAt: reportData.sent_at,
        recipients: reportData.recipients
      };

      const success = await sendReport(report, recipients);
      
      if (success) {
        return NextResponse.json({ message: "Rapport envoyé avec succès" });
      } else {
        return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
      }
    } catch (error) {
      console.error('Error sending report:', error);
      return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

/* ── PUT /api/reports ── */
export async function PUT(request: NextRequest) {
  try {
    await requireAuth(request);
  } catch (res) {
    return res as NextResponse;
  }

  const body = await request.json();
  const { config } = body as { config: Partial<ReportConfig> };

  try {
    const { data, error } = await supabaseAdmin
      .from('report_configs')
      .upsert({
        frequency: config.frequency || 'weekly',
        day_of_week: config.dayOfWeek || 1,
        enabled: config.enabled || false,
        recipients: config.recipients || [],
        alert_thresholds: config.alertThresholds || {
          behindSchedule: 15,
          noProgressDays: 7,
          decliningConfidence: true,
          overdueCheckin: 14
        },
        include_charts: config.includeCharts || true,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating config:', error);
      return NextResponse.json({ error: "Erreur lors de la configuration" }, { status: 500 });
    }

    const savedConfig: ReportConfig = {
      id: data.id,
      frequency: data.frequency,
      dayOfWeek: data.day_of_week,
      enabled: data.enabled,
      recipients: data.recipients,
      alertThresholds: data.alert_thresholds,
      includeCharts: data.include_charts,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };

    return NextResponse.json(savedConfig);
  } catch (error) {
    console.error('Error updating report config:', error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}