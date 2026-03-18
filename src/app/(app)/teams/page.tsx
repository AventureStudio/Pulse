import { Users, Plus } from "lucide-react";

export default function TeamsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">&Eacute;quipes</h1>
          <p className="text-gray-500 text-sm mt-1">G&eacute;rez vos &eacute;quipes et leurs OKRs</p>
        </div>
        <button className="btn-primary btn-md">
          <Plus className="w-4 h-4" /> Nouvelle &eacute;quipe
        </button>
      </div>

      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Aucune &eacute;quipe cr&eacute;&eacute;e
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Cr&eacute;ez des &eacute;quipes pour organiser vos objectifs par d&eacute;partement.
        </p>
      </div>
    </div>
  );
}
