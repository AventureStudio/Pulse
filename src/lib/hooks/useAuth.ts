"use client";

import { useState, useEffect } from "react";
import { createAuthClient } from "@/lib/supabase-auth-client";
import { supabase } from "@/lib/supabase";
import type { User as AppUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Use the Pulse data client to fetch the user profile
  async function fetchProfile(authUserId: string): Promise<AppUser | null> {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        avatarUrl: data.avatar_url,
        role: data.role,
        teamId: data.team_id,
        activity: data.activity || null,
        roleDescription: data.role_description || null,
        onboarded: data.onboarded ?? false,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;
    // Use the central auth client for session management
    const authClient = createAuthClient();

    async function init() {
      try {
        const { data: { session } } = await authClient.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted && profile) {
            setUser(profile);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth changes on the central auth client
    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
      } else if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setUser(profile);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
