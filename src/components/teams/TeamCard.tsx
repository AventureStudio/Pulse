"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import { Users, ChevronRight } from "lucide-react";
import type { Team } from "@/types";

interface TeamCardProps {
  team: Team;
  onClick?: () => void;
}

export default function TeamCard({ team, onClick }: TeamCardProps) {
  const membersCount = team.members ? team.members.length : 0;

  return (
    <div
      className="card p-6 hover:shadow-md hover:border-primary-200 transition-all group cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
          {team.avatarUrl ? (
            <OptimizedImage
              src={team.avatarUrl}
              alt={team.name}
              width={40}
              height={40}
              className="rounded-xl"
              sizes="40px"
            />
          ) : (
            <Users className="w-5 h-5 text-primary-600" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate group-hover:text-primary-700 transition-colors">
            {team.name}
          </h3>
          {team.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {team.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span>
              {membersCount} membre{membersCount > 1 ? "s" : ""}
            </span>
          </div>
          {/* Member avatars preview */}
          {team.members && team.members.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {team.members.slice(0, 4).map((member, index) => (
                <div key={member.id} className="relative">
                  {member.avatarUrl ? (
                    <OptimizedImage
                      src={member.avatarUrl}
                      alt={member.fullName}
                      width={20}
                      height={20}
                      className="rounded-full border border-white shadow-sm"
                      sizes="20px"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-200 border border-white shadow-sm flex items-center justify-center">
                      <span className="text-xs text-gray-500 font-medium">
                        {member.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {membersCount > 4 && (
                <div className="w-5 h-5 rounded-full bg-gray-100 border border-white shadow-sm flex items-center justify-center">
                  <span className="text-xs text-gray-500 font-medium">
                    +{membersCount - 4}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors mt-1" />
      </div>
    </div>
  );
}