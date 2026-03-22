"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/hooks/useAuth";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface CollaborativeUser {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  cursorPosition?: { field: string; position: number; selection?: { start: number; end: number } };
  lastSeen: string;
}

export interface ObjectiveComment {
  id: string;
  objectiveId: string;
  authorId: string;
  author?: { fullName: string; avatarUrl: string | null };
  content: string;
  fieldName?: string;
  position?: { field: string; position: number };
  parentCommentId?: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  replies?: ObjectiveComment[];
}

export interface ObjectiveSuggestion {
  id: string;
  objectiveId: string;
  authorId: string;
  author?: { fullName: string; avatarUrl: string | null };
  fieldName: string;
  originalValue?: string;
  suggestedValue: string;
  reasoning?: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveVersion {
  id: string;
  objectiveId: string;
  versionNumber: number;
  changes: Record<string, { from: unknown; to: unknown }>;
  authorId?: string;
  author?: { fullName: string; avatarUrl: string | null };
  createdAt: string;
}

interface UseRealTimeCollaborationProps {
  objectiveId: string;
  enabled?: boolean;
}

export function useRealTimeCollaboration({ objectiveId, enabled = true }: UseRealTimeCollaborationProps) {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [comments, setComments] = useState<ObjectiveComment[]>([]);
  const [suggestions, setSuggestions] = useState<ObjectiveSuggestion[]>([]);
  const [versions, setVersions] = useState<ObjectiveVersion[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mettre à jour la présence utilisateur
  const updatePresence = useCallback(async (
    field?: string, 
    position?: number, 
    selection?: { start: number; end: number }
  ) => {
    if (!user || !enabled) return;

    const cursorPosition = field && position !== undefined ? {
      field,
      position,
      ...(selection && { selection })
    } : undefined;

    try {
      await supabase
        .from("user_presence")
        .upsert({
          user_id: user.id,
          objective_id: objectiveId,
          cursor_position: cursorPosition,
          active_field: field,
          last_seen: new Date().toISOString()
        }, {
          onConflict: "user_id,objective_id"
        });
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  }, [user, objectiveId, enabled]);

  // Ajouter un commentaire
  const addComment = useCallback(async (
    content: string,
    fieldName?: string,
    position?: { field: string; position: number },
    parentCommentId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("objective_comments")
        .insert({
          objective_id: objectiveId,
          author_id: user.id,
          content,
          field_name: fieldName,
          position,
          parent_comment_id: parentCommentId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding comment:", error);
      return null;
    }
  }, [user, objectiveId]);

  // Résoudre un commentaire
  const resolveComment = useCallback(async (commentId: string, resolved: boolean) => {
    try {
      const { error } = await supabase
        .from("objective_comments")
        .update({ resolved, updated_at: new Date().toISOString() })
        .eq("id", commentId);

      if (error) throw error;
    } catch (error) {
      console.error("Error resolving comment:", error);
    }
  }, []);

  // Ajouter une suggestion
  const addSuggestion = useCallback(async (
    fieldName: string,
    originalValue: string,
    suggestedValue: string,
    reasoning?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("objective_suggestions")
        .insert({
          objective_id: objectiveId,
          author_id: user.id,
          field_name: fieldName,
          original_value: originalValue,
          suggested_value: suggestedValue,
          reasoning
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error adding suggestion:", error);
      return null;
    }
  }, [user, objectiveId]);

  // Traiter une suggestion
  const handleSuggestion = useCallback(async (
    suggestionId: string, 
    status: "accepted" | "rejected"
  ) => {
    try {
      const { error } = await supabase
        .from("objective_suggestions")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", suggestionId);

      if (error) throw error;
    } catch (error) {
      console.error("Error handling suggestion:", error);
    }
  }, []);

  // Sauvegarder une version
  const saveVersion = useCallback(async (changes: Record<string, { from: unknown; to: unknown }>) => {
    if (!user) return;

    try {
      // Obtenir le dernier numéro de version
      const { data: lastVersion } = await supabase
        .from("objective_versions")
        .select("version_number")
        .eq("objective_id", objectiveId)
        .order("version_number", { ascending: false })
        .limit(1)
        .single();

      const nextVersionNumber = (lastVersion?.version_number || 0) + 1;

      const { error } = await supabase
        .from("objective_versions")
        .insert({
          objective_id: objectiveId,
          version_number: nextVersionNumber,
          changes,
          author_id: user.id
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving version:", error);
    }
  }, [user, objectiveId]);

  // Initialiser la collaboration temps réel
  useEffect(() => {
    if (!enabled || !objectiveId || !user) return;

    const channel = supabase.channel(`objective-${objectiveId}`);
    channelRef.current = channel;

    // Écouter les changements de présence
    channel
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "user_presence",
        filter: `objective_id=eq.${objectiveId}`
      }, async () => {
        // Recharger les présences
        const { data } = await supabase
          .from("user_presence")
          .select(`
            user_id,
            cursor_position,
            active_field,
            last_seen,
            users!inner(full_name, avatar_url)
          `)
          .eq("objective_id", objectiveId)
          .gte("last_seen", new Date(Date.now() - 5 * 60 * 1000).toISOString());

        if (data) {
          const users: CollaborativeUser[] = data
            .filter(p => p.user_id !== user.id)
            .map(p => ({
              id: p.user_id,
              fullName: (p.users as any).full_name,
              avatarUrl: (p.users as any).avatar_url,
              cursorPosition: p.cursor_position ? {
                field: p.cursor_position.field,
                position: p.cursor_position.position,
                selection: p.cursor_position.selection
              } : undefined,
              lastSeen: p.last_seen
            }));
          setActiveUsers(users);
        }
      })
      // Écouter les commentaires
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "objective_comments",
        filter: `objective_id=eq.${objectiveId}`
      }, () => {
        // Recharger les commentaires
        loadComments();
      })
      // Écouter les suggestions
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "objective_suggestions",
        filter: `objective_id=eq.${objectiveId}`
      }, () => {
        // Recharger les suggestions
        loadSuggestions();
      })
      // Écouter les versions
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "objective_versions",
        filter: `objective_id=eq.${objectiveId}`
      }, () => {
        // Recharger les versions
        loadVersions();
      });

    channel.subscribe((status) => {
      setIsConnected(status === "SUBSCRIBED");
    });

    // Charger les données initiales
    const loadComments = async () => {
      const { data } = await supabase
        .from("objective_comments")
        .select(`
          *,
          users!author_id(full_name, avatar_url)
        `)
        .eq("objective_id", objectiveId)
        .order("created_at", { ascending: true });

      if (data) {
        const formattedComments: ObjectiveComment[] = data.map(c => ({
          id: c.id,
          objectiveId: c.objective_id,
          authorId: c.author_id,
          author: c.users ? {
            fullName: (c.users as any).full_name,
            avatarUrl: (c.users as any).avatar_url
          } : undefined,
          content: c.content,
          fieldName: c.field_name,
          position: c.position,
          parentCommentId: c.parent_comment_id,
          resolved: c.resolved,
          createdAt: c.created_at,
          updatedAt: c.updated_at
        }));
        setComments(formattedComments);
      }
    };

    const loadSuggestions = async () => {
      const { data } = await supabase
        .from("objective_suggestions")
        .select(`
          *,
          users!author_id(full_name, avatar_url)
        `)
        .eq("objective_id", objectiveId)
        .order("created_at", { ascending: false });

      if (data) {
        const formattedSuggestions: ObjectiveSuggestion[] = data.map(s => ({
          id: s.id,
          objectiveId: s.objective_id,
          authorId: s.author_id,
          author: s.users ? {
            fullName: (s.users as any).full_name,
            avatarUrl: (s.users as any).avatar_url
          } : undefined,
          fieldName: s.field_name,
          originalValue: s.original_value,
          suggestedValue: s.suggested_value,
          reasoning: s.reasoning,
          status: s.status,
          createdAt: s.created_at,
          updatedAt: s.updated_at
        }));
        setSuggestions(formattedSuggestions);
      }
    };

    const loadVersions = async () => {
      const { data } = await supabase
        .from("objective_versions")
        .select(`
          *,
          users!author_id(full_name, avatar_url)
        `)
        .eq("objective_id", objectiveId)
        .order("version_number", { ascending: false })
        .limit(10);

      if (data) {
        const formattedVersions: ObjectiveVersion[] = data.map(v => ({
          id: v.id,
          objectiveId: v.objective_id,
          versionNumber: v.version_number,
          changes: v.changes,
          authorId: v.author_id,
          author: v.users ? {
            fullName: (v.users as any).full_name,
            avatarUrl: (v.users as any).avatar_url
          } : undefined,
          createdAt: v.created_at
        }));
        setVersions(formattedVersions);
      }
    };

    loadComments();
    loadSuggestions();
    loadVersions();

    // Nettoyer au démontage
    return () => {
      if (presenceTimeoutRef.current) {
        clearTimeout(presenceTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [enabled, objectiveId, user]);

  // Nettoyer la présence lors du démontage
  useEffect(() => {
    return () => {
      if (user && objectiveId) {
        supabase
          .from("user_presence")
          .delete()
          .match({ user_id: user.id, objective_id: objectiveId });
      }
    };
  }, [user, objectiveId]);

  return {
    activeUsers,
    comments,
    suggestions,
    versions,
    isConnected,
    updatePresence,
    addComment,
    resolveComment,
    addSuggestion,
    handleSuggestion,
    saveVersion
  };
}