"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Plus, Loader2, ChevronRight } from "lucide-react";
import type { Team } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function TeamsPage() {
  const { t } = useI18n();
  const addToast = useStore((s) => s.addToast);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");

  async function fetchTeams() {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data: Team[] = await res.json();
        setTeams(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeams();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          description: formDescription.trim(),
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormName("");
        setFormDescription("");
        fetchTeams();
        addToast({ type: "success", message: t("toast.teamCreated") });
      } else {
        addToast({ type: "error", message: t("toast.error") });
      }
    } catch {
      addToast({ type: "error", message: t("toast.error") });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("teams.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("teams.subtitle")}
          </p>
        </div>
        <button className="btn-primary btn-md" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> {t("teams.new")}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <EmptyState
          icon={<Users className="w-7 h-7" />}
          title={t("teams.emptyTitle")}
          description={t("teams.emptyDesc")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <Link key={team.id} href={`/teams/${team.id}`} className="card p-6 hover:shadow-md hover:border-primary-200 transition-all group block">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
                    {team.name}
                  </h3>
                  {team.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {team.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {team.members ? team.members.length : 0} {t("teams.members")}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors mt-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormName("");
          setFormDescription("");
        }}
        title={t("teams.new")}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("teams.nameLabel")}
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder={t("teams.namePlaceholder")}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("teams.descLabel")}
            </label>
            <textarea
              className="input w-full"
              rows={3}
              placeholder={t("teams.descPlaceholder")}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              className="btn-secondary btn-md"
              onClick={() => {
                setModalOpen(false);
                setFormName("");
                setFormDescription("");
              }}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
              disabled={submitting || !formName.trim()}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                t("common.create")
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
