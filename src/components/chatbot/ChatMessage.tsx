import React from "react";
import { Sparkles, User } from "lucide-react";

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
        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] font-bold"
            : "bg-[#502D55] text-[#F6DBC0] border border-[#F6DBC0]/20 shadow-[0_0_10px_rgba(246,219,192,0.2)]"
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[82%] sm:max-w-[85%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-r from-[rgba(147,80,115,0.7)] to-[rgba(116,59,89,0.85)] text-[#F8F4E9] border border-[#F6DBC0]/30 shadow-md rounded-tr-none font-medium"
            : "bg-[rgba(43,20,53,0.75)] text-[#d8cfc4] border border-[#F6DBC0]/15 backdrop-blur-md rounded-tl-none shadow-sm"
        }`}
      >
        <div className="whitespace-pre-line break-words space-y-1">
          {message.content}
        </div>
      </div>
    </div>
  );
}
