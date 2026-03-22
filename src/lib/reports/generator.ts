import { supabaseAdmin } from "@/lib/supabase-server";
import type {
  Report,
  ProgressMetrics,
  ReportAlert,
  AlertThresholds,
  LevelMetrics,
  TeamMetrics,
  TrendingData,
  WeeklyProgressPoint,
  Objective,
  KeyResult,
  CheckIn,
  Team,
  User,
  Period,
  AlertLevel,
  ObjectiveLevel
} from "@/types";

/**
 * Generate comprehensive OKR progress report
 */
export async function generateProgressReport(
  periodId: string,
  alertThresholds: AlertThresholds
): Promise<{ metrics: ProgressMetrics; alerts: ReportAlert[] }> {
  // Fetch all data for the period
  const [objectives, teams, period] = await Promise.all([
    fetchObjectivesWithDetails(periodId),
    fetchTeams(),
    fetchPeriod(periodId)
  ]);

  if (!period) {
    throw new Error('Period not found');
  }

  const metrics = calculateProgressMetrics(objectives, teams, period);
  const alerts = generateAlerts(objectives, alertThresholds, period);

  return { metrics, alerts };
}

/**
 * Fetch objectives with full details for analysis
 */
async function fetchObjectivesWithDetails(periodId: string): Promise<Objective[]> {
  const { data, error } = await supabaseAdmin
    .from('objectives')
    .select(`
      *,
      owner:owner_id(id, full_name, email, role),
      team:team_id(id, name),
      key_results:key_results(
        *,
        check_ins:check_ins(
          id, new_value, confidence, note, created_at,
          author:author_id(full_name)
        )
      )
    `)
    .eq('period_id', periodId)
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching objectives:', error);
    return [];
  }

  return (data || []).map(mapObjectiveFromDB);
}

async function fetchTeams(): Promise<Team[]> {
  const { data, error } = await supabaseAdmin
    .from('teams')
    .select('*');
  
  if (error) {
    console.error('Error fetching teams:', error);
    return [];
  }

  return (data || []).map(team => ({
    id: team.id,
    name: team.name,
    description: team.description,
    parentTeamId: team.parent_team_id,
    createdAt: team.created_at
  }));
}

async function fetchPeriod(periodId: string): Promise<Period | null> {
  const { data, error } = await supabaseAdmin
    .from('periods')
    .select('*')
    .eq('id', periodId)
    .single();
  
  if (error) return null;
  
  return {
    id: data.id,
    label: data.label,
    startDate: data.start_date,
    endDate: data.end_date,
    isActive: data.is_active,
    createdAt: data.created_at
  };
}

/**
 * Calculate comprehensive progress metrics
 */
function calculateProgressMetrics(
  objectives: Objective[],
  teams: Team[],
  period: Period
): ProgressMetrics {
  const totalObjectives = objectives.length;
  const completedObjectives = objectives.filter(o => o.progress >= 100).length;
  const avgProgress = totalObjectives > 0 
    ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives) 
    : 0;
  
  const onTrackCount = objectives.filter(o => o.confidence === 'on_track').length;
  const atRiskCount = objectives.filter(o => o.confidence === 'at_risk').length;
  const offTrackCount = objectives.filter(o => o.confidence === 'off_track').length;

  const byLevel = calculateLevelMetrics(objectives);
  const byTeam = calculateTeamMetrics(objectives, teams);
  const trending = calculateTrendingData(objectives);
  const weeklyProgress = calculateWeeklyProgress(objectives, period);

  return {
    periodId: period.id,
    totalObjectives,
    completedObjectives,
    avgProgress,
    onTrackCount,
    atRiskCount,
    offTrackCount,
    byLevel,
    byTeam,
    trending,
    weeklyProgress
  };
}

function calculateLevelMetrics(objectives: Objective[]): LevelMetrics[] {
  const levels: ObjectiveLevel[] = ['company', 'team', 'individual'];
  
  return levels.map(level => {
    const levelObjectives = objectives.filter(o => o.level === level);
    const count = levelObjectives.length;
    
    if (count === 0) {
      return {
        level,
        count: 0,
        avgProgress: 0,
        onTrack: 0,
        atRisk: 0,
        offTrack: 0
      };
    }

    return {
      level,
      count,
      avgProgress: Math.round(levelObjectives.reduce((sum, o) => sum + o.progress, 0) / count),
      onTrack: levelObjectives.filter(o => o.confidence === 'on_track').length,
      atRisk: levelObjectives.filter(o => o.confidence === 'at_risk').length,
      offTrack: levelObjectives.filter(o => o.confidence === 'off_track').length
    };
  });
}

function calculateTeamMetrics(objectives: Objective[], teams: Team[]): TeamMetrics[] {
  const teamObjectives = objectives.filter(o => o.teamId);
  const teamIds = [...new Set(teamObjectives.map(o => o.teamId!))];
  
  return teamIds.map(teamId => {
    const team = teams.find(t => t.id === teamId);
    const objs = teamObjectives.filter(o => o.teamId === teamId);
    const count = objs.length;
    
    return {
      teamId,
      teamName: team?.name || 'Unknown Team',
      count,
      avgProgress: count > 0 ? Math.round(objs.reduce((sum, o) => sum + o.progress, 0) / count) : 0,
      onTrack: objs.filter(o => o.confidence === 'on_track').length,
      atRisk: objs.filter(o => o.confidence === 'at_risk').length,
      offTrack: objs.filter(o => o.confidence === 'off_track').length
    };
  });
}

function calculateTrendingData(objectives: Objective[]): TrendingData[] {
  // For this demo, we'll calculate trend based on recent check-ins
  // In a real implementation, you'd compare with previous week's data
  return objectives.slice(0, 10).map(obj => {
    // Mock trend calculation - in reality you'd compare historical data
    const recentCheckIns = obj.keyResults?.flatMap(kr => kr.checkIns || []) || [];
    const hasRecentActivity = recentCheckIns.length > 0;
    
    return {
      objectiveId: obj.id,
      title: obj.title,
      level: obj.level,
      previousProgress: Math.max(0, obj.progress - 5), // Mock previous
      currentProgress: obj.progress,
      trend: hasRecentActivity ? 'up' : obj.progress > 50 ? 'stable' : 'down'
    };
  });
}

function calculateWeeklyProgress(objectives: Objective[], period: Period): WeeklyProgressPoint[] {
  // Generate weekly data points for the period
  const weeks: WeeklyProgressPoint[] = [];
  const startDate = new Date(period.startDate);
  const endDate = new Date(period.endDate);
  const currentDate = new Date();
  
  for (let date = new Date(startDate); date <= Math.min(currentDate.getTime(), endDate.getTime()); date.setDate(date.getDate() + 7)) {
    const weekLabel = `${date.getDate()}/${date.getMonth() + 1}`;
    
    // For demo purposes, simulate weekly progress
    // In reality, you'd query historical data
    const weekProgress = Math.min(100, Math.floor(Math.random() * 20) + objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length);
    
    weeks.push({
      week: weekLabel,
      avgProgress: weekProgress,
      onTrack: Math.floor(objectives.length * 0.6),
      atRisk: Math.floor(objectives.length * 0.3),
      offTrack: Math.floor(objectives.length * 0.1)
    });
  }
  
  return weeks;
}

/**
 * Generate alerts for objectives that need attention
 */
function generateAlerts(
  objectives: Objective[],
  thresholds: AlertThresholds,
  period: Period
): ReportAlert[] {
  const alerts: ReportAlert[] = [];
  const now = new Date();
  const periodStart = new Date(period.startDate);
  const periodEnd = new Date(period.endDate);
  const expectedProgress = calculateExpectedProgress(now, periodStart, periodEnd);

  objectives.forEach(objective => {
    // Check if behind schedule
    if (objective.progress < expectedProgress - thresholds.behindSchedule) {
      alerts.push({
        id: `behind_${objective.id}`,
        level: 'warning',
        type: 'behind_schedule',
        objectiveId: objective.id,
        objectiveTitle: objective.title,
        message: `Objective is ${Math.round(expectedProgress - objective.progress)}% behind expected progress`,
        actionRequired: true
      });
    }

    // Check for objectives with no recent progress
    const keyResults = objective.keyResults || [];
    const hasRecentCheckIn = keyResults.some(kr => {
      const checkIns = kr.checkIns || [];
      if (checkIns.length === 0) return false;
      
      const lastCheckIn = new Date(checkIns[0].createdAt);
      const daysSinceCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCheckIn <= thresholds.noProgressDays;
    });

    if (!hasRecentCheckIn && keyResults.length > 0) {
      alerts.push({
        id: `no_progress_${objective.id}`,
        level: 'info',
        type: 'no_progress',
        objectiveId: objective.id,
        objectiveTitle: objective.title,
        message: `No progress updates in the last ${thresholds.noProgressDays} days`,
        actionRequired: true
      });
    }

    // Check for declining confidence
    if (objective.confidence === 'off_track') {
      alerts.push({
        id: `confidence_${objective.id}`,
        level: 'critical',
        type: 'declining_confidence',
        objectiveId: objective.id,
        objectiveTitle: objective.title,
        message: 'Objective confidence is off-track and needs immediate attention',
        actionRequired: true
      });
    }
  });

  return alerts.sort((a, b) => {
    const levelOrder = { critical: 3, warning: 2, info: 1 };
    return levelOrder[b.level] - levelOrder[a.level];
  });
}

function calculateExpectedProgress(now: Date, start: Date, end: Date): number {
  if (now <= start) return 0;
  if (now >= end) return 100;
  return Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100);
}

/**
 * Send report to recipients
 */
export async function sendReport(report: Report, recipients: string[]): Promise<boolean> {
  // In a real implementation, this would integrate with an email service
  console.log(`Sending report ${report.id} to ${recipients.length} recipients`);
  
  // Mock email sending
  try {
    // Update report status
    await supabaseAdmin
      .from('reports')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .eq('id', report.id);
    
    return true;
  } catch (error) {
    console.error('Error sending report:', error);
    return false;
  }
}

/**
 * Helper to map database objective to type
 */
function mapObjectiveFromDB(data: any): Objective {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    level: data.level,
    ownerId: data.owner_id,
    teamId: data.team_id,
    periodId: data.period_id,
    parentObjectiveId: data.parent_objective_id,
    status: data.status,
    progress: data.progress,
    confidence: data.confidence,
    sortOrder: data.sort_order,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    owner: data.owner ? {
      id: data.owner.id,
      fullName: data.owner.full_name,
      email: data.owner.email,
      role: data.owner.role,
      avatarUrl: null,
      teamId: null,
      activity: null,
      roleDescription: null,
      onboarded: true,
      createdAt: ''
    } : undefined,
    team: data.team ? {
      id: data.team.id,
      name: data.team.name,
      description: '',
      parentTeamId: null,
      createdAt: ''
    } : undefined,
    keyResults: (data.key_results || []).map((kr: any) => ({
      id: kr.id,
      objectiveId: kr.objective_id,
      title: kr.title,
      description: kr.description,
      metricType: kr.metric_type,
      startValue: kr.start_value,
      currentValue: kr.current_value,
      targetValue: kr.target_value,
      unit: kr.unit,
      progress: kr.progress,
      confidence: kr.confidence,
      ownerId: kr.owner_id,
      sortOrder: kr.sort_order,
      createdAt: kr.created_at,
      updatedAt: kr.updated_at,
      checkIns: (kr.check_ins || []).map((ci: any) => ({
        id: ci.id,
        keyResultId: kr.id,
        authorId: '',
        previousValue: 0,
        newValue: ci.new_value,
        confidence: ci.confidence,
        note: ci.note,
        createdAt: ci.created_at
      }))
    }))
  };
}