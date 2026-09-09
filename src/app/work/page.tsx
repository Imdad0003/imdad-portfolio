"use client";

import React, { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ShoppingBag,
  Sparkles,
  Globe,
  Video,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

type WorkCategory =
  | "all"
  | "ecommerce"
  | "creatives"
  | "websites"
  | "ads"
  | "ai"
  | "branding";

interface WorkProject {
  id: string;
  title: string;
  category: WorkCategory;
  categoryLabel: string;
  badge: "Active Brand — Founder" | "Concept Project" | "Self-Initiated Project";
  description: string;
  servicesProvided: string[];
  icon: React.ComponentType<{ className?: string }>;
}

const workCategories: { id: WorkCategory; label: string }[] = [
  { id: "all", label: "All Projects" },
  { id: "ecommerce", label: "E-Commerce" },
  { id: "creatives", label: "Product Creatives" },
  { id: "websites", label: "Websites" },
  { id: "ads", label: "Ads" },
  { id: "ai", label: "AI Creatives" },
  { id: "branding", label: "Branding" },
];

const projects: WorkProject[] = [
  {
    id: "easyxo",
    title: "EasyXo Marketplace Ecosystem",
    category: "ecommerce",
    categoryLabel: "E-Commerce",
    badge: "Active Brand — Founder",
    description:
      "End-to-end launch of EasyXo covering brand identity, multi-platform Amazon & Flipkart cataloging, listing creatives, and storefront checkout.",
    servicesProvided: [
      "Marketplace Cataloging",
      "7-Image Infographic Decks",
      "Razorpay Payment Workflow",
      "Listing SEO Optimization",
    ],
    icon: ShoppingBag,
  },
  {
    id: "infographic-deck",
    title: "High-Contrast 7-Image Listing Deck",
    category: "creatives",
    categoryLabel: "Product Creatives",
    badge: "Concept Project",
    description:
      "Conversion-engineered image set for marketplace listings answering objections, highlighting product materials, and visually explaining dimensions.",
    servicesProvided: [
      "White Main Hero Image",
      "Dimension Exploded Diagram",
      "Material Callout Infographics",
      "Use-Case Context Staging",
    ],
    icon: Sparkles,
  },
  {
    id: "d2c-storefront",
    title: "D2C Brand Storefront Architecture",
    category: "websites",
    categoryLabel: "Websites",
    badge: "Self-Initiated Project",
    description:
      "Mobile-optimized direct-to-consumer store built for frictionless checkout, clear visual hierarchy, and fast page speed.",
    servicesProvided: [
      "Shopify & Custom Theme",
      "Razorpay / UPI Integration",
      "Cart Drawer & Cross-Sell",
      "Conversion Rate Optimization",
    ],
    icon: Globe,
  },
  {
    id: "ugc-campaign",
    title: "UGC Demonstration Hook Campaign",
    category: "ads",
    categoryLabel: "Ads & Video",
    badge: "Concept Project",
    description:
      "Series of 9:16 vertical video creatives with 3-second hook variations designed for paid Meta and Instagram feed performance.",
    servicesProvided: [
      "Hook Variation Scripting",
      "Creator Demonstration Edits",
      "High-Contrast Subtitles",
      "Ad Creative Split-Testing",
    ],
    icon: Video,
  },
  {
    id: "ai-staging",
    title: "AI Staged Photorealistic Product Scenes",
    category: "ai",
    categoryLabel: "AI Creatives",
    badge: "Concept Project",
    description:
      "Studio-quality product scene generation placing physical products into authentic lifestyle environments using modern generative pipelines.",
    servicesProvided: [
      "Realistic Surface Reflections",
      "Studio Lighting Match",
      "Multiple Scene Variations",
      "Commercial High-Res Output",
    ],
    icon: Cpu,
  },
  {
    id: "studio-branding",
    title: "Digital Studio Brand Identity System",
    category: "branding",
    categoryLabel: "Branding",
    badge: "Concept Project",
    description:
      "Cohesive brand visual kit establishing high-contrast typography, luxury color hierarchy, and social media template grids.",
    servicesProvided: [
      "Brand Color Architecture",
      "Typography & Scale Hierarchy",
      "Social Media Post Grids",
      "Packaging Mockup Rules",
    ],
    icon: Layers,
  },
];

export default function WorkPage() {
  const [activeCategory, setActiveCategory] = useState<WorkCategory>("all");

  const filteredProjects =
    activeCategory === "all"
      ? projects
      : projects.filter((p) => p.category === activeCategory);

  const handleInquireProject = (project: WorkProject) => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt: `Hi Imdad! I saw your ${project.title} (${project.badge}) in the portfolio. Can we discuss building a similar project for my brand?`,
        },
      })
    );
  };

  return (
    <div className="py-16 sm:py-24">
      <Container>
        {/* Page Header */}
        <SectionHeading
          badgeText="Work &amp; Case Studies"
          title="Actual Work. Transparent Execution."
          description="A curated look into marketplace setups, visual decks, digital stores, and creative testing."
          align="center"
        />

        {/* Category Filters */}
        <div className="mt-8 flex justify-start sm:justify-center overflow-x-auto pb-4 gap-2 no-scrollbar px-2 sm:px-0">
          <div className="inline-flex items-center p-1.5 rounded-full bg-white/80 border border-[#502D55]/10 backdrop-blur-xl shadow-xs min-w-max">
            {workCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 min-h-[36px] rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-[#180D1D] text-[#F8F4E9] font-bold shadow-xs"
                      : "text-[#56475C] hover:text-[#180D1D] hover:bg-white"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-12">
          {filteredProjects.map((project) => {
            const Icon = project.icon;
            return (
              <div
                key={project.id}
                className="rounded-3xl p-5 sm:p-8 bg-white/75 border border-[#502D55]/08 hover:border-[#935073]/30 hover:bg-white/95 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  {/* Top Bar: Icon, Category & Honest Badge */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26] group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#FAF0F4] border border-[#d69fb5]/40 text-[#78284C] font-semibold">
                      {project.badge}
                    </span>
                  </div>

                  <div className="text-xs font-mono uppercase tracking-wider text-[#7A6880] mb-1 font-semibold">
                    {project.categoryLabel}
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                    {project.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-[#56475C] leading-relaxed">
                    {project.description}
                  </p>

                  {/* Services Provided Badges */}
                  <div className="mt-6 space-y-2">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#7A6880] font-bold">
                      Services Provided:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.servicesProvided.map((service, i) => (
                        <span
                          key={i}
                          className="text-xs px-3 py-1 rounded-lg bg-white/90 border border-[#502D55]/08 text-[#56475C] font-medium"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action CTA */}
                <div className="mt-8 pt-4 border-t border-[#502D55]/08 flex items-center justify-between text-xs">
                  <span className="text-[#7A6880]">Discuss this setup</span>
                  <button
                    type="button"
                    onClick={() => handleInquireProject(project)}
                    className="inline-flex items-center min-h-[44px] gap-1.5 font-bold text-[#935073] hover:text-[#180D1D] transition-colors cursor-pointer"
                  >
                    <span>Inquire Similar Project</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ethical Transparency Statement */}
        <div className="mt-16 sm:mt-20 p-5 sm:p-8 rounded-2xl bg-white/80 border border-[#502D55]/10 backdrop-blur-xl text-center max-w-2xl mx-auto text-xs text-[#56475C] space-y-2 shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[#180D1D] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#935073]" />
            <span>Honest Portfolio Standard</span>
          </div>
          <p className="leading-relaxed">
            I do not manufacture fictional client logos, fabricate vanity metrics, or invent testimonials. All work is either actively operated (EasyXo) or clearly labeled as self-initiated and concept design.
          </p>
        </div>
      </Container>
    </div>
  );
}
