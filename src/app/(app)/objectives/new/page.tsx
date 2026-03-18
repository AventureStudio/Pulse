"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { Period, Team, Objective } from "@/types";
import ObjectiveForm, { type ObjectiveFormData } from "@/components/objectives/ObjectiveForm";

export default function NewObjectivePage() {
  const router = useRouter();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [parentObjectives, setParentObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        router.push(`/objectives/${created.id}`);
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

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Nouvel objectif</h1>
        <p className="text-gray-500 text-sm mt-1">
          D&eacute;finissez un nouvel objectif pour votre organisation
        </p>
      </div>

      <div className="card p-6">
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
        />
      </div>
    </div>
  );
}
