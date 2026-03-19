"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Period, Team, Objective, AIContext, AIAction } from "@/types";
import ObjectiveForm, { type ObjectiveFormData } from "@/components/objectives/ObjectiveForm";
import AIAssistantPanel from "@/components/ai/AIAssistantPanel";
import { useAIAssistant } from "@/lib/hooks/useAIAssistant";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";

export default function NewObjectivePage() {
  const { t } = useI18n();
  const router = useRouter();
  const { user } = useAuth();
  const addToast = useStore((s) => s.addToast);
  const { ask, loading: aiLoading, error: aiError, response: aiResponse, reset: aiReset } = useAIAssistant();

  const [periods, setPeriods] = useState<Period[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [parentObjectives, setParentObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [suggestedValues, setSuggestedValues] = useState<{ title?: string; description?: string } | null>(null);
  const [currentForm, setCurrentForm] = useState<ObjectiveFormData | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [periodsRes, teamsRes, objectivesRes] = await Promise.all([
          fetch("/api/periods"),
          fetch("/api/teams"),
          fetch("/api/objectives"),
        ]);

        if (periodsRes.ok) setPeriods(await periodsRes.json());
        if (teamsRes.ok) setTeams(await teamsRes.json());
        if (objectivesRes.ok) setParentObjectives(await objectivesRes.json());
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSubmit(data: ObjectiveFormData) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const created: Objective = await res.json();
        addToast({ type: "success", message: t("toast.objectiveCreated") });
        router.push(`/objectives/${created.id}`);
      } else {
        addToast({ type: "error", message: t("toast.error") });
      }
    } catch {
      addToast({ type: "error", message: t("toast.error") });
    } finally {
      setSubmitting(false);
    }
  }

  const buildContext = useCallback((): AIContext => {
    const parentObj = currentForm?.parentObjectiveId
      ? parentObjectives.find((o) => o.id === currentForm.parentObjectiveId)
      : null;

    return {
      activity: user?.activity || null,
      roleDescription: user?.roleDescription || null,
      currentTitle: currentForm?.title || "",
      currentDescription: currentForm?.description || "",
      objectiveLevel: currentForm?.level,
      existingObjectives: parentObjectives.map((o) => ({ title: o.title, description: o.description })),
      parentObjective: parentObj ? { title: parentObj.title, description: parentObj.description } : null,
    };
  }, [user, currentForm, parentObjectives]);

  function handleAIAction(action: AIAction) {
    aiReset();
    ask(action, buildContext());
  }

  function handleApplySuggestion(title: string, description?: string) {
    setSuggestedValues({ title, description: description || "" });
  }

  const handleFormChange = useCallback((data: ObjectiveFormData) => {
    setCurrentForm(data);
  }, []);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("objectives.new.title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("objectives.new.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form (3/5) */}
        <div className="lg:col-span-3">
          <div className="card p-6 relative">
            {submitting && (
              <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10 rounded-xl">
                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
              </div>
            )}
            <ObjectiveForm
              periods={periods}
              teams={teams}
              parentObjectives={parentObjectives}
              onSubmit={handleSubmit}
              onCancel={() => router.back()}
              suggestedValues={suggestedValues}
              onFormChange={handleFormChange}
            />
          </div>
        </div>

        {/* AI Panel (2/5) */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <AIAssistantPanel
              context={buildContext()}
              response={aiResponse}
              loading={aiLoading}
              error={aiError}
              onAction={handleAIAction}
              onApplySuggestion={handleApplySuggestion}
              hasTitle={Boolean(currentForm?.title?.trim())}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
