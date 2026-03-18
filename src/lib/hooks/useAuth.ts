"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as AppUser } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user profile
        supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
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
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (session?.user) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
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
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
