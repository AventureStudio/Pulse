import type { AIContext, User, Objective, ObjectiveLevel } from "@/types";

interface ContextBuilderParams {
  user: User;
  currentTitle?: string;
  currentDescription?: string;
  objectiveLevel?: ObjectiveLevel;
  existingObjectives?: Objective[];
  parentObjective?: Objective | null;
}

export function buildAIContext(params: ContextBuilderParams): AIContext {
  const { user, currentTitle, currentDescription, objectiveLevel, existingObjectives, parentObjective } = params;

  return {
    activity: user.activity,
    roleDescription: user.roleDescription,
    currentTitle,
    currentDescription,
    objectiveLevel,
    existingObjectives: existingObjectives?.map((o) => ({
      title: o.title,
      description: o.description,
    })),
    parentObjective: parentObjective
      ? { title: parentObjective.title, description: parentObjective.description }
      : null,
  };
}
