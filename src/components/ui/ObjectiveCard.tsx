"use client";

import { memo, lazy, Suspense } from "react";
import Link from "next/link";
import { Target, Calendar } from "lucide-react";
import type { Objective } from "@/types";
import ProgressBar from "./ProgressBar";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy load heavy components
const ConfidenceBadge = lazy(() => import("./ConfidenceBadge"));

interface ObjectiveCardProps {
  objective: Objective;
  showTeam?: boolean;
  isPreview?: boolean;
}

const ObjectiveCard = memo(function ObjectiveCard({
  objective,
  showTeam = false,
  isPreview = false,
}: ObjectiveCardProps) {
  const CardWrapper = isPreview ? "div" : Link;
  const cardProps = isPreview ? {} : { href: `/objectives/${objective.id}` };

  return (
    <CardWrapper
      {...cardProps}
      className={`card p-5 ${!isPreview ? "card-interactive" : ""}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 text-gray-500">
          <Target className="w-4 h-4" />
          <span className="text-sm font-medium capitalize">
            {objective.level}
          </span>
          {showTeam && objective.team && (
            <>
              <span>•</span>
              <span className="text-sm">{objective.team.name}</span>
            </>
          )}
        </div>
        <Suspense fallback={<div className="skeleton w-16 h-5 rounded-full" />}>
          <ConfidenceBadge confidence={objective.confidence} size="sm" />
        </Suspense>
      </div>

      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {objective.title}
      </h3>

      {objective.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {objective.description}
        </p>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">Progrès</span>
          <span className="font-semibold text-gray-900">
            {objective.progress}%
          </span>
        </div>
        <ProgressBar progress={objective.progress} />
      </div>

      {objective.keyResults && objective.keyResults.length > 0 && (
        <div className="border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-500 mb-2">
            {objective.keyResults.length} résultat
            {objective.keyResults.length > 1 ? "s" : ""} clé
            {objective.keyResults.length > 1 ? "s" : ""}
          </p>
          <div className="space-y-1">
            {objective.keyResults.slice(0, 2).map((kr) => (
              <div key={kr.id} className="text-xs text-gray-600 line-clamp-1">
                • {kr.title}
              </div>
            ))}
            {objective.keyResults.length > 2 && (
              <div className="text-xs text-gray-400">
                +{objective.keyResults.length - 2} autre
                {objective.keyResults.length > 3 ? "s" : ""}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center text-xs text-gray-400 mt-3 pt-3 border-t border-gray-100">
        <Calendar className="w-3 h-3 mr-1" />
        Mis à jour {new Date(objective.updatedAt).toLocaleDateString()}
      </div>
    </CardWrapper>
  );
});

export default ObjectiveCard;