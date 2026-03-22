"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import type { Objective, Team } from "@/types";
import { useI18n } from "@/lib/i18n";

interface HeatMapCell {
  id: string;
  name: string;
  progress: number;
  confidence: "on_track" | "at_risk" | "off_track";
  objectiveCount: number;
}

interface OKRHeatMapProps {
  objectives: Objective[];
  teams: Team[];
  className?: string;
}

function getHeatMapColor(progress: number, confidence: string): string {
  if (confidence === "off_track") {
    return "bg-red-500";
  }
  if (confidence === "at_risk") {
    return progress >= 50 ? "bg-yellow-500" : "bg-orange-500";
  }
  // on_track
  if (progress >= 80) return "bg-emerald-500";
  if (progress >= 60) return "bg-green-400";
  if (progress >= 40) return "bg-lime-400";
  if (progress >= 20) return "bg-yellow-300";
  return "bg-gray-300";
}

function getIntensity(progress: number): number {
  return Math.max(0.3, progress / 100);
}

export default function OKRHeatMap({ objectives, teams, className = "" }: OKRHeatMapProps) {
  const { t } = useI18n();

  const heatMapData = useMemo(() => {
    const teamMap = new Map<string, HeatMapCell>();

    // Initialize with teams
    teams.forEach(team => {
      teamMap.set(team.id, {
        id: team.id,
        name: team.name,
        progress: 0,
        confidence: "on_track",
        objectiveCount: 0
      });
    });

    // Add company level (no team)
    teamMap.set("company", {
      id: "company",
      name: t("level.company"),
      progress: 0,
      confidence: "on_track",
      objectiveCount: 0
    });

    // Process objectives
    objectives.forEach(obj => {
      const key = obj.teamId || "company";
      const cell = teamMap.get(key);
      if (cell) {
        cell.objectiveCount++;
        
        // Calculate weighted average progress
        const totalProgress = cell.progress * (cell.objectiveCount - 1) + obj.progress;
        cell.progress = Math.round(totalProgress / cell.objectiveCount);
        
        // Update confidence to worst case
        if (obj.confidence === "off_track" || 
           (obj.confidence === "at_risk" && cell.confidence === "on_track")) {
          cell.confidence = obj.confidence;
        }
      }
    });

    // Filter out empty cells
    return Array.from(teamMap.values()).filter(cell => cell.objectiveCount > 0);
  }, [objectives, teams, t]);

  if (heatMapData.length === 0) {
    return (
      <div className={`card p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Heat Map OKR
        </h3>
        <div className="text-center py-8">
          <div className="text-gray-400 text-sm">
            Aucune donnée à afficher
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Heat Map OKR
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-500"></div>
            <span>Excellence (80-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-400"></div>
            <span>En cours (40-79%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span>À risque (0-39%)</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {heatMapData.map((cell, index) => {
          const color = getHeatMapColor(cell.progress, cell.confidence);
          const intensity = getIntensity(cell.progress);
          
          return (
            <motion.div
              key={cell.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-xl border-2 border-gray-200 ${color} transition-all duration-300 hover:scale-105 cursor-pointer`}
              style={{ opacity: intensity }}
            >
              <div className="text-white">
                <div className="text-sm font-medium truncate mb-1">
                  {cell.name}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {cell.progress}%
                </div>
                <div className="text-xs opacity-90">
                  {cell.objectiveCount} objectif{cell.objectiveCount > 1 ? 's' : ''}
                </div>
              </div>
              
              {/* Confidence indicator */}
              <div className="absolute top-2 right-2">
                <div className={`w-2 h-2 rounded-full ${
                  cell.confidence === "on_track" ? "bg-white/80" :
                  cell.confidence === "at_risk" ? "bg-yellow-200" :
                  "bg-red-200"
                }`} />
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 w-full bg-white/20 rounded-full h-1.5">
                <motion.div
                  className="h-full bg-white/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${cell.progress}%` }}
                  transition={{ duration: 1, delay: index * 0.1 + 0.3 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}