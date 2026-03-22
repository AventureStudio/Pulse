"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Target,
  TrendingUp,
  AlertTriangle,
  XCircle,
  Activity,
  Building2,
  Users,
  User,
  Plus,
} from "lucide-react";
import type { Objective, Period } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n";

// Hook pour les requêtes avec timeout et cache
function useApiData<T>(url: string, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout
        
        const response = await Promise.race([
          fetch(url, { signal: controller.signal }),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Request timeout')), 8000)
          )
        ]);
        
        clearTimeout(timeoutId);
        
        if (!cancelled && response.ok) {
          const result = await response.json();
          setData(result);
        } else if (!cancelled && !response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Failed to fetch ${url}:`, err);
          setError(err as Error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    
    fetchData();
    
    return () => {
      cancelled = true;
    };
  }, dependencies);
  
  return { data, loading, error };
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  
  // Fetch periods avec cache
  const { data: periods, loading: periodsLoading } = useApiData<Period[]>("/api/periods");
  
  // Fetch objectives pour la période sélectionnée avec cache
  const objectivesUrl = selectedPeriodId ? `/api/objectives?periodId=${selectedPeriodId}` : "";
  const { data: objectives, loading: objectivesLoading } = useApiData<Objective[]>(
    objectivesUrl,
    [selectedPeriodId]
  );

  // Définir la période active au chargement
  useEffect(() => {
    if (periods && periods.length > 0 && !selectedPeriodId) {
      const active = periods.find((p) => p.isActive);
      setSelectedPeriodId(active ? active.id : periods[0].id);
    }
  }, [periods, selectedPeriodId]);

  // Compute stats avec useMemo pour optimiser
  const stats = useMemo(() => {
    if (!objectives) return null;
    
    const totalObjectives = objectives.length;
    const onTrackCount = objectives.filter((o) => o.confidence === "on_track").length;
    const atRiskCount = objectives.filter((o) => o.confidence === "at_risk").length;
    const offTrackCount = objectives.filter((o) => o.confidence === "off_track").length;
    const avgProgress =
      totalObjectives > 0
        ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives)
        : 0;

    return {
      totalObjectives,
      onTrackCount,
      atRiskCount,
      offTrackCount,
      avgProgress,
    };
  }, [objectives]);

  // Données dérivées avec useMemo
  const derivedData = useMemo(() => {
    if (!objectives) return null;
    
    const recentObjectives = [...objectives]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);

    const companyObjectives = objectives.filter((o) => o.level === "company");
    const teamObjectives = objectives.filter((o) => o.level === "team");
    const individualObjectives = objectives.filter((o) => o.level === "individual");

    const avgProgressForLevel = (objs: Objective[]) =>
      objs.length > 0
        ? Math.round(objs.reduce((sum, o) => sum + o.progress, 0) / objs.length)
        : 0;
        
    return {
      recentObjectives,
      levelData: [
        {
          label: t("level.company"),
          icon: Building2,
          count: companyObjectives.length,
          progress: avgProgressForLevel(companyObjectives),
        },
        {
          label: t("level.team"),
          icon: Users,
          count: teamObjectives.length,
          progress: avgProgressForLevel(teamObjectives),
        },
        {
          label: t("level.individual"),
          icon: User,
          count: individualObjectives.length,
          progress: avgProgressForLevel(individualObjectives),
        },
      ],
    };
  }, [objectives, t]);

  const loading = periodsLoading || objectivesLoading || !selectedPeriodId;

  const statsCards = stats ? [
    {
      label: t("dashboard.totalObjectives"),
      value: stats.totalObjectives,
      icon: Target,
      color: "text-primary-600 bg-primary-100",
    },
    {
      label: t("dashboard.onTrack"),
      value: stats.onTrackCount,
      icon: TrendingUp,
      color: "text-success-600 bg-success-100",
    },
    {
      label: t("dashboard.atRisk"),
      value: stats.atRiskCount,
      icon: AlertTriangle,
      color: "text-warning-600 bg-warning-100",
    },
    {
      label: t("dashboard.offTrack"),
      value: stats.offTrackCount,
      icon: XCircle,
      color: "text-danger-600 bg-danger-100",
    },
  ] : [];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
        {periods && periods.length > 0 && (
          <select
            className="input"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} {p.isActive ? `(${t("common.active").toLowerCase()})` : ""}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : !stats || stats.totalObjectives === 0 ? (
        <EmptyState
          icon={<Activity className="w-7 h-7" />}
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDesc")}
          action={{ label: t("dashboard.createObjective"), href: "/objectives/new" }}
        />
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsCards.map((stat) => (
              <div key={stat.label} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">
                    {stat.label}
                  </span>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Average progress */}
          <div className="card p-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                {t("dashboard.avgProgress")}
              </span>
              <span className="text-lg font-bold text-gray-900">{stats.avgProgress}%</span>
            </div>
            <ProgressBar progress={stats.avgProgress} size="lg" />
          </div>

          {derivedData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Recent objectives */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("dashboard.recentObjectives")}
                </h2>
                <div className="space-y-3">
                  {derivedData.recentObjectives.map((obj) => (
                    <Link
                      key={obj.id}
                      href={`/objectives/${obj.id}`}
                      className="block p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {obj.title}
                        </span>
                        <ConfidenceBadge confidence={obj.confidence} size="sm" />
                      </div>
                      <ProgressBar progress={obj.progress} size="sm" showLabel />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Breakdown by level */}
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {t("dashboard.byLevel")}
                </h2>
                <div className="space-y-5">
                  {derivedData.levelData.map((level) => (
                    <div key={level.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <level.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            {level.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            ({level.count})
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {level.progress}%
                        </span>
                      </div>
                      <ProgressBar progress={level.progress} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}