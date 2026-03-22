"use client";

import { useState } from "react";
import { Calendar, Users, FileText, Clock, Mail, TrendingUp } from "lucide-react";
import type { Period, Team } from "@/types";

interface ReportGeneratorProps {
  periods: Period[];
  teams: Team[];
  onGenerate: (config: ReportConfig) => void;
  loading?: boolean;
}

interface ReportConfig {
  name: string;
  type: "okr_performance" | "team_analytics" | "period_summary";
  periodId: string;
  teamIds: string[];
  format: "pdf" | "excel" | "json";
  schedule?: {
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number;
    dayOfMonth?: number;
    recipients: string[];
  };
}

export default function ReportGenerator({
  periods,
  teams,
  onGenerate,
  loading = false,
}: ReportGeneratorProps) {
  const [config, setConfig] = useState<ReportConfig>({
    name: "",
    type: "okr_performance",
    periodId: periods.find(p => p.isActive)?.id || "",
    teamIds: [],
    format: "pdf",
  });
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [recipients, setRecipients] = useState<string>("");

  const reportTypes = [
    {
      id: "okr_performance" as const,
      name: "Rapport de Performance OKR",
      description: "Analyse complète des objectifs avec insights prédictifs et recommandations",
      icon: TrendingUp,
    },
    {
      id: "team_analytics" as const,
      name: "Analytiques d'Équipe",
      description: "Performance par équipe avec comparaisons et tendances",
      icon: Users,
    },
    {
      id: "period_summary" as const,
      name: "Résumé de Période",
      description: "Vue d'ensemble des résultats et achievements d'une période",
      icon: Calendar,
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalConfig: ReportConfig = {
      ...config,
      name: config.name || `Rapport ${reportTypes.find(t => t.id === config.type)?.name}`,
    };

    if (enableScheduling) {
      finalConfig.schedule = {
        frequency: config.schedule?.frequency || "weekly",
        dayOfWeek: config.schedule?.frequency === "weekly" ? (config.schedule?.dayOfWeek || 1) : undefined,
        dayOfMonth: config.schedule?.frequency === "monthly" ? (config.schedule?.dayOfMonth || 1) : undefined,
        recipients: recipients.split(",").map(email => email.trim()).filter(Boolean),
      };
    }

    onGenerate(finalConfig);
  };

  const updateSchedule = (updates: Partial<ReportConfig["schedule"]>) => {
    setConfig(prev => ({
      ...prev,
      schedule: {
        frequency: "weekly",
        recipients: [],
        ...prev.schedule,
        ...updates,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Report Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Nom du rapport
        </label>
        <input
          type="text"
          id="name"
          className="input"
          placeholder="Rapport de performance Q4 2024"
          value={config.name}
          onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      {/* Report Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Type de rapport
        </label>
        <div className="grid grid-cols-1 gap-3">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <label
                key={type.id}
                className={`relative flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                  config.type === type.id
                    ? "border-primary-300 bg-primary-50"
                    : "border-gray-200"
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.id}
                  checked={config.type === type.id}
                  onChange={(e) => setConfig(prev => ({ ...prev, type: e.target.value as ReportConfig["type"] }))}
                  className="sr-only"
                />
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${
                    config.type === type.id ? "text-primary-600" : "text-gray-400"
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{type.name}</div>
                    <div className="text-sm text-gray-500">{type.description}</div>
                  </div>
                </div>
                {config.type === type.id && (
                  <div className="absolute top-3 right-3 w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Period Selection */}
        <div>
          <label htmlFor="periodId" className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select
            id="periodId"
            className="input"
            value={config.periodId}
            onChange={(e) => setConfig(prev => ({ ...prev, periodId: e.target.value }))}
            required
          >
            <option value="">Sélectionner une période</option>
            {periods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.label} {period.isActive ? "(Active)" : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Format */}
        <div>
          <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
            Format d'export
          </label>
          <select
            id="format"
            className="input"
            value={config.format}
            onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as ReportConfig["format"] }))}
          >
            <option value="pdf">PDF (Présentation)</option>
            <option value="excel">Excel (Données)</option>
            <option value="json">JSON (API)</option>
          </select>
        </div>
      </div>

      {/* Team Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Équipes (optionnel)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Laissez vide pour inclure toutes les équipes
        </p>
        <div className="max-h-32 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
          {teams.map((team) => (
            <label key={team.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={config.teamIds.includes(team.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setConfig(prev => ({
                      ...prev,
                      teamIds: [...prev.teamIds, team.id]
                    }));
                  } else {
                    setConfig(prev => ({
                      ...prev,
                      teamIds: prev.teamIds.filter(id => id !== team.id)
                    }));
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm">{team.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Scheduling */}
      <div>
        <label className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            checked={enableScheduling}
            onChange={(e) => setEnableScheduling(e.target.checked)}
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Programmer l'envoi automatique
          </span>
        </label>

        {enableScheduling && (
          <div className="ml-6 space-y-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fréquence
              </label>
              <select
                className="input"
                value={config.schedule?.frequency || "weekly"}
                onChange={(e) => updateSchedule({ frequency: e.target.value as "daily" | "weekly" | "monthly" })}
              >
                <option value="daily">Quotidien</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="monthly">Mensuel</option>
              </select>
            </div>

            {config.schedule?.frequency === "weekly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour de la semaine
                </label>
                <select
                  className="input"
                  value={config.schedule?.dayOfWeek || 1}
                  onChange={(e) => updateSchedule({ dayOfWeek: parseInt(e.target.value) })}
                >
                  <option value={1}>Lundi</option>
                  <option value={2}>Mardi</option>
                  <option value={3}>Mercredi</option>
                  <option value={4}>Jeudi</option>
                  <option value={5}>Vendredi</option>
                </select>
              </div>
            )}

            {config.schedule?.frequency === "monthly" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jour du mois
                </label>
                <select
                  className="input"
                  value={config.schedule?.dayOfMonth || 1}
                  onChange={(e) => updateSchedule({ dayOfMonth: parseInt(e.target.value) })}
                >
                  {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataires (emails séparés par des virgules)
              </label>
              <textarea
                className="input"
                rows={3}
                placeholder="john@company.com, sarah@company.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={loading || !config.periodId}
          className="btn-primary flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          {loading ? "Génération..." : "Générer le Rapport"}
        </button>
      </div>
    </form>
  );
}