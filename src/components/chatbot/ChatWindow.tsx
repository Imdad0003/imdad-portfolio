"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, Message } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { ChatInput } from "./ChatInput";
import { ProjectSummaryCard } from "./ProjectSummaryCard";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import {
  Sparkles,
  X,
  RotateCcw,
  MessageSquare,
  Send,
} from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

interface ProjectSummaryData {
  service: string;
  requirement: string;
  scope: string;
  pricingNote: string;
}

interface ChatWindowProps {
  messages: Message[];
  loading: boolean;
  onSendMessage: (text: string) => void;
  onClearChat: () => void;
  onClose: () => void;
  onSendInquiry: (summary: ProjectSummaryData) => void;
}

export function ChatWindow({
  messages,
  loading,
  onSendMessage,
  onClearChat,
  onClose,
  onSendInquiry,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const hasUserMessages = messages.some((m) => m.role === "user");

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[rgba(43,20,53,0.96)] via-[rgba(30,12,38,0.98)] to-[rgba(19,9,23,0.99)] border border-[#F6DBC0]/25 rounded-3xl shadow-[0_25px_60px_-10px_rgba(10,3,14,0.95)] backdrop-blur-3xl overflow-hidden">
      {/* Chat Window Header */}
      <div className="p-4 px-5 border-b border-[#F6DBC0]/15 bg-[rgba(56,24,66,0.6)] backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#935073] via-[#502D55] to-[#27132c] border border-[#F6DBC0]/35 flex items-center justify-center text-[#F6DBC0] shadow-[0_0_15px_rgba(246,219,192,0.3)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F8F4E9] tracking-tight">
                Imdad&apos;s Assistant
              </h3>
              <span className="w-2 h-2 rounded-full bg-[#F6DBC0] animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-[#F6DBC0]/80">
              AI Sales &amp; Project Scoping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {hasUserMessages && (
            <button
              type="button"
              onClick={onClearChat}
              className="p-1.5 rounded-lg text-[#bba89d] hover:text-[#F8F4E9] hover:bg-[rgba(80,45,85,0.4)] transition-colors focus-ring"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#bba89d] hover:text-[#F8F4E9] hover:bg-[rgba(80,45,85,0.4)] transition-colors focus-ring"
            aria-label="Close chat window"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <ChatMessage message={message} />
            {message.projectSummary && (
              <ProjectSummaryCard
                summary={message.projectSummary}
                onSendInquiry={onSendInquiry}
              />
            )}
          </React.Fragment>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[#bba89d] py-2 px-3 rounded-xl bg-[rgba(43,20,53,0.5)] border border-[#F6DBC0]/10 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
            <span className="ml-1 text-[11px] font-mono text-[#F6DBC0]">
              Analyzing project scope...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips (always available for easy topic jumping) */}
      <QuickActions onSelect={onSendMessage} disabled={loading} />

      {/* Direct Quick Contact Toolbar */}
      <div className="py-1.5 px-3 bg-[rgba(19,9,23,0.85)] border-t border-[#F6DBC0]/10 flex items-center justify-between text-[11px] text-[#bba89d]">
        <div className="flex items-center gap-3">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F6DBC0] transition-colors flex items-center gap-1 focus-ring rounded"
          >
            <MessageSquare className="w-3 h-3 text-[#F6DBC0]" />
            <span>WhatsApp</span>
          </a>
          <span>•</span>
          <a
            href={siteConfig.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#F6DBC0] transition-colors flex items-center gap-1 focus-ring rounded"
          >
            <Instagram className="w-3 h-3 text-[#d68fad]" />
            <span>Instagram</span>
          </a>
        </div>

        <a
          href="#contact"
          onClick={onClose}
          className="hover:text-[#F8F4E9] text-[10px] uppercase font-mono tracking-wider flex items-center gap-0.5 focus-ring rounded"
        >
          Form <Send className="w-2.5 h-2.5 ml-0.5" />
        </a>
      </div>

      {/* Chat Input Field */}
      <ChatInput onSend={onSendMessage} disabled={loading} />
    </div>
  );
}
