"use client";

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
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const levelOptions: { value: ObjectiveLevel; label: string; icon: typeof Building2 }[] = [
  { value: "company", label: "Entreprise", icon: Building2 },
  { value: "team", label: "Equipe", icon: Users },
  { value: "individual", label: "Individuel", icon: Users },
];

const statusOptions: { value: ObjectiveStatus; label: string }[] = [
  { value: "draft", label: "Brouillon" },
  { value: "active", label: "Actif" },
  { value: "completed", label: "Termine" },
  { value: "cancelled", label: "Annule" },
];

const helpTexts: Record<string, string> = {
  title:
    "Un bon objectif est ambitieux, qualitatif et inspirant. Par exemple : Devenir la reference du marche.",
  description:
    "Ajoutez du contexte pour que toute l'equipe comprenne l'intention derriere cet objectif.",
  level:
    "Entreprise : objectif strategique global. Equipe : objectif de groupe. Individuel : contribution personnelle.",
  period: "Selectionnez la periode (trimestre, semestre...) durant laquelle cet objectif sera poursuivi.",
  team: "L'equipe responsable de cet objectif.",
  parentObjectiveId:
    "Alignez cet objectif sur un objectif de niveau superieur pour garantir la coherence strategique.",
};

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
}: ObjectiveFormProps) {
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
      if (s >= 1 && !form.title.trim()) errs.title = "Le titre est requis.";
      if (s >= 2 && !form.periodId) errs.periodId = "La periode est requise.";
      setErrors(errs);
      return Object.keys(errs).length === 0;
    },
    [form],
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
    () => teams.find((t) => t.id === form.teamId),
    [teams, form.teamId],
  );
  const selectedParent = useMemo(
    () => parentObjectives.find((o) => o.id === form.parentObjectiveId),
    [parentObjectives, form.parentObjectiveId],
  );

  /* ---- Reusable help hint ---- */
  const Hint = ({ field }: { field: string }) => (
    <p className="mt-1 flex items-start gap-1 text-xs text-gray-400">
      <HelpCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
      {helpTexts[field]}
    </p>
  );

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
          Etape {step} sur 3
        </span>
      </div>

      {/* ── Step 1: Identite ── */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="obj-title" className="mb-1 block text-sm font-medium text-gray-700">
              Titre <span className="text-red-500">*</span>
            </label>
            <input
              id="obj-title"
              type="text"
              className={`input ${errors.title ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              placeholder="Ex : Devenir la reference du marche"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
            <Hint field="title" />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="obj-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="obj-desc"
              className="input min-h-[100px] resize-y"
              placeholder="Pourquoi cet objectif est-il important ?"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
            />
            <Hint field="description" />
          </div>

          {/* Level */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Niveau</label>
            <div className="flex gap-2">
              {levelOptions.map((opt) => {
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
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <Hint field="level" />
          </div>
        </div>
      )}

      {/* ── Step 2: Contexte ── */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Period */}
          <div>
            <label htmlFor="obj-period" className="mb-1 block text-sm font-medium text-gray-700">
              Periode <span className="text-red-500">*</span>
            </label>
            <select
              id="obj-period"
              className={`input ${errors.periodId ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""}`}
              value={form.periodId}
              onChange={(e) => set("periodId", e.target.value)}
            >
              <option value="">Selectionnez une periode</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                  {p.isActive ? " (en cours)" : ""}
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
                Equipe
              </label>
              <select
                id="obj-team"
                className="input"
                value={form.teamId}
                onChange={(e) => set("teamId", e.target.value)}
              >
                <option value="">Aucune equipe</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <Hint field="team" />
            </div>
          )}

          {/* Parent alignment */}
          <div>
            <label htmlFor="obj-parent" className="mb-1 block text-sm font-medium text-gray-700">
              Alignement (objectif parent)
            </label>
            <select
              id="obj-parent"
              className="input"
              value={form.parentObjectiveId}
              onChange={(e) => set("parentObjectiveId", e.target.value)}
            >
              <option value="">Aucun alignement</option>
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
              Statut
            </label>
            <select
              id="obj-status"
              className="input"
              value={form.status}
              onChange={(e) => set("status", e.target.value as ObjectiveStatus)}
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* ── Step 3: Review ── */}
      {step === 3 && (
        <div className="space-y-3 rounded-xl bg-gray-50 p-4 text-sm">
          <h4 className="font-semibold text-gray-900">Recapitulatif</h4>
          <dl className="space-y-2 text-gray-700">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Titre</dt>
              <dd className="text-right max-w-[60%]">{form.title}</dd>
            </div>
            {form.description && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Description</dt>
                <dd className="text-right max-w-[60%] line-clamp-2">{form.description}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Niveau</dt>
              <dd>{levelOptions.find((l) => l.value === form.level)?.label}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Periode</dt>
              <dd>{selectedPeriod?.label ?? "—"}</dd>
            </div>
            {form.level !== "company" && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Equipe</dt>
                <dd>{selectedTeam?.name ?? "—"}</dd>
              </div>
            )}
            {form.parentObjectiveId && (
              <div className="flex justify-between">
                <dt className="font-medium text-gray-500">Aligne sur</dt>
                <dd className="text-right max-w-[60%] line-clamp-1">
                  {selectedParent?.title ?? "—"}
                </dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Statut</dt>
              <dd>{statusOptions.find((s) => s.value === form.status)?.label}</dd>
            </div>
          </dl>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4">
        <div>
          {step > 1 && (
            <button type="button" onClick={prev} className="btn-ghost btn-md">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary btn-md">
            Annuler
          </button>
          {step < 3 ? (
            <button type="button" onClick={next} className="btn-primary btn-md">
              Suivant
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button type="submit" className="btn-primary btn-md">
              <Check className="h-4 w-4" />
              {isEdit ? "Mettre a jour" : "Creer l'objectif"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
