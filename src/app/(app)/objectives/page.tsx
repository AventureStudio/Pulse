"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Target, Plus, Search, Loader2 } from "lucide-react";
import type { Objective, Period, ObjectiveLevel, ObjectiveStatus } from "@/types";
import ObjectiveCard from "@/components/objectives/ObjectiveCard";
import EmptyState from "@/components/ui/EmptyState";

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<ObjectiveLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ObjectiveStatus | "all">("all");
  const [search, setSearch] = useState("");

  // Fetch periods on mount
  useEffect(() => {
    async function fetchPeriods() {
      try {
        const res = await fetch("/api/periods");
        if (res.ok) {
          const data: Period[] = await res.json();
          setPeriods(data);
          const active = data.find((p) => p.isActive);
          if (active) setSelectedPeriodId(active.id);
          else if (data.length > 0) setSelectedPeriodId(data[0].id);
        }
      } catch {
        // silently fail
      }
    }
    fetchPeriods();
  }, []);

  // Fetch objectives when period or filters change
  useEffect(() => {
    if (!selectedPeriodId) {
      setLoading(false);
      return;
    }
    async function fetchObjectives() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ periodId: selectedPeriodId });
        if (levelFilter !== "all") params.set("level", levelFilter);
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (search.trim()) params.set("search", search.trim());

        const res = await fetch(`/api/objectives?${params}`);
        if (res.ok) {
          const data: Objective[] = await res.json();
          setObjectives(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchObjectives();
  }, [selectedPeriodId, levelFilter, statusFilter, search]);

  const filteredObjectives = useMemo(() => objectives, [objectives]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
          <p className="text-gray-500 text-sm mt-1">
            G&eacute;rez vos objectifs et r&eacute;sultats cl&eacute;s
          </p>
        </div>
        <Link href="/objectives/new" className="btn-primary btn-md">
          <Plus className="w-4 h-4" /> Nouvel objectif
        </Link>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <select
          className="input"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {p.isActive ? "(actif)" : ""}
            </option>
          ))}
        </select>

        {/* Level filter */}
        <select
          className="input"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as ObjectiveLevel | "all")}
        >
          <option value="all">Tous les niveaux</option>
          <option value="company">Entreprise</option>
          <option value="team">&Eacute;quipe</option>
          <option value="individual">Individuel</option>
        </select>

        {/* Status filter */}
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ObjectiveStatus | "all")}
        >
          <option value="all">Tous les statuts</option>
          <option value="draft">Brouillon</option>
          <option value="active">Actif</option>
          <option value="completed">Termin&eacute;</option>
          <option value="cancelled">Annul&eacute;</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un objectif..."
            className="input pl-9 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-2 bg-gray-200 rounded w-full mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filteredObjectives.length === 0 ? (
        <EmptyState
          icon={<Target className="w-7 h-7" />}
          title="Aucun objectif pour le moment"
          description="Cr&eacute;ez votre premier objectif pour commencer &agrave; suivre vos OKRs."
          action={{ label: "Nouvel objectif", href: "/objectives/new" }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjectives.map((obj) => (
            <Link key={obj.id} href={`/objectives/${obj.id}`}>
              <ObjectiveCard objective={obj} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
