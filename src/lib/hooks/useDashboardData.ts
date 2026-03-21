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

interface UseDashboardDataReturn extends DashboardData {
  setSelectedPeriodId: (id: string) => void;
  refetch: () => void;
}

// Cache for data with 30 second TTL
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30000; // 30 seconds

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Fetch with timeout
async function fetchWithTimeout(url: string, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-cache'
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>({
    objectives: [],
    periods: [],
    selectedPeriodId: "",
    loading: true,
    error: null,
  });

  // Fetch periods with caching
  const fetchPeriods = useCallback(async () => {
    const cacheKey = "periods";
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      const res = await fetchWithTimeout("/api/periods");
      const periods: Period[] = await res.json();
      setCachedData(cacheKey, periods);
      return periods;
    } catch {
      return [];
    }
  }, []);

  // Fetch objectives with caching and pagination
  const fetchObjectives = useCallback(async (periodId: string) => {
    if (!periodId) return [];
    
    const cacheKey = `objectives-${periodId}`;
    const cached = getCachedData(cacheKey);
    
    if (cached) {
      return cached;
    }

    try {
      // Limit to 50 objectives initially for performance
      const res = await fetchWithTimeout(
        `/api/objectives?periodId=${periodId}&limit=50`
      );
      const objectives: Objective[] = await res.json();
      setCachedData(cacheKey, objectives);
      return objectives;
    } catch {
      return [];
    }
  }, []);

  // Initialize data
  const initializeData = useCallback(async () => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const periods = await fetchPeriods();
      const activePeriod = periods.find(p => p.isActive);
      const selectedId = activePeriod?.id || periods[0]?.id || "";
      
      const objectives = await fetchObjectives(selectedId);
      
      setData({
        periods,
        objectives,
        selectedPeriodId: selectedId,
        loading: false,
        error: null,
      });
    } catch (error) {
      setData(prev => ({
        ...prev,
        loading: false,
        error: "Erreur de chargement des données",
      }));
    }
  }, [fetchPeriods, fetchObjectives]);

  // Change period
  const setSelectedPeriodId = useCallback(async (periodId: string) => {
    setData(prev => ({ ...prev, selectedPeriodId: periodId, loading: true }));
    
    try {
      const objectives = await fetchObjectives(periodId);
      setData(prev => ({ ...prev, objectives, loading: false }));
    } catch {
      setData(prev => ({ ...prev, loading: false, error: "Erreur de chargement" }));
    }
  }, [fetchObjectives]);

  // Refetch data
  const refetch = useCallback(() => {
    // Clear cache
    cache.clear();
    initializeData();
  }, [initializeData]);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return {
    ...data,
    setSelectedPeriodId,
    refetch,
  };
}