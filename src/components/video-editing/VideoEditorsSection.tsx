import React from "react";
import { EditorProfile } from "@/types/video-editing";
import { CheckCircle2, Award, Clock, Sparkles, Layers, ShieldCheck, Info } from "lucide-react";

interface VideoEditorsSectionProps {
  editors: EditorProfile[];
}

export function VideoEditorsSection({ editors }: VideoEditorsSectionProps) {
  return (
    <section id="editors" className="py-16 sm:py-24 bg-[#F8FAFC] border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[10px] sm:text-[11px] font-mono text-[#0284C7] font-bold mb-3 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>STUDIO TALENT ROSTER // EDITORS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#0A192F] tracking-tight">
              Meet Our Video Editors
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-xl">
              Specialized editors dedicated to hook psychology, kinetic motion, and broadcast-grade color grading.
            </p>
          </div>

          {/* Verification Badge Clarification Note */}
          <div className="p-3 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 max-w-sm flex items-start gap-2 shadow-2xs">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              <strong>Verification Transparency:</strong> The blue verified badge is demo placeholder data for preview purposes until formal studio talent verification is finalized.
            </span>
          </div>
        </div>

        {/* Editors Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {editors.map((editor) => (
            <div
              key={editor.id}
              className="rounded-3xl bg-white border border-slate-200 hover:border-[#0284C7]/40 shadow-xs hover:shadow-lg transition-all duration-300 p-6 flex flex-col justify-between"
            >
              <div>
                {/* Editor Header: Avatar + Name + Verified Badge */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                    <img
                      src={editor.avatar}
                      alt={editor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="text-base font-black text-[#0A192F] tracking-tight truncate">
                        {editor.name}
                      </h3>
                      {editor.verified && (
                        <div
                          className="inline-flex items-center shrink-0 cursor-help"
                          title="Verified Studio Editor (Demo Verification Status)"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#0284C7] fill-sky-100" />
                        </div>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-[#0284C7] truncate">
                      {editor.role}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {editor.experienceYears}
                      </span>
                      {editor.completedProjectsCount && (
                        <>
                          <span>•</span>
                          <span>{editor.completedProjectsCount}+ Projects</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verified Status & Demo Tag */}
                <div className="mb-4 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-[10px] font-mono font-bold text-[#0284C7]">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{editor.isDemo ? "DEMO PROFILE • CMS REPLACEABLE" : "VERIFIED STUDIO TALENT"}</span>
                  </span>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {editor.bio}
                </p>

                {/* Specialization Tags */}
                <div className="mb-4">
                  <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider block font-bold mb-1.5">
                    SPECIALIZATION:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {editor.specialization.map((spec, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-slate-700 text-[11px] font-medium"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Software Tooling Stack */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider font-bold">
                  TOOLKIT:
                </span>
                <div className="flex items-center gap-1.5">
                  {editor.software.map((sw, swIdx) => (
                    <span
                      key={swIdx}
                      className="px-2 py-0.5 rounded-md bg-sky-50/70 border border-sky-100 text-[#0284C7] text-[10px] font-mono font-bold"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
