"use client";

import { memo } from "react";

interface ProgressBarProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  color?: "primary" | "success" | "warning" | "danger";
}

const ProgressBar = memo(function ProgressBar({
  progress,
  size = "md",
  showLabel = false,
  color = "primary",
}: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const colorClasses = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
  };

  if (clampedProgress === 0) {
    return (
      <div className="space-y-1">
        <div className={`skeleton ${sizeClasses[size]} rounded-full`} />
        {showLabel && (
          <div className="skeleton h-3 w-8 rounded" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className={`bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedProgress}%` }}
          role="progressbar"
          aria-valuenow={clampedProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 font-medium">
          {clampedProgress}%
        </p>
      )}
    </div>
  );
});

export default ProgressBar;