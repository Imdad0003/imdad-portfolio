import React from "react";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { easyXoCaseStudy } from "@/data/caseStudy";
import {
  Store,
  Globe,
  Search,
  Sparkles,
  Package,
  TrendingUp,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function EasyXoCaseStudy() {
  const iconMap: Record<string, React.ElementType> = {
    "Marketplace Operations": Store,
    "Direct Digital Storefront": Globe,
    "Product Listing & SEO": Search,
    "Product Creatives & Infographics": Sparkles,
    "Branding & Packaging": Package,
    "Marketing & Growth Workflows": TrendingUp,
  };

  return (
    <section
      id="easyxo"
      className="py-24 sm:py-32 border-b border-[#F6DBC0]/15 relative overflow-hidden bg-gradient-to-b from-[#130917] via-[#240d2b] to-[#130917]"
    >
      {/* Cinematic Ambient Violet Glow */}
      <div
        className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-[#502D55]/35 blur-[170px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container>
        {/* Section Header */}
        <div className="flex flex-col max-w-3xl mb-14">
          <Badge variant="peach" size="md" className="mb-4 self-start">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-pulse shadow-[0_0_8px_#F6DBC0]" />
            Cinematic Case Study • Flagship Project
          </Badge>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#F8F4E9]">
              Building EasyXo
            </h2>
            <span className="text-sm sm:text-base font-bold text-[#F6DBC0] font-mono">
              [ Founder &amp; Sole Owner: Imdad ]
            </span>
          </div>
          <p className="mt-4 text-base sm:text-lg text-[#d8cfc4] leading-relaxed">
            {easyXoCaseStudy.coreSummary}
          </p>
        </div>

        {/* Challenge vs Strategy Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Challenge */}
          <div className="p-7 sm:p-8 rounded-2xl bg-[rgba(43,20,53,0.55)] border border-[#935073]/30 backdrop-blur-2xl shadow-[0_15px_35px_rgba(10,3,14,0.6)]">
            <div className="text-xs font-mono uppercase tracking-wider text-[#d68fad] mb-2 font-bold">
              Marketplace Friction &amp; Context
            </div>
            <h3 className="text-xl font-bold text-[#F8F4E9] tracking-tight mb-3">
              {easyXoCaseStudy.challenge.title}
            </h3>
            <p className="text-sm text-[#d8cfc4] leading-relaxed">
              {easyXoCaseStudy.challenge.description}
            </p>
          </div>

          {/* Strategy */}
          <div className="p-7 sm:p-8 rounded-2xl bg-[rgba(56,24,66,0.65)] border border-[#F6DBC0]/25 backdrop-blur-2xl shadow-[0_15px_35px_rgba(10,3,14,0.6)]">
            <div className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] mb-2 font-bold">
              Execution Architecture
            </div>
            <h3 className="text-xl font-bold text-[#F8F4E9] tracking-tight mb-3">
              {easyXoCaseStudy.strategy.title}
            </h3>
            <p className="text-sm text-[#d8cfc4] leading-relaxed">
              {easyXoCaseStudy.strategy.description}
            </p>
          </div>
        </div>

        {/* What I Built - 6 Core Operational Pillars */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#F6DBC0]/12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#F8F4E9] tracking-tight">
                What I Built &amp; Operate
              </h3>
              <p className="text-xs sm:text-sm text-[#bba89d] mt-1">
                Full-stack commerce infrastructure implemented for EasyXo
              </p>
            </div>
            <Badge variant="outline" size="sm" className="hidden sm:inline-flex">
              6 Core Pillars
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {easyXoCaseStudy.pillars.map((pillar, idx) => {
              const Icon = iconMap[pillar.title] || ShieldCheck;
              return (
                <Card
                  key={idx}
                  hoverEffect
                  className="flex flex-col justify-between p-6 sm:p-7 bg-[rgba(43,20,53,0.5)] border-[#F6DBC0]/15"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[rgba(30,12,38,0.8)] border border-[#F6DBC0]/25 flex items-center justify-center text-[#F6DBC0] shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <Badge variant="peach" size="sm">
                        {pillar.badge}
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-[#F8F4E9] tracking-tight mb-2">
                      {pillar.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed mb-4">
                      {pillar.description}
                    </p>

                    <ul className="space-y-1.5 pt-3 border-t border-[#F6DBC0]/12">
                      {pillar.points.map((pt, pIdx) => (
                        <li
                          key={pIdx}
                          className="flex items-start gap-2 text-xs text-[#F8F4E9]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F6DBC0] shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Results & Milestones Glass Showcase with Honest Metrics */}
        <div className="p-7 sm:p-9 rounded-3xl bg-gradient-to-br from-[rgba(56,24,66,0.7)] via-[rgba(43,20,53,0.65)] to-[rgba(30,12,38,0.8)] border border-[#F6DBC0]/25 backdrop-blur-3xl shadow-[0_25px_60px_rgba(10,3,14,0.8),inset_0_1px_0_0_rgba(248,244,233,0.2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#F6DBC0]/15">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                Proof &amp; Commercial Truth
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#F8F4E9] tracking-tight mt-0.5">
                Brand Status &amp; Real Business Project
              </h3>
            </div>
            <div className="text-xs text-[#d8cfc4] flex items-center gap-1.5 bg-[rgba(24,10,30,0.8)] px-3.5 py-1.5 rounded-xl border border-[#F6DBC0]/20 self-start sm:self-auto font-medium">
              <Lock className="w-3.5 h-3.5 text-[#F6DBC0]" />
              <span>Strict Transparency: Zero Fabricated Figures</span>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {easyXoCaseStudy.metrics.map((metric, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border flex flex-col justify-between ${
                  metric.status === "active"
                    ? "bg-[rgba(30,12,38,0.75)] border-[#F6DBC0]/20"
                    : "bg-[rgba(24,10,30,0.4)] border-dashed border-[#F6DBC0]/20"
                }`}
              >
                <div>
                  <div className="text-xs font-medium text-[#bba89d] mb-1">
                    {metric.label}
                  </div>
                  <div
                    className={`text-sm sm:text-base font-bold tracking-tight ${
                      metric.status === "active"
                        ? "text-[#F8F4E9]"
                        : "text-[#F6DBC0] font-mono"
                    }`}
                  >
                    {metric.value}
                  </div>
                </div>
                {metric.note && (
                  <p className="text-[11px] text-[#bba89d] mt-3 pt-2 border-t border-[#F6DBC0]/10">
                    {metric.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Operator Takeaway */}
          <div className="mt-8 pt-6 border-t border-[#F6DBC0]/15 flex flex-col sm:flex-row items-center justify-between gap-6">
            <p className="text-xs sm:text-sm text-[#d8cfc4] leading-relaxed italic max-w-3xl">
              &ldquo;{easyXoCaseStudy.operatorTakeaway}&rdquo;
            </p>
            <Button href="#contact" variant="primary" size="md" className="shrink-0">
              Apply This To Your Business
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
