"use client";

import { useState, useEffect } from "react";
import { FileText, TrendingUp, Calendar, Users, Download, Send, Clock, BarChart3 } from "lucide-react";
import ReportGenerator from "@/components/reports/ReportGenerator";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { useI18n } from "@/lib/i18n";
import type { Period, Team } from "@/types";

interface ReportConfig {
  id: string;
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
  createdAt: string;
  lastRun?: string;
}

export default function ReportsPage() {
  const { t } = useI18n();
  const [showGenerator, setShowGenerator] = useState(false);
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [periodsRes, teamsRes, reportsRes] = await Promise.all([
          fetch("/api/periods"),
          fetch("/api/teams"),
          fetch("/api/reports"),
        ]);

        if (periodsRes.ok) {
          const periodsData = await periodsRes.json();
          setPeriods(periodsData);
        }

        if (teamsRes.ok) {
          const teamsData = await teamsRes.json();
          setTeams(teamsData);
        }

        if (reportsRes.ok) {
          const reportsData = await reportsRes.json();
          setReports(reportsData);
        }
      } catch (error) {
        console.error("Failed to fetch reports data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleGenerateReport = async (config: Omit<ReportConfig, "id" | "createdAt">) => {
    setGeneratingId("new");
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `report-${Date.now()}.${config.format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setGeneratingId(null);
      setShowGenerator(false);
    }
  };

  const handleRegenerateReport = async (report: ReportConfig) => {
    setGeneratingId(report.id);
    try {
      const response = await fetch(`/api/reports/${report.id}/generate`, {
        method: "POST",
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${report.name.toLowerCase().replace(/\s+/g, "-")}.${report.format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to regenerate report:", error);
    } finally {
      setGeneratingId(null);
    }
  };

  const reportTypeConfig = {
    okr_performance: {
      label: "Rapport de Performance OKR",
      icon: TrendingUp,
      color: "text-primary-600 bg-primary-100",
    },
    team_analytics: {
      label: "Analytiques d'Équipe",
      icon: Users,
      color: "text-purple-600 bg-purple-100",
    },
    period_summary: {
      label: "Résumé de Période",
      icon: Calendar,
      color: "text-orange-600 bg-orange-100",
    },
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rapports de Performance</h1>
          <p className="text-gray-500 text-sm mt-1">
            Générez et programmez des rapports automatisés avec analyses prédictives
          </p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Nouveau Rapport
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Rapports Créés</span>
            <BarChart3 className="w-5 h-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Rapports Programmés</span>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {reports.filter(r => r.schedule).length}
          </p>
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Dernière Génération</span>
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {reports.some(r => r.lastRun)
              ? new Date(Math.max(...reports.filter(r => r.lastRun).map(r => new Date(r.lastRun!).getTime()))).toLocaleDateString("fr-FR")
              : "Aucune"
            }
          </p>
        </div>
      </div>

      {/* Reports List */}
      {reports.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-7 h-7" />}
          title="Aucun rapport configuré"
          description="Créez votre premier rapport automatisé pour suivre les performances OKR"
          action={{
            label: "Créer un rapport",
            onClick: () => setShowGenerator(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const config = reportTypeConfig[report.type];
            const Icon = config.icon;
            const period = periods.find(p => p.id === report.periodId);
            const reportTeams = teams.filter(t => report.teamIds.includes(t.id));

            return (
              <div key={report.id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRegenerateReport(report)}
                      disabled={generatingId === report.id}
                      className="btn-ghost text-xs px-2 py-1 flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      {generatingId === report.id ? "..." : "Télécharger"}
                    </button>
                    {report.schedule && (
                      <div className="flex items-center text-orange-600">
                        <Clock className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{report.name}</h3>
                <p className="text-xs text-gray-500 mb-3">{config.label}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Période:</span>
                    <span className="font-medium">{period?.label || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Équipes:</span>
                    <span className="font-medium">
                      {reportTeams.length === 0 ? "Toutes" : `${reportTeams.length} équipe${reportTeams.length > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Format:</span>
                    <span className="font-medium uppercase">{report.format}</span>
                  </div>
                  {report.schedule && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Fréquence:</span>
                      <span className="font-medium capitalize">{report.schedule.frequency}</span>
                    </div>
                  )}
                </div>

                {report.lastRun && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Dernière génération: {new Date(report.lastRun).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Report Generator Modal */}
      <Modal
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        title="Générer un Rapport"
        size="lg"
      >
        <ReportGenerator
          periods={periods}
          teams={teams}
          onGenerate={handleGenerateReport}
          loading={generatingId === "new"}
        />
      </Modal>
    </div>
  );
}