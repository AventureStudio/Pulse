"use client";

import { useState, useEffect, useCallback } from "react";
import { createAuthClient } from "@/lib/supabase-auth-client";
import { supabase } from "@/lib/supabase";
import type { User as AppUser } from "@/types";

// Cache for user profile to avoid redundant API calls
let userCache: { [key: string]: AppUser } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Optimized profile fetching with caching
  const fetchProfile = useCallback(async (authUserId: string): Promise<AppUser | null> => {
    // Check cache first
    const cached = userCache[authUserId];
    if (cached && Date.now() - cached.createdAt < CACHE_DURATION) {
      return cached;
    }

    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUserId)
        .single();

      if (error || !data) return null;

      const userProfile: AppUser = {
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

      // Cache the result
      userCache[authUserId] = userProfile;
      
      return userProfile;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    
    const authClient = createAuthClient();

    async function init() {
      try {
        // Delay auth check to not block initial render
        timeoutId = setTimeout(async () => {
          if (!mounted) return;
          
          const { data: { session } } = await authClient.auth.getSession();

          if (!mounted) return;

          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            if (mounted && profile) {
              setUser(profile);
            }
          }
          
          if (mounted) setLoading(false);
        }, 50); // Small delay to not block LCP
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setLoading(false);
      }
    }

    init();

    // Listen for auth changes
    const {
      data: { subscription },
    } = authClient.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_OUT" || !session) {
        setUser(null);
        userCache = {}; // Clear cache on signout
      } else if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (mounted) {
          setUser(profile);
        }
      }
    });

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  return { user, loading };
}