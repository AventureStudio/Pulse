"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Objective, Period, Team, AIContext, AIAction } from "@/types";
import ObjectiveForm, { type ObjectiveFormData } from "@/components/objectives/ObjectiveForm";
import AIAssistantPanel from "@/components/ai/AIAssistantPanel";
import { useAIAssistant } from "@/lib/hooks/useAIAssistant";
import { useAuth } from "@/lib/hooks/useAuth";
import { useI18n } from "@/lib/i18n";

export default function EditObjectivePage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuth();
  const { ask, loading: aiLoading, error: aiError, response: aiResponse, reset: aiReset } = useAIAssistant();

  const [objective, setObjective] = useState<Objective | null>(null);
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
        const [objRes, periodsRes, teamsRes, objectivesRes] = await Promise.all([
          fetch(`/api/objectives/${id}`),
          fetch("/api/periods"),
          fetch("/api/teams"),
          fetch("/api/objectives"),
        ]);

        if (objRes.ok) setObjective(await objRes.json());
        if (periodsRes.ok) setPeriods(await periodsRes.json());
        if (teamsRes.ok) setTeams(await teamsRes.json());
        if (objectivesRes.ok) {
          const all: Objective[] = await objectivesRes.json();
          setParentObjectives(all.filter((o) => o.id !== id));
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSubmit(data: ObjectiveFormData) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/objectives/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        router.push(`/objectives/${id}`);
      }
    } catch {
      // silently fail
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
      currentTitle: currentForm?.title || objective?.title || "",
      currentDescription: currentForm?.description || objective?.description || "",
      objectiveLevel: currentForm?.level || objective?.level,
      existingObjectives: parentObjectives.map((o) => ({ title: o.title, description: o.description })),
      parentObjective: parentObj ? { title: parentObj.title, description: parentObj.description } : null,
    };
  }, [user, currentForm, parentObjectives, objective]);

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

  if (!objective) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <p className="text-gray-500">{t("form.objective.notFound")}</p>
        <Link href="/objectives" className="btn-secondary btn-md mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <Link
        href={`/objectives/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t("objectives.edit.backToObjective")}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("objectives.edit.title")}</h1>
        <p className="text-gray-500 text-sm mt-1">{t("objectives.edit.subtitle")}</p>
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
              objective={objective}
              periods={periods}
              teams={teams}
              parentObjectives={parentObjectives}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/objectives/${id}`)}
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
              hasTitle={Boolean(currentForm?.title?.trim() || objective?.title)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
