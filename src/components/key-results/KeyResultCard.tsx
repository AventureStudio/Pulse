"use client";

import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import type { KeyResult } from "@/types";
import { Pencil, RefreshCw, Trash2 } from "lucide-react";

interface KeyResultCardProps {
  keyResult: KeyResult;
  onCheckIn?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatMetric(value: number, unit: string, metricType: KeyResult["metricType"]): string {
  if (metricType === "boolean") return value >= 1 ? "Oui" : "Non";
  if (metricType === "percentage") return `${value}%`;
  if (metricType === "currency") return `${value.toLocaleString("fr-FR")} ${unit || "\u20AC"}`;
  return `${value.toLocaleString("fr-FR")}${unit ? ` ${unit}` : ""}`;
}

export default function KeyResultCard({
  keyResult,
  onCheckIn,
  onEdit,
  onDelete,
}: KeyResultCardProps) {
  const { title, currentValue, targetValue, unit, metricType, progress, confidence } = keyResult;

  return (
    <div className="card p-4">
      {/* Header: title + confidence */}
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</h4>
        <ConfidenceBadge confidence={confidence} size="sm" />
      </div>

      {/* Metric */}
      <div className="mt-2 text-xs text-gray-500">
        <span className="font-semibold text-gray-800">
          {formatMetric(currentValue, unit, metricType)}
        </span>
        {" "}
        / {formatMetric(targetValue, unit, metricType)}
      </div>

      {/* Progress */}
      <div className="mt-2.5">
        <ProgressBar progress={progress} size="sm" showLabel />
      </div>

      {/* Actions */}
      {(onCheckIn || onEdit || onDelete) && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-gray-100 pt-3">
          {onCheckIn && (
            <button
              type="button"
              onClick={onCheckIn}
              className="btn-primary btn-sm"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Mettre a jour
            </button>
          )}
          <div className="flex-1" />
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="btn-ghost rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
              aria-label="Modifier"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="btn-ghost rounded-lg p-1.5 text-gray-400 hover:text-red-500"
              aria-label="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
