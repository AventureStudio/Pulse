"use client";

import { Check, Lightbulb } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface AISuggestionCardProps {
  title: string;
  description?: string;
  reasoning?: string;
  onApply: () => void;
  meta?: { label: string; value: string }[];
}

export default function AISuggestionCard({ title, description, reasoning, onApply, meta }: AISuggestionCardProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2 hover:border-primary-300 transition-colors">
      <div className="flex items-start gap-2">
        <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
          {reasoning && (
            <p className="text-xs text-gray-400 mt-1 italic">{reasoning}</p>
          )}
          {meta && meta.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {meta.map((m) => (
                <span key={m.label} className="text-xs bg-gray-100 text-gray-600 rounded px-2 py-0.5">
                  {m.label}: {m.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onApply}
        className="btn-secondary text-xs px-3 py-1.5 w-full"
      >
        <Check className="w-3 h-3" />
        {t("ai.apply")}
      </button>
    </div>
  );
}
