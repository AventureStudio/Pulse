"use client";

import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Objective } from "@/types";
import { KeyRound, User } from "lucide-react";

interface ObjectiveCardProps {
  objective: Objective;
  onClick?: () => void;
}

const levelConfig: Record<
  Objective["level"],
  { label: string; bg: string; text: string }
> = {
  company: {
    label: "Entreprise",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  team: {
    label: "Equipe",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  individual: {
    label: "Individuel",
    bg: "bg-green-50",
    text: "text-green-700",
  },
};

export default function ObjectiveCard({
  objective,
  onClick,
}: ObjectiveCardProps) {
  const level = levelConfig[objective.level];
  const keyResultsCount = objective.keyResults?.length ?? 0;

  return (
    <div
      className="card-interactive p-5"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {/* Header: level badge + confidence */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`badge ${level.bg} ${level.text}`}
        >
          {level.label}
        </span>
        <ConfidenceBadge confidence={objective.confidence} size="sm" />
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-semibold text-gray-900 line-clamp-2">
        {objective.title}
      </h3>

      {/* Progress */}
      <div className="mt-3">
        <ProgressBar progress={objective.progress} size="sm" showLabel />
      </div>

      {/* Footer: meta */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        {keyResultsCount > 0 && (
          <span className="inline-flex items-center gap-1">
            <KeyRound className="h-3.5 w-3.5" />
            {keyResultsCount} resultat{keyResultsCount > 1 ? "s" : ""} cle
            {keyResultsCount > 1 ? "s" : ""}
          </span>
        )}
        {objective.owner && (
          <span className="inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5" />
            {objective.owner.fullName}
          </span>
        )}
      </div>
    </div>
  );
}
