"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { ArrowRight } from "lucide-react";
import type { SiteContentDocument } from "@/types/cms";
import { getSiteContent } from "@/lib/cms";

interface StudioAboutSectionProps {
  initialContent?: SiteContentDocument["about"];
}

export function StudioAboutSection({ initialContent }: StudioAboutSectionProps) {
  const [aboutContent, setAboutContent] = useState<SiteContentDocument["about"]>(
    initialContent || {
      eyebrow: "About Studio",
      headline: "An independent studio focused on useful, honest digital work.",
      bio: "Imdad.builds helps businesses, online sellers, and creators with simple video editing, product graphics, and clean websites — with transparent pricing and direct support.",
      ethos: "Simple design. Honest pricing. Reliable execution.",
      location: "India",
    }
  );

  useEffect(() => {
    getSiteContent()
      .then((content) => {
        if (content && content.about) {
          setAboutContent(content.about);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section id="studio-about" className="py-16 sm:py-20 bg-white border-b border-[#E8DFD5]">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FAECE4] border border-[#F0CFC0] text-xs font-semibold text-[#B4583F]">
              {aboutContent.eyebrow}
            </span>

            <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight text-[#332924] leading-snug">
              {aboutContent.headline}
            </h2>

            <p className="text-sm sm:text-base text-[#5F534D] leading-relaxed">
              {aboutContent.bio}
            </p>

            <p className="text-sm sm:text-base text-[#5F534D] leading-relaxed">
              {aboutContent.ethos}
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C96A50] hover:text-[#B4583F] transition-colors group"
              >
                <span>Read more about us</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            {(
              aboutContent.pillars || [
                {
                  number: "01",
                  title: "Real Experience",
                  description: "We build and manage live online stores and apps ourselves.",
                },
                {
                  number: "02",
                  title: "Direct Collaboration",
                  description: "No middlemen — talk straight with the people creating your project.",
                },
                {
                  number: "03",
                  title: "Clear Outcomes",
                  description: "Clean layouts built for real customers on mobile and desktop.",
                },
              ]
            ).map((pillar, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8DFD5]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FAECE4] text-[#B4583F] border border-[#F0CFC0] flex items-center justify-center font-bold text-xs">
                    {pillar.number || `0${idx + 1}`}
                  </div>
                  <h4 className="font-display font-bold text-base text-[#332924]">
                    {pillar.title}
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-[#5F534D] leading-relaxed pl-11">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
