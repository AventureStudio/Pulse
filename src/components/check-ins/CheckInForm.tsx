"use client";

import type { Confidence, KeyResult } from "@/types";
import { ArrowRight } from "lucide-react";
import { type FormEvent, useCallback, useMemo, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CheckInFormData {
  newValue: number;
  confidence: Confidence;
  note: string;
}

interface CheckInFormProps {
  keyResult: KeyResult;
  onSubmit: (data: CheckInFormData) => void;
  onCancel: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const confidenceOptions: { value: Confidence; label: string; dot: string }[] = [
  { value: "on_track", label: "En bonne voie", dot: "bg-emerald-500" },
  { value: "at_risk", label: "A risque", dot: "bg-amber-500" },
  { value: "off_track", label: "En retard", dot: "bg-red-500" },
];

function computeProgress(current: number, start: number, target: number): number {
  if (target === start) return current >= target ? 100 : 0;
  return Math.min(100, Math.max(0, Math.round(((current - start) / (target - start)) * 100)));
}

function formatValue(value: number, kr: KeyResult): string {
  if (kr.metricType === "boolean") return value >= 1 ? "Oui" : "Non";
  if (kr.metricType === "percentage") return `${value}%`;
  if (kr.metricType === "currency")
    return `${value.toLocaleString("fr-FR")} ${kr.unit || "\u20AC"}`;
  return `${value.toLocaleString("fr-FR")}${kr.unit ? ` ${kr.unit}` : ""}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function CheckInForm({
  keyResult,
  onSubmit,
  onCancel,
}: CheckInFormProps) {
  const [form, setForm] = useState<CheckInFormData>({
    newValue: keyResult.currentValue,
    confidence: keyResult.confidence,
    note: "",
  });

  const projectedProgress = useMemo(
    () => computeProgress(form.newValue, keyResult.startValue, keyResult.targetValue),
    [form.newValue, keyResult.startValue, keyResult.targetValue],
  );

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      onSubmit(form);
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Context bar */}
      <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 text-sm">
        <div>
          <span className="text-gray-500">Actuel : </span>
          <span className="font-semibold text-gray-800">
            {formatValue(keyResult.currentValue, keyResult)}
          </span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <div>
          <span className="text-gray-500">Cible : </span>
          <span className="font-semibold text-gray-800">
            {formatValue(keyResult.targetValue, keyResult)}
          </span>
        </div>
      </div>

      {/* New value */}
      <div>
        <label htmlFor="ci-value" className="mb-1 block text-sm font-medium text-gray-700">
          Nouvelle valeur
        </label>
        <input
          id="ci-value"
          type="number"
          className="input"
          value={form.newValue}
          onChange={(e) => setForm((prev) => ({ ...prev, newValue: Number(e.target.value) }))}
          step="any"
        />
        {/* Projected progress */}
        <p className="mt-1.5 text-xs text-gray-500">
          Progression apres mise a jour :{" "}
          <span className="font-semibold text-gray-700">{projectedProgress}%</span>
        </p>
      </div>

      {/* Confidence */}
      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Confiance</label>
        <div className="flex gap-2">
          {confidenceOptions.map((opt) => {
            const active = form.confidence === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, confidence: opt.value }))}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${opt.dot}`} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note */}
      <div>
        <label htmlFor="ci-note" className="mb-1 block text-sm font-medium text-gray-700">
          Note
        </label>
        <textarea
          id="ci-note"
          className="input min-h-[80px] resize-y"
          placeholder="Qu'est-ce qui a change depuis le dernier check-in ?"
          value={form.note}
          onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary btn-md">
          Annuler
        </button>
        <button type="submit" className="btn-primary btn-md">
          Enregistrer le check-in
        </button>
      </div>
    </form>
  );
}
