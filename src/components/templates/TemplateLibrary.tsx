"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Filter, BookOpen, Users, Building2, Zap } from "lucide-react";
import type { Template, TemplateSector, TemplateTeamSize, TemplateFilters } from "@/types";
import { useI18n } from "@/lib/i18n";

interface TemplateLibraryProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

const sectorConfig: Record<TemplateSector, { icon: typeof Building2; label: string; color: string }> = {
  tech: { icon: Zap, label: "Tech", color: "bg-blue-50 text-blue-700" },
  marketing: { icon: Users, label: "Marketing", color: "bg-purple-50 text-purple-700" },
  sales: { icon: Building2, label: "Sales", color: "bg-green-50 text-green-700" },
  hr: { icon: Users, label: "RH", color: "bg-orange-50 text-orange-700" },
  finance: { icon: Building2, label: "Finance", color: "bg-red-50 text-red-700" },
  product: { icon: Zap, label: "Product", color: "bg-indigo-50 text-indigo-700" },
  operations: { icon: Building2, label: "Operations", color: "bg-gray-50 text-gray-700" },
  general: { icon: BookOpen, label: "Général", color: "bg-slate-50 text-slate-700" },
};

const teamSizeConfig: Record<TemplateTeamSize, { label: string; description: string }> = {
  startup: { label: "Startup", description: "< 10 personnes" },
  small: { label: "Petite équipe", description: "10-50 personnes" },
  medium: { label: "Équipe moyenne", description: "50-200 personnes" },
  large: { label: "Grande équipe", description: "200+ personnes" },
};

export default function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const { t } = useI18n();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TemplateFilters>({
    sector: "all",
    teamSize: "all",
    type: "all",
    search: "",
  });

  // Fetch templates
  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.sector !== "all") params.set("sector", filters.sector);
        if (filters.teamSize !== "all") params.set("teamSize", filters.teamSize);
        if (filters.search.trim()) params.set("search", filters.search.trim());

        const res = await fetch(`/api/templates?${params}`);
        if (res.ok) {
          const data: Template[] = await res.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [filters]);

  // Filter templates client-side for type filter
  const filteredTemplates = useMemo(() => {
    if (filters.type === "all") return templates;
    return templates.filter(t => t.type === filters.type);
  }, [templates, filters.type]);

  const updateFilter = <K extends keyof TemplateFilters>(key: K, value: TemplateFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="h-[600px] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Templates d'OKR</h3>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un template..."
            className="input pl-9 w-full"
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
          />
        </div>

        {/* Sector filter */}
        <select
          className="input min-w-[120px]"
          value={filters.sector}
          onChange={(e) => updateFilter("sector", e.target.value as TemplateSector | "all")}
        >
          <option value="all">Tous les secteurs</option>
          {Object.entries(sectorConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        {/* Team size filter */}
        <select
          className="input min-w-[140px]"
          value={filters.teamSize}
          onChange={(e) => updateFilter("teamSize", e.target.value as TemplateTeamSize | "all")}
        >
          <option value="all">Toutes tailles</option>
          {Object.entries(teamSizeConfig).map(([key, config]) => (
            <option key={key} value={key}>{config.label}</option>
          ))}
        </select>

        {/* Type filter */}
        <select
          className="input min-w-[120px]"
          value={filters.type}
          onChange={(e) => updateFilter("type", e.target.value as typeof filters.type)}
        >
          <option value="all">Tous types</option>
          <option value="predefined">Prédéfinis</option>
          <option value="custom">Personnalisés</option>
        </select>
      </div>

      {/* Templates list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun template trouvé</p>
            <p className="text-gray-400 text-xs">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => {
              const sectorInfo = sectorConfig[template.sector];
              const SectorIcon = sectorInfo.icon;
              
              return (
                <button
                  key={template.id}
                  onClick={() => onSelectTemplate(template)}
                  className="card p-4 text-left hover:shadow-lg transition-all duration-200 border-2 hover:border-primary-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${sectorInfo.color}`}>
                        <SectorIcon className="w-3 h-3" />
                        {sectorInfo.label}
                      </span>
                      {template.type === "custom" && (
                        <span className="badge bg-amber-50 text-amber-700">Custom</span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{template.objectives.length} objectifs</span>
                    <div className="flex gap-1">
                      {template.teamSize.map(size => (
                        <span key={size} className="badge bg-gray-50 text-gray-600">
                          {teamSizeConfig[size].label}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  {template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="badge bg-blue-50 text-blue-600 text-xs">
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 3 && (
                        <span className="text-xs text-gray-400">+{template.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-secondary btn-md">
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}