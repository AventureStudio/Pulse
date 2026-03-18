"use client";

import { useI18n } from "@/lib/i18n";
import type { KeyResult, MetricType } from "@/types";
import { type FormEvent, useCallback, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface KeyResultFormData {
  title: string;
  description: string;
  metricType: MetricType;
  startValue: number;
  targetValue: number;
  unit: string;
}

interface KeyResultFormProps {
  keyResult?: KeyResult;
  onSubmit: (data: KeyResultFormData) => void;
  onCancel: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function unitPlaceholder(metricType: MetricType): string {
  switch (metricType) {
    case "percentage":
      return "%";
    case "currency":
      return "\u20AC";
    case "number":
      return "";
    case "boolean":
      return "";
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function KeyResultForm({
  keyResult,
  onSubmit,
  onCancel,
}: KeyResultFormProps) {
  const { t } = useI18n();
  const isEdit = Boolean(keyResult);

  const [form, setForm] = useState<KeyResultFormData>({
    title: keyResult?.title ?? "",
    description: keyResult?.description ?? "",
    metricType: keyResult?.metricType ?? "number",
    startValue: keyResult?.startValue ?? 0,
    targetValue: keyResult?.targetValue ?? 100,
    unit: keyResult?.unit ?? "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof KeyResultFormData, string>>>({});

  const set = useCallback(
    <K extends keyof KeyResultFormData>(key: K, value: KeyResultFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  const isBoolean = form.metricType === "boolean";

  const metricTypeOptions: { value: MetricType; label: string }[] = [
    { value: "number", label: t("form.kr.metricNumber") },
    { value: "percentage", label: t("form.kr.metricPercentage") },
    { value: "currency", label: t("form.kr.metricCurrency") },
    { value: "boolean", label: t("form.kr.metricBoolean") },
  ];

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const errs: typeof errors = {};
      if (!form.title.trim()) errs.title = t("form.kr.titleRequired");
      if (!isBoolean && form.targetValue === 0 && form.startValue === 0)
        errs.targetValue = t("form.kr.targetRequired");
      setErrors(errs);
      if (Object.keys(errs).length > 0) return;

      const data: KeyResultFormData = isBoolean
        ? { ...form, startValue: 0, targetValue: 1, unit: "" }
        : form;
      onSubmit(data);
    },
    [form, isBoolean, onSubmit, t],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label htmlFor="kr-title" className="mb-1 block text-sm font-medium text-gray-700">
          {t("form.kr.titleLabel")} <span className="text-red-500">*</span>
        </label>
        <input
          id="kr-title"
          type="text"
          className={`input ${errors.title ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
          placeholder={t("form.kr.titlePlaceholder")}
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
        {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="kr-desc" className="mb-1 block text-sm font-medium text-gray-700">
          {t("form.kr.descLabel")}
        </label>
        <textarea
          id="kr-desc"
          className="input min-h-[80px] resize-y"
          placeholder={t("form.kr.descPlaceholder")}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={3}
        />
      </div>

      {/* Metric type */}
      <div>
        <label htmlFor="kr-metric" className="mb-1 block text-sm font-medium text-gray-700">
          {t("form.kr.metricType")}
        </label>
        <select
          id="kr-metric"
          className="input"
          value={form.metricType}
          onChange={(e) => set("metricType", e.target.value as MetricType)}
        >
          {metricTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Boolean: simple toggle indication */}
      {isBoolean ? (
        <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
          {t("form.kr.booleanDesc")}
        </p>
      ) : (
        <>
          {/* Start / Target values */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="kr-start" className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.kr.startValue")}
              </label>
              <input
                id="kr-start"
                type="number"
                className="input"
                value={form.startValue}
                onChange={(e) => set("startValue", Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="kr-target" className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.kr.targetValue")} <span className="text-red-500">*</span>
              </label>
              <input
                id="kr-target"
                type="number"
                className={`input ${errors.targetValue ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                value={form.targetValue}
                onChange={(e) => set("targetValue", Number(e.target.value))}
              />
              {errors.targetValue && (
                <p className="mt-1 text-xs text-red-500">{errors.targetValue}</p>
              )}
            </div>
          </div>

          {/* Unit */}
          <div>
            <label htmlFor="kr-unit" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.kr.unit")}
            </label>
            <input
              id="kr-unit"
              type="text"
              className="input"
              placeholder={unitPlaceholder(form.metricType)}
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-4">
        <button type="button" onClick={onCancel} className="btn-secondary btn-md">
          {t("common.cancel")}
        </button>
        <button type="submit" className="btn-primary btn-md">
          {isEdit ? t("form.kr.updateKR") : t("form.kr.createKR")}
        </button>
      </div>
    </form>
  );
}
