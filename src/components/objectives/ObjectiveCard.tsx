"use client";

import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import OptimizedImage from "@/components/ui/OptimizedImage";
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
          {t(level.labelKey)}
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
            {keyResultsCount} {t("kr.title")}{keyResultsCount > 1 ? "s" : ""}
          </span>
        )}
        {objective.owner && (
          <div className="inline-flex items-center gap-1">
            {objective.owner.avatarUrl ? (
              <OptimizedImage
                src={objective.owner.avatarUrl}
                alt={objective.owner.fullName}
                width={14}
                height={14}
                className="rounded-full"
                sizes="14px"
              />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            <span>{objective.owner.fullName}</span>
          </div>
        )}
      </div>
    </div>
  );
}