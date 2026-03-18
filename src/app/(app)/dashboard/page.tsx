import { Target, TrendingUp, AlertTriangle, XCircle, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d&apos;ensemble de vos OKRs</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Objectifs", value: "0", icon: Target, color: "text-primary-600 bg-primary-100" },
          { label: "En bonne voie", value: "0", icon: TrendingUp, color: "text-success-600 bg-success-100" },
          { label: "À risque", value: "0", icon: AlertTriangle, color: "text-warning-600 bg-warning-100" },
          { label: "En retard", value: "0", icon: XCircle, color: "text-danger-600 bg-danger-100" },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Commencez par cr&eacute;er vos OKRs
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
          D&eacute;finissez vos objectifs et r&eacute;sultats cl&eacute;s pour suivre la progression de votre &eacute;quipe.
        </p>
        <a href="/objectives/new" className="btn-primary btn-md inline-flex">
          <Target className="w-4 h-4" />
          Cr&eacute;er un objectif
        </a>
      </div>
    </div>
  );
}
