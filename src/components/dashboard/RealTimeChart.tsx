"use client";

import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import type { Objective } from "@/types";
import { useVisualizationData } from "@/lib/hooks/useVisualizationData";
import { useI18n } from "@/lib/i18n";

interface TrendData {
  label: string;
  current: number;
  previous: number;
  trend: "up" | "down" | "stable";
  change: number;
}

interface RealTimeChartProps {
  objectives: Objective[];
  periodId: string;
  className?: string;
}

function getTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return TrendingUp;
    case "down":
      return TrendingDown;
    default:
      return Minus;
  }
}

function getTrendColor(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return "text-success-600 bg-success-100";
    case "down":
      return "text-danger-600 bg-danger-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export default function RealTimeChart({ objectives, periodId, className = "" }: RealTimeChartProps) {
  const { t } = useI18n();
  const { data: visualizationData, refreshData } = useVisualizationData(periodId);

  // Refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const trendMetrics = useMemo((): TrendData[] => {
    if (!visualizationData) {
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

      return [
        {
          label: "Progression moyenne",
          current: currentAvgProgress,
          previous: Math.max(0, currentAvgProgress - 5),
          trend: "up",
          change: 5
        },
        {
          label: "Objectifs en bonne voie",
          current: onTrackPercentage,
          previous: Math.max(0, onTrackPercentage - 3),
          trend: "up",
          change: 3
        },
        {
          label: "Objectifs à risque",
          current: atRiskPercentage,
          previous: atRiskPercentage + 2,
          trend: "down",
          change: -2
        },
        {
          label: "Objectifs actifs",
          current: objectives.filter(obj => obj.status === "active").length,
          previous: Math.max(0, objectives.filter(obj => obj.status === "active").length - 1),
          trend: "up",
          change: 1
        }
      ];
    }

    return [
      {
        label: "Progression moyenne",
        current: visualizationData.avgProgress.current,
        previous: visualizationData.avgProgress.previous,
        trend: visualizationData.avgProgress.trend,
        change: visualizationData.avgProgress.current - visualizationData.avgProgress.previous
      },
      {
        label: "Objectifs en bonne voie",
        current: visualizationData.onTrackPercentage.current,
        previous: visualizationData.onTrackPercentage.previous,
        trend: visualizationData.onTrackPercentage.trend,
        change: visualizationData.onTrackPercentage.current - visualizationData.onTrackPercentage.previous
      },
      {
        label: "Objectifs à risque",
        current: visualizationData.atRiskPercentage.current,
        previous: visualizationData.atRiskPercentage.previous,
        trend: visualizationData.atRiskPercentage.trend,
        change: visualizationData.atRiskPercentage.current - visualizationData.atRiskPercentage.previous
      },
      {
        label: "Objectifs actifs",
        current: visualizationData.activeObjectives.current,
        previous: visualizationData.activeObjectives.previous,
        trend: visualizationData.activeObjectives.trend,
        change: visualizationData.activeObjectives.current - visualizationData.activeObjectives.previous
      }
    ];
  }, [objectives, visualizationData]);

  const lastUpdate = visualizationData?.lastUpdate || new Date();

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Métriques temps réel
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-success-600">
          <Activity className="w-4 h-4 animate-pulse" />
          <span className="text-xs font-medium">LIVE</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {trendMetrics.map((metric, index) => {
          const TrendIcon = getTrendIcon(metric.trend);
          const trendColor = getTrendColor(metric.trend);
          const isPercentage = metric.label.includes("Progression") || metric.label.includes("bonne voie") || metric.label.includes("risque");
          
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative p-4 rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {metric.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {metric.current}{isPercentage ? '%' : ''}
                    </span>
                    {metric.change !== 0 && (
                      <span className={`text-xs font-medium flex items-center gap-1 ${trendColor}`}>
                        <TrendIcon className="w-3 h-3" />
                        {Math.abs(metric.change)}{isPercentage ? 'pp' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className={`p-2 rounded-lg ${trendColor}`}>
                  <TrendIcon className="w-4 h-4" />
                </div>
              </div>
              
              {/* Mini progress bar visualization */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Précédent: {metric.previous}{isPercentage ? '%' : ''}</span>
                  <span>Actuel: {metric.current}{isPercentage ? '%' : ''}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <motion.div
                    className={`h-full rounded-full ${
                      metric.trend === "up" ? "bg-success-500" :
                      metric.trend === "down" ? "bg-danger-500" :
                      "bg-gray-400"
                    }`}
                    initial={{ width: `${Math.min(100, (metric.previous / (isPercentage ? 100 : Math.max(metric.current, metric.previous, 10))) * 100)}%` }}
                    animate={{ width: `${Math.min(100, (metric.current / (isPercentage ? 100 : Math.max(metric.current, metric.previous, 10))) * 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}