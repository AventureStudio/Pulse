import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nWrapper } from "./i18n-wrapper";

export const metadata: Metadata = {
  title: "Pulse — OKR Tracking",
  description: "Plateforme de suivi des Objectifs et Résultats Clés / OKR Tracking Platform",
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
        <I18nWrapper>{children}</I18nWrapper>
      </body>
    </html>
  );
}
