import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nWrapper } from "./i18n-wrapper";
import ToastContainer from "@/components/ui/ToastContainer";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

export const metadata: Metadata = {
  title: "Pulse — OKR Tracking",
  description: "Plateforme de suivi des Objectifs et Résultats Clés / OKR Tracking Platform",
  icons: { icon: "/favicon.ico" },
  other: {
    "color-scheme": "light",
  },
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
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[200] focus:bg-primary-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm"
        >
          Aller au contenu principal
        </a>
        <I18nWrapper>
          <ErrorBoundary>
            <div id="main-content" role="main">
              {children}
            </div>
          </ErrorBoundary>
          <ToastContainer />
        </I18nWrapper>
      </body>
    </html>
  );
}
