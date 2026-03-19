"use client";

import { Sparkles, Lightbulb, RefreshCw, Shield, Target, Loader2, AlertCircle } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { AIAction, AIContext, AIResponse } from "@/types";
import AISuggestionCard from "./AISuggestionCard";

interface AIAssistantPanelProps {
  context: AIContext;
  response: AIResponse | null;
  loading: boolean;
  error: string | null;
  onAction: (action: AIAction) => void;
  onApplySuggestion: (title: string, description?: string) => void;
  onApplyKeyResult?: (kr: { title: string; metricType: string; startValue: number; targetValue: number; unit: string }) => void;
  showKRButton?: boolean;
  hasTitle?: boolean;
}

export default function AIAssistantPanel({
  response,
  loading,
  error,
  onAction,
  onApplySuggestion,
  onApplyKeyResult,
  showKRButton = false,
  hasTitle = false,
}: AIAssistantPanelProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/30 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary-600" />
        <h3 className="text-sm font-semibold text-gray-900">{t("ai.assistant")}</h3>
      </div>

      <p className="text-xs text-gray-500">{t("ai.panelHint")}</p>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onAction("suggest_objective")}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50"
        >
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
          {t("ai.suggest")}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!hasTitle) return;
            onAction("reformulate_objective");
          }}
          disabled={loading || !hasTitle}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
          {t("ai.reformulate")}
        </button>
        <button
          type="button"
          onClick={() => {
            if (!hasTitle) return;
            onAction("challenge_objective");
          }}
          disabled={loading || !hasTitle}
          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50"
        >
          <Shield className="w-3.5 h-3.5 text-orange-500" />
          {t("ai.challenge")}
        </button>
        {showKRButton && (
          <button
            type="button"
            onClick={() => {
              if (!hasTitle) return;
              onAction("suggest_key_results");
            }}
            disabled={loading || !hasTitle}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-primary-300 hover:bg-primary-50 transition-all disabled:opacity-50"
          >
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            {t("ai.suggestKR")}
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-primary-600 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          {t("ai.thinking")}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 py-2">
          <AlertCircle className="w-4 h-4" />
          {t("ai.error")}
        </div>
      )}

      {/* Results */}
      {response && !loading && (
        <div className="space-y-3">
          {/* Suggestions */}
          {response.suggestions && response.suggestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t("ai.suggestionsTitle")}
              </h4>
              <div className="space-y-2">
                {response.suggestions.map((s, i) => (
                  <AISuggestionCard
                    key={i}
                    title={s.title}
                    description={s.description}
                    reasoning={s.reasoning}
                    onApply={() => onApplySuggestion(s.title, s.description)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Reformulation */}
          {response.reformulation && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t("ai.reformulationTitle")}
              </h4>
              <AISuggestionCard
                title={response.reformulation.title}
                description={response.reformulation.description}
                reasoning={response.reformulation.reasoning}
                onApply={() =>
                  onApplySuggestion(
                    response.reformulation!.title,
                    response.reformulation!.description
                  )
                }
              />
            </div>
          )}

          {/* Challenges */}
          {response.challenges && response.challenges.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t("ai.challengesTitle")}
              </h4>
              <div className="space-y-2">
                {response.challenges.map((c, i) => (
                  <div key={i} className="rounded-lg border border-orange-200 bg-orange-50/50 p-3">
                    <p className="text-xs font-medium text-gray-800">{c.point}</p>
                    <p className="text-xs text-gray-500 mt-1">{c.suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Key Results */}
          {response.keyResults && response.keyResults.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {t("ai.krSuggestionsTitle")}
              </h4>
              <div className="space-y-2">
                {response.keyResults.map((kr, i) => (
                  <AISuggestionCard
                    key={i}
                    title={kr.title}
                    reasoning={kr.reasoning}
                    meta={[
                      { label: t("ai.start"), value: String(kr.startValue) },
                      { label: t("ai.target"), value: `${kr.targetValue} ${kr.unit}` },
                    ]}
                    onApply={() => onApplyKeyResult?.(kr)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
