"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Target, Users, User, Building2, Calendar, MoreVertical } from "lucide-react";
import type { Objective } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { useI18n } from "@/lib/i18n";
import { performanceMonitor } from "@/lib/utils/performance";

interface ObjectiveCardProps {
  objective: Objective;
  showTeam?: boolean;
  showOwner?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ObjectiveCard({
  objective,
  showTeam = true,
  showOwner = true,
  onEdit,
  onDelete,
}: ObjectiveCardProps) {
  const { t } = useI18n();
  const [keyResultsCount, setKeyResultsCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Lazy load key results count
  useEffect(() => {
    if (objective.keyResultsCount !== undefined) {
      setKeyResultsCount(objective.keyResultsCount);
      return;
    }

    let mounted = true;
    const endMeasure = performanceMonitor.startMeasure(`objective-${objective.id}-kr-count`);

    async function loadKeyResultsCount() {
      if (loading) return;
      
      setLoading(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch(`/api/key-results?objectiveId=${objective.id}&count=true`, {
          signal: controller.signal,
          headers: {
            "Cache-Control": "max-age=300" // 5 minutes cache
          }
        });
        
        clearTimeout(timeoutId);
        
        if (mounted && res.ok) {
          const data = await res.json();
          setKeyResultsCount(Array.isArray(data) ? data.length : data.count || 0);
        }
      } catch (err) {
        if (mounted && err instanceof Error && err.name !== 'AbortError') {
          console.warn(`Failed to load key results count for objective ${objective.id}:`, err);
          setKeyResultsCount(0);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          endMeasure();
        }
      }
    }

    // Delay loading to prevent blocking initial render
    const timer = setTimeout(loadKeyResultsCount, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      endMeasure();
    };
  }, [objective.id, objective.keyResultsCount, loading]);

  const levelIcons = {
    company: Building2,
    team: Users,
    individual: User,
  };

  const LevelIcon = levelIcons[objective.level];

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-primary-100 text-primary-600 flex-shrink-0">
            <Target className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/objectives/${objective.id}`}
              className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors block truncate"
            >
              {objective.title}
            </Link>
            {objective.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {objective.description}
              </p>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative flex-shrink-0">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <LevelIcon className="w-3.5 h-3.5" />
          <span>{t(`level.${objective.level}`)}</span>
        </div>
        
        {keyResultsCount !== null && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {keyResultsCount} {keyResultsCount === 1 ? 'résultat clé' : 'résultats clés'}
            </span>
          </div>
        )}
        
        {loading && keyResultsCount === null && (
          <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
        )}

        {showTeam && objective.teamId && (
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>Équipe</span>
          </div>
        )}

        {showOwner && objective.ownerId && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>Assigné</span>
          </div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-medium text-gray-600">
            {t("common.progress")}
          </span>
          <span className="text-sm font-bold text-gray-900">
            {objective.progress}%
          </span>
        </div>
        <ProgressBar progress={objective.progress} size="md" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <ConfidenceBadge confidence={objective.confidence} />
        <Link
          href={`/objectives/${objective.id}`}
          className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
        >
          {t("common.viewDetails")}
        </Link>
      </div>
    </div>
  );
}