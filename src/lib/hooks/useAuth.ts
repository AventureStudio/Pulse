"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as AppUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(authUserId: string) {
    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUserId)
      .single();

    if (data) {
      setUser({
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        avatarUrl: data.avatar_url,
        role: data.role,
        teamId: data.team_id,
        createdAt: data.created_at,
      });
    }
  }

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      if (mounted) setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        await fetchProfile(session.user.id);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
