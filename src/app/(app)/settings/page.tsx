"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Loader2, User, Briefcase, Crown, Users, UserCheck } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

const roleOptions = [
  { value: "CEO / Founder", labelKey: "onboarding.step1.roleCEO" as const, icon: Crown },
  { value: "Manager", labelKey: "onboarding.step1.roleManager" as const, icon: Users },
  { value: "Team Lead", labelKey: "onboarding.step1.roleLead" as const, icon: UserCheck },
  { value: "Contributor", labelKey: "onboarding.step1.roleContributor" as const, icon: User },
];

export default function SettingsPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  const addToast = useStore((s) => s.addToast);

  const [fullName, setFullName] = useState("");
  const [activity, setActivity] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setActivity(user.activity || "");
      setRoleDescription(user.roleDescription || "");
    }
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, activity, roleDescription }),
      });
      if (res.ok) {
        addToast({ type: "success", message: t("settings.saved") });
        // Reload to refresh useAuth
        window.location.reload();
      } else {
        addToast({ type: "error", message: t("settings.saveError") });
      }
    } catch {
      addToast({ type: "error", message: t("settings.saveError") });
    } finally {
      setSaving(false);
    }
  }

  if (!user) return null;

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("settings.title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Profile card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-primary-700">
              {user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
              {user.role}
            </span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Full name */}
          <div>
            <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
              {t("settings.nameLabel")}
            </label>
            <input
              id="fullName"
              type="text"
              className="input w-full"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
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
              className="input w-full"
              placeholder={t("onboarding.step1.activityPlaceholder")}
              value={activity}
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>

          {/* Role description */}
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
                    onClick={() => setRoleDescription(opt.value)}
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
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary btn-md"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
