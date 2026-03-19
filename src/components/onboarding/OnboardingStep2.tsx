"use client";

import { useState } from "react";
import { Mail, Plus, X, Send, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface OnboardingStep2Props {
  emails: string[];
  onEmailsChange: (emails: string[]) => void;
  onSendInvites: () => Promise<void>;
  onNext: () => void;
  onPrev: () => void;
}

export default function OnboardingStep2({ emails, onEmailsChange, onSendInvites, onNext, onPrev }: OnboardingStep2Props) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function addEmail() {
    const email = input.trim().toLowerCase();
    if (!email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("onboarding.step2.invalidEmail"));
      return;
    }
    if (emails.includes(email)) {
      setError(t("onboarding.step2.duplicateEmail"));
      return;
    }
    onEmailsChange([...emails, email]);
    setInput("");
    setError("");
  }

  function removeEmail(email: string) {
    onEmailsChange(emails.filter((e) => e !== email));
  }

  async function handleSend() {
    if (emails.length === 0) return;
    setSending(true);
    try {
      await onSendInvites();
      setSent(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{t("onboarding.step2.title")}</h2>
        <p className="text-sm text-gray-500 mt-1">{t("onboarding.step2.subtitle")}</p>
      </div>

      {/* Email input */}
      <div>
        <label htmlFor="invite-email" className="mb-1 block text-sm font-medium text-gray-700">
          <Mail className="inline w-4 h-4 mr-1" />
          {t("onboarding.step2.emailLabel")}
        </label>
        <div className="flex gap-2">
          <input
            id="invite-email"
            type="email"
            className="input flex-1"
            placeholder={t("onboarding.step2.emailPlaceholder")}
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addEmail(); } }}
          />
          <button type="button" onClick={addEmail} className="btn-secondary btn-md">
            <Plus className="w-4 h-4" />
            {t("onboarding.step2.addEmail")}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      {/* Email list */}
      {emails.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-500">{emails.length} {t("onboarding.step2.invited")}</p>
          {emails.map((email) => (
            <div key={email} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 bg-gray-50">
              <span className="text-sm text-gray-700">{email}</span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title={t("onboarding.step2.remove")}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}

          {!sent ? (
            <button
              type="button"
              onClick={handleSend}
              disabled={sending}
              className="btn-primary btn-md w-full mt-2"
            >
              {sending ? (
                <span className="animate-spin"><Mail className="w-4 h-4" /></span>
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t("onboarding.step2.sendInvites")}
            </button>
          ) : (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mt-2">
              <Check className="w-4 h-4" />
              {t("onboarding.step2.invitesSent")}
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">{t("onboarding.step2.noInvites")}</p>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button type="button" onClick={onPrev} className="btn-ghost btn-md">
          {t("onboarding.previous")}
        </button>
        <button type="button" onClick={onNext} className="btn-secondary btn-md">
          {emails.length === 0 ? t("onboarding.skip") : t("onboarding.next")}
        </button>
      </div>
    </div>
  );
}
