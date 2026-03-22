import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Activity } from "lucide-react";

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <Activity className="w-6 h-6 text-white animate-pulse" />
        </div>
        <span className="text-sm text-gray-500">Chargement...</span>
      </div>
    </div>
  );
}

export default function Home() {
  // Use immediate redirect to avoid navigation issues
  redirect("/login");
  
  // This won't be reached but provides fallback
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <LoadingSpinner />
    </Suspense>
  );
}