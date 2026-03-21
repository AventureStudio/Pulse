"use client";

import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import type { Objective } from "@/types";
import { KeyRound, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ObjectiveCardProps {
  objective: Objective;
  onClick?: () => void;
}

const levelConfig: Record<
  Objective["level"],
  { labelKey: "level.company" | "level.team" | "level.individual"; bg: string; text: string }
> = {
  company: {
    labelKey: "level.company",
    bg: "bg-blue-50",
    text: "text-blue-700",
  },
  team: {
    labelKey: "level.team",
    bg: "bg-purple-50",
    text: "text-purple-700",
  },
  individual: {
    labelKey: "level.individual",
    bg: "bg-green-50",
    text: "text-green-700",
  },
};

export default function ObjectiveCard({
  objective,
  onClick,
}: ObjectiveCardProps) {
  const { t } = useI18n();
  const level = levelConfig[objective.level];
  const keyResultsCount = (objective as unknown as { keyResultsCount?: number }).keyResultsCount ?? objective.keyResults?.length ?? 0;

  return (
    <div
      className="card-interactive p-5"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      data-testid={`objective-card-${objective.id}`}
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
          data-testid="level-badge"
        >
          {t(level.labelKey)}
        </span>
        <div data-testid="confidence-badge">
          <ConfidenceBadge confidence={objective.confidence} size="sm" />
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-3 text-sm font-semibold text-gray-900 line-clamp-2" data-testid="objective-title">
        {objective.title}
      </h3>

      {/* Progress */}
      <div className="mt-3" data-testid="progress-section">
        <ProgressBar progress={objective.progress} size="sm" showLabel />
      </div>

      {/* Footer: meta */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        {keyResultsCount > 0 && (
          <span className="inline-flex items-center gap-1" data-testid="key-results-count">
            <KeyRound className="h-3.5 w-3.5" />
            {keyResultsCount} {t("kr.title")}{keyResultsCount > 1 ? "s" : ""}
          </span>
        )}
        {objective.owner && (
          <span className="inline-flex items-center gap-1" data-testid="objective-owner">
            <User className="h-3.5 w-3.5" />
            {objective.owner.fullName}
          </span>
        )}
      </div>
    </div>
  );
}