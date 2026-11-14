"use client";

import React from "react";
import { QualityAuditResult } from "@/lib/resume-quality";
import { CheckCircle2, AlertTriangle, Info, Sparkles, X } from "lucide-react";

interface QualityAuditProps {
  audit: QualityAuditResult;
  onClose?: () => void;
}

export function ResumeQualityAudit({ audit, onClose }: QualityAuditProps) {
  return (
    <div className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-left space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#0A192F]">ATS Quality Checklist</h3>
            <p className="text-[11px] text-slate-500">
              Transparent review of readability, action verbs, and ATS parsing readiness.
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Summary Score Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span className="font-bold text-[#0A192F]">Checks Passed: </span>
          <span className="font-mono text-[#0284C7] font-bold">
            {audit.passedCount} / {audit.totalChecks} Criteria
          </span>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
            audit.passedCount >= audit.totalChecks - 1
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {audit.passedCount >= audit.totalChecks - 1 ? "EXCELLENT READABILITY" : "SUGGESTIONS AVAILABLE"}
        </span>
      </div>

      {/* Checklist items */}
      <div className="space-y-2.5">
        {audit.checks.map((check) => (
          <div
            key={check.id}
            className="p-3 rounded-xl border border-slate-100 bg-white flex items-start gap-2.5 shadow-2xs"
          >
            {check.status === "pass" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : check.status === "warning" ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
            )}
            <div className="overflow-hidden">
              <h4 className="font-bold text-xs text-[#0A192F]">{check.title}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">{check.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Actionable Suggestions */}
      {audit.suggestions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
          <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-wider block">
            RECOMMENDED ACTIONS BEFORE APPLYING:
          </span>
          <ul className="list-disc list-outside ml-4 text-xs text-amber-900 space-y-1">
            {audit.suggestions.map((sugg, idx) => (
              <li key={idx}>{sugg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Matched Keywords (if Job Description was provided) */}
      {audit.matchedKeywords.length > 0 && (
        <div className="pt-2">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5">
            MATCHED JOB DESCRIPTION KEYWORDS ({audit.matchedKeywords.length}):
          </span>
          <div className="flex flex-wrap gap-1">
            {audit.matchedKeywords.slice(0, 15).map((kw, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-sky-50 text-[#0284C7] font-mono text-[10px] font-bold">
                ✓ {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
