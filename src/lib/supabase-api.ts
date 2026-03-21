import { supabase } from "./supabase";
import type { Objective, KeyResult, Period, Team } from "@/types";

// Response cache with TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

function getCacheKey(operation: string, params: Record<string, any> = {}): string {
  return `${operation}_${JSON.stringify(params)}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function getObjectives(params: {
  periodId?: string;
  teamId?: string;
  userId?: string;
  level?: "company" | "team" | "individual";
  limit?: number;
}): Promise<Objective[]> {
  const cacheKey = getCacheKey("objectives", params);
  const cached = getFromCache<Objective[]>(cacheKey);
  if (cached) return cached;

  let query = supabase
    .from("objectives")
    .select(`
      *,
      key_results (*),
      team:team_id (*),
      owner:owner_id (*)
    `)
    .order("updated_at", { ascending: false });

  if (params.periodId) {
    query = query.eq("period_id", params.periodId);
  }
  if (params.teamId) {
    query = query.eq("team_id", params.teamId);
  }
  if (params.userId) {
    query = query.eq("owner_id", params.userId);
  }
  if (params.level) {
    query = query.eq("level", params.level);
  }
  if (params.limit) {
    query = query.limit(params.limit);
  }

  const { data, error } = await query;
  if (error) throw error;

  const objectives = data?.map(transformObjective) || [];
  setCache(cacheKey, objectives);
  return objectives;
}

export async function getObjective(id: string): Promise<Objective | null> {
  const cacheKey = getCacheKey("objective", { id });
  const cached = getFromCache<Objective>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("objectives")
    .select(`
      *,
      key_results (*),
      team:team_id (*),
      owner:owner_id (*),
      parent:parent_id (*)
    `)
    .eq("id", id)
    .single();

  if (error) return null;
  if (!data) return null;

  const objective = transformObjective(data);
  setCache(cacheKey, objective);
  return objective;
}

export async function getPeriods(): Promise<Period[]> {
  const cacheKey = getCacheKey("periods");
  const cached = getFromCache<Period[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("periods")
    .select("*")
    .order("start_date", { ascending: false });

  if (error) throw error;

  const periods = data?.map(transformPeriod) || [];
  setCache(cacheKey, periods);
  return periods;
}

export async function getTeams(): Promise<Team[]> {
  const cacheKey = getCacheKey("teams");
  const cached = getFromCache<Team[]>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("name");

  if (error) throw error;

  const teams = data?.map(transformTeam) || [];
  setCache(cacheKey, teams);
  return teams;
}

// Optimized batch operations
export async function createObjective(
  objective: Omit<Objective, "id" | "createdAt" | "updatedAt">
): Promise<Objective> {
  // Clear cache for objectives
  Array.from(cache.keys())
    .filter(key => key.startsWith('objectives_'))
    .forEach(key => cache.delete(key));

  const { data, error } = await supabase
    .from("objectives")
    .insert({
      title: objective.title,
      description: objective.description,
      level: objective.level,
      confidence: objective.confidence,
      progress: objective.progress,
      period_id: objective.periodId,
      team_id: objective.teamId,
      owner_id: objective.ownerId,
      parent_id: objective.parentId,
    })
    .select(`
      *,
      key_results (*),
      team:team_id (*),
      owner:owner_id (*)
    `)
    .single();

  if (error) throw error;
  return transformObjective(data);
}

export async function updateObjective(
  id: string,
  updates: Partial<Objective>
): Promise<Objective> {
  // Clear related cache entries
  Array.from(cache.keys())
    .filter(key => key.includes('objective') || key.includes(id))
    .forEach(key => cache.delete(key));

  const { data, error } = await supabase
    .from("objectives")
    .update({
      ...(updates.title && { title: updates.title }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.level && { level: updates.level }),
      ...(updates.confidence && { confidence: updates.confidence }),
      ...(updates.progress !== undefined && { progress: updates.progress }),
      ...(updates.periodId && { period_id: updates.periodId }),
      ...(updates.teamId && { team_id: updates.teamId }),
      ...(updates.ownerId && { owner_id: updates.ownerId }),
      ...(updates.parentId !== undefined && { parent_id: updates.parentId }),
    })
    .eq("id", id)
    .select(`
      *,
      key_results (*),
      team:team_id (*),
      owner:owner_id (*)
    `)
    .single();

  if (error) throw error;
  return transformObjective(data);
}

// Transform functions (optimized)
function transformObjective(data: any): Objective {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    level: data.level,
    confidence: data.confidence,
    progress: data.progress,
    periodId: data.period_id,
    teamId: data.team_id,
    ownerId: data.owner_id,
    parentId: data.parent_id,
    keyResults: data.key_results?.map(transformKeyResult) || [],
    team: data.team ? transformTeam(data.team) : undefined,
    owner: data.owner ? {
      id: data.owner.id,
      fullName: data.owner.full_name,
      email: data.owner.email,
      avatarUrl: data.owner.avatar_url,
    } : undefined,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformKeyResult(data: any): KeyResult {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    type: data.type,
    startValue: data.start_value,
    targetValue: data.target_value,
    currentValue: data.current_value,
    unit: data.unit,
    objectiveId: data.objective_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

function transformPeriod(data: any): Period {
  return {
    id: data.id,
    label: data.label,
    startDate: data.start_date,
    endDate: data.end_date,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
}

function transformTeam(data: any): Team {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    color: data.color,
    createdAt: data.created_at,
  };
}

// Clear cache function for external use
export function clearCache(pattern?: string): void {
  if (pattern) {
    Array.from(cache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => cache.delete(key));
  } else {
    cache.clear();
  }
}