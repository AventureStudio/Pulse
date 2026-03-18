"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Loader2,
  TrendingUp,
} from "lucide-react";
import type { KeyResult } from "@/types";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import Modal from "@/components/ui/Modal";
import CheckInForm, { type CheckInFormData } from "@/components/check-ins/CheckInForm";
import CheckInTimeline from "@/components/check-ins/CheckInTimeline";
import KeyResultForm, { type KeyResultFormData } from "@/components/key-results/KeyResultForm";
import { useI18n } from "@/lib/i18n";

export default function KeyResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { t } = useI18n();

  const [keyResult, setKeyResult] = useState<KeyResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchKeyResult = useCallback(async () => {
    try {
      const res = await fetch(`/api/key-results/${id}`);
      if (res.ok) {
        const data = await res.json();
        setKeyResult(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchKeyResult();
  }, [fetchKeyResult]);

  async function handleCheckIn(data: CheckInFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, keyResultId: id }),
      });
      if (res.ok) {
        setCheckInModalOpen(false);
        fetchKeyResult();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(data: KeyResultFormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/key-results/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setEditModalOpen(false);
        fetchKeyResult();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm(t("kr.confirmDelete"))) return;
    try {
      const res = await fetch(`/api/key-results/${id}`, { method: "DELETE" });
      if (res.ok && keyResult) {
        router.push(`/objectives/${keyResult.objectiveId}`);
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

  if (!keyResult) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <p className="text-gray-500">{t("kr.notFound")}</p>
        <Link href="/objectives" className="btn-secondary btn-md mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </Link>
      </div>
    );
  }

  const checkIns = keyResult.checkIns ?? [];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href={`/objectives/${keyResult.objectiveId}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t("kr.backToObjective")}
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <ConfidenceBadge confidence={keyResult.confidence} size="sm" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {keyResult.title}
            </h1>
            {keyResult.description && (
              <p className="text-gray-600 text-sm">{keyResult.description}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              className="btn-primary btn-md"
              onClick={() => setCheckInModalOpen(true)}
            >
              <RefreshCw className="w-4 h-4" /> {t("kr.update")}
            </button>
            <button
              className="btn-secondary btn-md"
              onClick={() => setEditModalOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </button>
            <button className="btn-ghost btn-md text-red-600" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metric display */}
        <div className="bg-gray-50 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">
                {keyResult.currentValue}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-lg text-gray-600">{keyResult.targetValue}</span>
              {keyResult.unit && (
                <span className="text-sm text-gray-500">{keyResult.unit}</span>
              )}
            </div>
          </div>
          <ProgressBar progress={keyResult.progress} size="lg" showLabel />
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span>
            {t("kr.start")} : {keyResult.startValue} {keyResult.unit}
          </span>
          <span>
            {t("kr.target")} : {keyResult.targetValue} {keyResult.unit}
          </span>
          {keyResult.owner && <span>{t("kr.responsible")} : {keyResult.owner.fullName}</span>}
        </div>
      </div>

      {/* Check-in Timeline */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t("kr.history")} ({checkIns.length})
        </h2>
        {checkIns.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("kr.noHistory")}
          </p>
        ) : (
          <CheckInTimeline checkIns={checkIns} />
        )}
      </div>

      {/* Check-in Modal */}
      <Modal
        isOpen={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title={t("kr.update")}
        size="md"
      >
        <CheckInForm
          keyResult={keyResult}
          onSubmit={handleCheckIn}
          onCancel={() => setCheckInModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={t("kr.editKR")}
        size="lg"
      >
        <KeyResultForm
          keyResult={keyResult}
          onSubmit={handleEdit}
          onCancel={() => setEditModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
