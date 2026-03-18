import { Calendar, Plus } from "lucide-react";

export default function PeriodsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">P&eacute;riodes</h1>
          <p className="text-gray-500 text-sm mt-1">G&eacute;rez les cycles OKR (trimestres, semestres...)</p>
        </div>
        <button className="btn-primary btn-md">
          <Plus className="w-4 h-4" /> Nouvelle p&eacute;riode
        </button>
      </div>

      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          D&eacute;finissez vos p&eacute;riodes OKR
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Cr&eacute;ez des trimestres ou semestres pour organiser vos objectifs dans le temps.
        </p>
      </div>
    </div>
  );
}
