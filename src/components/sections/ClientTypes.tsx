import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { clientTypes } from "@/data/clientTypes";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Check } from "lucide-react";

export function ClientTypes() {
  return (
    <section className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      <Container>
        <SectionHeading
          badgeText="Target Audiences"
          title="Who I Build &amp; Partner With"
          description="Whether you sell on marketplaces, run an independent brand, or need foundational digital infrastructure, I tailor services to your business stage."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientTypes.map((client, idx) => (
            <Card
              key={idx}
              hoverEffect
              className="flex flex-col justify-between p-6 sm:p-7 bg-[rgba(43,20,53,0.5)] border-[#F6DBC0]/15"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[rgba(30,12,38,0.75)] border border-[#F6DBC0]/20 flex items-center justify-center text-[#F6DBC0] mb-4 shadow-inner">
                  <DynamicIcon name={client.iconName} className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight mb-2">
                  {client.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed mb-4">
                  {client.description}
                </p>

                <div className="pt-3 border-t border-[#F6DBC0]/12">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#bba89d] mb-2">
                    Common Focus Areas:
                  </div>
                  <ul className="space-y-1.5">
                    {client.keyNeeds.map((need, nIdx) => (
                      <li
                        key={nIdx}
                        className="flex items-center gap-2 text-xs text-[#F8F4E9]"
                      >
                        <Check className="w-3.5 h-3.5 text-[#F6DBC0] shrink-0" />
                        <span>{need}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
