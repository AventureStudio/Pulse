"use client";

import { memo } from "react";
import { Activity } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

const LoadingSpinner = memo(function LoadingSpinner({
  size = "md",
  className = "",
  text,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Activity
        className={`${sizeClasses[size]} text-primary-600 animate-pulse`}
        aria-hidden="true"
      />
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-500 font-medium`}>
          {text}
        </span>
      )}
      <span className="sr-only">Chargement en cours...</span>
    </div>
  );
});

export { LoadingSpinner };