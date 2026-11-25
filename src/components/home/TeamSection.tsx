"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { defaultTeamSection, getSiteContent } from "@/lib/cms";
import type { SiteContentDocument } from "@/types/cms";

interface TeamSectionProps {
  initialContent?: SiteContentDocument;
}

export function TeamSection({ initialContent }: TeamSectionProps) {
  const [content, setContent] = useState<SiteContentDocument | undefined>(initialContent);

  useEffect(() => {
    getSiteContent()
      .then((res) => setContent(res))
      .catch(() => {});
  }, []);

  const sec = content?.teamSection || defaultTeamSection;
  const members = (
    sec.members && sec.members.length > 0 ? sec.members : defaultTeamSection.members || []
  ).filter((m) => m.enabled ?? true);

  return (
    <section
      id="team"
      className="py-16 sm:py-20 bg-[var(--background,#FAF7F2)] border-t border-[var(--border-warm,#E8DFD5)]/70"
    >
      <Container>
        <SectionHeading
          badgeText={sec.eyebrow || "STUDIO TEAM"}
          title={sec.headline || "Meet the People Behind the Work"}
          description={sec.subheadline}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="rounded-3xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] p-6 shadow-[0_6px_22px_-6px_rgba(51,41,36,0.05)] flex flex-col justify-between gap-4"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {member.avatarUrl ? (
                        <div className="w-12 h-12 rounded-2xl bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] overflow-hidden p-1 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-peach,#FAECE4)] border border-[#EED3C5] flex items-center justify-center font-display font-bold text-base text-[var(--accent-coral-hover,#B4583F)] shrink-0">
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-display font-bold text-lg text-[var(--ink-primary,#332924)] truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs font-medium text-[var(--ink-muted,#8A7C75)] truncate">
                          {member.title || member.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {member.badge && (
                    <Badge variant="peach" size="sm">
                      {member.badge}
                    </Badge>
                  )}

                  <p className="text-sm text-[var(--ink-body,#5F534D)] leading-relaxed">
                    {member.bio}
                  </p>
                </div>

                {member.specialties && member.specialties.length > 0 && (
                  <div className="pt-3 border-t border-[var(--border-warm,#E8DFD5)]/70 flex flex-wrap gap-1.5">
                    {member.specialties.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-body,#5F534D)]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
