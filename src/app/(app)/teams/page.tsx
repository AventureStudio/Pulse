"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import type { Team } from "@/types";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";

export default function TeamsPage() {
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
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">&Eacute;quipes</h1>
          <p className="text-gray-500 text-sm mt-1">
            G&eacute;rez vos &eacute;quipes et leurs OKRs
          </p>
        </div>
        <button className="btn-primary btn-md" onClick={() => setModalOpen(true)}>
          <Plus className="w-4 h-4" /> Nouvelle &eacute;quipe
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
          title="Aucune \u00E9quipe cr\u00E9\u00E9e"
          description="Cr\u00E9ez des \u00E9quipes pour organiser vos objectifs par d\u00E9partement."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 truncate">
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
                      {team.members ? team.members.length : 0} membre
                      {(team.members?.length ?? 0) !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
        title="Nouvelle \u00E9quipe"
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l&apos;&eacute;quipe
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Ex : Marketing, Produit..."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="input w-full"
              rows={3}
              placeholder="D&eacute;crivez le r&ocirc;le de cette &eacute;quipe..."
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
              Annuler
            </button>
            <button
              type="submit"
              className="btn-primary btn-md"
              disabled={submitting || !formName.trim()}
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
