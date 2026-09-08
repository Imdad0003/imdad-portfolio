import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { businessSetupItems } from "@/data/businessSetup";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { ShieldAlert, Check, ArrowRight } from "lucide-react";

export function BusinessSetup() {
  return (
    <section
      id="business-setup"
      className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden"
    >
      <Container>
        <SectionHeading
          badgeText="Administrative Guidance"
          title="Business Setup &amp; Seller Onboarding Assistance"
          description="Hands-on documentation guidance, portal filing support, and marketplace verification walkthroughs to launch your selling channels cleanly."
        />

        {/* Regulatory & Compliance Transparency Notice (Warm Peach/Amber Glass Box) */}
        <div className="mb-12 p-5 sm:p-6 rounded-2xl bg-[rgba(56,24,66,0.6)] border border-[#F6DBC0]/30 backdrop-blur-2xl flex items-start gap-4 text-xs sm:text-sm text-[#d8cfc4] leading-relaxed shadow-[0_10px_30px_rgba(10,3,14,0.5)]">
          <ShieldAlert className="w-5 h-5 text-[#F6DBC0] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#F8F4E9] font-bold block mb-1">
              Important Compliance Transparency Notice:
            </strong>
            I provide practical administrative guidance, portal walkthroughs, and
            documentation preparation based on real business operations. I am{" "}
            <strong>not</strong> an advocate, chartered accountant (CA),
            registered trademark attorney, or licensed tax professional. For
            formal legal representation, court matters, or statutory tax audits,
            consult licensed professionals.
          </div>
        </div>

        {/* Glass Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessSetupItems.map((item) => (
            <Card
              key={item.id}
              hoverEffect
              className="flex flex-col justify-between p-6 sm:p-7 bg-[rgba(43,20,53,0.5)] border-[#F6DBC0]/15"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[rgba(30,12,38,0.75)] border border-[#F6DBC0]/20 flex items-center justify-center text-[#F6DBC0] mb-4 shadow-inner">
                  <DynamicIcon name={item.iconName} className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight mb-2">
                  {item.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed mb-4">
                  {item.description}
                </p>

                <div className="space-y-2 pt-3 border-t border-[#F6DBC0]/12 mb-4">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-[#bba89d]">
                    What We Walk Through:
                  </div>
                  {item.scope.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-[#F8F4E9]"
                    >
                      <Check className="w-3.5 h-3.5 text-[#F6DBC0] shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {item.disclaimer && (
                <div className="pt-3 border-t border-[#F6DBC0]/12 text-[11px] text-[#bba89d] italic">
                  * {item.disclaimer}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Action Prompt */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[rgba(56,24,66,0.7)] via-[rgba(43,20,53,0.65)] to-[rgba(70,30,82,0.65)] border border-[#F6DBC0]/25 backdrop-blur-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[0_15px_40px_rgba(10,3,14,0.6)]">
          <div>
            <h4 className="text-lg font-bold text-[#F8F4E9]">
              Need help organizing documentation before investing in inventory?
            </h4>
            <p className="text-xs sm:text-sm text-[#d8cfc4] mt-1">
              Let&apos;s map out your seller accounts, GST readiness, and trademark public search properly.
            </p>
          </div>
          <a
            href="#contact"
            className="shrink-0 px-6 py-3 rounded-xl bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(246,219,192,0.4)] hover:shadow-[0_0_30px_rgba(246,219,192,0.6)] transition-all flex items-center gap-2"
          >
            Ask About Setup Help
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </Container>
    </section>
  );
}
