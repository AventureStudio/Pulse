export function calculateProgress(current: number, start: number, target: number): number {
  if (target === start) return 0;
  return Math.max(0, Math.min(100, Math.round(((current - start) / (target - start)) * 100)));
}

export function formatProgress(progress: number): string {
  return `${progress}%`;
}

export function progressColor(progress: number): string {
  if (progress >= 70) return "bg-success-500";
  if (progress >= 40) return "bg-warning-500";
  return "bg-danger-500";
}
