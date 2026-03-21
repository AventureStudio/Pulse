"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  GitBranch,
  Users,
  Calendar,
  Settings,
  Activity,
  ChevronLeft,
  LogOut,
  Globe,
} from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut } from "@/lib/supabase-auth";
import { useI18n } from "@/lib/i18n";
import BackButton from "@/components/ui/BackButton";
import type { TranslationKey } from "@/lib/i18n";

const navItems: { href: string; labelKey: TranslationKey; icon: typeof LayoutDashboard }[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/objectives", labelKey: "nav.objectives", icon: Target },
  { href: "/alignment", labelKey: "nav.alignment", icon: GitBranch },
  { href: "/teams", labelKey: "nav.teams", icon: Users },
  { href: "/periods", labelKey: "nav.periods", icon: Calendar },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, loading } = useAuth();
  const { t, locale, setLocale } = useI18n();

  // Determine if we should show the back button
  const shouldShowBackButton = !["/dashboard", "/objectives", "/alignment", "/teams", "/periods", "/settings"].includes(pathname);

  // Redirect to login if not authenticated, or to onboarding if not onboarded
  useEffect(() => {
    if (!loading && !user) {
      // Use replace to avoid adding to history stack
      window.location.replace("/login");
    } else if (!loading && user && !user.onboarded && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [loading, user, pathname, router]);

  async function handleSignOut() {
    await signOut();
    window.location.replace("/login");
  }

  function toggleLocale() {
    setLocale(locale === "fr" ? "en" : "fr");
  }

  // Loading or redirecting state
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="text-sm text-gray-500">
            {loading ? t("common.loading") : t("common.redirecting")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white border-r border-gray-200 flex flex-col transition-all duration-200 hidden lg:flex`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-bold text-gray-900 text-lg">Pulse</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            const label = t(item.labelKey);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary-600" : ""}`} />
                {sidebarOpen && <span>{label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Language switcher */}
        <div className="border-t border-gray-100 px-3 py-2">
          <button
            onClick={toggleLocale}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all`}
            title={sidebarOpen ? undefined : t("lang.toggle")}
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && (
              <span>
                {locale === "fr" ? "FR" : "EN"} → {t("lang.toggle")}
              </span>
            )}
          </button>
        </div>

        {/* User footer */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-primary-700">
                {user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.fullName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleSignOut}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                title={t("auth.signOut")}
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex lg:hidden z-50">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs ${
                isActive ? "text-primary-600" : "text-gray-500"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>

      {/* Main content */}
      <main id="main-content" role="main" className="flex-1 overflow-auto pb-20 lg:pb-0">
        {/* Back button for sub-pages */}
        {shouldShowBackButton && (
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-6 lg:px-8 py-3">
            <BackButton />
          </div>
        )}
        {children}
      </main>
    </div>
  );
}