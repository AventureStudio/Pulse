"use client";

import { Suspense } from "react";
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
import type { Objective } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useI18n } from "@/lib/i18n";

// Stats component with Suspense boundary
function DashboardStats({ objectives }: { objectives: Objective[] }) {
  const { t } = useI18n();
  
  const totalObjectives = objectives.length;
  const onTrackCount = objectives.filter((o) => o.confidence === "on_track").length;
  const atRiskCount = objectives.filter((o) => o.confidence === "at_risk").length;
  const offTrackCount = objectives.filter((o) => o.confidence === "off_track").length;
  const avgProgress =
    totalObjectives > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives)
      : 0;

  const stats = [
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
  ];

  return (
    <>
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
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
          <span className="text-lg font-bold text-gray-900">{avgProgress}%</span>
        </div>
        <ProgressBar progress={avgProgress} size="lg" />
      </div>
    </>
  );
}

// Recent objectives component
function RecentObjectives({ objectives }: { objectives: Objective[] }) {
  const { t } = useI18n();
  
  const recentObjectives = [...objectives]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
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
  );
}

// Level breakdown component
function LevelBreakdown({ objectives }: { objectives: Objective[] }) {
  const { t } = useI18n();
  
  const companyObjectives = objectives.filter((o) => o.level === "company");
  const teamObjectives = objectives.filter((o) => o.level === "team");
  const individualObjectives = objectives.filter((o) => o.level === "individual");

  const avgProgressForLevel = (objs: Objective[]) =>
    objs.length > 0
      ? Math.round(objs.reduce((sum, o) => sum + o.progress, 0) / objs.length)
      : 0;

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {t("dashboard.byLevel")}
      </h2>
      <div className="space-y-5">
        {[
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
        ].map((level) => (
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
  );
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { objectives, periods, selectedPeriodId, loading, error, setSelectedPeriodId } =
    useDashboardData();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="card p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Erreur de chargement
          </h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary btn-md"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const totalObjectives = objectives.length;

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

      {totalObjectives === 0 ? (
        <EmptyState
          icon={<Activity className="w-7 h-7" />}
          title={t("dashboard.emptyTitle")}
          description={t("dashboard.emptyDesc")}
          action={{ label: t("dashboard.createObjective"), href: "/objectives/new" }}
        />
      ) : (
        <>
          <Suspense fallback={<LoadingSpinner className="my-8" />}>
            <DashboardStats objectives={objectives} />
          </Suspense>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Suspense fallback={<div className="card p-6 h-64 animate-pulse" />}>
              <RecentObjectives objectives={objectives} />
            </Suspense>
            
            <Suspense fallback={<div className="card p-6 h-64 animate-pulse" />}>
              <LevelBreakdown objectives={objectives} />
            </Suspense>
          </div>
        </>
      )}
    </div>
  );
}