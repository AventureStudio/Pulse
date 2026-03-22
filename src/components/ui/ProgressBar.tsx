"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
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
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, progress));
  const color = useMemo(() => getBarColor(clamped), [clamped]);
  const height = useMemo(() => getTrackHeight(size), [size]);

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative w-full overflow-hidden rounded-full bg-gray-100 ${height}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${color}`}
          style={{
            transform: `translateX(-${100 - clamped}%)`,
            width: "100%",
          }}
          initial={{ transform: "translateX(-100%)" }}
          animate={{ transform: `translateX(-${100 - clamped}%)` }}
          transition={{ 
            duration: 0.5, 
            ease: "easeOut",
            type: "tween"
          }}
        />
      </div>
      {showLabel && (
        <span className="flex-shrink-0 text-xs font-semibold text-gray-600 tabular-nums">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  );
}