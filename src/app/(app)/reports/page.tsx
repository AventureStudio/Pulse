"use client";

import { useState, useEffect } from "react";
import { BarChart3, Calendar, Settings, Send, RefreshCw, AlertTriangle } from "lucide-react";
import type { Report, Period, ReportConfig } from "@/types";
import ReportVisualization from "@/components/reports/ReportVisualization";
import EmptyState from "@/components/ui/EmptyState";

export default function ReportsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    frequency: 'weekly',
    dayOfWeek: 1,
    enabled: false,
    includeCharts: true,
    alertThresholds: {
      behindSchedule: 15,
      noProgressDays: 7,
      decliningConfidence: true,
      overdueCheckin: 14
    }
  });

  // Fetch periods on mount
  useEffect(() => {
    async function fetchPeriods() {
      try {
        const res = await fetch("/api/periods");
        if (res.ok) {
          const data: Period[] = await res.json();
          setPeriods(data);
          const active = data.find((p) => p.isActive);
          if (active) {
            setSelectedPeriodId(active.id);
          } else if (data.length > 0) {
            setSelectedPeriodId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching periods:', error);
      }
    }
    fetchPeriods();
  }, []);

  // Fetch reports when period changes
  useEffect(() => {
    if (!selectedPeriodId) return;
    
    async function fetchReports() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reports?periodId=${selectedPeriodId}`);
        if (res.ok) {
          const data: Report[] = await res.json();
          setReports(data);
          if (data.length > 0) {
            setSelectedReport(data[0]);
          } else {
            setSelectedReport(null);
          }
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [selectedPeriodId]);

  async function generateReport() {
    if (!selectedPeriodId || generating) return;
    
    setGenerating(true);
    try {
      const res = await fetch(`/api/reports?action=generate&periodId=${selectedPeriodId}`);
      if (res.ok) {
        const newReport: Report = await res.json();
        setReports(prev => [newReport, ...prev]);
        setSelectedReport(newReport);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  }

  async function sendReport(recipients: string[]) {
    if (!selectedReport || recipients.length === 0) return;
    
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: selectedReport.id,
          action: 'send',
          recipients
        })
      });
      
      if (res.ok) {
        // Update report status
        setSelectedReport(prev => prev ? {
          ...prev,
          status: 'sent',
          sentAt: new Date().toISOString(),
          recipients
        } : null);
        
        // Update reports list
        setReports(prev => prev.map(r => 
          r.id === selectedReport.id 
            ? { ...r, status: 'sent' as const, sentAt: new Date().toISOString() }
            : r
        ));
      }
    } catch (error) {
      console.error('Error sending report:', error);
    }
  }

  async function saveConfig() {
    try {
      const res = await fetch('/api/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      
      if (res.ok) {
        setShowConfig(false);
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  }

  const hasAlerts = selectedReport ? selectedReport.alerts.some(a => a.level === 'critical' || a.level === 'warning') : false;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Rapports OKR
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Rapports automatisés de progression des objectifs et résultats clés
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="input"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
          >
            <option value="">Sélectionner une période</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label} {p.isActive ? "(active)" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowConfig(true)}
            className="btn-ghost p-2"
            title="Configuration"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={generateReport}
            disabled={!selectedPeriodId || generating}
            className="btn-primary flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Génération...' : 'Générer un rapport'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="w-7 h-7" />}
          title="Aucun rapport généré"
          description="Générez votre premier rapport de progression OKR pour cette période."
          action={{
            label: "Générer un rapport",
            onClick: generateReport,
            disabled: !selectedPeriodId
          }}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Reports sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Rapports générés
              </h2>
              <div className="space-y-2">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedReport?.id === report.id
                        ? 'border-primary-200 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(report.generatedAt).toLocaleDateString('fr-FR')}
                      </span>
                      {report.alerts.some(a => a.level === 'critical' || a.level === 'warning') && (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{report.data.totalObjectives} objectifs</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        report.status === 'sent' ? 'bg-green-100 text-green-800' :
                        report.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'sent' ? 'Envoyé' :
                         report.status === 'ready' ? 'Prêt' : report.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Report content */}
          <div className="lg:col-span-3">
            {selectedReport ? (
              <ReportVisualization 
                report={selectedReport} 
                onSend={sendReport}
              />
            ) : (
              <div className="card p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sélectionnez un rapport
                </h3>
                <p className="text-gray-500">
                  Choisissez un rapport dans la liste pour le visualiser.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Configuration des rapports automatiques
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Activation</h3>
                  <p className="text-sm text-gray-500">Générer automatiquement les rapports</p>
                </div>
                <button
                  onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.enabled ? 'bg-primary-600' : 'bg-gray-200'
                  }`}
                >
                  <span
