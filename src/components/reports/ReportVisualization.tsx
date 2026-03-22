"use client";

import { useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Calendar,
  Users,
  Target,
  Send
} from "lucide-react";
import type { Report, ProgressMetrics, ReportAlert, AlertLevel } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";

interface ReportVisualizationProps {
  report: Report;
  onSend?: (recipients: string[]) => void;
}

function AlertIcon({ level }: { level: AlertLevel }) {
  switch (level) {
    case "critical":
      return <XCircle className="h-4 w-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    case "info":
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
  }
}

function AlertCard({ alert }: { alert: ReportAlert }) {
  const bgColors = {
    critical: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
    info: "bg-blue-50 border-blue-200"
  };

  return (
    <div className={`p-3 rounded-lg border ${bgColors[alert.level]}`}>
      <div className="flex items-start gap-2">
        <AlertIcon level={alert.level} />
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {alert.objectiveTitle}
          </h4>
          <p className="text-xs text-gray-600 mt-0.5">
            {alert.message}
          </p>
          {alert.actionRequired && (
            <span className="inline-block mt-1 text-xs bg-white px-2 py-0.5 rounded border">
              Action requise
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "text-gray-600" 
}: {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {subtitle && (
        <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

function ProgressChart({ weeklyData }: { weeklyData: ProgressMetrics['weeklyProgress'] }) {
  const maxProgress = Math.max(...weeklyData.map(w => w.avgProgress), 100);
  
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        Progression hebdomadaire
      </h3>
      <div className="space-y-3">
        {weeklyData.map((week, index) => (
          <div key={week.week} className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600 w-16">
              S{index + 1}
            </span>
            <div className="flex-1">
              <ProgressBar 
                progress={week.avgProgress} 
                size="sm" 
                showLabel 
              />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              {week.onTrack}
              <span className="w-2 h-2 rounded-full bg-amber-500 ml-2"></span>
              {week.atRisk}
              <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span>
              {week.offTrack}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendingObjectives({ trending }: { trending: ProgressMetrics['trending'] }) {
  return (
    <div className="card p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Objectifs en mouvement
      </h3>
      <div className="space-y-3">
        {trending.slice(0, 5).map((item) => (
          <div key={item.objectiveId} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {item.title}
              </h4>
              <span className="text-xs text-gray-500 capitalize">
                {item.level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {item.previousProgress}% → {item.currentProgress}%
              </span>
              {item.trend === 'up' && (
                <TrendingUp className="h-4 w-4 text-green-500" />
              )}
              {item.trend === 'down' && (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReportVisualization({ report, onSend }: ReportVisualizationProps) {
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [recipients, setRecipients] = useState("");
  const { data: metrics, alerts } = report;
  
  const criticalAlerts = alerts.filter(a => a.level === "critical");
  const warningAlerts = alerts.filter(a => a.level === "warning");
  const infoAlerts = alerts.filter(a => a.level === "info");

  function handleSend() {
    if (onSend && recipients.trim()) {
      const emailList = recipients.split(',').map(e => e.trim()).filter(e => e);
      onSend(emailList);
      setShowSendDialog(false);
      setRecipients("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{report.title}</h2>
          <p className="text-sm text-gray-500">
            Généré le {new Date(report.generatedAt).toLocaleDateString('fr-FR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        {onSend && (
          <button
            onClick={() => setShowSendDialog(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Envoyer le rapport
          </button>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Objectifs totaux"
          value={metrics.totalObjectives}
          icon={Target}
          color="text-blue-600"
        />
        <MetricsCard
          title="Progression moyenne"
          value={`${metrics.avgProgress}%`}
          icon={BarChart3}
          color="text-green-600"
        />
        <MetricsCard
          title="En bonne voie"
          value={metrics.onTrackCount}
          subtitle={`${Math.round((metrics.onTrackCount / metrics.totalObjectives) * 100) || 0}%`}
          icon={CheckCircle}
          color="text-green-600"
        />
        <MetricsCard
          title="À risque + En retard"
          value={metrics.atRiskCount + metrics.offTrackCount}
          subtitle={`${Math.round(((metrics.atRiskCount + metrics.offTrackCount) / metrics.totalObjectives) * 100) || 0}%`}
          icon={AlertTriangle}
          color="text-amber-600"
        />
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes ({alerts.length})
          </h3>
          
          {criticalAlerts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-red-700 mb-2">
                Critique ({criticalAlerts.length})
              </h4>
              <div className="space-y-2">
                {criticalAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
          
          {warningAlerts.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-amber-700 mb-2">
                Attention ({warningAlerts.length})
              </h4>
              <div className="space-y-2">
                {warningAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
          
          {infoAlerts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-blue-700 mb-2">
                Information ({infoAlerts.length})
              </h4>
              <div className="space-y-2">
                {infoAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress by Level */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progression par niveau
          </h3>
          <div className="space-y-4">
            {metrics.byLevel.map((level) => (
              <div key={level.level}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium capitalize">
                    {level.level} ({level.count})
                  </span>
                  <span className="text-sm font-semibold">
                    {level.avgProgress}%
                  </span>
                </div>
                <ProgressBar progress={level.avgProgress} size="sm" />
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {level.onTrack} en bonne voie
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    {level.atRisk} à risque
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    {level.offTrack} en retard
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress by Team */}
        <div className="card p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Progression par équipe
          </h3>
          <div className="space-y-4">
            {metrics.byTeam.slice(0, 5).map((team) => (
              <div key={team.teamId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">
                    {team.teamName} ({team.count})
                  </span>
                  <span className="text-sm font-semibold">
                    {team.avgProgress}%
                  </span>
                </div>
                <ProgressBar progress={team.avgProgress} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress Chart */}
        <ProgressChart weeklyData={metrics.weeklyProgress} />
        
        {/* Trending Objectives */}
        <TrendingObjectives trending={metrics.trending} />
      </div>

      {/* Send Dialog */}
      {showSendDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Envoyer le rapport
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destinataires (emails séparés par des virgules)
              </label>
              <textarea
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="email1@example.com, email2@example.com"
                className="input w-full h-20 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSend}
                disabled={!recipients.trim()}
                className="btn-primary flex-1"
              >
                Envoyer
              </button>
              <button
                onClick={() => setShowSendDialog(false)}
                className="btn-ghost flex-1"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}