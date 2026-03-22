import type { Objective, Team } from "@/types";

// Types pour les données de visualisation
export interface HeatMapData {
  teamId: string;
  teamName: string;
  avgProgress: number;
  confidence: "on_track" | "at_risk" | "off_track";
  objectiveCount: number;
  intensity: number;
}

export interface TrendMetric {
  current: number;
  previous: number;
  trend: "up" | "down" | "stable";
}

export interface VisualizationData {
  avgProgress: TrendMetric;
  onTrackPercentage: TrendMetric;
  atRiskPercentage: TrendMetric;
  activeObjectives: TrendMetric;
  lastUpdate: Date;
}

/**
 * Calcule les données pour la heat map OKR
 */
export function calculateHeatMapData(
  objectives: Objective[], 
  teams: Team[]
): HeatMapData[] {
  const teamMap = new Map<string, HeatMapData>();

  // Initialiser avec les équipes existantes
  teams.forEach(team => {
    teamMap.set(team.id, {
      teamId: team.id,
      teamName: team.name,
      avgProgress: 0,
      confidence: "on_track",
      objectiveCount: 0,
      intensity: 0
    });
  });

  // Ajouter le niveau entreprise
  teamMap.set("company", {
    teamId: "company",
    teamName: "Entreprise",
    avgProgress: 0,
    confidence: "on_track",
    objectiveCount: 0,
    intensity: 0
  });

  // Traiter les objectifs
  objectives.forEach(obj => {
    const teamId = obj.teamId || "company";
    const data = teamMap.get(teamId);
    
    if (data) {
      data.objectiveCount++;
      
      // Calculer la progression moyenne pondérée
      const totalProgress = data.avgProgress * (data.objectiveCount - 1) + obj.progress;
      data.avgProgress = Math.round(totalProgress / data.objectiveCount);
      
      // Mettre à jour la confiance (prendre le pire cas)
      if (obj.confidence === "off_track" || 
         (obj.confidence === "at_risk" && data.confidence === "on_track")) {
        data.confidence = obj.confidence;
      }
      
      // Calculer l'intensité basée sur la progression et le nombre d'objectifs
      data.intensity = Math.min(1, Math.max(0.3, data.avgProgress / 100));
    }
  });

  // Retourner seulement les équipes avec des objectifs
  return Array.from(teamMap.values()).filter(data => data.objectiveCount > 0);
}

/**
 * Calcule la couleur pour la heat map basée sur la progression et la confiance
 */
export function getHeatMapColor(progress: number, confidence: string): string {
  if (confidence === "off_track") {
    return "#ef4444"; // red-500
  }
  if (confidence === "at_risk") {
    return progress >= 50 ? "#eab308" : "#f97316"; // yellow-500 ou orange-500
  }
  
  // on_track - couleurs graduées selon la progression
  if (progress >= 80) return "#10b981"; // emerald-500
  if (progress >= 60) return "#4ade80"; // green-400
  if (progress >= 40) return "#a3e635"; // lime-400
  if (progress >= 20) return "#fde047"; // yellow-300
  return "#d1d5db"; // gray-300
}

/**
 * Simule des données de tendance (en attendant une vraie API de métriques historiques)
 */
export function generateTrendData(objectives: Objective[]): VisualizationData {
  const currentAvgProgress = objectives.length > 0 
    ? Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length)
    : 0;

  const onTrackCount = objectives.filter(obj => obj.confidence === "on_track").length;
  const onTrackPercentage = objectives.length > 0 
    ? Math.round((onTrackCount / objectives.length) * 100)
    : 0;

  const atRiskCount = objectives.filter(obj => obj.confidence === "at_risk").length;
  const atRiskPercentage = objectives.length > 0
    ? Math.round((atRiskCount / objectives.length) * 100)
    : 0;

  const activeCount = objectives.filter(obj => obj.status === "active").length;

  // Simulation de données précédentes (normalement stockées en base)
  const previousAvgProgress = Math.max(0, currentAvgProgress - Math.floor(Math.random() * 10));
  const previousOnTrack = Math.max(0, onTrackPercentage - Math.floor(Math.random() * 8));
  const previousAtRisk = Math.min(100, atRiskPercentage + Math.floor(Math.random() * 5));
  const previousActive = Math.max(0, activeCount - Math.floor(Math.random() * 3));

  return {
    avgProgress: {
      current: currentAvgProgress,
      previous: previousAvgProgress,
      trend: currentAvgProgress > previousAvgProgress ? "up" : 
             currentAvgProgress < previousAvgProgress ? "down" : "stable"
    },
    onTrackPercentage: {
      current: onTrackPercentage,
      previous: previousOnTrack,
      trend: onTrackPercentage > previousOnTrack ? "up" : 
             onTrackPercentage < previousOnTrack ? "down" : "stable"
    },
    atRiskPercentage: {
      current: atRiskPercentage,
      previous: previousAtRisk,
      trend: atRiskPercentage < previousAtRisk ? "up" : 
             atRiskPercentage > previousAtRisk ? "down" : "stable"
    },
    activeObjectives: {
      current: activeCount,
      previous: previousActive,
      trend: activeCount > previousActive ? "up" : 
             activeCount < previousActive ? "down" : "stable"
    },
    lastUpdate: new Date()
  };
}

/**
 * Formatte les nombres pour l'affichage dans les graphiques
 */
export function formatMetricValue(value: number, type: "percentage" | "count" | "progress"): string {
  switch (type) {
    case "percentage":
    case "progress":
      return `${value}%`;
    case "count":
      return value.toString();
    default:
      return value.toString();
  }
}

/**
 * Calcule l'intensité de couleur pour la heat map (0.3 à 1.0)
 */
export function calculateIntensity(progress: number, objectiveCount: number): number {
  const baseIntensity = Math.max(0.3, progress / 100);
  const countBonus = Math.min(0.2, objectiveCount * 0.05);
  return Math.min(1, baseIntensity + countBonus);
}

/**
 * Détermine si une métrique est en amélioration, détérioration ou stable
 */
export function getTrendDirection(current: number, previous: number, threshold: number = 1): "up" | "down" | "stable" {
  const diff = current - previous;
  if (Math.abs(diff) < threshold) return "stable";
  return diff > 0 ? "up" : "down";
}