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
} from "lucide-react";
import type { Objective, KeyResult, CheckIn } from "@/types";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import Modal from "@/components/ui/Modal";
import KeyResultCard from "@/components/key-results/KeyResultCard";
import KeyResultForm, { type KeyResultFormData } from "@/components/key-results/KeyResultForm";
import CheckInForm, { type CheckInFormData } from "@/components/check-ins/CheckInForm";

const levelLabels: Record<string, { label: string; icon: typeof Building2 }> = {
  company: { label: "Entreprise", icon: Building2 },
  team: { label: "\u00C9quipe", icon: Users },
  individual: { label: "Individuel", icon: User },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: "Brouillon", color: "bg-gray-100 text-gray-700" },
  active: { label: "Actif", color: "bg-blue-50 text-blue-700" },
  completed: { label: "Termin\u00E9", color: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Annul\u00E9", color: "bg-red-50 text-red-700" },
};

export default function ObjectiveDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

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
      }
    } catch {
      // silently fail
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
      }
    } catch {
      // silently fail
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
      }
    } catch {
      // silently fail
    }
  }

  async function handleDeleteKr(krId: string) {
    if (!confirm("Supprimer ce r\u00E9sultat cl\u00E9 ?")) return;
    try {
      const res = await fetch(`/api/key-results/${krId}`, { method: "DELETE" });
      if (res.ok) {
        fetchObjective();
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <p className="text-gray-500">Objectif introuvable.</p>
        <Link href="/objectives" className="btn-secondary btn-md mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> Retour
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
        <ArrowLeft className="w-4 h-4" /> Retour aux objectifs
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="badge inline-flex items-center gap-1">
                <LevelIcon className="w-3.5 h-3.5" />
                {levelInfo.label}
              </span>
              <span className={`badge ${statusInfo.color}`}>{statusInfo.label}</span>
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
            <Edit className="w-4 h-4" /> Modifier
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Progression</span>
            <span className="font-semibold text-gray-700">
              {Math.round(objective.progress)}%
            </span>
          </div>
          <ProgressBar progress={objective.progress} size="md" />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {objective.owner && <span>Responsable : {objective.owner.fullName}</span>}
          {objective.team && <span>\u00C9quipe : {objective.team.name}</span>}
          {objective.period && <span>P\u00E9riode : {objective.period.label}</span>}
        </div>

        {/* Status actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          {objective.status === "draft" && (
            <button
              className="btn-primary btn-md"
              onClick={() => handleStatusChange("active")}
            >
              Activer
            </button>
          )}
          {objective.status === "active" && (
            <>
              <button
                className="btn-primary btn-md"
                onClick={() => handleStatusChange("completed")}
              >
                Marquer comme termin\u00E9
              </button>
              <button
                className="btn-ghost btn-md"
                onClick={() => handleStatusChange("cancelled")}
              >
                Annuler
              </button>
            </>
          )}
        </div>
      </div>

      {/* Key Results */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            R\u00E9sultats cl\u00E9s ({keyResults.length})
          </h2>
          <button
            className="btn-primary btn-md"
            onClick={() => setKrModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Ajouter un r\u00E9sultat cl\u00E9
          </button>
        </div>

        {keyResults.length === 0 ? (
          <div className="card p-8 text-center text-gray-500 text-sm">
            Aucun r\u00E9sultat cl\u00E9 pour cet objectif.
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
          Alignement
        </h2>

        {objective.parentObjective && (
          <div className="mb-4">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Objectif parent
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
              Objectifs enfants
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
              Aucun lien d&apos;alignement pour cet objectif.
            </p>
          )}
      </div>

      {/* Add Key Result Modal */}
      <Modal
        isOpen={krModalOpen}
        onClose={() => setKrModalOpen(false)}
        title="Ajouter un r\u00E9sultat cl\u00E9"
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
        title="Mettre \u00E0 jour"
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
