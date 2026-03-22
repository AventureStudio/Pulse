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
  useRef,
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
  onFieldFocus?: (field: string, position?: number) => void;
  showCollaborationIndicators?: boolean;
  activeUsers?: Array<{
    id: string;
    fullName: string;
    avatarUrl: string | null;
    cursorPosition?: { field: string; position: number; selection?: { start: number; end: number } };
  }>;
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
  onFieldFocus,
  showCollaborationIndicators = false,
  activeUsers = [],
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
  
  // Refs pour les champs de saisie
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  /* ---- Handle field focus for collaboration ---- */
  const handleFieldFocus = useCallback((field: string, element: HTMLInputElement | HTMLTextAreaElement) => {
    const position = element.selectionStart || 0;
    onFieldFocus?.(field, position);
  }, [onFieldFocus]);

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

  /* ---- Get cursors for field ---- */
  const getCursorsForField = useCallback((field: string) => {
    if (!showCollaborationIndicators) return [];
    return activeUsers.filter(u => u.cursorPosition?.field === field);
  }, [showCollaborationIndicators, activeUsers]);

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

  /* ---- Collaboration indicators ---- */
  const CollaborationIndicators = ({ field }: { field: string }) => {
    const cursors = getCursorsForField(field);
    if (cursors.length === 0) return null;

    return (
      <div className="absolute -top-6 left-0 flex gap-1 z-10">
        {cursors.map(user => (
          <div key={user.id} className="flex items-center gap-1 rounded-full bg-primary-500 px-2 py-0.5 text-xs text-white">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="h-3 w-3 rounded-full" />
            ) : (
              <div className="h-3 w-3 rounded-full bg-white/30 flex items-center justify-center text-xs font-bold">
                {user.fullName.charAt(0)}
              </div>
            )}
            <span>{user.fullName.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    );
  };

  /* ================================================================ */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Step indicator ── */}
      <div className="flex items-center gap-2">
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
        <div className="space-y-4">
          {/* Title */}
          <div className="relative">
            <label htmlFor="obj-title" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.titleLabel")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                ref={titleInputRef}
                id="obj-title"
                type="text"
                className={`input ${errors.title ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
                placeholder={t("form.objective.titlePlaceholder")}
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                onFocus={(e) => handleFieldFocus("title", e.target)}
                onKeyUp={(e) => handleFieldFocus("title", e.target)}
                onClick={(e) => handleFieldFocus("title", e.target)}
              />
              {showCollaborationIndicators && <CollaborationIndicators field="title" />}
            </div>
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            <Hint field="title" />
          </div>

          {/* Description */}
          <div className="relative">
            <label htmlFor="obj-desc" className="mb-1 block text-sm font-medium text-gray-700">
              {t("form.objective.descLabel")}
            </label>
            <div className="relative">
              <textarea
                ref={descriptionTextareaRef}
                id="obj-desc"
                className="input min-h-[100px] resize-y"
                placeholder={t("form.objective.descPlaceholder")}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                onFocus={(e) => handleFieldFocus("description", e.target)}
                onKeyUp={(e) => handleFieldFocus("description", e.target)}
                onClick={(e) => handleFieldFocus("description", e.target)}
                rows={4}
              />
              {showCollaborationIndicators && <CollaborationIndicators field="description" />}
            </div>
            <Hint field="description" />
          </div>

          {/* Level */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">{t("form.objective.levelLabel")}</label>
            <div className="flex gap-2">
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
        <div className="space-y-4">
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

      {/* ── Step 3