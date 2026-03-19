import type { AIAction, AIContext } from "@/types";

const SYSTEM_PROMPT = `Tu es un expert en méthodologie OKR (Objectives & Key Results). Tu aides les utilisateurs à formuler des objectifs ambitieux, mesurables et alignés avec leur stratégie. Réponds toujours en JSON valide, sans texte autour.`;

export function buildPrompt(action: AIAction, context: AIContext): { system: string; user: string } {
  const contextBlock = buildContextBlock(context);

  switch (action) {
    case "suggest_objective":
      return {
        system: SYSTEM_PROMPT,
        user: `${contextBlock}

Suggère 3 objectifs OKR pertinents pour cet utilisateur. Chaque objectif doit être ambitieux, qualitatif et inspirant.

Réponds en JSON avec ce format exact :
{
  "suggestions": [
    { "title": "...", "description": "...", "reasoning": "..." }
  ]
}`,
      };

    case "reformulate_objective":
      return {
        system: SYSTEM_PROMPT,
        user: `${contextBlock}

L'utilisateur a rédigé cet objectif :
- Titre : "${context.currentTitle || ""}"
- Description : "${context.currentDescription || ""}"

Reformule cet objectif pour le rendre plus ambitieux, mesurable et clair. Propose UNE reformulation améliorée.

Réponds en JSON avec ce format exact :
{
  "reformulation": { "title": "...", "description": "...", "reasoning": "..." }
}`,
      };

    case "challenge_objective":
      return {
        system: SYSTEM_PROMPT,
        user: `${contextBlock}

L'utilisateur a rédigé cet objectif :
- Titre : "${context.currentTitle || ""}"
- Description : "${context.currentDescription || ""}"

Fais une analyse critique constructive de cet objectif. Identifie 3 à 5 points d'amélioration potentiels (mesurabilité, ambition, clarté, alignement stratégique, faisabilité).

Réponds en JSON avec ce format exact :
{
  "challenges": [
    { "point": "...", "suggestion": "..." }
  ]
}`,
      };

    case "suggest_key_results":
      return {
        system: SYSTEM_PROMPT,
        user: `${contextBlock}

Pour l'objectif suivant :
- Titre : "${context.currentTitle || ""}"
- Description : "${context.currentDescription || ""}"

Suggère 3 à 5 résultats clés (Key Results) mesurables. Chaque KR doit avoir une métrique claire avec des valeurs de départ et cible.

Réponds en JSON avec ce format exact :
{
  "keyResults": [
    {
      "title": "...",
      "metricType": "number" | "percentage" | "currency" | "boolean",
      "startValue": 0,
      "targetValue": 100,
      "unit": "...",
      "reasoning": "..."
    }
  ]
}`,
      };
  }
}

function buildContextBlock(context: AIContext): string {
  const parts: string[] = [];

  if (context.activity) parts.push(`Secteur d'activité : ${context.activity}`);
  if (context.roleDescription) parts.push(`Rôle de l'utilisateur : ${context.roleDescription}`);
  if (context.objectiveLevel) parts.push(`Niveau de l'objectif : ${context.objectiveLevel}`);

  if (context.parentObjective) {
    parts.push(`Objectif parent : "${context.parentObjective.title}" — ${context.parentObjective.description}`);
  }

  if (context.existingObjectives && context.existingObjectives.length > 0) {
    const objList = context.existingObjectives
      .slice(0, 5)
      .map((o) => `  - ${o.title}`)
      .join("\n");
    parts.push(`Objectifs existants :\n${objList}`);
  }

  if (parts.length === 0) return "Contexte : aucun contexte supplémentaire disponible.";
  return `Contexte :\n${parts.join("\n")}`;
}
