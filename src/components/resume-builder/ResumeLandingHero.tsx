"use client";

import React from "react";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, FileText, Zap, Laptop } from "lucide-react";

interface ResumeLandingHeroProps {
  onStart: () => void;
  noticeBanner?: string;
  isFreeBeta?: boolean;
}

export function ResumeLandingHero({ onStart, noticeBanner, isFreeBeta = true }: ResumeLandingHeroProps) {
  return (
    <div className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 overflow-hidden">
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#180D1D_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] sm:text-[11px] font-mono text-emerald-800 font-bold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{isFreeBeta ? "FREE BETA LAUNCH" : "AI RESUME ENGINE"}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-[10px] sm:text-[11px] font-mono text-[#0284C7] font-bold shadow-2xs">
            <Zap className="w-3 h-3 text-[#0284C7]" />
            <span>POWERED BY GEMINI 4 HYDROGEN</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] sm:text-[11px] font-mono text-slate-700 font-bold shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-slate-600" />
            <span>100% ATS PARSER COMPLIANT</span>
          </div>
        </div>

        {/* Headline & Value Proposition */}
        <div className="max-w-3xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0A192F] leading-[1.08]">
            Build an ATS-optimized resume that gets{" "}
            <span className="text-[#0284C7]">interviews</span>.
          </h1>

          <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Transform raw education, projects, and career milestones into high-impact, keyword-aligned resumes. Powered by Google Gemini 4 Hydrogen reasoning with zero hallucinations and clean vector PDF export.
          </p>

          {noticeBanner && (
            <div className="mt-4 p-3 rounded-xl bg-sky-50 border border-sky-200 text-xs text-[#0284C7] flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{noticeBanner}</span>
            </div>
          )}

          {/* CTA & Trust Strip */}
          <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <button
              onClick={onStart}
              type="button"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold text-sm shadow-md transition-all cursor-pointer group hover:scale-[1.01]"
            >
              <span>Create My Resume Now</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-xs font-mono text-slate-500 flex items-center justify-center sm:justify-start gap-2 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>No signup required &bull; 100% Free in Beta &bull; Instant PDF</span>
            </div>
          </div>
        </div>

        {/* Feature Grid Strip */}
        <div className="mt-12 pt-8 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0284C7] mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F] mb-1">True ATS Single-Column Layouts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Eliminates tables, multi-column sidebars, and graphics that choke automated Applicant Tracking Systems like Workday and Greenhouse.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F] mb-1">Anti-Hallucination Guarantee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI refines your actual responsibilities into power bullet points. It never invents fake employers, degrees, metrics, or technologies.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3">
              <Laptop className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-[#0A192F] mb-1">Students &amp; Freshers Friendly</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Work experience is completely optional. Students and career changers can highlight projects, coursework, and technical skills with equal strength.
            </p>
          </div>
        </div>

        {/* 3 Template Previews */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-mono text-[#0284C7] font-bold uppercase tracking-wider block">
                PRE-CONFIGURED ATS TEMPLATES
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#0A192F]">
                3 Clean, Recruiter-Approved Styles
              </h2>
            </div>
            <button
              onClick={onStart}
              type="button"
              className="text-xs font-bold text-[#0284C7] hover:underline hidden sm:inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Choose a template &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284C7] transition-all group">
              <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 p-3 overflow-hidden text-[7px] font-serif text-slate-400 select-none">
                <div className="text-center font-bold text-slate-800 text-[9px] border-b border-slate-300 pb-1 mb-1.5 uppercase">
                  ALEX MORGAN &bull; LEAD ENGINEER
                </div>
                <div className="font-bold text-slate-700 uppercase mb-0.5">Professional Summary</div>
                <div className="space-y-0.5 line-clamp-3">
                  Experienced engineer specializing in high-throughput cloud infrastructure and distributed systems.
                </div>
                <div className="font-bold text-slate-700 uppercase mt-1 mb-0.5">Experience</div>
                <div className="font-bold text-slate-800">Senior Architect &mdash; Acme Corp</div>
              </div>
              <h4 className="font-bold text-xs text-[#0A192F] mt-3">1. Classic Professional</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Formal serif headers, clean horizontal dividers. Best for enterprise, finance, and corporate roles.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284C7] transition-all group">
              <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 p-3 overflow-hidden text-[7px] font-sans text-slate-400 select-none">
                <div className="font-black text-slate-900 text-[10px] tracking-tight">ALEX MORGAN</div>
                <div className="font-mono text-[#0284C7] text-[7.5px] uppercase mb-1">// FULL STACK DEVELOPER</div>
                <div className="font-mono uppercase text-slate-400 text-[6.5px] mt-1">// CORE STACK</div>
                <div className="text-slate-600">TypeScript, Next.js, PostgreSQL, Docker, AWS</div>
                <div className="font-mono uppercase text-slate-400 text-[6.5px] mt-1.5">// WORK EXPERIENCE</div>
                <div className="font-bold text-slate-800">Software Engineer @ TechFlow</div>
              </div>
              <h4 className="font-bold text-xs text-[#0A192F] mt-3">2. Modern Minimal</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Sans-serif typography with monospace accents and refined spacing. Best for startups and tech roles.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#0284C7] transition-all group">
              <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 p-3 overflow-hidden text-[7px] font-sans text-slate-400 select-none">
                <div className="font-black text-slate-900 text-[10px] border-b border-sky-500 pb-0.5 mb-1">ALEX MORGAN</div>
                <div className="font-bold text-slate-700 uppercase mb-0.5">Education</div>
                <div className="font-bold text-slate-800">B.Tech in Computer Science &bull; 2022 - 2026</div>
                <div className="text-slate-600">GPA: 3.9/4.0 &bull; Focus: Algorithms &amp; Distributed Systems</div>
                <div className="font-bold text-slate-700 uppercase mt-1 mb-0.5">Key Projects</div>
                <div className="font-bold text-slate-800">OpenAudio Engine &bull; React Native</div>
              </div>
              <h4 className="font-bold text-xs text-[#0A192F] mt-3">3. Student &amp; Fresher</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Prioritizes academic credentials and technical projects. Perfect for fresh graduates and interns.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
