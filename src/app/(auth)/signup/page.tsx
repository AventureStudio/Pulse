"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If session exists, user is auto-confirmed → create profile and go to dashboard
      if (data.session) {
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user!.id,
            email,
            fullName,
            avatarUrl: null,
          }),
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        // Email confirmation required
        // Still try to create the profile (it may work if the user exists in auth)
        if (data.user) {
          await fetch("/api/auth/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.user.id,
              email,
              fullName,
              avatarUrl: null,
            }),
          });
        }
        setNeedsConfirmation(true);
      }
    } catch {
      setError("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (needsConfirmation) {
    return (
      <div className="w-full max-w-sm">
        <div className="card p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Vérifiez votre email
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Un lien de confirmation a été envoyé à{" "}
            <span className="font-medium text-gray-700">{email}</span>.
          </p>
          <Link href="/login" className="btn-secondary btn-md w-full inline-block text-center">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Créer un compte
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Rejoignez Pulse pour suivre vos objectifs
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input w-full" placeholder="Jean Dupont" required autoComplete="name" autoFocus />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input w-full" placeholder="vous@exemple.com" required autoComplete="email" />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe
            </label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input w-full" placeholder="••••••••" required minLength={6} autoComplete="new-password" />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmer le mot de passe
            </label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input w-full" placeholder="••••••••" required minLength={6} autoComplete="new-password" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500 text-center mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
