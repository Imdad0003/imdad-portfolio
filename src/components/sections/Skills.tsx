import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { skillGroups } from "@/data/skills";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

export function Skills() {
  return (
    <section id="skills" className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      <Container>
        <SectionHeading
          badgeText="Capabilities &amp; Tech"
          title="Skills, Tools &amp; Execution Stack"
          description="E-commerce channels, creative design software, frontier generative AI systems, and technical workflows applied directly to business growth."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skillGroups.map((group, idx) => (
            <Card
              key={idx}
              hoverEffect
              className="flex flex-col justify-between p-6 sm:p-7 bg-[rgba(43,20,53,0.48)] border-[#F6DBC0]/15"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[rgba(30,12,38,0.75)] border border-[#F6DBC0]/20 flex items-center justify-center text-[#F6DBC0] shadow-inner">
                    <DynamicIcon name={group.iconName} className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono text-[#F6DBC0] bg-[rgba(24,10,30,0.8)] px-2.5 py-1 rounded-lg border border-[#F6DBC0]/15">
                    {group.skills.length} competencies
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight mb-2">
                  {group.category}
                </h3>
                <p className="text-xs text-[#d8cfc4] mb-6 leading-relaxed">
                  {group.description}
                </p>

                {/* Badges Grid */}
                <div className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(30,12,38,0.75)] border border-[#F6DBC0]/12 text-[#d8cfc4] font-medium hover:border-[#F6DBC0]/40 hover:text-[#F6DBC0] transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
