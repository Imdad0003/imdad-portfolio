"use client";

import React, { useState } from "react";
import { GeneratedResume } from "@/types/resume";
import { ClassicProfessional } from "./templates/ClassicProfessional";
import { ModernMinimal } from "./templates/ModernMinimal";
import { StudentFresher } from "./templates/StudentFresher";
import { ResumeQualityAudit } from "./ResumeQualityAudit";
import { auditResumeQuality } from "@/lib/resume-quality";
import {
  Download,
  Copy,
  RotateCw,
  Edit3,
  Check,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  FileText,
  FileCode,
  ShieldCheck,
  Eye,
} from "lucide-react";
import "./print/resume-print.css";

interface ResumeLiveEditorProps {
  initialResume: GeneratedResume;
  targetJobDescription?: string;
  onBackToForm: () => void;
}

export function ResumeLiveEditor({
  initialResume,
  targetJobDescription,
  onBackToForm,
}: ResumeLiveEditorProps) {
  const [resume, setResume] = useState<GeneratedResume>(initialResume);
  const [activeTemplate, setActiveTemplate] = useState<"classic-professional" | "modern-minimal" | "student-fresher">(
    initialResume.metadata.templateId || "classic-professional"
  );
  const [showQualityAudit, setShowQualityAudit] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  // Active section editing drawer/modal
  const [editingSection, setEditingSection] = useState<"header" | "summary" | "experience" | "skills" | null>(null);

  // Run transparent quality audit
  const auditResult = auditResumeQuality(resume, targetJobDescription);

  // Trigger high-fidelity vector PDF print
  const handlePrint = () => {
    window.print();
  };

  // Plain-text copy for text-only ATS forms
  const handleCopyPlainText = () => {
    const lines: string[] = [];
    lines.push(resume.header.fullName.toUpperCase());
    lines.push(resume.header.targetTitle);
    lines.push(`${resume.header.location} | ${resume.header.email} | ${resume.header.phone}`);
    if (resume.header.linkedin) lines.push(resume.header.linkedin);
    lines.push("\n--- PROFESSIONAL SUMMARY ---");
    lines.push(resume.professionalSummary);
    lines.push("\n--- SKILLS ---");
    lines.push(resume.skills.technical.join(", "));
    if (resume.experience.length > 0) {
      lines.push("\n--- WORK EXPERIENCE ---");
      resume.experience.forEach((e) => {
        lines.push(`${e.jobTitle} - ${e.company} (${e.dateRange})`);
        e.bulletPoints.forEach((b) => lines.push(`• ${b}`));
      });
    }
    lines.push("\n--- EDUCATION ---");
    resume.education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution} (${edu.dateRange})`);
    });
    if (resume.projects.length > 0) {
      lines.push("\n--- KEY PROJECTS ---");
      resume.projects.forEach((p) => {
        lines.push(`${p.title} (${p.technologies.join(", ")})`);
        p.bulletPoints.forEach((b) => lines.push(`• ${b}`));
      });
    }

    navigator.clipboard.writeText(lines.join("\n"));
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // Re-write summary with AI
  const handleRegenerateSummary = async () => {
    setIsRegeneratingSummary(true);
    try {
      const res = await fetch("/api/services/resume-builder/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: "summary",
          targetTitle: resume.header.targetTitle,
          targetJobDescription,
          existingContent: resume.professionalSummary,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.result && typeof data.result === "string") {
          setResume((prev) => ({
            ...prev,
            professionalSummary: data.result,
          }));
        }
      }
    } catch {
      // Ignore
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* Top Action & Tool Bar */}
      <div className="p-4 sm:p-5 bg-white rounded-3xl border border-slate-200 shadow-xs mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToForm}
            type="button"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            title="Edit Form Data"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-[#0A192F]">
                {resume.header.fullName}&apos;s Resume
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold">
                GENERATED READY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live preview &bull; ATS vector print layout &bull; Selectable text
            </p>
          </div>
        </div>

        {/* Template Switcher Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTemplate("classic-professional")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTemplate === "classic-professional"
                ? "bg-white text-[#0A192F] shadow-xs"
                : "text-slate-600 hover:text-[#0A192F]"
            }`}
          >
            Classic Professional
          </button>
          <button
            type="button"
            onClick={() => setActiveTemplate("modern-minimal")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTemplate === "modern-minimal"
                ? "bg-white text-[#0A192F] shadow-xs"
                : "text-slate-600 hover:text-[#0A192F]"
            }`}
          >
            Modern Minimal
          </button>
          <button
            type="button"
            onClick={() => setActiveTemplate("student-fresher")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTemplate === "student-fresher"
                ? "bg-white text-[#0A192F] shadow-xs"
                : "text-slate-600 hover:text-[#0A192F]"
            }`}
          >
            Student &amp; Fresher
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quality Audit Toggle */}
          <button
            type="button"
            onClick={() => setShowQualityAudit(!showQualityAudit)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Audit ({auditResult.passedCount}/{auditResult.totalChecks})</span>
          </button>

          {/* Copy Plain Text */}
          <button
            type="button"
            onClick={handleCopyPlainText}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            {copiedText ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {/* Download PDF Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download / Print PDF</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Column Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Quick Editors & Quality Checklist (5 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quality Audit Panel (Always Accessible or Expanded) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
                <span className="text-xs font-bold text-[#0A192F]">ATS Optimization Health</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#0284C7]">
                {auditResult.passedCount} / {auditResult.totalChecks}
              </span>
            </div>

            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${(auditResult.passedCount / auditResult.totalChecks) * 100}%` }}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Your resume follows a single-column ATS vector structure without tables or decorative graphics that cause parsing errors in automated HR systems.
            </p>

            <button
              onClick={() => setShowQualityAudit(true)}
              type="button"
              className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0A192F] hover:bg-slate-50 transition-all cursor-pointer"
            >
              View Detailed Quality Checklist &rarr;
            </button>
          </div>

          {/* Quick Edit Accordions */}
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-4 text-left">
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#0A192F] font-mono border-b border-slate-100 pb-2">
              In-Place Text Editor
            </h3>

            {/* Edit Summary */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Professional Summary</span>
                <button
                  type="button"
                  disabled={isRegeneratingSummary}
                  onClick={handleRegenerateSummary}
                  className="text-[11px] font-bold text-[#0284C7] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RotateCw className={`w-3 h-3 ${isRegeneratingSummary ? "animate-spin" : ""}`} />
                  <span>AI Rewrite</span>
                </button>
              </div>
              <textarea
                rows={4}
                value={resume.professionalSummary}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    professionalSummary: e.target.value,
                  })
                }
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F] leading-relaxed"
              />
            </div>

            {/* Edit Skills */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">Technical Skills (Comma separated)</span>
              <input
                type="text"
                value={resume.skills.technical.join(", ")}
                onChange={(e) =>
                  setResume({
                    ...resume,
                    skills: {
                      ...resume.skills,
                      technical: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                    },
                  })
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0A192F]"
              />
            </div>

            {/* Print Instructions Callout */}
            <div className="p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100 text-[11px] text-[#0284C7] space-y-1 font-mono">
              <div className="font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>PDF EXPORT TIP</span>
              </div>
              <p className="leading-normal">
                Click &quot;Download / Print PDF&quot; above. In your browser dialog, select &quot;Save as PDF&quot;. Set Margins to &quot;None / Default&quot; for a perfect pixel-crisp A4 vector document.
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Live Printable Document Stage (7 Cols) */}
        <div className="lg:col-span-8 flex flex-col items-center">
          
          <div className="w-full max-w-[800px] shadow-2xl rounded-2xl overflow-hidden border border-slate-300 transition-all bg-white">
            {/* Dedicated printable element with ID matching CSS */}
            <div id="printable-resume">
              {activeTemplate === "classic-professional" && (
                <ClassicProfessional resume={resume} />
              )}
              {activeTemplate === "modern-minimal" && (
                <ModernMinimal resume={resume} />
              )}
              {activeTemplate === "student-fresher" && (
                <StudentFresher resume={resume} />
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Quality Audit Full Modal Drawer */}
      {showQualityAudit && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <ResumeQualityAudit
              audit={auditResult}
              onClose={() => setShowQualityAudit(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
