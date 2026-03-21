import { Suspense } from "react";

function RedirectToLogin() {
  // Use client-side redirect to avoid SSR context destruction
  if (typeof window !== "undefined") {
    window.location.replace("/login");
  }
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white animate-pulse"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
          </svg>
        </div>
        <span className="text-sm text-gray-500">Redirection vers la connexion...</span>
        <noscript>
          <p className="text-sm text-red-600">JavaScript requis pour la redirection.</p>
          <a href="/login" className="text-primary-600 underline">Cliquez ici pour continuer</a>
        </noscript>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="text-sm text-gray-500">Chargement...</span>
      </div>
    }>
      <RedirectToLogin />
    </Suspense>
  );
}