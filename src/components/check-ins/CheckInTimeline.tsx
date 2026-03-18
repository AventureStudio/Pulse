"use client";

import ConfidenceBadge from "@/components/ui/ConfidenceBadge";
import { useI18n } from "@/lib/i18n";
import type { CheckIn } from "@/types";
import { motion } from "framer-motion";
import { Clock, MessageSquare } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function useRelativeDate() {
  const { t } = useI18n();

  return (dateStr: string): string => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return t("timeline.justNow");
    if (diffMin < 60) return t("timeline.minutesAgo").replace("{n}", String(diffMin));
    if (diffHours < 24) return t("timeline.hoursAgo").replace("{n}", String(diffHours));
    if (diffDays === 1) return t("timeline.yesterday");
    if (diffDays < 7) return t("timeline.daysAgo").replace("{n}", String(diffDays));
    if (diffDays < 30) return t("timeline.weeksAgo").replace("{n}", String(Math.floor(diffDays / 7)));
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyTimeline() {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <Clock className="h-6 w-6" />
      </div>
      <p className="text-sm font-medium text-gray-600">{t("timeline.noCheckins")}</p>
      <p className="mt-1 text-xs text-gray-400">
        {t("timeline.noCheckinsDesc")}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Timeline                                                           */
/* ------------------------------------------------------------------ */

interface CheckInTimelineProps {
  checkIns: CheckIn[];
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function CheckInTimeline({ checkIns }: CheckInTimelineProps) {
  const relativeDate = useRelativeDate();

  if (checkIns.length === 0) return <EmptyTimeline />;

  const sorted = [...checkIns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-gray-200" />

      <motion.ul
        className="space-y-5"
        initial="hidden"
        animate="visible"
        variants={{
          visible: { transition: { staggerChildren: 0.07 } },
        }}
      >
        {sorted.map((ci) => (
          <motion.li
            key={ci.id}
            className="relative"
            variants={itemVariants}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Dot */}
            <span className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center">
              <span className="h-2.5 w-2.5 rounded-full border-2 border-white bg-primary-500 shadow-sm" />
            </span>

            <div className="space-y-1.5">
              {/* Header: author + date */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {ci.author?.fullName ?? "Utilisateur"}
                </span>
                <span>&middot;</span>
                <span>{relativeDate(ci.createdAt)}</span>
              </div>

              {/* Value change + confidence */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-gray-700">
                  {ci.previousValue}
                  <span className="mx-1 text-gray-400">&rarr;</span>
                  {ci.newValue}
                </span>
                <ConfidenceBadge confidence={ci.confidence} size="sm" />
              </div>

              {/* Note */}
              {ci.note && (
                <div className="flex items-start gap-1.5 text-xs text-gray-600">
                  <MessageSquare className="mt-0.5 h-3 w-3 flex-shrink-0 text-gray-400" />
                  <p>{ci.note}</p>
                </div>
              )}
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  );
}
