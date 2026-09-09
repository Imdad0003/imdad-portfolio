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
        <div className="rounded-3xl bg-gradient-to-r from-white/90 via-[#FDF9F5]/90 to-[#FAF0F4]/85 border border-[#502D55]/10 p-5 sm:p-10 backdrop-blur-2xl shadow-[0_15px_35px_-5px_rgba(80,45,85,0.06)] flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[11px] font-semibold text-[#7A3F26]">
              <Sparkles className="w-3.5 h-3.5 text-[#d97746]" />
              <span>Instant Scope Guidance</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#180D1D] tracking-tight">
              Not sure what you need?
            </h3>
            <p className="text-xs sm:text-sm text-[#56475C] max-w-xl leading-relaxed">
              Talk to the AI assistant and get a quick project estimate based on your exact product volume, platforms, and goals.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenChat}
            className="w-full sm:w-auto min-h-[48px] justify-center px-7 py-3.5 rounded-full font-bold text-xs sm:text-sm bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-[0_4px_20px_-2px_rgba(24,13,29,0.25)] hover:shadow-[0_8px_30px_-4px_rgba(80,45,85,0.35)] transition-all flex items-center gap-2 cursor-pointer shrink-0 focus-ring active:scale-95"
          >
            <MessageSquare className="w-4 h-4 text-[#F6DBC0]" />
            <span>Chat With Imdad AI</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Container>
    </section>
  );
}
