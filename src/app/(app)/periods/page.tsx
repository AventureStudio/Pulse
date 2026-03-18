"use client";

import { useEffect, useState } from "react";
import { Calendar, Plus, Loader2, Check } from "lucide-react";
import type { Period } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";

export default function PeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formLabel, setFormLabel] = useState("");
  const [formStartDate, setFormStartDate] = useState("");
  const [formEndDate, setFormEndDate] = useState("");
  const [formIsActive, setFormIsActive] = useState(false);

  async function fetchPeriods() {
    try {
      const res = await fetch("/api/periods");
      if (res.ok) {
        const data: Period[] = await res.json();
        setPeriods(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPeriods();
  }, []);

  function resetForm() {
    setFormLabel("");
    setFormStartDate("");
    setFormEndDate("");
    setFormIsActive(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formLabel.trim() || !formStartDate || !formEndDate) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: formLabel.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          isActive: formIsActive,
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        resetForm();
        fetchPeriods();
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  async function handleActivate(periodId: string) {
    try {
      const res = await fetch("/api/periods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: periodId, isActive: true }),
      });
      if (res.ok) {
        fetchPeriods();
      }
    } catch {
      // silently fail
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">P&eacute;riodes</h1>
          <p className="text-gray-500 text-sm mt-1">
            G&eacute;rez les cycles OKR (trimestres, semestres...)
          </p>
        </div>
        <button className="btn-primary btn-md" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Nouvelle p&eacute;riode
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : periods.length === 0 ? (
        <EmptyState
          icon={<Calendar className="w-7 h-7" />}
          title="D\u00E9finissez vos p\u00E9riodes OKR"
          description="Cr\u00E9ez des trimestres ou semestres pour organiser vos objectifs dans le temps."
        />
      ) : (
        <div className="space-y-4">
          {periods.map((period) => (
            <div
              key={period.id}
              className="card p-6 flex items-center justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    period.isActive
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {period.label}
                    </h3>
                    {period.isActive && (
                      <span className="badge bg-emerald-50 text-emerald-700 text-xs">
                        Actif
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {formatDate(period.startDate)} &mdash;{" "}
                    {formatDate(period.endDate)}
                  </p>
                </div>
              </div>

              {!period.isActive && (
                <button
                  className="btn-secondary btn-md"
                  onClick={() => handleActivate(period.id)}
                >
                  <Check className="w-4 h-4" /> Activer
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Period Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title="Nouvelle p\u00E9riode"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Libell&eacute;
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Ex : Q1 2026, S1 2026..."
              value={formLabel}
              onChange={(e) => setFormLabel(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de d&eacute;but
              </label>
              <input
                type="date"
                className="input w-full"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                className="input w-full"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formIsActive}
              onChange={(e) => setFormIsActive(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              D&eacute;finir comme p&eacute;riode active
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-secondary btn-md"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
              disabled={
                submitting || !formLabel.trim() || !formStartDate || !formEndDate
              }
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Cr\u00E9er"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
