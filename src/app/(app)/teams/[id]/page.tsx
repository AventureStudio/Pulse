"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Target, User, Loader2, Trash2 } from "lucide-react";
import type { Team, Objective } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

interface TeamDetail extends Team {
  objectives?: Objective[];
}

export default function TeamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t } = useI18n();
  const addToast = useStore((s) => s.addToast);

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTeam = useCallback(async () => {
    try {
      const res = await fetch(`/api/teams/${id}`);
      if (res.ok) setTeam(await res.json());
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
        <div className="card p-6 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="h-3 bg-gray-200 rounded w-1/4" />
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <p className="text-gray-500">Équipe introuvable.</p>
        <Link href="/teams" className="btn-secondary btn-md mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </Link>
      </div>
    );
  }

  const members = team.members ?? [];
  const objectives = team.objectives ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <Link
        href="/teams"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t("common.back")}
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-primary-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
            {team.description && (
              <p className="text-gray-500 text-sm mt-1">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {members.length} {t("teams.memberCount")}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5" />
                {objectives.length} {t("teams.objectives")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            {t("teams.members")} ({members.length})
          </h2>
          {members.length === 0 ? (
            <p className="text-sm text-gray-400">{t("teams.noMembers")}</p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-medium text-primary-700">
                      {member.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.fullName}</p>
                    <p className="text-xs text-gray-500 truncate">{member.email}</p>
                  </div>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objectives */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-gray-400" />
            {t("nav.objectives")} ({objectives.length})
          </h2>
          {objectives.length === 0 ? (
            <p className="text-sm text-gray-400">{t("objectives.emptyTitle")}</p>
          ) : (
            <div className="space-y-3">
              {objectives.map((obj) => (
                <Link
                  key={obj.id}
                  href={`/objectives/${obj.id}`}
                  className="block p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">{obj.title}</span>
                    <ConfidenceBadge confidence={obj.confidence} size="sm" />
                  </div>
                  <ProgressBar progress={obj.progress} size="sm" showLabel />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
