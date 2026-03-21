"use client";

import { useMemo } from "react";
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
  RefreshCw,
} from "lucide-react";
import type { Objective } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

function DashboardContent() {
  const { t } = useI18n();
  const {
    objectives,
    periods,
    selectedPeriodId,
    loading,
    error,
    setSelectedPeriodId,
    refresh
  } = useDashboardData();

  // Memoize heavy calculations
  const stats = useMemo(() => {
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
      items: [
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

    const breakdown = [
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
    ];

    return { recentObjectives: recent, levelBreakdown: breakdown };
  }, [objectives, t]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <button
              onClick={refresh}
              className="btn-ghost p-2"
              title="Réessayer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <select
            className="input"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            disabled={loading}
          >
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} {p.isActive ? `(${t("common.active").toLowerCase()})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="card p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-800 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : stats.totalObjectives === 0 ? (
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
            {stats.items.map((stat) => (
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
              <div className="space-y-3">
                {recentObjectives.map((obj) => (
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

export default function DashboardPage() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}