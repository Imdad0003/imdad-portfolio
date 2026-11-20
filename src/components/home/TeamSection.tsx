"use client";

import React from "react";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { studioTeam, TeamMember } from "@/data/team";
import { Film, Sparkles, CheckCircle2 } from "lucide-react";

export function TeamSection() {
  return (
    <section id="team" className="py-16 sm:py-24 relative overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="max-w-2xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[10px] sm:text-[11px] font-mono text-[#0284C7] mb-3.5 shadow-2xs font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] animate-pulse" />
            STUDIO TEAM // CORE CREATIVE LEADERSHIP
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#0A192F] leading-tight">
            The Builders &amp; Creators Behind The Work.
          </h2>
          <p className="mt-3.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed font-normal">
            Direct collaboration with dedicated craftspeople. You work directly with the builder and editors who shape your digital experience.
          </p>
        </div>

        {/* 3 Team Member Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {studioTeam.map((member) => (
            <div
              key={member.id}
              className="group relative rounded-3xl bg-white/85 hover:bg-white border border-slate-200/90 hover:border-sky-300/80 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_45px_-10px_rgba(2,132,199,0.12)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Avatar / Monogram Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/80 p-1 flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform duration-300">
                    {member.avatarUrl ? (
                      <div className="w-full h-full rounded-xl overflow-hidden bg-white flex items-center justify-center p-1">
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white flex items-center justify-center font-black text-xl font-mono shadow-xs">
                        {member.initials}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xl font-black text-[#0A192F] tracking-tight group-hover:text-[#0284C7] transition-colors">
                        {member.name}
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active on Studio Projects" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0284C7] block mt-0.5">
                      {member.role}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {member.title}
                    </span>
                  </div>
                </div>

                {/* Badge Tag */}
                <div className="mb-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-[#0284C7] border border-sky-200/80">
                    <Sparkles className="w-3 h-3 text-[#0284C7]" />
                    {member.badge}
                  </span>
                </div>

                {/* Bio */}
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>

              {/* Specialties */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                  CORE SPECIALTIES
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {member.specialties.map((item) => (
                    <span
                      key={item}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-slate-700"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
