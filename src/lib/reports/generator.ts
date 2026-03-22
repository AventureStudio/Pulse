import { supabaseAdmin } from "@/lib/supabase-server";
import { getAnthropicClient } from "@/lib/ai/anthropic";
import { calculateProgress } from "@/lib/utils/progress";
import { confidenceConfig } from "@/lib/utils/confidence";
import type { Objective, KeyResult, Period, Team, User } from "@/types";

interface ReportConfig {
  type: "okr_performance" | "team_analytics" | "period_summary";
  periodId: string;
  teamIds?: string[];
  format: "pdf" | "excel" | "json";
  userId: string;
}

interface ReportData {
  period: Period;
  objectives: (Objective & { keyResults: KeyResult[]; owner: User; team?: Team })[];
  teams: Team[];
  insights: AIInsights;
  metrics: PerformanceMetrics;
}

interface AIInsights {
  summary: string;
  predictions: {
    objective: string;
    likelihood: number;
    recommendation: string;
  }[];
  recommendations: {
    category: string;
    priority: "high" | "medium" | "low";
    action: string;
    impact: string;
  }[];
  trends: {
    metric: string;
    direction: "up" | "down" | "stable";
    change: number;
    analysis: string;
  }[];
}

interface PerformanceMetrics {
  totalObjectives: number;
  avgProgress: number;
  confidenceDistribution: Record<string, number>;
  teamPerformance: {
    teamId: string;
    teamName: string;
    objectivesCount: number;
    avgProgress: number;
    velocity: number;
  }[];
  keyResultsMetrics: {
    total: number;
    completed: number;
    avgProgress: number;
    byType: Record<string, number>;
  };
  timeSeriesData: {
    date: string;
    progress: number;
    confidence: number;
  }[];
}

export async function generateReport(config: ReportConfig): Promise<Buffer | string> {
  // Fetch report data
  const reportData = await fetchReportData(config);
  
  // Generate AI insights
  reportData.insights = await generateAIInsights(reportData, config.type);
  
  // Generate report based on format
  switch (config.format) {
    case "json":
      return JSON.stringify(reportData, null, 2);
    case "excel":
      return await generateExcelReport(reportData);
    case "pdf":
    default:
      return await generatePDFReport(reportData);
  }
}

async function fetchReportData(config: ReportConfig): Promise<ReportData> {
  // Fetch period
  const { data: period } = await supabaseAdmin
    .from("periods")
    .select("*")
    .eq("id", config.periodId)
    .single();

  if (!period) throw new Error("Period not found");

  // Build objectives query
  let objectivesQuery = supabaseAdmin
    .from("objectives")
    .select(`
      *,
      key_results(*),
      users!objectives_owner_id_fkey(*),
      teams(*)
    `)
    .eq("period_id", config.periodId);

  if (config.teamIds && config.teamIds.length > 0) {
    objectivesQuery = objectivesQuery.in("team_id", config.teamIds);
  }

  const { data: objectives } = await objectivesQuery;

  // Fetch teams
  let teamsQuery = supabaseAdmin.from("teams").select("*");
  if (config.teamIds && config.teamIds.length > 0) {
    teamsQuery = teamsQuery.in("id", config.teamIds);
  }
  const { data: teams } = await teamsQuery;

  // Calculate metrics
  const metrics = calculateMetrics(objectives || [], teams || []);

  return {
    period: {
      id: period.id,
      label: period.label,
      startDate: period.start_date,
      endDate: period.end_date,
      isActive: period.is_active,
      createdAt: period.created_at,
    },
    objectives: (objectives || []).map(mapObjective),
    teams: (teams || []).map(mapTeam),
    metrics,
    insights: { summary: "", predictions: [], recommendations: [], trends: [] }, // Will be filled by AI
  };
}

async function generateAIInsights(data: ReportData, reportType: string): Promise<AIInsights> {
  try {
    const anthropic = getAnthropicClient();
    
    const prompt = `Analyse les données de performance OKR suivantes et génère des insights pour un rapport ${reportType}:

Période: ${data.period.label}
Nombre d'objectifs: ${data.metrics.totalObjectives}
Progrès moyen: ${data.metrics.avgProgress}%
Distribution de confiance: ${JSON.stringify(data.metrics.confidenceDistribution)}

Performance par équipe:
${data.metrics.teamPerformance.map(t => 
  `- ${t.teamName}: ${t.objectivesCount} objectifs, ${t.avgProgress}% de progrès, vélocité ${t.velocity}`
).join('\n')}

Objectifs détaillés:
${data.objectives.slice(0, 10).map(o => 
  `- "${o.title}": ${o.progress}% (${confidenceConfig[o.confidence].label})`
).join('\n')}

Génère une analyse structurée avec:
1. Un résumé exécutif
2. Des prédictions d'atteinte des objectifs
3. Des recommandations d'amélioration prioritaires
4. L'analyse des tendances clés

Format de réponse en JSON strictement structuré.`;

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === "text") {
      try {
        return JSON.parse(content.text);
      } catch {
        // Fallback if JSON parsing fails
        return generateFallbackInsights(data);
      }
    }
  } catch (error) {
    console.error("AI insights generation failed:", error);
  }
  
  return generateFallbackInsights(data);
}

function generateFallbackInsights(data: ReportData): AIInsights {
  const avgProgress = data.metrics.avgProgress;
  const onTrackCount = data.metrics.confidenceDistribution.on_track || 0;
  const totalObjectives = data.metrics.totalObjectives;
  
  return {
    summary: `Période ${data.period.label}: ${totalObjectives} objectifs avec ${avgProgress}% de progrès moyen. ${onTrackCount} objectifs en bonne voie (${Math.round((onTrackCount / totalObjectives) * 100)}%).`,
    predictions: data.objectives.slice(0, 5).map(obj => ({
      objective: obj.title,
      likelihood: obj.confidence === "on_track" ? 85 : obj.confidence === "at_risk" ? 60 : 30,
      recommendation: obj.confidence === "off_track" 
        ? "Révision urgente des ressources et stratégie nécessaire"
        : obj.confidence === "at_risk"
        ? "Surveillance rapprochée et support supplémentaire recommandé"
        : "Maintenir le rythme actuel",
    })),
    recommendations: [
      {
        category: "Performance",
        priority: avgProgress < 50 ? "high" : "medium",
        action: "Réviser les objectifs sous-performants et ajuster les ressources",
        impact: "Amélioration estimée de 15-25% du taux d'atteinte",
      },
    ],
    trends: [
      {
        metric: "Progrès moyen",
        direction: avgProgress > 60 ? "up" : avgProgress < 40 ? "down" : "stable",
        change: avgProgress,
        analysis: `Performance ${avgProgress > 60 ? 'excellente' : avgProgress > 40 ? 'correcte' : 'préoccupante'} sur la période`,
      },
    ],
  };
}

function calculateMetrics(objectives: any[], teams: any[]): PerformanceMetrics {
  const totalObjectives = objectives.length;
  const avgProgress = totalObjectives > 0 
    ? Math.round(objectives.reduce((sum, obj) => sum + (obj.progress || 0), 0) / totalObjectives)
    : 0;

  const confidenceDistribution = objectives.reduce((acc, obj) => {
    acc[obj.confidence] = (acc[obj.confidence] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const teamPerformance = teams.map(team => {
    const teamObjectives = objectives.filter(obj => obj.team_id === team.id);
    const teamAvgProgress = teamObjectives.length > 0
      ? Math.round(teamObjectives.reduce((sum, obj) => sum + (obj.progress || 0), 0) / teamObjectives.length)
      : 0;
    
    return {
      teamId: team.id,
      teamName: team.name,
      objectivesCount: teamObjectives.length,
      avgProgress: teamAvgProgress,
      velocity: Math.max(0, teamAvgProgress - 30), // Simple velocity calculation
    };
  });

  const allKeyResults = objectives.flatMap(obj => obj.key_results || []);
  const keyResultsMetrics = {
    total: allKeyResults.length,
    completed: allKeyResults.filter(kr => kr.progress >= 100).length,
    avgProgress: allKeyResults.length > 0
      ? Math.round(allKeyResults.reduce((sum, kr) => sum + (kr.progress || 0), 0) / allKeyResults.length)
      : 0,
    byType: allKeyResults.reduce((acc, kr) => {
      acc[kr.metric_type] = (acc[kr.metric_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  // Generate mock time series data
  const timeSeriesData = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(Date.now() - (11 - i) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: Math.min(100, (i + 1) * (avgProgress / 12) + Math.random() * 10),
    confidence: Math.round((confidenceDistribution.on_track || 0) / totalObjectives * 100),
  }));

  return {
    totalObjectives,
    avgProgress,
    confidenceDistribution,
    teamPerformance,
    keyResultsMetrics,
    timeSeriesData,
  };
}

function mapObjective(obj: any): any {
  return {
    id: obj.id,
    title: obj.title,
    description: obj.description,
    level: obj.level,
    progress: obj.progress,
    confidence: obj.confidence,
    status: obj.status,
    createdAt: obj.created_at,
    updatedAt: obj.updated_at,
    keyResults: (obj.key_results || []).map(mapKeyResult),
    owner: obj.users ? {
      id: obj.users.id,
      fullName: obj.users.full_name,
      email: obj.users.email,
      role: obj.users.role,
    } : null,
    team: obj.teams ? {
      id: obj.teams.id,
      name: obj.teams.name,
      description: obj.teams.description,
    } : null,
  };
}

function mapKeyResult(kr: any): any {
  return {
    id: kr.id,
    title: kr.title,
    description: kr.description,
    metricType: kr.metric_type,
    startValue: kr.start_value,
    currentValue: kr.current_value,
    targetValue: kr.target_value,
    unit: kr.unit,
    progress: kr.progress,
    confidence: kr.confidence,
  };
}

function mapTeam(team: any): Team {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    parentTeamId: team.parent_team_id,
    createdAt: team.created_at,
  };
}

async function generatePDFReport(data: ReportData): Promise<Buffer> {
  // For this implementation, we'll return a simple text-based report
  // In a real implementation, you'd use a library like puppeteer or jsPDF
  const reportContent = `
=== RAPPORT DE PERFORMANCE OKR ===
Période: ${data.period.label}
Généré le: ${new Date().toLocaleDateString('fr-FR')}

=== RÉSUMÉ EXÉCUTIF ===
${data.insights.summary}

=== MÉTRIQUES CLÉS ===
- Objectifs totaux: ${data.metrics.totalObjectives}
- Progrès moyen: ${data.metrics.avgProgress}%
- Key Results: ${data.metrics.keyResultsMetrics.total} (${data.metrics.keyResultsMetrics.completed} terminés)

=== PERFORMANCE PAR ÉQUIPE ===
${data.metrics.teamPerformance.map(team => 
  `${team.teamName}: ${team.avgProgress}% (${team.objectivesCount} objectifs)`
).join('\n')}

=== RECOMMANDATIONS ===
${data.insights.recommendations.map(rec => 
  `[${rec.priority.toUpperCase()}] ${rec.category}: ${rec.action}`
).join('\n')}
  `;
  
  return Buffer.from(reportContent, 'utf-8');
}

async function generateExcelReport(data: ReportData): Promise<Buffer> {
  // For this implementation, we'll return CSV data
  // In a real implementation, you'd use a library like exceljs
  const csvContent = [
    ['Objectif', 'Équipe', 'Propriétaire', 'Progrès', 'Confiance', 'Status'],
    ...data.objectives.map(obj => [
      obj.title,
      obj.team?.name || 'N/A',
      obj.owner?.fullName || 'N/A',
      `${obj.progress}%`,
      confidenceConfig[obj.confidence].label,
      obj.status,
    ]),
  ].map(row => row.join(',')).join('\n');
  
  return Buffer.from(csvContent, 'utf-8');
}