"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  label?: string;
}

function getBarColor(progress: number): string {
  if (progress >= 70) return "bg-emerald-500";
  if (progress >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function getTrackHeight(size: "sm" | "md" | "lg"): string {
  switch (size) {
    case "sm":
      return "h-1.5";
    case "md":
      return "h-2.5";
    case "lg":
      return "h-4";
  }
}

export default function ProgressBar({
  progress,
  size = "md",
  showLabel = false,
  className = "",
  label,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const color = getBarColor(clamped);
  const height = getTrackHeight(size);
  const progressBarId = `progress-bar-${Math.random().toString(36).substr(2, 9)}`;
  const ariaLabel = label || `Progression : ${Math.round(clamped)} pourcent`;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative w-full overflow-hidden rounded-full bg-gray-100 ${height}`}
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
        id={progressBarId}
      >
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          aria-hidden="true"
        />
      </div>
      {showLabel && (
        <span className="flex-shrink-0 text-xs font-semibold text-gray-600 tabular-nums" aria-describedby={progressBarId}>
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}