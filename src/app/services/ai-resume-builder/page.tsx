"use client";

import React, { useState } from "react";
import { ResumeLandingHero } from "@/components/resume-builder/ResumeLandingHero";
import { ResumeFormWizard } from "@/components/resume-builder/ResumeFormWizard";
import { ResumeLiveEditor } from "@/components/resume-builder/ResumeLiveEditor";
import { ResumeInputPayload, GeneratedResume } from "@/types/resume";
import { Container } from "@/components/ui/Container";

export default function ResumeBuilderPage() {
  const [viewMode, setViewMode] = useState<"landing" | "form" | "editor">("landing");
  const [generatedResume, setGeneratedResume] = useState<GeneratedResume | null>(null);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<ResumeInputPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStart = () => {
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

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {viewMode === "landing" && (
        <ResumeLandingHero onStart={handleStart} isFreeBeta={true} />
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
                FREE BETA
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
