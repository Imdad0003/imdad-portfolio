import React from "react";
import { Sparkles, User } from "lucide-react";
import { VideoOrderSummaryData } from "@/lib/video-order-extractor";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  projectSummary?: {
    service: string;
    requirement: string;
    scope: string;
    pricingNote: string;
  } | null;
  videoOrderSummary?: VideoOrderSummaryData | null;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-start gap-2.5 mb-3.5 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar Icon */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-2xs ${
          isUser
            ? "bg-[var(--accent-coral,#C96A50)] text-white font-bold"
            : "bg-[var(--surface-peach,#FAECE4)] text-[var(--accent-coral-hover,#B4583F)] border border-[#F0CFC0]"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[82%] sm:max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-[var(--accent-coral,#C96A50)] text-white shadow-sm rounded-tr-none font-medium"
            : "bg-[var(--surface-pure,#FFFFFF)] text-[var(--ink-primary,#332924)] border border-[var(--border-warm,#E8DFD5)] rounded-tl-none shadow-2xs"
        }`}
      >
        <div className="whitespace-pre-line break-words space-y-1">
          {message.content}
        </div>
      </div>
    </div>
  );
}
