import Link from "next/link";
import { Target, Plus, Filter } from "lucide-react";

export default function ObjectivesPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Objectifs</h1>
          <p className="text-gray-500 text-sm mt-1">G&eacute;rez vos objectifs et r&eacute;sultats cl&eacute;s</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn-md">
            <Filter className="w-4 h-4" /> Filtrer
          </button>
          <Link href="/objectives/new" className="btn-primary btn-md">
            <Plus className="w-4 h-4" /> Nouvel objectif
          </Link>
        </div>
      </div>

      {/* Empty state */}
      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Aucun objectif pour le moment
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Cr&eacute;ez votre premier objectif pour commencer &agrave; suivre vos OKRs.
        </p>
      </div>
    </div>
  );
}
