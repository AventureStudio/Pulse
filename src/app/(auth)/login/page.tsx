"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmail } from "@/lib/supabase-auth";
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
      const { data, error: signInError } = await signInWithEmail(
        email,
        password
      );

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }

      // Upsert user profile in the users table
      if (data.user) {
        await supabase.from("users").upsert(
          {
            id: data.user.id,
            email: data.user.email,
            full_name:
              data.user.user_metadata?.full_name ||
              data.user.email?.split("@")[0] ||
              "User",
            avatar_url: data.user.user_metadata?.avatar_url || null,
            role: "member",
          },
          { onConflict: "id" }
        );
      }

      router.push("/dashboard");
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
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
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
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
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
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

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : null}
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>

      <p className="text-sm text-gray-500 text-center mt-6">
        Pas encore de compte ?{" "}
        <Link
          href="/signup"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
