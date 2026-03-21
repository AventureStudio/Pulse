"use client";

import { useState, useEffect, useCallback } from "react";
import type { Objective, Period } from "@/types";

interface DashboardData {
  objectives: Objective[];
  periods: Period[];
  selectedPeriodId: string;
  loading: boolean;
  error: string | null;
}

interface DashboardActions {
  setSelectedPeriodId: (id: string) => void;
  refresh: () => void;
}

export function useDashboardData(): DashboardData & DashboardActions {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch periods with timeout
  const fetchPeriods = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch("/api/periods", {
        signal: controller.signal,
        headers: {
          "Cache-Control": "max-age=60"
        }
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data: Period[] = await res.json();
        setPeriods(data);
        const active = data.find((p) => p.isActive);
        if (active && !selectedPeriodId) {
          setSelectedPeriodId(active.id);
        } else if (data.length > 0 && !selectedPeriodId) {
          setSelectedPeriodId(data[0].id);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError("Erreur lors du chargement des périodes");
      }
    }
  }, [selectedPeriodId]);

  // Fetch objectives with timeout and optimizations
  const fetchObjectives = useCallback(async (periodId: string) => {
    if (!periodId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(`/api/objectives?periodId=${periodId}&limit=50`, {
        signal: controller.signal,
        headers: {
          "Cache-Control": "max-age=30"
        }
      });
      
      clearTimeout(timeoutId);
      
      if (res.ok) {
        const data: Objective[] = await res.json();
        setObjectives(data);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError("Erreur lors du chargement des objectifs");
        setObjectives([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load periods on mount
  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  // Load objectives when period changes
  useEffect(() => {
    if (selectedPeriodId) {
      fetchObjectives(selectedPeriodId);
    }
  }, [selectedPeriodId, fetchObjectives]);

  const refresh = useCallback(() => {
    if (selectedPeriodId) {
      fetchObjectives(selectedPeriodId);
    }
  }, [selectedPeriodId, fetchObjectives]);

  return {
    objectives,
    periods,
    selectedPeriodId,
    loading,
    error,
    setSelectedPeriodId,
    refresh
  };
}