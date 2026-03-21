"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, Target, Calendar, User, MoreVertical } from "lucide-react";
import type { KeyResult, CheckIn } from "@/types";
import ProgressBar from "@/components/ui/ProgressBar";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { useI18n } from "@/lib/i18n";
import { performanceMonitor, debounce } from "@/lib/utils/performance";

interface KeyResultCardProps {
  keyResult: KeyResult;
  showObjective?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCheckIn?: () => void;
}

export default function KeyResultCard({
  keyResult,
  showObjective = false,
  onEdit,
  onDelete,
  onCheckIn,
}: KeyResultCardProps) {
  const { t } = useI18n();
  const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize progress calculation
  const progress = useMemo(() => {
    if (keyResult.targetValue === 0) return 0;
    const current = keyResult.currentValue || 0;
    return Math.min(Math.round((current / keyResult.targetValue) * 100), 100);
  }, [keyResult.currentValue, keyResult.targetValue]);

  // Debounced check-ins loading
  const loadCheckIns = useMemo(
    () => debounce(async (keyResultId: string) => {
      if (loading) return;
      
      setLoading(true);
      setError(null);
      
      const endMeasure = performanceMonitor.startMeasure(`key-result-${keyResultId}-checkins`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch(
          `/api/check-ins?keyResultId=${keyResultId}&limit=3`,
          {
            signal: controller.signal,
            headers: {
              "Cache-Control": "max-age=60" // 1 minute cache
            }
          }
        );
        
        clearTimeout(timeoutId);
        
        if (res.ok) {
          const data: CheckIn[] = await res.json();
          setRecentCheckIns(data);
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.warn(`Failed to load check-ins for key result ${keyResultId}:`, err);
          setError("Erreur de chargement");
        }
      } finally {
        setLoading(false);
        endMeasure();
      }
    }, 300),
    [loading]
  );

  // Load recent check-ins on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      loadCheckIns(keyResult.id);
    }, 200);

    return () => clearTimeout(timer);
  }, [keyResult.id, loadCheckIns]);

  const formatValue = (value: number) => {
    if (keyResult.unit) {
      return `${value}${keyResult.unit}`;
    }
    return value.toString();
  };

  const getConfidence = () => {
    if (recentCheckIns.length > 0) {
      return recentCheckIns[0].confidence;
    }
    
    // Fallback confidence based on progress
    if (progress >= 70) return "on_track";
    if (progress >= 30) return "at_risk";
    return "off_track";
  };

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-success-100 text-success-600 flex-shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <Link
              href={`/key-results/${keyResult.id}`}
              className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors block truncate"
            >
              {keyResult.title}
            </Link>
            {keyResult.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {keyResult.description}
              </p>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="relative flex-shrink-0">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Target className="w-3.5 h-3.5" />
          <span>{t(`metricType.${keyResult.metricType}`)}</span>
        </div>

        {showObjective && keyResult.objectiveId && (
          <div className="flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            <span>Objectif lié</span>
          </div>
        )}

        {keyResult.ownerId && (
          <div className="flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            <span>Assigné</span>
          </div>
        )}
      </div>

      {/* Progress and Values */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {formatValue(keyResult.currentValue || keyResult.startValue)}
            </span>
            <span className="mx-2">/</span>
            <span>{formatValue(keyResult.targetValue)}</span>
          </div>
          <span className="text-sm font-bold text-gray-900">
            {progress}%
          </span>
        </div>
        <ProgressBar progress={progress} size="md" />
      </div>

      {/* Recent Activity */}
      {loading && (
        <div className="mb-3">
          <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
        </div>
      )}
      
      {error && (
        <div className="mb-3 text-xs text-red-600">
          {error}
        </div>
      )}
      
      {recentCheckIns.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500">
            Dernière mise à jour: {new Date(recentCheckIns[0].createdAt).toLocaleDateString()}
          </p>
          {recentCheckIns[0].note && (
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {recentCheckIns[0].note}
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <ConfidenceBadge confidence={getConfidence()} />
        <div className="flex items-center gap-2">
          {onCheckIn && (
            <button
              onClick={onCheckIn}
              className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t("keyResults.checkIn")}
            </button>
          )}
          <Link
            href={`/key-results/${keyResult.id}`}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            {t("common.viewDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}