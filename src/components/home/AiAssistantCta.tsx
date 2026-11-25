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
            "Hi! I'm not sure which service or package I need. Can you help me pick the right one?",
        },
      })
    );
  };

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="rounded-3xl bg-white border border-[#E8DFD5] p-6 sm:p-10 shadow-[0_10px_28px_-8px_rgba(51,41,36,0.06)] flex flex-col md:flex-row items-center justify-between gap-6 max-w-5xl mx-auto">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAECE4] border border-[#F0CFC0] text-xs font-semibold text-[#B4583F]">
              <Sparkles className="w-3.5 h-3.5 text-[#C96A50]" />
              <span>Quick Project Guide</span>
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold text-[#332924]">
              Not sure what you need?
            </h3>
            <p className="text-xs sm:text-sm text-[#5F534D] max-w-xl leading-relaxed">
              Ask our helper assistant to suggest the best package based on your goals and budget.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenChat}
            className="w-full sm:w-auto min-h-[48px] justify-center px-7 py-3.5 rounded-full font-semibold text-xs sm:text-sm bg-[#C96A50] hover:bg-[#B4583F] text-white shadow-sm transition-colors flex items-center gap-2 cursor-pointer shrink-0 focus-ring"
          >
            <MessageSquare className="w-4 h-4 text-white" />
            <span>Ask Project Helper</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </Container>
    </section>
  );
}
