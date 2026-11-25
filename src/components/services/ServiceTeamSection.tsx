"use client";

import React from "react";
import { ServiceTeamMember } from "@/types/cms";
import { Badge } from "@/components/ui/Badge";
import { Users } from "lucide-react";

interface ServiceTeamSectionProps {
  members: ServiceTeamMember[];
  serviceTitle: string;
}

export function ServiceTeamSection({ members, serviceTitle }: ServiceTeamSectionProps) {
  if (!members || members.length === 0) {
    return null;
  }

  return (
    <section id="team" className="mb-14 scroll-mt-24">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAECE4]/85 border border-[#F0CFC0] text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider mb-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
          <Users className="w-3.5 h-3.5" />
          <span>Dedicated Specialists</span>
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#332924]">
          Team Handling {serviceTitle}
        </h2>
        <p className="mt-1.5 text-sm text-[#5F534D]">
          The specialists directly responsible for executing your {serviceTitle.toLowerCase()} deliverables.
        </p>
      </div>

      <div
        className={`grid grid-cols-1 gap-6 ${
          members.length === 1
            ? "md:grid-cols-1 max-w-xl"
            : members.length === 2
            ? "md:grid-cols-2"
            : "md:grid-cols-3"
        }`}
      >
        {members.map((member) => {
          const initials =
            member.initials ||
            member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

          return (
            <div
              key={member.id}
              className="group relative rounded-[28px] m3-surface-1 m3-card-interactive p-6 flex flex-col justify-between overflow-hidden"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-12 -right-12 w-32 h-32 rounded-full bg-[#FAECE4]/60 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />

              <div className="relative z-10">
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-13 h-13 m3-icon-squircle bg-[#FAF7F2] border border-[#E8DFD5] p-1 flex items-center justify-center shrink-0">
                    {member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full object-contain rounded-[14px] group-hover:rounded-full transition-all duration-400"
                      />
                    ) : (
                      <div className="w-full h-full rounded-[14px] group-hover:rounded-full bg-[#FAECE4] text-[#B4583F] flex items-center justify-center font-display font-bold text-base transition-all duration-400">
                        {initials}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-display text-lg font-bold text-[#332924] group-hover:text-[#B4583F] transition-colors">
                      {member.name}
                    </h3>
                    <span className="text-xs font-semibold text-[#C96A50] block">
                      {member.role}
                    </span>
                  </div>
                </div>

                {member.bio && (
                  <p className="text-sm text-[#5F534D] leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              {member.specialties && member.specialties.length > 0 && (
                <div className="relative z-10 mt-5 pt-4 border-t border-[#EFE6DD] flex flex-wrap gap-1.5">
                  {member.specialties.map((spec) => (
                    <Badge key={spec} variant="outline" size="sm" className="m3-pill-chip">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
