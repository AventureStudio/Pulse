"use client";

import { ChevronLeft } from "lucide-react";
import { useNavigation } from "@/lib/hooks/useNavigation";
import { useI18n } from "@/lib/i18n";

interface BackButtonProps {
  fallback?: string;
  className?: string;
}

export default function BackButton({ fallback = "/dashboard", className = "" }: BackButtonProps) {
  const { t } = useI18n();
  const { goBack, canGoBack } = useNavigation();

  const handleBack = () => {
    goBack(fallback);
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      aria-label={t("common.back")}
    >
      <ChevronLeft className="w-4 h-4" />
      {t("common.back")}
    </button>
  );
}