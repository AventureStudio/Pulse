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

    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError("Le lien a expiré ou est invalide. Veuillez réessayer.");
      return;
    }

    // Fallback: listen for auth state change (handles hash-based tokens from implicit flow)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        subscription.unsubscribe();

        // Call setup then redirect
        try {
          const res = await fetch("/api/auth/setup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: session.user.id,
              email: session.user.email,
              fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
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
        window.location.href = "/dashboard";
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        subscription.unsubscribe();
        window.location.href = "/dashboard";
      }
    });

    // Timeout
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      setError("Le lien a expiré ou est invalide. Veuillez réessayer.");
    }, 8000);

    return () => clearTimeout(timeout);
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
