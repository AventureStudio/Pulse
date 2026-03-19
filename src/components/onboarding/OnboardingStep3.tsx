"use client";

import { CheckCircle, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface OnboardingStep3Props {
  onFinish: () => void;
  loading: boolean;
}

export default function OnboardingStep3({ onFinish, loading }: OnboardingStep3Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-6 text-center py-8">
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900">{t("onboarding.step3.title")}</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          {t("onboarding.step3.subtitle")}
        </p>
      </div>

      <button
        type="button"
        onClick={onFinish}
        disabled={loading}
        className="btn-primary btn-md mx-auto"
      >
        {t("onboarding.step3.goToDashboard")}
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
