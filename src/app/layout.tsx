import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nWrapper } from "./i18n-wrapper";
import ToastContainer from "@/components/ui/ToastContainer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Pulse — OKR Tracking",
  description: "Plateforme de suivi des Objectifs et Résultats Clés / OKR Tracking Platform",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#4f46e5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log("[LAYOUT] RootLayout initialized", {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL_ENV || 'local'
  });

  console.log("[LAYOUT] Metadata configuration:", {
    title: metadata.title,
    description: metadata.description,
    icons: metadata.icons
  });

  console.log("[LAYOUT] Viewport configuration:", viewport);

  try {
    console.log("[LAYOUT] Attempting to render HTML structure...");
    
    return (
      <html lang="fr" suppressHydrationWarning>
        <head>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log("[LAYOUT] Head script executing at:", new Date().toISOString());
                window.layoutLoadTime = Date.now();
                console.log("[LAYOUT] Window object available:", typeof window !== 'undefined');
              `
            }}
          />
        </head>
        <body>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.log("[LAYOUT] Body script executing at:", new Date().toISOString());
                console.log("[LAYOUT] Document ready state:", document.readyState);
                window.bodyLoadTime = Date.now();
              `
            }}
          />
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
            Aller au contenu principal
          </a>
          <I18nWrapper>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
            <ToastContainer />
          </I18nWrapper>
        </body>
      </html>
    );
  } catch (error) {
    console.error("[LAYOUT] Error rendering RootLayout:", error);
    console.error("[LAYOUT] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    console.error("[LAYOUT] Error details:", {
      message: error instanceof Error ? error.message : String(error),
      name: error instanceof Error ? error.name : 'Unknown',
      timestamp: new Date().toISOString()
    });

    // Fallback render in case of error
    return (
      <html lang="fr">
        <body>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#fee', 
            border: '1px solid #fcc',
            margin: '20px',
            borderRadius: '8px'
          }}>
            <h1>Layout Error</h1>
            <p>An error occurred while loading the application layout.</p>
            <details>
              <summary>Error Details</summary>
              <pre>{error instanceof Error ? error.message : String(error)}</pre>
            </details>
          </div>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                console.error("[LAYOUT] Fallback layout rendered due to error");
                console.error("[LAYOUT] Error timestamp:", new Date().toISOString());
              `
            }}
          />
        </body>
      </html>
    );
  }
}