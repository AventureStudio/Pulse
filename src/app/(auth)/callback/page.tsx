"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Activity } from "lucide-react";

function CallbackContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") || "/dashboard";

    async function setupAndRedirect(userId: string, email: string, fullName?: string) {
      try {
        const res = await fetch("/api/auth/setup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            email,
            fullName: fullName || email.split("@")[0],
          }),
        });
        if (res.ok) {
          const { onboarded } = await res.json();
          if (!onboarded) {
            window.location.href = "/onboarding";
            return;
          }
        }
      } catch {
        // Continue to redirect even if setup fails
      }
      window.location.href = next;
    }

    async function handleExplicitParams() {
      try {
        if (code) {
          // PKCE flow — code in query params
          const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code);
          if (authError) throw authError;
          if (data.user) {
            await setupAndRedirect(data.user.id, data.user.email!, data.user.user_metadata?.full_name);
            return true;
          }
        } else if (token_hash && type) {
          // OTP / magic link with token_hash
          const { data, error: authError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as "magiclink" | "email",
          });
          if (authError) throw authError;
          if (data.user) {
            await setupAndRedirect(data.user.id, data.user.email!, data.user.user_metadata?.full_name);
            return true;
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Authentication failed";
        setError(message);
        return true;
      }
      return false;
    }

    async function run() {
      // 1. Try explicit query params (PKCE code or token_hash)
      const handledByParams = await handleExplicitParams();
      if (handledByParams) return;

      // 2. Check if there are auth params in the URL hash (implicit flow)
      //    Supabase JS client auto-detects hash on init. Wait for it.
      //    Also handle the case where session already exists.

      // Listen for auth state change (handles hash-based tokens)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          subscription.unsubscribe();
          await setupAndRedirect(
            session.user.id,
            session.user.email!,
            session.user.user_metadata?.full_name
          );
        }
      });

      // 3. Also check if there's already a session (e.g., user is already logged in)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        subscription.unsubscribe();
        await setupAndRedirect(
          session.user.id,
          session.user.email!,
          session.user.user_metadata?.full_name
        );
        return;
      }

      // 4. Timeout — if nothing happens after 8 seconds, show error
      setTimeout(() => {
        subscription.unsubscribe();
        setError("Le lien a expiré ou est invalide. Veuillez réessayer.");
      }, 8000);
    }

    run();
  }, [searchParams]);

  if (error) {
    return (
      <div className="w-full max-w-sm">
        <div className="card p-8 text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <a href="/login" className="btn-primary btn-md inline-flex">
            Retour à la connexion
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
        <Activity className="w-6 h-6 text-white animate-pulse" />
      </div>
      <span className="text-sm text-gray-500">Connexion en cours...</span>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white animate-pulse" />
          </div>
          <span className="text-sm text-gray-500">Connexion en cours...</span>
        </div>
      }
    >
      <CallbackContent />
    </Suspense>
  );
}
