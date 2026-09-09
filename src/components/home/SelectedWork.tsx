import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowRight, ShoppingBag, Sparkles, Globe, Video } from "lucide-react";

interface ProjectPreview {
  title: string;
  category: string;
  badge: string;
  description: string;
  deliverables: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const featuredProjects: ProjectPreview[] = [
  {
    title: "EasyXo E-Commerce Ecosystem",
    category: "Marketplace & D2C Store",
    badge: "Active Brand — Founder",
    description: "Built the end-to-end marketplace presence, product cataloging, listing creatives, and brand assets for EasyXo.",
    deliverables: ["Amazon & Flipkart Setup", "7-Image Listing Sets", "Razorpay Storefront Flow", "Inventory Systems"],
    icon: ShoppingBag,
  },
  {
    title: "High-Contrast 7-Image Listing Deck",
    category: "Product Creatives & Infographics",
    badge: "Concept Project",
    description: "Engineered visual communication hierarchy to answer customer friction points, size requirements, and material highlights.",
    deliverables: ["Main White Hero Shot", "Dimension Callouts", "Material Exploded View", "Lifestyle Context"],
    icon: Sparkles,
  },
  {
    title: "D2C Brand Storefront Architecture",
    category: "Web & Storefront Development",
    badge: "Self-Initiated Project",
    description: "Mobile-first digital storefront developed on Shopify and headless architectures with seamless automated checkout.",
    deliverables: ["Speed Optimized Layout", "Cart & Upsell Flow", "UPI / Razorpay Integration", "Category Filtering"],
    icon: Globe,
  },
  {
    title: "UGC-Style Hook Video Campaign",
    category: "Video & Paid Meta Ads",
    badge: "Concept Project",
    description: "Short-form vertical demonstration reels testing multiple 3-second hook variations designed for paid Meta and Instagram feeds.",
    deliverables: ["3 Hook Variations", "Problem-Solution Script", "Kinetic Subtitles", "9:16 Vertical Export"],
    icon: Video,
  },
];

export function SelectedWork() {
  return (
    <section className="py-14 sm:py-20 relative overflow-hidden">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeading
            badgeText="Portfolio Highlights"
            title="Selected Work &amp; Case Studies"
            description="Real execution across marketplace listings, creative decks, and storefront development."
            className="mb-0"
          />

          <Link
            href="/work"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#935073] hover:text-[#180D1D] transition-colors self-start sm:self-auto shrink-0 pb-1"
          >
            <span>View All Work</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Selected Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {featuredProjects.map((project) => {
            const Icon = project.icon;
            return (
              <div
                key={project.title}
                className="rounded-2xl p-5 sm:p-7 bg-white/75 border border-[#502D55]/08 hover:border-[#935073]/30 hover:bg-white/95 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#FAF0F4] border border-[#d69fb5]/40 text-[#78284C] font-semibold">
                      {project.badge}
                    </span>
                  </div>

                  <div className="text-xs font-mono uppercase tracking-wider text-[#7A6880] mb-1">
                    {project.category}
                  </div>

                  <h3 className="text-xl font-bold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                    {project.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#56475C] leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {project.deliverables.map((d, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-white/90 border border-[#502D55]/08 text-[#56475C] font-medium"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#502D55]/08 flex items-center justify-between text-xs text-[#7A6880]">
                  <span>Detailed case study available</span>
                  <Link
                    href="/work"
                    className="text-[#935073] hover:underline font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    View Project <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/work"
            className="inline-flex items-center justify-center w-full min-h-[44px] gap-2 px-6 py-3 rounded-full bg-white border border-[#502D55]/15 text-xs font-semibold text-[#180D1D] shadow-xs"
          >
            <span>View All Work</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
