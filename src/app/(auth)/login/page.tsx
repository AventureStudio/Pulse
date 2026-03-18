"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        if (signInError.message.includes("Email not confirmed")) {
          setError(
            "Votre email n'est pas encore confirmé. Vérifiez votre boîte de réception ou désactivez la confirmation email dans Supabase."
          );
        } else if (signInError.message.includes("Invalid login credentials")) {
          setError("Email ou mot de passe incorrect.");
        } else {
          setError(signInError.message);
        }
        setLoading(false);
        return;
      }

      // Upsert user profile via API (uses service role key)
      if (data.user) {
        await fetch("/api/auth/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            fullName:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            avatarUrl: data.user.user_metadata?.avatar_url || null,
          }),
        });
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Une erreur inattendue est survenue.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="card p-8">
        <h1 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Bienvenue
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          Connectez-vous à votre compte Pulse
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500 text-center mt-6">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
