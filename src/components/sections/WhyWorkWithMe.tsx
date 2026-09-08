import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { whyMePoints } from "@/data/whyMe";

export function WhyWorkWithMe() {
  return (
    <section className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      <Container>
        <SectionHeading
          badgeText="The Operator Advantage"
          title="Why Work With Me?"
          description="Commercial, execution-first capabilities grounded in active brand ownership rather than theoretical agency advice."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyMePoints.map((point) => (
            <Card
              key={point.number}
              hoverEffect
              className="flex flex-col justify-between p-6 sm:p-7 bg-[rgba(43,20,53,0.5)] border-[#F6DBC0]/15"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xl font-black font-mono text-[#F6DBC0]">
                    {point.number}
                  </span>
                  <Badge variant="peach" size="sm">
                    {point.highlight}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight mb-2.5">
                  {point.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed">
                  {point.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
