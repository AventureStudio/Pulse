"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Link from "next/link";
import { Target, Plus, Search, Loader2 } from "lucide-react";
import type { Objective, Period, ObjectiveLevel, ObjectiveStatus } from "@/types";
import ObjectiveCard from "@/components/objectives/ObjectiveCard";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n";

export default function ObjectivesPage() {
  const { t } = useI18n();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<ObjectiveLevel | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ObjectiveStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

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
        if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());

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
  }, [selectedPeriodId, levelFilter, statusFilter, debouncedSearch]);

  const filteredObjectives = useMemo(() => objectives, [objectives]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto" data-testid="objectives-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("objectives.title")}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("objectives.subtitle")}
          </p>
        </div>
        <Link 
          href="/objectives/new" 
          className="btn-primary btn-md"
          data-testid="create-objective-btn"
          role="button"
          aria-label={t("objectives.new")}
        >
          <Plus className="w-4 h-4" /> {t("objectives.new")}
        </Link>
      </div>

      {/* Period selector */}
      <div className="flex flex-wrap items-center gap-3 mb-6" data-testid="filters-section">
        <select
          className="input"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
          data-testid="period-selector"
          aria-label={t("form.objective.periodLabel")}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {p.isActive ? `(${t("common.active").toLowerCase()})` : ""}
            </option>
          ))}
        </select>

        {/* Level filter */}
        <select
          className="input"
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value as ObjectiveLevel | "all")}
          data-testid="level-filter"
          aria-label={t("objectives.allLevels")}
        >
          <option value="all">{t("objectives.allLevels")}</option>
          <option value="company">{t("level.company")}</option>
          <option value="team">{t("level.team")}</option>
          <option value="individual">{t("level.individual")}</option>
        </select>

        {/* Status filter */}
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ObjectiveStatus | "all")}
          data-testid="status-filter"
          aria-label={t("objectives.allStatuses")}
        >
          <option value="all">{t("objectives.allStatuses")}</option>
          <option value="draft">{t("status.draft")}</option>
          <option value="active">{t("status.active")}</option>
          <option value="completed">{t("status.completed")}</option>
          <option value="cancelled">{t("status.cancelled")}</option>
        </select>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t("objectives.searchPlaceholder")}
            className="input pl-9 w-full"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            data-testid="search-input"
            aria-label={t("objectives.searchPlaceholder")}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="loading-grid">
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
        <div data-testid="empty-state">
          <EmptyState
            icon={<Target className="w-7 h-7" />}
            title={t("objectives.emptyTitle")}
            description={t("objectives.emptyDesc")}
            action={{ label: t("objectives.new"), href: "/objectives/new" }}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="objectives-grid">
          {filteredObjectives.map((obj) => (
            <Link 
              key={obj.id} 
              href={`/objectives/${obj.id}`}
              data-testid={`objective-link-${obj.id}`}
              role="button"
              aria-label={`Voir l'objectif: ${obj.title}`}
              tabIndex={0}
            >
              <ObjectiveCard objective={obj} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
