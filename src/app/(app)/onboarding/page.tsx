"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Check } from "lucide-react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import OnboardingStep1 from "@/components/onboarding/OnboardingStep1";
import OnboardingStep2 from "@/components/onboarding/OnboardingStep2";
import OnboardingStep3 from "@/components/onboarding/OnboardingStep3";

export default function OnboardingPage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [finishing, setFinishing] = useState(false);

  async function handleSendInvites() {
    if (!user || emails.length === 0) return;
    await fetch("/api/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, invitedBy: user.id }),
    });
  }

  async function handleFinish() {
    if (!user) return;
    setFinishing(true);
    try {
      await fetch(`/api/users/${user.id}/onboarding`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity, roleDescription }),
      });
      // Force full reload to pick up onboarded=true in useAuth
      window.location.href = "/dashboard";
    } catch {
      setFinishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-xl">Pulse</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  s === step
                    ? "bg-primary-600 text-white"
                    : s < step
                      ? "bg-primary-100 text-primary-700"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {s < step ? <Check className="h-3.5 w-3.5" /> : s}
              </span>
              {s < 3 && (
                <div className={`h-0.5 w-8 rounded-full ${s < step ? "bg-primary-400" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs text-gray-500">
            {t("onboarding.step")} {step} {t("onboarding.of")} 3
          </span>
        </div>

        {/* Card */}
        <div className="card p-6">
          {step === 1 && (
            <OnboardingStep1
              activity={activity}
              roleDescription={roleDescription}
              onChange={(data) => {
                setActivity(data.activity);
                setRoleDescription(data.roleDescription);
              }}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <OnboardingStep2
              emails={emails}
              onEmailsChange={setEmails}
              onSendInvites={handleSendInvites}
              onNext={() => setStep(3)}
              onPrev={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <OnboardingStep3 onFinish={handleFinish} loading={finishing} />
          )}
        </div>
      </div>
    </div>
  );
}
