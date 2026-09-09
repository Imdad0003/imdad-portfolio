import React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  ShoppingBag,
  Sparkles,
  Globe,
  Video,
  TrendingUp,
  Cpu,
  ArrowRight,
} from "lucide-react";

interface ServicePreview {
  title: string;
  category: string;
  description: string;
  price: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const selectedServices: ServicePreview[] = [
  {
    title: "E-Commerce & Marketplaces",
    category: "Amazon • Flipkart • Meesho",
    description: "End-to-end listing creation, catalog optimization, SEO keyword indexing, and seller onboarding.",
    price: "Starting at ₹499 / product",
    icon: ShoppingBag,
    href: "/services#ecommerce",
  },
  {
    title: "Product Listing Creatives",
    category: "Infographics • Hero Shots",
    description: "7-image and 10-image high-contrast listing decks answering buyer questions to drive conversions.",
    price: "From ₹149 (7-Deck at ₹799)",
    icon: Sparkles,
    href: "/services#creatives",
  },
  {
    title: "Websites & Digital Stores",
    category: "Shopify • WordPress • Funnels",
    description: "Fast, conversion-focused online stores and business websites with seamless Razorpay integration.",
    price: "Starting at ₹4,999",
    icon: Globe,
    href: "/services#websites",
  },
  {
    title: "Video & UGC Ads",
    category: "Reels • TikTok • Meta Ads",
    description: "Short-form vertical video demonstration reels and authentic creator-style hooks tested for high CTR.",
    price: "Starting at ₹799",
    icon: Video,
    href: "/services#video",
  },
  {
    title: "Digital Marketing & Ads",
    category: "Meta Ads • Creative Split Testing",
    description: "Strategic campaign setup, conversion tracking, creative A/B testing, and ongoing ROAS scaling.",
    price: "Starting at ₹2,999",
    icon: TrendingUp,
    href: "/services#marketing",
  },
  {
    title: "AI Creative Workflows",
    category: "AI Staging • Video Synthesis",
    description: "AI-accelerated realistic product scene staging, studio lighting, and multilingual voice synthesis.",
    price: "Starting at ₹299",
    icon: Cpu,
    href: "/services#ai",
  },
];

export function SelectedServices() {
  return (
    <section className="py-14 sm:py-20 relative overflow-hidden">
      <Container>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <SectionHeading
            badgeText="Core Disciplines"
            title="What I Build For You"
            description="Focused digital capabilities designed to elevate how your products are perceived and sold online."
            className="mb-0"
          />

          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#935073] hover:text-[#180D1D] transition-colors self-start sm:self-auto shrink-0 pb-1"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 6 Clean White Liquid Glass Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedServices.map((service) => {
            const IconComponent = service.icon;
            return (
              <Link
                key={service.title}
                href={service.href}
                className="rounded-2xl p-5 sm:p-6 bg-white/75 border border-[#502D55]/08 hover:border-[#935073]/30 hover:bg-white/95 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between group shadow-sm hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] flex items-center justify-center text-[#7A3F26] group-hover:scale-105 transition-transform">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-[#7A6880] uppercase tracking-wider">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#180D1D] group-hover:text-[#935073] transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-xs sm:text-sm text-[#56475C] leading-relaxed">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#502D55]/08 flex items-center justify-between text-xs">
                  <span className="font-mono text-[#935073] font-bold">
                    {service.price}
                  </span>
                  <span className="text-[#7A6880] group-hover:text-[#180D1D] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-medium">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link
            href="/services"
            className="inline-flex items-center justify-center w-full min-h-[44px] gap-2 px-6 py-3 rounded-full bg-white border border-[#502D55]/15 text-xs font-semibold text-[#180D1D] shadow-xs"
          >
            <span>View All Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
