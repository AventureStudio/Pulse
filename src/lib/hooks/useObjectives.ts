"use client";

import { useState, useEffect, useMemo } from "react";
import type { Objective, ObjectiveLevel, ObjectiveStatus } from "@/types";

interface UseObjectivesFilters {
  periodId?: string;
  level?: ObjectiveLevel;
  status?: ObjectiveStatus;
  search?: string;
  teamId?: string;
}

interface UseObjectivesReturn {
  objectives: Objective[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to manage objectives state with proper loading states
 * and error handling for E2E tests
 */
export function useObjectives(filters: UseObjectivesFilters = {}): UseObjectivesReturn {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const filterKey = useMemo(
    () => JSON.stringify(filters),
    [filters]
  );

  const fetchObjectives = async () => {
    if (!filters.periodId) {
      setObjectives([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ periodId: filters.periodId });
      if (filters.level) params.set("level", filters.level);
      if (filters.status) params.set("status", filters.status);
      if (filters.search) params.set("search", filters.search);
      if (filters.teamId) params.set("teamId", filters.teamId);

      const res = await fetch(`/api/objectives?${params}`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: Objective[] = await res.json();
      setObjectives(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch objectives'));
      setObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjectives();
  }, [filterKey]);

  return {
    objectives,
    loading,
    error,
    refetch: fetchObjectives,
  };
}