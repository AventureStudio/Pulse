"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400" aria-hidden="true">
        {icon}
      </div>
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1.5 max-w-sm text-sm text-gray-500">{description}</p>
      {action && (
        <Link href={action.href} className="btn-primary btn-md mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}
