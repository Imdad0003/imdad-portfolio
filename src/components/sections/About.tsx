import React from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  Briefcase,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

export function About() {
  const visualPillars = [
    {
      title: "Entrepreneur",
      role: "Brand Builder & Founder",
      desc: "Founder & sole owner of EasyXo. Hands-on experience navigating supply, fulfillment, and real customer economics.",
      icon: Briefcase,
      color: "text-[#F6DBC0]",
      glow: "hover:shadow-[0_0_25px_rgba(246,219,192,0.35)]",
      floatClass: "animate-float-slow",
    },
    {
      title: "E-Commerce",
      role: "Marketplace Specialist",
      desc: "Amazon, Flipkart, and Meesho cataloging, keyword optimization, and seller onboarding.",
      icon: ShoppingBag,
      color: "text-[#d68fad]",
      glow: "hover:shadow-[0_0_25px_rgba(184,104,144,0.35)]",
      floatClass: "animate-float-reverse",
    },
    {
      title: "Creative",
      role: "Visual & Ad Production",
      desc: "Conversion-engineered 7-image listing sets, UGC-style video ads, and AI-accelerated staging.",
      icon: Sparkles,
      color: "text-[#F8F4E9]",
      glow: "hover:shadow-[0_0_25px_rgba(248,244,233,0.35)]",
      floatClass: "animate-float-slow",
    },
    {
      title: "Growth",
      role: "Storefronts & Acquisition",
      desc: "Mobile-first online stores, Razorpay payments, and Meta advertising hook frameworks.",
      icon: TrendingUp,
      color: "text-[#F6DBC0]",
      glow: "hover:shadow-[0_0_25px_rgba(246,219,192,0.35)]",
      floatClass: "animate-float-reverse",
    },
  ];

  return (
    <section id="about" className="py-24 sm:py-32 border-b border-[#F6DBC0]/12 relative overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-[-10%] w-[500px] h-[500px] rounded-full bg-[#502D55]/30 blur-[150px] pointer-events-none -z-10" />

      <Container>
        <SectionHeading
          badgeText="About The Builder"
          title="Who is Imdad?"
          description="Entrepreneur, e-commerce brand owner, and hands-on digital specialist based in India."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Narrative (6 Cols) */}
          <div className="lg:col-span-6 space-y-6 text-[#d8cfc4] leading-relaxed text-base sm:text-lg">
            {/* Operator Pull Quote Glass Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[rgba(65,28,77,0.65)] to-[rgba(43,20,53,0.5)] border border-[#F6DBC0]/25 backdrop-blur-xl shadow-[0_15px_35px_rgba(10,3,14,0.6),inset_0_1px_0_0_rgba(248,244,233,0.15)]">
              <p className="text-xl sm:text-2xl font-bold text-[#F8F4E9] tracking-tight leading-snug">
                &ldquo;I don&apos;t just provide digital services. I use many of
                these systems in my own e-commerce business.&rdquo;
              </p>
            </div>

            <p>
              I’m an entrepreneur and digital business builder who works across
              e-commerce, marketplace operations, product creatives, websites,
              content and digital growth.
            </p>

            <p>
              As the founder and sole owner of <strong>EasyXo</strong>, an
              e-commerce brand, I view commercial problems from an operator&apos;s
              standpoint. I know what it means to preserve profit margins, build
              marketplace listings that comply with strict catalog rules, design
              images that immediately resolve buyer hesitation, and maintain a
              reliable direct storefront.
            </p>

            <p>
              Whether you need high-converting listing graphics for Amazon, a
              complete mobile store with Razorpay payment processing, or guidance
              navigating GST and marketplace onboarding, I deliver focused,
              end-to-end execution.
            </p>

            {/* Quick Proof Points */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold text-[#F8F4E9]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F6DBC0] shrink-0" />
                <span>Founder &amp; Sole Owner of EasyXo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F6DBC0] shrink-0" />
                <span>Marketplace Operations Experience</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F6DBC0] shrink-0" />
                <span>Conversion-First Creative Production</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#F6DBC0] shrink-0" />
                <span>Modern Generative AI Integration</span>
              </div>
            </div>
          </div>

          {/* Visual Side: 4 Floating Glass Cards (6 Cols) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {visualPillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className={`p-6 rounded-2xl bg-[rgba(43,20,53,0.55)] border border-[#F6DBC0]/18 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(10,3,14,0.6),inset_0_1px_0_0_rgba(248,244,233,0.1)] transition-all duration-300 hover:border-[#F6DBC0]/40 hover:-translate-y-1 ${pillar.glow} ${pillar.floatClass}`}
                  style={{ animationDelay: `${idx * 1.5}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-[rgba(30,12,38,0.7)] border border-[#F6DBC0]/20 flex items-center justify-center mb-4 shadow-inner">
                    <Icon className={`w-6 h-6 ${pillar.color}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[#F8F4E9] tracking-tight">
                    {pillar.title}
                  </h3>
                  <div className="text-xs font-medium text-[#F6DBC0] mb-2">
                    {pillar.role}
                  </div>
                  <p className="text-xs text-[#d8cfc4] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
