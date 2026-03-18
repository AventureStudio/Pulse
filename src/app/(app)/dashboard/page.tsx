"use client";

import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch periods
  useEffect(() => {
    async function fetchPeriods() {
      try {
        const res = await fetch("/api/periods");
        if (res.ok) {
          const data: Period[] = await res.json();
          setPeriods(data);
          const active = data.find((p) => p.isActive);
          if (active) setSelectedPeriodId(active.id);
          else if (data.length > 0) setSelectedPeriodId(data[0].id);
        }
      } catch {
        // silently fail
      }
    }
    fetchPeriods();
  }, []);

  // Fetch objectives for the selected period
  useEffect(() => {
    if (!selectedPeriodId) {
      setLoading(false);
      return;
    }
    async function fetchObjectives() {
      setLoading(true);
      try {
        const res = await fetch(`/api/objectives?periodId=${selectedPeriodId}`);
        if (res.ok) {
          const data: Objective[] = await res.json();
          setObjectives(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchObjectives();
  }, [selectedPeriodId]);

  // Compute stats
  const totalObjectives = objectives.length;
  const onTrackCount = objectives.filter((o) => o.confidence === "on_track").length;
  const atRiskCount = objectives.filter((o) => o.confidence === "at_risk").length;
  const offTrackCount = objectives.filter((o) => o.confidence === "off_track").length;
  const avgProgress =
    totalObjectives > 0
      ? Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / totalObjectives)
      : 0;

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

  const stats = [
    {
      label: "Objectifs",
      value: totalObjectives,
      icon: Target,
      color: "text-primary-600 bg-primary-100",
    },
    {
      label: "En bonne voie",
      value: onTrackCount,
      icon: TrendingUp,
      color: "text-success-600 bg-success-100",
    },
    {
      label: "\u00C0 risque",
      value: atRiskCount,
      icon: AlertTriangle,
      color: "text-warning-600 bg-warning-100",
    },
    {
      label: "En retard",
      value: offTrackCount,
      icon: XCircle,
      color: "text-danger-600 bg-danger-100",
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de vos OKRs</p>
        </div>
        <select
          className="input"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {p.isActive ? "(actif)" : ""}
            </option>
          ))}
        </select>
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
      ) : totalObjectives === 0 ? (
        <EmptyState
          icon={<Activity className="w-7 h-7" />}
          title="Commencez par cr\u00E9er vos OKRs"
          description="D\u00E9finissez vos objectifs et r\u00E9sultats cl\u00E9s pour suivre la progression de votre \u00E9quipe."
          action={{ label: "Cr\u00E9er un objectif", href: "/objectives/new" }}
        />
      ) : (
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
                Progression moyenne
              </span>
              <span className="text-lg font-bold text-gray-900">{avgProgress}%</span>
            </div>
            <ProgressBar progress={avgProgress} size="lg" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent objectives */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Objectifs r&eacute;cents
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
                Par niveau
              </h2>
              <div className="space-y-5">
                {[
                  {
                    label: "Entreprise",
                    icon: Building2,
                    count: companyObjectives.length,
                    progress: avgProgressForLevel(companyObjectives),
                  },
                  {
                    label: "\u00C9quipe",
                    icon: Users,
                    count: teamObjectives.length,
                    progress: avgProgressForLevel(teamObjectives),
                  },
                  {
                    label: "Individuel",
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
          </div>
        </>
      )}
    </div>
  );
}
