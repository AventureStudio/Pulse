"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/lib/supabase-auth";
import { useI18n } from "@/lib/i18n";
import { Mail, ArrowRight, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: otpError } = await signInWithMagicLink(email);

      if (otpError) {
        setError(otpError.message);
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm">
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-success-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-success-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            {t("auth.checkEmail")}
          </h2>
          <p className="text-sm text-gray-500 mb-1">
            {t("auth.linkSentTo")}
          </p>
          <p className="font-medium text-gray-800 mb-6">{email}</p>
          <p className="text-xs text-gray-400 mb-6">
            {t("auth.linkExpiry")}
          </p>
          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="btn-ghost btn-sm text-primary-600"
          >
            {t("auth.useAnotherEmail")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
          {t("auth.welcome")}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {t("auth.magicLinkPrompt")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("auth.emailLabel")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input w-full pl-11"
                placeholder={t("auth.emailPlaceholder")}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          <button type="submit" disabled={loading || !email.trim()} className="btn-primary btn-lg w-full">
            {loading ? (
              t("auth.sending")
            ) : (
              <>
                {t("auth.sendLink")}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          {t("auth.noPasswordRequired")}
        </p>
      </div>
    </div>
  );
}
