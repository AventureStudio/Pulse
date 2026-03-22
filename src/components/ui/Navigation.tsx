"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  GitBranch,
  Users,
  Calendar,
  Settings,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { TranslationKey } from "@/lib/i18n";

interface NavItem {
  href: string;
  labelKey: TranslationKey;
  icon: typeof LayoutDashboard;
}

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/objectives", labelKey: "nav.objectives", icon: Target },
  { href: "/alignment", labelKey: "nav.alignment", icon: GitBranch },
  { href: "/teams", labelKey: "nav.teams", icon: Users },
  { href: "/periods", labelKey: "nav.periods", icon: Calendar },
  { href: "/settings", labelKey: "nav.settings", icon: Settings },
];

interface NavigationProps {
  sidebarOpen: boolean;
  variant?: "desktop" | "mobile";
}

export default function Navigation({ sidebarOpen, variant = "desktop" }: NavigationProps) {
  const pathname = usePathname();
  const { t } = useI18n();

  if (variant === "mobile") {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex lg:hidden z-50">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-colors ${
                isActive ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/");
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
            prefetch={false}
          >
            <Icon className={`w-5 h-5 flex-shrink-0 ${
              isActive ? "text-primary-600" : ""
            }`} />
            {sidebarOpen && <span>{label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}