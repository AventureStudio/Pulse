"use client";

import { useState, useEffect, useCallback } from "react";
import type { VisualizationData } from "@/lib/utils/visualization";
import { generateTrendData } from "@/lib/utils/visualization";
import type { Objective } from "@/types";

interface UseVisualizationDataReturn {
  data: VisualizationData | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
}

/**
 * Hook personnalisé pour récupérer et gérer les données de visualisation en temps réel
 */
export function useVisualizationData(periodId: string): UseVisualizationDataReturn {
  const [data, setData] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisualizationData = useCallback(async () => {
    if (!periodId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      
      // Récupérer les objectifs pour la période
      const objectivesRes = await fetch(`/api/objectives?periodId=${periodId}`);
      if (!objectivesRes.ok) {
        throw new Error('Erreur lors du chargement des objectifs');
      }
      
      const objectives: Objective[] = await objectivesRes.json();
      
      // Générer les données de tendance
      // En production, ceci ferait appel à une API dédiée aux métriques historiques
      const visualizationData = generateTrendData(objectives);
      
      setData(visualizationData);
    } catch (err) {
      console.error('Erreur lors du chargement des données de visualisation:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [periodId]);

  const refreshData = useCallback(() => {
    if (!loading) {
      setLoading(true);
      fetchVisualizationData();
    }
  }, [fetchVisualizationData, loading]);

  // Chargement initial
  useEffect(() => {
    fetchVisualizationData();
  }, [fetchVisualizationData]);

  // Actualisation automatique toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchVisualizationData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchVisualizationData]);

  // Actualisation lors du changement de focus de la fenêtre
  useEffect(() => {
    const handleFocus = () => {
      // Actualiser seulement si la dernière mise à jour date de plus de 30 secondes
      if (data && new Date().getTime() - data.lastUpdate.getTime() > 30000) {
        fetchVisualizationData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [data, fetchVisualizationData]);

  return {
    data,
    loading,
    error,
    refreshData
  };
}

/**
 * Hook pour les données de heat map avec cache optimisé
 */
export function useHeatMapData(objectives: Objective[], teams: any[]) {
  const [cacheKey, setCacheKey] = useState<string>('');
  const [cachedData, setCachedData] = useState<any>(null);

  useEffect(() => {
    // Créer une clé de cache basée sur les données
    const newCacheKey = `${objectives.length}-${objectives.map(o => `${o.id}:${o.progress}:${o.confidence}`).join(',')}-${teams.length}`;
    
    if (newCacheKey !== cacheKey) {
      setCacheKey(newCacheKey);
      // Recalculer les données seulement si nécessaire
      // (Le calcul se fait dans le composant OKRHeatMap)
      setCachedData(null);
    }
  }, [objectives, teams, cacheKey]);

  return { cacheKey, cachedData, setCachedData };
}