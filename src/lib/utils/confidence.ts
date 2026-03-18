import type { Confidence } from "@/types";

export const confidenceConfig: Record<Confidence, { label: string; color: string; bgColor: string; dotColor: string }> = {
  on_track: { label: "En bonne voie", color: "text-success-600", bgColor: "bg-success-100", dotColor: "bg-success-500" },
  at_risk: { label: "À risque", color: "text-warning-600", bgColor: "bg-warning-100", dotColor: "bg-warning-500" },
  off_track: { label: "En retard", color: "text-danger-600", bgColor: "bg-danger-100", dotColor: "bg-danger-500" },
};
