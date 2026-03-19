import type { User, Team, Period, Objective, KeyResult, CheckIn, Invitation } from "@/types";

export function toUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    email: row.email as string,
    avatarUrl: (row.avatar_url as string) || null,
    role: row.role as User["role"],
    teamId: (row.team_id as string) || null,
    activity: (row.activity as string) || null,
    roleDescription: (row.role_description as string) || null,
    onboarded: (row.onboarded as boolean) ?? false,
    createdAt: row.created_at as string,
  };
}

export function toInvitation(row: Record<string, unknown>): Invitation {
  return {
    id: row.id as string,
    email: row.email as string,
    invitedBy: row.invited_by as string,
    teamId: (row.team_id as string) || null,
    role: row.role as Invitation["role"],
    status: row.status as Invitation["status"],
    createdAt: row.created_at as string,
    acceptedAt: (row.accepted_at as string) || null,
  };
}

export function toTeam(row: Record<string, unknown>): Team {
  return {
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string) || "",
    parentTeamId: (row.parent_team_id as string) || null,
    createdAt: row.created_at as string,
  };
}

export function toPeriod(row: Record<string, unknown>): Period {
  return {
    id: row.id as string,
    label: row.label as string,
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    isActive: row.is_active as boolean,
    createdAt: row.created_at as string,
  };
}

export function toObjective(row: Record<string, unknown>): Objective {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    level: row.level as Objective["level"],
    ownerId: row.owner_id as string,
    teamId: (row.team_id as string) || null,
    periodId: row.period_id as string,
    parentObjectiveId: (row.parent_objective_id as string) || null,
    status: row.status as Objective["status"],
    progress: row.progress as number,
    confidence: row.confidence as Objective["confidence"],
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function toKeyResult(row: Record<string, unknown>): KeyResult {
  return {
    id: row.id as string,
    objectiveId: row.objective_id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    metricType: row.metric_type as KeyResult["metricType"],
    startValue: Number(row.start_value),
    currentValue: Number(row.current_value),
    targetValue: Number(row.target_value),
    unit: (row.unit as string) || "",
    progress: row.progress as number,
    confidence: row.confidence as KeyResult["confidence"],
    ownerId: row.owner_id as string,
    sortOrder: row.sort_order as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function toCheckIn(row: Record<string, unknown>): CheckIn {
  return {
    id: row.id as string,
    keyResultId: row.key_result_id as string,
    authorId: row.author_id as string,
    previousValue: Number(row.previous_value),
    newValue: Number(row.new_value),
    confidence: row.confidence as CheckIn["confidence"],
    note: (row.note as string) || "",
    createdAt: row.created_at as string,
  };
}
