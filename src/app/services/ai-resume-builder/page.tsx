"use client";

import React, { useState, useEffect } from "react";
import { ResumeLandingHero } from "@/components/resume-builder/ResumeLandingHero";
import { ResumeFormWizard } from "@/components/resume-builder/ResumeFormWizard";
import { ResumeLiveEditor } from "@/components/resume-builder/ResumeLiveEditor";
import { ResumeInputPayload, GeneratedResume } from "@/types/resume";
import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/cms";
import { AlertTriangle, Wrench } from "lucide-react";

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

  useEffect(() => {
    getSettings()
      .then((settings) => {
        const rb = (settings as any)?.resumeBuilder;
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
        <ResumeLandingHero
          onStart={handleStart}
          isFreeBeta={config.isFreeBeta}
          noticeBanner={config.noticeBanner}
        />
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
