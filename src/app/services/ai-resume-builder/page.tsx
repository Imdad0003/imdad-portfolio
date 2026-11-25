"use client";

import React, { useState, useEffect } from "react";
import { ResumeLandingHero } from "@/components/resume-builder/ResumeLandingHero";
import { ResumeFormWizard } from "@/components/resume-builder/ResumeFormWizard";
import { ResumeLiveEditor } from "@/components/resume-builder/ResumeLiveEditor";
import { ResumeInputPayload, GeneratedResume } from "@/types/resume";
import { Container } from "@/components/ui/Container";
import { getSettings, getPublishedServiceBySlug } from "@/lib/cms";
import type { ServiceDocument } from "@/types/cms";
import { ServiceDemoGallery } from "@/components/services/ServiceDemoGallery";
import { ServiceTeamSection } from "@/components/services/ServiceTeamSection";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Check, Wrench } from "lucide-react";

export default function ResumeBuilderPage() {
  const [viewMode, setViewMode] = useState<"landing" | "form" | "editor">("landing");
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<ResumeInputPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic admin configuration state
  const [config, setConfig] = useState<{
    enabled: boolean;
    maintenanceMode: boolean;
    isFreeBeta: boolean;
    noticeBanner?: string;
  }>({
    enabled: true,
    maintenanceMode: false,
    isFreeBeta: true,
    noticeBanner: undefined,
  });
  const [serviceInfo, setServiceInfo] = useState<ServiceDocument | null>(null);

  useEffect(() => {
    getSettings()
      .then((settings) => {
        const rb = settings?.resumeBuilder;
        if (rb) {
          setConfig({
            enabled: rb.enabled !== false,
            maintenanceMode: rb.maintenanceMode === true,
            isFreeBeta: rb.isFreeBeta ?? true,
            noticeBanner: rb.noticeBanner,
          });
        }
      })
      .catch(() => {});

    getPublishedServiceBySlug("ai-resume-builder")
      .then((svc) => {
        if (svc) setServiceInfo(svc);
      })
      .catch(() => {});
  }, []);

  const handleStart = () => {
    if (!config.enabled || config.maintenanceMode) return;
    setViewMode("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFormSubmit = async (payload: ResumeInputPayload) => {
    setLastSubmittedPayload(payload);
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/services/resume-builder/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(
          data.error || "Failed to generate resume. Please verify your inputs and try again."
        );
        setIsGenerating(false);
        return;
      }

      setGeneratedResume(data.resume);
      setViewMode("editor");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error";
      setErrorMessage(`Failed to reach the AI generation service: ${msg}. Please retry.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isUnavailable = !config.enabled || config.maintenanceMode;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Maintenance or Disabled Notice */}
      {isUnavailable && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-center">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-xs font-semibold text-amber-900">
            <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {config.noticeBanner || "AI Resume Builder is currently undergoing scheduled maintenance. Please check back shortly."}
            </span>
          </div>
        </div>
      )}

      {viewMode === "landing" && (
        <>
          <ResumeLandingHero
            onStart={handleStart}
            isFreeBeta={config.isFreeBeta}
            noticeBanner={config.noticeBanner}
          />

          {serviceInfo && (
            <div className="py-12 sm:py-16 bg-[#FAF7F2] border-t border-[#E8DFD5]">
              <Container>
                {serviceInfo.demos && serviceInfo.demos.length > 0 && (
                  <ServiceDemoGallery
                    demos={serviceInfo.demos}
                    serviceTitle={serviceInfo.name}
                  />
                )}

                {serviceInfo.pricing && serviceInfo.pricing.length > 0 && (
                  <section className="mb-14">
                    <div className="mb-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FAECE4] border border-[#F0CFC0] text-[11px] font-semibold text-[#B4583F] uppercase tracking-wider mb-2">
                        Plans &amp; Pricing
                      </span>
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#332924]">
                        {serviceInfo.name} Pricing
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {serviceInfo.pricing.map((tier, idx) => (
                        <div
                          key={idx}
                          className="p-6 rounded-[28px] m3-surface-1 m3-card-interactive flex flex-col justify-between"
                        >
                          <div>
                            <h3 className="font-display font-bold text-xl text-[#332924]">
                              {tier.tierName}
                            </h3>
                            <p className="text-xs text-[#5F534D] mt-1 mb-4">
                              {tier.description}
                            </p>
                            <div className="flex items-baseline gap-1.5 pb-4 mb-4 border-b border-[#EFE6DD]">
                              <span className="font-display text-2xl font-bold text-[#332924]">
                                {tier.price}
                              </span>
                              <span className="text-xs text-[#8A7C75]">{tier.turnaround}</span>
                            </div>
                            <ul className="space-y-2 mb-6">
                              {(tier.deliverables || []).map((item, dIdx) => (
                                <li key={dIdx} className="flex items-center gap-2 text-xs text-[#5F534D]">
                                  <Check className="w-3.5 h-3.5 text-[#C96A50] shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <Button
                            type="button"
                            onClick={handleStart}
                            variant="primary"
                            size="sm"
                            className="w-full justify-center"
                          >
                            <span>Launch Builder</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {serviceInfo.teamMembers && serviceInfo.teamMembers.length > 0 && (
                  <ServiceTeamSection
                    members={serviceInfo.teamMembers}
                    serviceTitle={serviceInfo.name}
                  />
                )}
              </Container>
            </div>
          )}
        </>
      )}

      {viewMode === "form" && (
        <div className="py-8 sm:py-12">
          <Container>
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode("landing")}
                className="text-xs font-bold text-slate-500 hover:text-[#0A192F] transition-colors cursor-pointer"
              >
                &larr; Back to Overview
              </button>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                {config.isFreeBeta ? "FREE BETA" : "PRO"}
              </span>
            </div>

            <ResumeFormWizard
              initialData={lastSubmittedPayload || undefined}
              onSubmit={handleFormSubmit}
              isGenerating={isGenerating}
              errorMessage={errorMessage}
            />
          </Container>
        </div>
      )}

      {viewMode === "editor" && generatedResume && (
        <ResumeLiveEditor
          initialResume={generatedResume}
          targetJobDescription={lastSubmittedPayload?.career.targetJobDescription}
          onBackToForm={() => setViewMode("form")}
        />
      )}
    </div>
  );
}
