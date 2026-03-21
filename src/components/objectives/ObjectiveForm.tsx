"use client";

import { useI18n } from "@/lib/i18n";
import type {
  Objective,
  ObjectiveLevel,
  ObjectiveStatus,
  Period,
  Team,
} from "@/types";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  HelpCircle,
  Users,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ObjectiveFormData {
  title: string;
  description: string;
  level: ObjectiveLevel;
  periodId: string;
  teamId: string;
  parentObjectiveId: string;
  status: ObjectiveStatus;
}

interface ObjectiveFormProps {
  objective?: Objective;
  periods: Period[];
  teams: Team[];
  parentObjectives: Objective[];
  onSubmit: (data: ObjectiveFormData) => void;
  onCancel: () => void;
  suggestedValues?: { title?: string; description?: string } | null;
  onFormChange?: (data: ObjectiveFormData) => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const levelOptionsDef: { value: ObjectiveLevel; icon: typeof Building2 }[] = [
  { value: "company", icon: Building2 },
  { value: "team", icon: Users },
  { value: "individual", icon: Users },
];

const statusOptionValues: ObjectiveStatus[] = ["draft", "active", "completed", "cancelled"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ObjectiveForm({
  objective,
  periods,
  teams,
  parentObjectives,
  onSubmit,
  onCancel,
  suggestedValues,
  onFormChange,
}: ObjectiveFormProps) {
  const { t } = useI18n();
  const isEdit = Boolean(objective);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ObjectiveFormData>({
    title: objective?.title ?? "",
    description: objective?.description ?? "",
    level: objective?.level ?? "team",
    periodId: objective?.periodId ?? (periods.find((p) => p.isActive)?.id ?? ""),
    teamId: objective?.teamId ?? "",
    parentObjectiveId: objective?.parentObjectiveId ?? "",
    status: objective?.status ?? "draft",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ObjectiveFormData, string>>>({});

  /* ---- Apply suggested values ---- */
  useEffect(() => {
    if (suggestedValues) {
      setForm((prev) => ({
        ...prev,
        ...(suggestedValues.title !== undefined && { title: suggestedValues.title }),
        ...(suggestedValues.description !== undefined && { description: suggestedValues.description }),
      }));
    }
  }, [suggestedValues]);

  /* ---- Notify parent of form changes ---- */
  useEffect(() => {
    onFormChange?.(form);
  }, [form, onFormChange]);

  /* ---- Translated help texts ---- */
  const helpTexts: Record<string, string> = useMemo(
    () => ({
      title: t("form.objective.step1Help"),
      description: t("form.objective.step2Help"),
      level: t("form.objective.helpLevel"),
      period: t("form.objective.helpPeriod"),
      team: t("form.objective.helpTeam"),
      parentObjectiveId: t("form.objective.helpParent"),
    }),
    [t],
  );

  /* ---- Field updater ---- */
  const set = useCallback(
    <K extends keyof ObjectiveFormData>(key: K, value: ObjectiveFormData[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    [],
  );

  /* ---- Validation ---- */
  const validate = useCallback(
    (s: number): boolean => {
      const errs: typeof errors = {};
      if (s >= 1 && !form.title.trim()) errs.title = t("form.objective.titleRequired");
      if (s >= 2 && !form.periodId) errs.periodId = t("form.objective.periodRequired");
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [form, t],
  );

  /* ---- Navigation ---- */
  const next = useCallback(() => {
    if (validate(step)) setStep((s) => Math.min(s + 1, 3));
  }, [step, validate]);

  const prev = useCallback(() => setStep((s) => Math.max(s - 1, 1)), []);

  /* ---- Submit ---- */
  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (validate(3)) onSubmit(form);
    },
    [form, onSubmit, validate],
  );

  /* ---- Derived ---- */
  const selectedPeriod = useMemo(
    () => periods.find((p) => p.id === form.periodId),
    [periods, form.periodId],
  );
  const selectedTeam = useMemo(
    () => teams.find((tm) => tm.id === form.teamId),
    [teams, form.teamId],
  );
  const selectedParent = useMemo(
    () => parentObjectives.find((o) => o.id === form.parentObjectiveId),
    [parentObjectives, form.parentObjectiveId],
  );

  /* ---- Level label helper ---- */
  const levelLabel = (value: ObjectiveLevel) => {
    const key = `level.${value}` as const;
    return t(key);
  };

  /* ---- Status label helper ---- */
  const statusLabel = (value: ObjectiveStatus) => {
    const key = `status.${value}` as const;
    return t(key);
  };

  /* ---- Reusable help hint ---- */
  const Hint = ({ field }: { field: string }) => (
    <p className="mt-1 flex items-start gap-1 text-xs text-gray-400">
      <HelpCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
      {helpTexts[field]}
    </p>
  );

  /* ================================================================ */
  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="objective-form">
      {/* ── Step indicator ── */}
      <div className="flex items-center gap-2" data-testid="step-indicator">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                s === step
                  ? "bg-primary-600 text-white"
                  : s < step
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-400"
              }`}
              data-testid={`step-${s}`}
            >
              {s < step ? <Check className="h-3.5 w-3.5" /> : s}
            </span>
            {s < 3 && (
              <div
                className={`h-0.5 w-8 rounded-full ${
                  s < step ? "bg-primary-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-gray-500">
          {t("form.objective.step")} {step} {t("form.objective.of")} 3
        </span>
      </div>

      {/* ── Step 1: Identity ── */}
      {step === 1 && (
        <div className="space-y-4" data-testid="step-1-content">
          {/* Title */}
          <div>
            <label htmlFor="obj-title" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.titleLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              id="obj-title"
              type="text"
              className={`input ${errors.title ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              placeholder={t("form.objective.titlePlaceholder")}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              data-testid="title-input"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            <Hint field="title" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="obj-desc" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.descLabel")}
            </label>
            <textarea
              id="obj-desc"
              className="input min-h-[100px] resize-y"
              placeholder={t("form.objective.descPlaceholder")}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              data-testid="description-input"
            />
            <Hint field="description" />
          </div>

          {/* Level */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.objective.levelLabel")}</label>
            <div className="flex gap-2" data-testid="level-selector">
              {levelOptionsDef.map((opt) => {
                const Icon = opt.icon;
                const active = form.level === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("level", opt.value)}
                    className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                    data-testid={`level-${opt.value}`}
                  >
                    <Icon className="h-4 w-4" />
                    {levelLabel(opt.value)}
                  </button>
                );
              })}
            </div>
            <Hint field="level" />
          </div>
        </div>
      )}

      {/* ── Step 2: Context ── */}
      {step === 2 && (
        <div className="space-y-4" data-testid="step-2-content">
          {/* Period */}
          <div>
            <label htmlFor="obj-period" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.periodLabel")} <span className="text-red-500">*</span>
            </label>
            <select
              id="obj-period"
              className={`input ${errors.periodId ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              value={form.periodId}
              onChange={(e) => set("periodId", e.target.value)}
              data-testid="period-input"
            >
              <option value="">{t("form.objective.selectPeriod")}</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.isActive ? ` ${t("form.objective.currentSuffix")}` : ""}
                </option>
              ))}
            </select>
            {errors.periodId && <p className="mt-1 text-xs text-red-500">{errors.periodId}</p>}
            <Hint field="period" />
          </div>

          {/* Team (hidden when company level) */}
          {form.level !== "company" && (
            <div>
              <label htmlFor="obj-team" className="mb-1 block text-sm font-medium text-gray-700">
                {t("form.objective.teamLabel")}
              </label>
              <select
                id="obj-team"
                className="input"
                value={form.teamId}
                onChange={(e) => set("teamId", e.target.value)}
                data-testid="team-input"
              >
                <option value="">{t("form.objective.noTeam")}</option>
                {teams.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.name}
                  </option>
                ))}
              </select>
              <Hint field="team" />
            </div>
          )}

          {/* Parent alignment */}
          <div>
            <label htmlFor="obj-parent" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.parentLabel")}
            </label>
            <select
              id="obj-parent"
              className="input"
              value={form.parentObjectiveId}
              onChange={(e) => set("parentObjectiveId", e.target.value)}
              data-testid="parent-input"
            >
              <option value="">{t("form.objective.selectParent")}</option>
              {parentObjectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.title}
                </option>
              ))}
            </select>
            <Hint field="parentObjectiveId" />
          </div>

          {/* Status */}
          <div>
            <label htmlFor="obj-status" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.statusLabel")}
            </label>
            <select
              id="obj-status"
              className="input"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ObjectiveStatus)}
              data-testid="status-input"
            >
              {statusOptionValues.map((value) => (
                <option key={value} value={value}>
                  {statusLabel(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm" data-testid="step-3-content">
          <h4 className="font-semibold text-gray-900">{t("form.objective.step3Title")}</h4>
          <dl className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">{t("form.objective.titleLabel")}</dt>
              <dd className="text-right max-w-[60%]">{form.title}</dd>
            </div>
            {form.description && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">{t("form.objective.descLabel")}</dt>
                <dd className="text-right max-w-[60%] line-clamp-2">{form.description}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">{t("form.objective.levelLabel")}</dt>
              <dd>{levelLabel(form.level)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">{t("form.objective.periodLabel")}</dt>
              <dd>{selectedPeriod?.label ?? "\u2014"}</dd>
            </div>
            {form.level !== "company" && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">{t("form.objective.teamLabel")}</dt>
                <dd>{selectedTeam?.name ?? "\u2014"}</dd>
              </div>
            )}
            {form.parentObjectiveId && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">{t("form.objective.alignedOn")}</dt>
                <dd className="text-right max-w-[60%] line-clamp-1">
                  {selectedParent?.title ?? "\u2014"}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">{t("form.objective.statusLabel")}</dt>
              <dd>{statusLabel(form.status)}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4" data-testid="form-actions">
        <div>
          {step > 1 && (
            <button 
              type="button" 
              onClick={prev} 
              className="btn-ghost btn-md"
              data-testid="previous-button"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("form.objective.previous")}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button" 
            onClick={onCancel} 
            className="btn-secondary btn-md"
            data-testid="cancel-button"
          >
            {t("common.cancel")}
          </button>
          {step < 3 ? (
            <button 
              type="button" 
              onClick={next} 
              className="btn-primary btn-md"
              data-testid="next-button"
            >
              {t("form.objective.next")}
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button 
              type="submit" 
              className="btn-primary btn-md"
              data-testid="submit-button"
            >
              <Check className="h-4 w-4" />
              {isEdit ? t("form.objective.updateObjective") : t("form.objective.createObjective")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}