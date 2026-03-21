"use client";

import type { Confidence } from "@/types";

const config: Record<
  Confidence,
  { label: string; dot: string; bg: string; text: string }
> = {
  on_track: {
    label: "En bonne voie",
    dot: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
  at_risk: {
    label: "À risque",
    dot: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  off_track: {
    label: "En retard",
    dot: "bg-red-500",
    bg: "bg-red-50",
    text: "text-red-700",
  },
};

interface ConfidenceBadgeProps {
  confidence: Confidence;
  size?: "sm" | "md";
}

export default function ConfidenceBadge({
  confidence,
  size = "md",
}: ConfidenceBadgeProps) {
  const c = config[confidence];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${c.bg} ${c.text} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      }`}
      aria-label={`Statut de confiance: ${c.label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
      {c.label}
    </span>
  );
}
