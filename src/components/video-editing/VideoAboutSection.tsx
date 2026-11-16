import React from "react";
import { VideoEditingAboutContent } from "@/types/video-editing";
import { Zap, Volume2, Type, Palette, Clock, CheckCircle2, Award, Sparkles } from "lucide-react";

interface VideoAboutSectionProps {
  content: VideoEditingAboutContent;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap,
  Volume2,
  Type,
  Palette,
};

export function VideoAboutSection({ content }: VideoAboutSectionProps) {
  return (
    <section className="py-16 sm:py-24 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] sm:text-[11px] font-mono text-slate-700 font-bold mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{content.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A192F] tracking-tight">
            {content.title}
          </h2>
          <p className="mt-2 text-base sm:text-lg font-semibold text-[#0284C7]">
            {content.tagline}
          </p>

          <div className="mt-5 space-y-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            {content.descriptionParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
        </div>

        {/* 4 Core Studio Principles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {content.principles.map((p, idx) => {
            const Icon = iconMap[p.icon] || Zap;

            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-2xs hover:border-[#0284C7]/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center text-[#0284C7] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0A192F] mb-1.5">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Production Workflow Blueprint (4 Steps) */}
        <div className="p-6 sm:p-10 rounded-3xl bg-[#0A192F] text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <span className="font-mono text-[10px] text-sky-400 font-bold uppercase tracking-widest block mb-1">
                PRODUCTION BLUEPRINT
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                How Your Edits Are Produced
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Average 24–48h pipeline turnaround
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.workflowSteps.map((ws, sIdx) => (
              <div key={sIdx} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-sky-400 font-bold text-base">Step {ws.step}</span>
                  <span className="text-white/60 text-[10px] bg-white/10 px-2 py-0.5 rounded">
                    {ws.turnaround}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{ws.title}</h4>
                <p className="text-xs text-white/70 leading-relaxed">{ws.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
