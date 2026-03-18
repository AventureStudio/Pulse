"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Objective, Period, Team } from "@/types";
import ObjectiveForm, { type ObjectiveFormData } from "@/components/objectives/ObjectiveForm";
import { useI18n } from "@/lib/i18n";

export default function EditObjectivePage() {
  const { t } = useI18n();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [objective, setObjective] = useState<Objective | null>(null);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [parentObjectives, setParentObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
          // Filter out current objective from parent options
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

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!objective) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <p className="text-gray-500">{t("form.objective.notFound")}</p>
        <Link href="/objectives" className="btn-secondary btn-md mt-4 inline-flex">
          <ArrowLeft className="w-4 h-4" /> {t("common.back")}
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <Link
        href={`/objectives/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> {t("objectives.edit.backToObjective")}
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t("objectives.edit.title")}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {t("objectives.edit.subtitle")}
        </p>
      </div>

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
        />
      </div>
    </div>
  );
}
