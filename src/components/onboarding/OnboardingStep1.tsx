"use client";

import { useState } from "react";
import { Briefcase, Crown, Users, UserCheck, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface OnboardingStep1Props {
  activity: string;
  roleDescription: string;
  onChange: (data: { activity: string; roleDescription: string }) => void;
  onNext: () => void;
}

const roleOptions = [
  { value: "CEO / Founder", labelKey: "onboarding.step1.roleCEO" as const, icon: Crown },
  { value: "Manager", labelKey: "onboarding.step1.roleManager" as const, icon: Users },
  { value: "Team Lead", labelKey: "onboarding.step1.roleLead" as const, icon: UserCheck },
  { value: "Contributor", labelKey: "onboarding.step1.roleContributor" as const, icon: User },
];

export default function OnboardingStep1({ activity, roleDescription, onChange, onNext }: OnboardingStep1Props) {
  const { t } = useI18n();
  const [errors, setErrors] = useState<{ activity?: string; role?: string }>({});

  function handleNext() {
    const errs: typeof errors = {};
    if (!activity.trim()) errs.activity = t("onboarding.step1.activityRequired");
    if (!roleDescription) errs.role = t("onboarding.step1.roleRequired");
    setErrors(errs);
    if (Object.keys(errs).length === 0) onNext();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{t("onboarding.step1.title")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("onboarding.step1.subtitle")}</p>
      </div>

      {/* Activity */}
      <div>
        <label htmlFor="activity" className="mb-1 block text-sm font-medium text-gray-700">
          <Briefcase className="inline w-4 h-4 mr-1" />
          {t("onboarding.step1.activityLabel")}
        </label>
        <input
          id="activity"
          type="text"
          className={`input ${errors.activity ? "border-red-400" : ""}`}
          placeholder={t("onboarding.step1.activityPlaceholder")}
          value={activity}
          onChange={(e) => {
            onChange({ activity: e.target.value, roleDescription });
            setErrors((prev) => ({ ...prev, activity: undefined }));
          }}
        />
        {errors.activity && <p className="mt-1 text-xs text-red-500">{errors.activity}</p>}
      </div>

      {/* Role */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t("onboarding.step1.roleLabel")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {roleOptions.map((opt) => {
            const Icon = opt.icon;
            const active = roleDescription === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange({ activity, roleDescription: opt.value });
                  setErrors((prev) => ({ ...prev, role: undefined }));
                }}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? "border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
        {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role}</p>}
      </div>

      <button type="button" onClick={handleNext} className="btn-primary btn-md w-full">
        {t("onboarding.next")}
      </button>
    </div>
  );
}
