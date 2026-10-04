"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { studioServices, StudioService } from "@/data/servicesData";
import { getPublishedServices } from "@/lib/cms";
import {
  ArrowRight,
  Globe,
  Smartphone,
  ShoppingBag,
  Video,
  Share2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  Smartphone,
  ShoppingBag,
  Video,
  Share2,
};

export function StudioServicesSection() {
  const [services, setServices] = useState<StudioService[]>(studioServices);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(0);

  useEffect(() => {
    getPublishedServices()
      .then((docs) => {
        if (docs && docs.length > 0) {
          const merged = docs.map((doc, idx) => {
            const base =
              studioServices.find((s) => s.slug === doc.slug) ||
              studioServices[idx] ||
              studioServices[0];
            return {
              ...base,
              id: doc.id,
              title: doc.name || base.title,
              slug: doc.slug || base.slug,
              shortDescription: doc.shortDescription || base.shortDescription,
              fullDescription: doc.description || base.fullDescription,
              deliverables: doc.deliverables || base.deliverables,
              accentColor: doc.accentColor || base.accentColor,
              iconName: doc.iconName || base.iconName,
            };
          });
          if (merged.length > 0) {
            setServices(merged);
          }
        }
      })
      .catch((err) => {
        console.warn("StudioServicesSection Firestore sync fallback:", err);
      });
  }, []);

  return (
    <section id="services" className="py-16 sm:py-24 relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12 sm:mb-16">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#502D55]/12 text-[10px] font-mono text-[#56475C] mb-3 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#502D55] animate-pulse" />
              STUDIO CAPABILITIES // 5 DISCIPLINES
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#180D1D]">
              Studio Services
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#56475C] max-w-xl">
              High-precision engineering, e-commerce operations, and direct-response creative media tailored for ambitious brands.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#180D1D] hover:text-[#935073] transition-colors group shrink-0"
          >
            <span>EXPLORE ALL SERVICES &amp; PRICING</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Editorial Services Architectural Stack */}
        <div className="divide-y divide-[#502D55]/12 border-y border-[#502D55]/12">
          {services.map((service, index) => {
            const Icon = iconMap[service.iconName] || Globe;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={service.id}
                onMouseEnter={() => setHoveredIndex(index)}
                className={`py-8 sm:py-10 transition-all duration-300 relative group ${
                  isHovered ? "bg-white/80 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-2xl shadow-xs" : ""
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  
                  {/* Number & Service Name (5 Cols) */}
                  <div className="lg:col-span-5 flex items-start gap-4 sm:gap-6">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-[#502D55]/30 group-hover:text-[#935073] transition-colors shrink-0">
                      {service.number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                          style={{ backgroundColor: service.accentColor }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-[#180D1D] tracking-tight group-hover:text-[#935073] transition-colors">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-sm text-[#7A6880] font-mono">
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description & Capabilities Tags (5 Cols) */}
                  <div className="lg:col-span-5 space-y-3">
                    <p className="text-xs sm:text-sm text-[#56475C] leading-relaxed">
                      {service.shortDescription}
                    </p>

                    <div className="flex flex-wrap gap-1.5">
                      {service.capabilities.slice(0, 3).map((cap) => (
                        <span
                          key={cap}
                          className="px-2 py-0.5 rounded-md bg-[#FAF4F9] border border-[#502D55]/08 text-[10px] font-mono text-[#502D55]"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Link (2 Cols) */}
                  <div className="lg:col-span-2 flex items-center lg:justify-end">
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white group-hover:bg-[#180D1D] group-hover:text-white border border-[#502D55]/15 text-xs font-bold text-[#180D1D] transition-all shadow-2xs group/btn"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Transparent Rates Footer Note */}
        <div className="mt-8 text-right">
          <p className="text-xs font-mono text-[#7A6880]">
            TRANSPARENT SCOPE &bull; REAL MARKETPLACE &amp; D2C EXPERIENCE &bull; DIRECT FOUNDER EXECUTION
          </p>
        </div>
      </Container>
    </section>
  );
}
