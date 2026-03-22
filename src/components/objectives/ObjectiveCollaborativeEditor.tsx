"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Users, History, Check, X, Eye, MessageSquare, Lightbulb } from "lucide-react";
import ObjectiveForm, { type ObjectiveFormData } from "./ObjectiveForm";
import { useRealTimeCollaboration, type CollaborativeUser, type ObjectiveComment, type ObjectiveSuggestion } from "@/lib/hooks/useRealTimeCollaboration";
import { useAuth } from "@/lib/hooks/useAuth";
import { relativeDate } from "@/lib/utils/dates";
import { useI18n } from "@/lib/i18n";
import type { Objective, Period, Team } from "@/types";

interface ObjectiveCollaborativeEditorProps {
  objective?: Objective;
  periods: Period[];
  teams: Team[];
  parentObjectives: Objective[];
  onSubmit: (data: ObjectiveFormData) => void;
  onCancel: () => void;
  suggestedValues?: { title?: string; description?: string } | null;
  onFormChange?: (data: ObjectiveFormData) => void;
}

interface UserCursor {
  user: CollaborativeUser;
  field: string;
  position: number;
  selection?: { start: number; end: number };
}

export default function ObjectiveCollaborativeEditor({
  objective,
  periods,
  teams,
  parentObjectives,
  onSubmit,
  onCancel,
  suggestedValues,
  onFormChange
}: ObjectiveCollaborativeEditorProps) {
  const { t } = useI18n();
  const { user } = useAuth();
  const [isCollaborativeMode, setIsCollaborativeMode] = useState(objective?.id ? true : false);
  const [showComments, setShowComments] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentField, setCommentField] = useState<string | undefined>();
  const [formData, setFormData] = useState<ObjectiveFormData | null>(null);
  
  const formRef = useRef<HTMLFormElement>(null);
  const lastSavedRef = useRef<ObjectiveFormData | null>(null);

  const {
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
  } = useRealTimeCollaboration({
    objectiveId: objective?.id || "",
    enabled: isCollaborativeMode && Boolean(objective?.id)
  });

  // Sauvegarder automatiquement les modifications
  const handleFormChange = useCallback((data: ObjectiveFormData) => {
    setFormData(data);
    onFormChange?.(data);

    if (!isCollaborativeMode || !objective?.id || !lastSavedRef.current) {
      lastSavedRef.current = data;
      return;
    }

    // Détecter les changements et sauvegarder une version
    const changes: Record<string, { from: unknown; to: unknown }> = {};
    const prev = lastSavedRef.current;

    if (prev.title !== data.title) {
      changes.title = { from: prev.title, to: data.title };
    }
    if (prev.description !== data.description) {
      changes.description = { from: prev.description, to: data.description };
    }
    if (prev.level !== data.level) {
      changes.level = { from: prev.level, to: data.level };
    }
    if (prev.status !== data.status) {
      changes.status = { from: prev.status, to: data.status };
    }

    if (Object.keys(changes).length > 0) {
      saveVersion(changes);
      lastSavedRef.current = data;
    }
  }, [isCollaborativeMode, objective?.id, saveVersion, onFormChange]);

  // Gérer les mouvements de curseur
  const handleFieldFocus = useCallback((field: string, position: number = 0) => {
    if (isCollaborativeMode && objective?.id) {
      updatePresence(field, position);
    }
  }, [isCollaborativeMode, objective?.id, updatePresence]);

  // Ajouter un commentaire
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim() || !objective?.id) return;

    await addComment(newComment, commentField);
    setNewComment("");
    setCommentField(undefined);
  }, [newComment, commentField, objective?.id, addComment]);

  // Gérer une suggestion
  const handleSuggestionAction = useCallback(async (
    suggestionId: string, 
    action: "accept" | "reject"
  ) => {
    await handleSuggestion(suggestionId, action === "accept" ? "accepted" : "rejected");
    
    if (action === "accept") {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion && formData) {
        const updatedData = {
          ...formData,
          [suggestion.fieldName]: suggestion.suggestedValue
        };
        setFormData(updatedData);
        onFormChange?.(updatedData);
      }
    }
  }, [handleSuggestion, suggestions, formData, onFormChange]);

  // Calculer les curseurs visibles
  const visibleCursors: UserCursor[] = activeUsers
    .filter(u => u.cursorPosition)
    .map(u => ({
      user: u,
      field: u.cursorPosition!.field,
      position: u.cursorPosition!.position,
      selection: u.cursorPosition!.selection
    }));

  const pendingSuggestions = suggestions.filter(s => s.status === "pending");
  const unresolvedComments = comments.filter(c => !c.resolved);

  return (
    <div className="relative">
      {/* Barre d'outils collaborative */}
      {objective?.id && (
        <div className="mb-6 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
          <div className="flex items-center gap-4">
            {/* Toggle mode collaboratif */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCollaborativeMode(!isCollaborativeMode)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  isCollaborativeMode
                    ? "bg-primary-100 text-primary-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Users className="h-4 w-4" />
                {isCollaborativeMode ? t("collaboration.active") : t("collaboration.enable")}
              </button>
              
              {/* Indicateur de connexion */}
              {isCollaborativeMode && (
                <div className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-green-400" : "bg-red-400"
                }`} title={isConnected ? "Connecté" : "Déconnecté"} />
              )}
            </div>

            {/* Utilisateurs actifs */}
            {isCollaborativeMode && activeUsers.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">
                  {activeUsers.length} {activeUsers.length > 1 ? "collaborateurs" : "collaborateur"}
                </span>
                <div className="flex -space-x-1">
                  {activeUsers.slice(0, 3).map(u => (
                    <div
                      key={u.id}
                      className="h-6 w-6 rounded-full border-2 border-white bg-gray-300 overflow-hidden"
                      title={u.fullName}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary-500 text-xs font-medium text-white">
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-400 text-xs font-medium text-white">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          {isCollaborativeMode && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowComments(!showComments)}
                className={`relative rounded-lg p-2 transition-colors ${
                  showComments ? "bg-blue-100 text-blue-700" : "text-gray-500 hover:bg-gray-100"
                }`}
                title="Commentaires"
              >
                <MessageCircle className="h-4 w-4" />
                {unresolvedComments.length > 0 && (
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
                    {unresolvedComments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`relative rounded-lg p-2 transition-colors ${
                  showSuggestions ? "bg-yellow-100 text-yellow-700" : "text-gray-500 hover:bg-gray-100"
                }`}
                title="Suggestions"
              >
                <Lightbulb className="h-4 w-4" />
                {pendingSuggestions.length > 0 && (
                  <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-yellow-500 text-xs font-medium text-white flex items-center justify-center">
                    {pendingSuggestions.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`rounded-lg p-2 transition-colors ${
                  showHistory ? "bg-green-100 text-green-700" : "text-gray-500 hover:bg-gray-100"
                }`}
                title="Historique"
              >
                <History className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Formulaire principal */}
        <div className="flex-1">
          <ObjectiveForm
            objective={objective}
            periods={periods}
            teams={teams}
            parentObjectives={parentObjectives}
            onSubmit={onSubmit}
            onCancel={onCancel}
            suggestedValues={suggestedValues}
            onFormChange={handleFormChange}
          />
        </div>

        {/* Panneaux latéraux */}
        <AnimatePresence>
          {(showComments || showSuggestions || showHistory) && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="border-l border-gray-200 pl-6 overflow-hidden"
            >
              {/* Commentaires */}
              {showComments && (
                <div className="mb-6">
                  <h3 className="mb-3 font-medium text-gray-900 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Commentaires ({unresolvedComments.length})
                  </h3>
                  
                  {/* Nouveau commentaire */}
                  <div className="mb-4 space-y-2">
                    <select
                      value={commentField || ""}
                      onChange={(e) => setCommentField(e.target.value || undefined)}
                      className="input text-xs"
                    >
                      <option value="">Commentaire général</option>
                      <option value="title">Titre</option>
                      <option value="description">Description</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajouter un commentaire..."
                        className="input flex-1 text-xs"
                        onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                      />
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="btn-primary px-2 py-1 text-xs"
                      >
                        <MessageSquare className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Liste des commentaires */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {comments.map(comment => (
                      <div key={comment.id} className="rounded-lg bg-gray-50 p-3 text-xs">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {comment.author?.fullName || "Utilisateur"}
                          </span>
                          <div className="flex items-center gap-1">
                            {comment.fieldName && (
                              <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">
                                {comment.fieldName}
                              </span>
                            )}
                            <button
                              onClick={() => resolveComment(comment.id, !comment.resolved)}
                              className={`p-1 rounded ${comment.resolved ? "text-green-600" : "text-gray-400 hover:text-green-600"}`}
                            >
                              <Check className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <p className={`text-gray-700 ${comment.resolved ? "line-through opacity-60" : ""}`}>
                          {comment.content}
                        </p>
                        <p className="mt-1 text-gray-500">
                          {relativeDate(comment.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {showSuggestions && (
                <div className="mb-6">
                  <h3 className="mb-3 font-medium text-gray-900 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Suggestions ({pendingSuggestions.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {suggestions.map(suggestion => (
                      <div key={suggestion.id} className="rounded-lg bg-yellow-50 p-3 text-xs">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {suggestion.author?.fullName || "Utilisateur"}
                          </span>
                          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-yellow-700">
                            {suggestion.fieldName}
                          </span>
                        </div>
                        
                        {suggestion.originalValue && (
                          <div className="mb-2">
                            <p className="text-gray-500 line-through">
                              {suggestion.originalValue}
                            </p>
                          </div>
                        )}
                        
                        <p className="mb-2 font-medium text-gray-900">
                          {suggestion.suggestedValue}
                        </p>
                        
                        {suggestion.reasoning && (
                          <p className="mb-2 text-gray-600 italic">
                            {suggestion.reasoning}
                          </p>
                        )}
                        
                        {suggestion.status === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSuggestionAction(suggestion.id, "accept")}
                              className="flex-1 rounded bg-green-100 px-2 py-1 text-green-700 hover:bg-green-200"
                            >
                              <Check className="h-3 w-3 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleSuggestionAction(suggestion.id, "reject")}
                              className="flex-1 rounded bg-red-100 px-2 py-1 text-red-700 hover:bg-red-200"
                            >
                              <X className="h-3 w-3 mx-auto" />
                            </button>
                          </div>
                        )}
                        
                        <p className="mt-2 text-gray-500">
                          {relativeDate(suggestion.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Historique */}
              {showHistory && (
                <div>
                  <h3 className="mb-3 font-medium text-gray-900 flex items-center gap-2">
                    <History className="h-4 w-4" />
                    Historique ({versions.length})
                  </h3>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {versions.map(version => (
                      <div key={version.id} className="rounded-lg bg-green-50 p-3 text-xs">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            {version.author?.fullName || "Système"}
                          </span>
                          <span className="text-gray-500">
                            v{version.versionNumber}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {Object.entries(version.changes).map(([field, change]) => (
                            <div key={field} className="text-gray-600">
                              <span className="font-medium">{field}:</span>
                              {" "}
                              <span className="line-through">{String(change.from)}</span>
                              {" → "}
                              <span className="font-medium">{String(change.to)}</span>
                            </div>
                          ))}
                        </div>
                        
                        <p className="mt-2 text-gray-500">
                          {relativeDate(version.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}