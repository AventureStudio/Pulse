"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Plus,
  Loader2,
  Building2,
  Users,
  User,
  GitBranch,
  Sparkles,
} from "lucide-react";
import type { Objective, KeyResult, CheckIn, AIAction, AIContext, AIKeyResultSuggestion } from "@/types";
import dynamic from "next/dynamic";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import KeyResultCard from "@/components/key-results/KeyResultCard";
import { type KeyResultFormData } from "@/components/key-results/KeyResultForm";
import { type CheckInFormData } from "@/components/check-ins/CheckInForm";

const Modal = dynamic(() => import("@/components/ui/Modal"), { ssr: false });
const KeyResultForm = dynamic(() => import("@/components/key-results/KeyResultForm"), { ssr: false });
const CheckInForm = dynamic(() => import("@/components/check-ins/CheckInForm"), { ssr: false });
const AIAssistantPanel = dynamic(() => import("@/components/ai/AIAssistantPanel"), { ssr: false });
import { useAIAssistant } from "@/lib/hooks/useAIAssistant";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t } = useI18n();
  const { user: authUser } = useAuth();
  const { ask, loading: aiLoading, error: aiError, response: aiResponse, reset: aiReset } = useAIAssistant();
  const addToast = useStore((s) => s.addToast);
  const [showAIPanel, setShowAIPanel] = useState(false);

  const levelLabels: Record<string, { labelKey: "level.company" | "level.team" | "level.individual"; icon: typeof Building2 }> = {
    company: { labelKey: "level.company", icon: Building2 },
    team: { labelKey: "level.team", icon: Users },
    individual: { labelKey: "level.individual", icon: User },
  };

  const statusLabels: Record<string, { labelKey: "status.draft" | "status.active" | "status.completed" | "status.cancelled"; color: string }> = {
    draft: { labelKey: "status.draft", color: "bg-gray-100 text-gray-700" },
    active: { labelKey: "status.active", color: "bg-blue-50 text-blue-700" },
    completed: { labelKey: "status.completed", color: "bg-emerald-50 text-emerald-700" },
    cancelled: { labelKey: "status.cancelled", color: "bg-red-50 text-red-700" },
  };

  const [objective, setObjective] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(true);
  const [krModalOpen, setKrModalOpen] = useState(false);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [selectedKr, setSelectedKr] = useState<KeyResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchObjective = useCallback(async () => {
    try {
      const res = await fetch(`/api/objectives/${id}`);
      if (res.ok) {
        const data = await res.json();
        setObjective(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchObjective();
  }, [fetchObjective]);

  async function handleAddKeyResult(data: KeyResultFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/key-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, objectiveId: id }),
      });
      if (res.ok) {
        setKrModalOpen(false);
        fetchObjective();
        addToast({ type: "success", message: t("toast.krCreated") });
      } else {
        addToast({ type: "error", message: t("toast.error") });
      }
    } catch {
      addToast({ type: "error", message: t("toast.error") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckIn(data: CheckInFormData) {
    if (!selectedKr) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, keyResultId: selectedKr.id }),
      });
      if (res.ok) {
        setCheckInModalOpen(false);
        setSelectedKr(null);
        fetchObjective();
        addToast({ type: "success", message: t("toast.checkinSaved") });
      } else {
        addToast({ type: "error", message: t("toast.error") });
      }
    } catch {
      addToast({ type: "error", message: t("toast.error") });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      const res = await fetch(`/api/objectives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchObjective();
        addToast({ type: "success", message: t("toast.objectiveUpdated") });
      }
    } catch {
      addToast({ type: "error", message: t("toast.error") });
    }
  }

  async function handleDeleteKr(krId: string) {
    if (!confirm(t("objectives.detail.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/key-results/${krId}`, { method: "DELETE" });
      if (res.ok) {
        fetchObjective();
        addToast({ type: "success", message: t("toast.krDeleted") });
      }
    } catch {
      addToast({ type: "error", message: t("toast.error") });
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-4 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
        <div className="card p-6 mb-6 animate-pulse">
          <div className="flex gap-2 mb-3">
            <div className="h-5 bg-gray-200 rounded w-20" />
            <div className="h-5 bg-gray-200 rounded w-16" />
          </div>
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-3 bg-gray-200 rounded w-full mb-4" />
          <div className="flex gap-4">
            <div className="h-3 bg-gray-200 rounded w-24" />
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>
        <div className="h-5 bg-gray-200 rounded w-40 mb-4 animate-pulse" />
        {[1, 2].map((i) => (
          <div key={i} className="card p-5 mb-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="h-2 bg-gray-200 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <p className="text-gray-500">{t("objectives.detail.notFound")}</p>
        <Link href="/objectives" className="btn-secondary btn-md mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </Link>
      </div>
    );
  }

  const levelInfo = levelLabels[objective.level];
  const statusInfo = statusLabels[objective.status];
  const LevelIcon = levelInfo.icon;
  const keyResults = objective.keyResults ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/objectives"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t("objectives.detail.backToObjectives")}
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge inline-flex items-center gap-1">
                <LevelIcon className="w-3.5 h-3.5" />
                {t(levelInfo.labelKey)}
              </span>
              <span className={`badge ${statusInfo.color}`}>{t(statusInfo.labelKey)}</span>
              <ConfidenceBadge confidence={objective.confidence} size="sm" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{objective.title}</h1>
            {objective.description && (
              <p className="text-gray-600 text-sm">{objective.description}</p>
            )}
          </div>
          <Link
            href={`/objectives/${id}/edit`}
            className="btn-secondary btn-md flex-shrink-0"
          >
            <Edit className="w-4 h-4" /> {t("common.edit")}
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">{t("objectives.detail.progression")}</span>
            <span className="font-semibold text-gray-700">
              {Math.round(objective.progress)}%
            </span>
          </div>
          <ProgressBar progress={objective.progress} size="md" />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {objective.owner && <span>{t("objectives.detail.responsible")} : {objective.owner.fullName}</span>}
          {objective.team && <span>{t("objectives.detail.team")} : {objective.team.name}</span>}
          {objective.period && <span>{t("objectives.detail.period")} : {objective.period.label}</span>}
        </div>

        {/* Status actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {objective.status === "draft" && (
            <button
              className="btn-primary btn-md"
              onClick={() => handleStatusChange("active")}
            >
              {t("status.markActive")}
            </button>
          )}
          {objective.status === "active" && (
            <>
              <button
                className="btn-primary btn-md"
                onClick={() => handleStatusChange("completed")}
              >
                {t("status.markCompleted")}
              </button>
              <button
                className="btn-ghost btn-md"
                onClick={() => handleStatusChange("cancelled")}
              >
                {t("objectives.detail.cancelObjective")}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Key Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {t("objectives.detail.keyResults")} ({keyResults.length})
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAIPanel(!showAIPanel);
                if (!showAIPanel) {
                  aiReset();
                }
              }}
              className="btn-secondary btn-md"
            >
              <Sparkles className="w-4 h-4" /> {t("ai.suggestKR")}
            </button>
            <button
              className="btn-primary btn-md"
              onClick={() => setKrModalOpen(true)}
            >
              <Plus className="w-4 h-4" /> {t("objectives.detail.addKR")}
            </button>
          </div>
        </div>

        {/* AI Panel for KR suggestions */}
        {showAIPanel && objective && (
          <div className="mb-4">
            <AIAssistantPanel
              context={{
                activity: authUser?.activity || null,
                roleDescription: authUser?.roleDescription || null,
                currentTitle: objective.title,
                currentDescription: objective.description,
                objectiveLevel: objective.level,
              }}
              response={aiResponse}
              loading={aiLoading}
              error={aiError}
              onAction={(action: AIAction) => {
                aiReset();
                ask(action, {
                  activity: authUser?.activity || null,
                  roleDescription: authUser?.roleDescription || null,
                  currentTitle: objective.title,
                  currentDescription: objective.description,
                  objectiveLevel: objective.level,
                });
              }}
              onApplySuggestion={() => {}}
              onApplyKeyResult={(kr) => {
                // Open the KR modal — the user can then fill in from the suggestion
                setKrModalOpen(true);
              }}
              showKRButton
              hasTitle={Boolean(objective.title)}
            />
          </div>
        )}

        {keyResults.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">
            {t("objectives.detail.noKR")}
          </div>
        ) : (
          <div className="space-y-3">
            {keyResults.map((kr) => (
              <KeyResultCard
                key={kr.id}
                keyResult={kr}
                onCheckIn={() => {
                  setSelectedKr(kr);
                  setCheckInModalOpen(true);
                }}
                onEdit={() => router.push(`/key-results/${kr.id}`)}
                onDelete={() => handleDeleteKr(kr.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Alignment */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-gray-400" />
          {t("objectives.detail.alignment")}
        </h2>

        {objective.parentObjective && (
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {t("objectives.detail.parentObjective")}
            </span>
            <Link
              href={`/objectives/${objective.parentObjective.id}`}
              className="block mt-1 p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
            >
              <span className="text-sm font-medium text-gray-900">
                {objective.parentObjective.title}
              </span>
            </Link>
          </div>
        )}

        {objective.childObjectives && objective.childObjectives.length > 0 && (
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              {t("objectives.detail.childObjectives")}
            </span>
            <div className="mt-1 space-y-2">
              {objective.childObjectives.map((child) => (
                <Link
                  key={child.id}
                  href={`/objectives/${child.id}`}
                  className="block p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {child.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {!objective.parentObjective &&
          (!objective.childObjectives || objective.childObjectives.length === 0) && (
            <p className="text-sm text-gray-500">
              {t("objectives.detail.noAlignment")}
            </p>
          )}
      </div>

      {/* Add Key Result Modal */}
      <Modal
        isOpen={krModalOpen}
        onClose={() => setKrModalOpen(false)}
        title={t("objectives.detail.addKR")}
        size="lg"
      >
        <KeyResultForm
          onSubmit={handleAddKeyResult}
          onCancel={() => setKrModalOpen(false)}
        />
      </Modal>

      {/* Check-in Modal */}
      <Modal
        isOpen={checkInModalOpen}
        onClose={() => {
          setCheckInModalOpen(false);
          setSelectedKr(null);
        }}
        title={t("kr.update")}
        size="md"
      >
        {selectedKr && (
          <CheckInForm
            keyResult={selectedKr}
            onSubmit={handleCheckIn}
            onCancel={() => {
              setCheckInModalOpen(false);
              setSelectedKr(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
