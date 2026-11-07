"use client";

import React from "react";
import { Container } from "@/components/ui/Container";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";

export function AiAssistantCta() {
  const handleOpenChat = () => {
    window.dispatchEvent(
      new CustomEvent("imdad:open-chat", {
        detail: {
          prompt:
            "Hi Imdad AI! I'm not sure which service or package I need for my business. Can you help me evaluate my project and give me a quick estimate?",
        },
      })
    );
  };

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden">
      <Container>
        <div className="rounded-3xl bg-gradient-to-r from-white via-sky-50/20 to-blue-50/20 border border-slate-200 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(10,25,47,0.06)] flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-semibold text-[#0284C7] font-mono uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Instant Scope Guidance</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              Not sure what you need?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
              Talk to the AI assistant and get a quick project estimate based on your exact product volume, platforms, and goals.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenChat}
            className="w-full sm:w-auto min-h-[48px] justify-center px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0 focus-ring active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Chat With Imdad AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Container>
    </section>
  );
}
