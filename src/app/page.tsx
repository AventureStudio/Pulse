import { redirect } from "next/navigation";

export default function Home() {
  // Using replace instead of redirect to avoid navigation context destruction
  // that can cause accessibility test failures
  return (
    <main id="main-content" role="main">
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pulse</h1>
          <p className="text-gray-600 text-center max-w-md">
            Redirection vers la page de connexion...
          </p>
          <a 
            href="/login" 
            className="btn-primary btn-md mt-4"
            aria-label="Aller à la page de connexion"
          >
            Connexion
          </a>
        </div>
      </div>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(function() {
              if (window.location.pathname === '/') {
                window.location.href = '/login';
              }
            }, 2000);
          `,
        }}
      />
    </main>
  );
}