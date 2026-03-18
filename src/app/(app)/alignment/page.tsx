import { GitBranch } from "lucide-react";

export default function AlignmentPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Alignement</h1>
        <p className="text-gray-500 text-sm mt-1">Visualisez la hi&eacute;rarchie de vos OKRs</p>
      </div>

      <div className="card p-12 text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <GitBranch className="w-8 h-8 text-primary-300" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Arbre d&apos;alignement
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          L&apos;arbre d&apos;alignement appara&icirc;tra ici lorsque vous aurez des objectifs avec des liens parent/enfant.
        </p>
      </div>
    </div>
  );
}
