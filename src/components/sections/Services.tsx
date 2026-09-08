import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { serviceCategories } from "@/data/services";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { Check, ArrowRight } from "lucide-react";

export function Services() {
  return (
    <section id="services" className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/3 right-[-10%] w-[600px] h-[600px] rounded-full bg-[#935073]/20 blur-[170px] pointer-events-none -z-10" />

      <Container>
        <SectionHeading
          badgeText="Comprehensive Capabilities"
          title="Services I Offer"
          description="Everything you need to launch, grow and scale your online business — in one place."
        />

        {/* Asymmetric Glass Grid: First 2 are large featured anchor cards, followed by responsive multi-tier cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {serviceCategories.map((category, index) => {
            // First two cards are featured with 6 cols, others take 6 or 4 cols
            const isFeatured = index === 0 || index === 1;
            const colSpanClass = isFeatured ? "lg:col-span-6" : "lg:col-span-4";

            return (
              <div
                key={category.id}
                className={`${colSpanClass} group rounded-3xl p-7 sm:p-9 transition-all duration-300 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[rgba(56,24,66,0.65)] via-[rgba(43,20,53,0.55)] to-[rgba(30,12,38,0.7)] border border-[#F6DBC0]/18 hover:border-[#F6DBC0]/40 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(10,3,14,0.6),inset_0_1px_0_0_rgba(248,244,233,0.12)] hover:shadow-[0_20px_50px_-5px_rgba(80,45,85,0.4),0_0_25px_-5px_rgba(246,219,192,0.15)] hover:-translate-y-1`}
              >
                {/* Subtle Radial Backlight inside Card on Hover */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#F6DBC0]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div>
                  {/* Top Row: Icon and Category Number */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[rgba(30,12,38,0.8)] border border-[#F6DBC0]/25 flex items-center justify-center text-[#F6DBC0] shadow-[0_0_15px_rgba(246,219,192,0.15)] group-hover:scale-110 group-hover:border-[#F6DBC0]/50 transition-all duration-300">
                      <DynamicIcon name={category.iconName} className="w-6 h-6" />
                    </div>
                    <span className="text-3xl sm:text-4xl font-black font-mono text-[#F6DBC0]/20 select-none group-hover:text-[#F6DBC0]/40 transition-colors">
                      {category.categoryNumber}
                    </span>
                  </div>

                  <span className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] block mb-1">
                    Category {category.categoryNumber}
                  </span>

                  <h3 className="text-xl sm:text-2xl font-black text-[#F8F4E9] tracking-tight mb-2">
                    {category.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-medium text-[#F6DBC0]/90 mb-3">
                    {category.tagline}
                  </p>

                  <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed mb-6">
                    {category.description}
                  </p>

                  {/* Scope Chips */}
                  <div className="mb-6">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-[#bba89d] mb-2.5">
                      Included Scope:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {category.services.map((service, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-[rgba(24,10,30,0.7)] border border-[#F6DBC0]/10 text-[#d8cfc4] font-medium group-hover:border-[#F6DBC0]/20 transition-colors"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Deliverables Checklist */}
                  {category.deliverables && (
                    <div className="pt-4 border-t border-[#F6DBC0]/12 mb-6">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#bba89d] mb-2">
                        Key Deliverables:
                      </div>
                      <ul className="space-y-1.5 text-xs text-[#F8F4E9]">
                        {category.deliverables.map((deliv, dIdx) => (
                          <li key={dIdx} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#F6DBC0] shrink-0" />
                            <span>{deliv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Card Action Link */}
                <div className="pt-4 border-t border-[#F6DBC0]/12 flex items-center justify-between mt-4">
                  <span className="text-[11px] text-[#bba89d]">
                    Tailored Project Scopes
                  </span>
                  <a
                    href="#contact"
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#F6DBC0] hover:text-[#F8F4E9] transition-colors group-hover:translate-x-1 duration-200"
                  >
                    Inquire For This Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
