"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  GitBranch,
  Loader2,
  Building2,
  Users,
  User,
  ChevronRight,
} from "lucide-react";
import type { Objective, Period, AlignmentNode } from "@/types";
import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";

const levelConfig: Record<
  string,
  { label: string; icon: typeof Building2; color: string }
> = {
  company: { label: "Entreprise", icon: Building2, color: "text-purple-600 bg-purple-100" },
  team: { label: "\u00C9quipe", icon: Users, color: "text-blue-600 bg-blue-100" },
  individual: { label: "Individuel", icon: User, color: "text-teal-600 bg-teal-100" },
};

function buildTree(objectives: Objective[]): AlignmentNode[] {
  const map = new Map<string, AlignmentNode>();
  const roots: AlignmentNode[] = [];

  // Create nodes
  for (const obj of objectives) {
    map.set(obj.id, { objective: obj, children: [], depth: 0 });
  }

  // Build parent-child relationships
  for (const obj of objectives) {
    const node = map.get(obj.id)!;
    if (obj.parentObjectiveId && map.has(obj.parentObjectiveId)) {
      const parent = map.get(obj.parentObjectiveId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Compute depths
  function setDepth(nodes: AlignmentNode[], depth: number) {
    for (const node of nodes) {
      node.depth = depth;
      setDepth(node.children, depth + 1);
    }
  }
  setDepth(roots, 0);

  // Sort: company first, then team, then individual
  const levelOrder = { company: 0, team: 1, individual: 2 };
  function sortNodes(nodes: AlignmentNode[]) {
    nodes.sort(
      (a, b) =>
        (levelOrder[a.objective.level] ?? 99) -
        (levelOrder[b.objective.level] ?? 99)
    );
    for (const node of nodes) {
      sortNodes(node.children);
    }
  }
  sortNodes(roots);

  return roots;
}

function TreeNode({ node }: { node: AlignmentNode }) {
  const [expanded, setExpanded] = useState(true);
  const obj = node.objective;
  const config = levelConfig[obj.level];
  const LevelIcon = config.icon;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 group"
        style={{ paddingLeft: `${node.depth * 32}px` }}
      >
        {/* Expand/collapse toggle */}
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 flex-shrink-0"
          >
            <ChevronRight
              className={`w-4 h-4 text-gray-400 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
          </div>
        )}

        {/* Connecting line for indented items */}
        {node.depth > 0 && (
          <div className="w-4 border-t border-gray-200 flex-shrink-0" />
        )}

        {/* Node content */}
        <Link
          href={`/objectives/${obj.id}`}
          className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group-hover:shadow-sm"
        >
          {/* Level icon */}
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}
          >
            <LevelIcon className="w-4 h-4" />
          </div>

          {/* Title and progress */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900 truncate">
                {obj.title}
              </span>
            </div>
            <ProgressBar progress={obj.progress} size="sm" showLabel />
          </div>

          {/* Confidence */}
          <ConfidenceBadge confidence={obj.confidence} size="sm" />
        </Link>
      </div>

      {/* Children */}
      {expanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {node.children.map((child) => (
            <TreeNode key={child.objective.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AlignmentPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch periods
  useEffect(() => {
    async function fetchPeriods() {
      try {
        const res = await fetch("/api/periods");
        if (res.ok) {
          const data: Period[] = await res.json();
          setPeriods(data);
          const active = data.find((p) => p.isActive);
          if (active) setSelectedPeriodId(active.id);
          else if (data.length > 0) setSelectedPeriodId(data[0].id);
        }
      } catch {
        // silently fail
      }
    }
    fetchPeriods();
  }, []);

  // Fetch objectives for selected period
  useEffect(() => {
    if (!selectedPeriodId) {
      setLoading(false);
      return;
    }
    async function fetchObjectives() {
      setLoading(true);
      try {
        const res = await fetch(`/api/objectives?periodId=${selectedPeriodId}`);
        if (res.ok) {
          const data: Objective[] = await res.json();
          setObjectives(data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchObjectives();
  }, [selectedPeriodId]);

  const tree = useMemo(() => buildTree(objectives), [objectives]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alignement</h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualisez la hi&eacute;rarchie de vos OKRs
          </p>
        </div>
        <select
          className="input"
          value={selectedPeriodId}
          onChange={(e) => setSelectedPeriodId(e.target.value)}
        >
          {periods.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} {p.isActive ? "(actif)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6">
        {Object.entries(levelConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={key} className="flex items-center gap-1.5 text-sm text-gray-500">
              <div
                className={`w-6 h-6 rounded flex items-center justify-center ${cfg.color}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span>{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : objectives.length === 0 ? (
        <EmptyState
          icon={<GitBranch className="w-7 h-7" />}
          title="Arbre d'alignement"
          description="L'arbre d'alignement appara\u00EEtra ici lorsque vous aurez des objectifs avec des liens parent/enfant."
          action={{ label: "Cr\u00E9er un objectif", href: "/objectives/new" }}
        />
      ) : (
        <div className="card p-6">
          <div className="space-y-1">
            {tree.map((node) => (
              <TreeNode key={node.objective.id} node={node} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
