"use client";

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
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
} from "lucide-react";
import type { Objective, Period } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load non-critical components
const ConfidenceBadge = lazy(() => import("@/components/ui/ConfidenceBadge"));

// Virtual scrolling for large lists
function VirtualObjectiveList({ objectives }: { objectives: Objective[] }) {
  const [visibleCount, setVisibleCount] = useState(5);
  
  const visibleObjectives = useMemo(() => 
    objectives.slice(0, visibleCount),
    [objectives, visibleCount]
  );

  return (
    <div className="space-y-3">
      {visibleObjectives.map((obj) => (
        <Link
          key={obj.id}
          href={`/objectives/${obj.id}`}
          className="block p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-900 truncate">
              {obj.title}
            </span>
            <Suspense fallback={<div className="skeleton w-16 h-5 rounded-full" />}>
              <ConfidenceBadge confidence={obj.confidence} size="sm" />
            </Suspense>
          </div>
          <ProgressBar progress={obj.progress} size="sm" showLabel />
        </Link>
      ))}
      {visibleCount < objectives.length && (
        <button
          onClick={() => setVisibleCount(prev => prev + 5)}
          className="btn-ghost btn-sm w-full"
        >
          Voir plus ({objectives.length - visibleCount} restants)
        </button>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-4 w-64" />
        </div>
        <div className="skeleton h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton h-4 w-1/2 mb-3" />
            <div className="skeleton h-8 w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch periods with caching
  useEffect(() => {
    let mounted = true;
    
    async function fetchPeriods() {
      try {
        // Check if periods are cached in sessionStorage
        const cached = sessionStorage.getItem('dashboard-periods');
        if (cached) {
          const { data: cachedPeriods, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 60000) { // 1 minute cache
            if (mounted) {
              setPeriods(cachedPeriods);
              const active = cachedPeriods.find((p: Period) => p.isActive);
              if (active) setSelectedPeriodId(active.id);
              else if (cachedPeriods.length > 0) setSelectedPeriodId(cachedPeriods[0].id);
              return;
            }
          }
        }
        
        const res = await fetch("/api/periods");
        if (res.ok && mounted) {
          const data: Period[] = await res.json();
          setPeriods(data);
          
          // Cache the result
          sessionStorage.setItem('dashboard-periods', JSON.stringify({
            data,
            timestamp: Date.now()
          }));
          
          const active = data.find((p) => p.isActive);
          if (active) setSelectedPeriodId(active.id);
          else if (data.length > 0) setSelectedPeriodId(data[0].id);
        }
      } catch {
        // silently fail
      }
    }
    
    fetchPeriods();
    return () => { mounted = false; };
  }, []);

  // Fetch objectives with streaming approach
  useEffect(() => {
    if (!selectedPeriodId) {
      setLoading(false);
      return;
    }
    
    let mounted = true;
    
    async function fetchObjectives() {
      setLoading(true);
      try {
        const res = await fetch(`/api/objectives?periodId=${selectedPeriodId}&limit=50`);
        if (res.ok && mounted) {
          const data: Objective[] = await res.json();
          setObjectives(data);
        }
      } catch {
        // silently fail
      } finally {
        if (mounted) setLoading(false);
      }
    }
    
    fetchObjectives();
    return () => { mounted = false; };
  }, [selectedPeriodId]);

  // Memoized calculations to avoid recomputation
  const stats = useMemo(() => {
    const totalObjectives = objectives.length;
    const onTrackCount = objectives.filter((o) => o.confidence === "on_track").length;
    const atRiskCount = objectives.filter((o) => o.confidence === "at_risk").length;
    const offTrackCount = objectives.filter((o) => o.confidence === "off_track").length;
    const avgProgress = totalObjectives > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives)
      : 0;

    return {
      totalObjectives,
      onTrackCount,
      atRiskCount,
      offTrackCount,
      avgProgress,
      statItems: [
        {
          label: t("dashboard.totalObjectives"),
          value: totalObjectives,
          icon: Target,
          color: "text-primary-600 bg-primary-100",
        },
        {
          label: t("dashboard.onTrack"),
          value: onTrackCount,
          icon: TrendingUp,
          color: "text-success-600 bg-success-100",
        },
        {
          label: t("dashboard.atRisk"),
          value: atRiskCount,
          icon: AlertTriangle,
          color: "text-warning-600 bg-warning-100",
        },
        {
          label: t("dashboard.offTrack"),
          value: offTrackCount,
          icon: XCircle,
          color: "text-danger-600 bg-danger-100",
        },
      ]
    };
  }, [objectives, t]);

  const { recentObjectives, levelBreakdown } = useMemo(() => {
    const recent = [...objectives]
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
      recentObjectives: recent,
      levelBreakdown: [
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
      ]
    };
  }, [objectives, t]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
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
      </div>

      {stats.totalObjectives === 0 ? (
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
            {stats.statItems.map((stat) => (
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent objectives */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("dashboard.recentObjectives")}
              </h2>
              <Suspense fallback={<LoadingSpinner />}>
                <VirtualObjectiveList objectives={recentObjectives} />
              </Suspense>
            </div>

            {/* Breakdown by level */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {t("dashboard.byLevel")}
              </h2>
              <div className="space-y-5">
                {levelBreakdown.map((level) => (
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
        </>
      )}
    </div>
  );
}