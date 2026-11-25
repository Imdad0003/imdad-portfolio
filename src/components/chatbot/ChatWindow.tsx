"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, Message } from "./ChatMessage";
import { QuickActions } from "./QuickActions";
import { ChatInput } from "./ChatInput";
import { ProjectSummaryCard } from "./ProjectSummaryCard";
import { VideoOrderSummaryCard } from "./VideoOrderSummaryCard";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import {
  Sparkles,
  X,
  RotateCcw,
  MessageSquare,
  Send,
  ShoppingBag,
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
    <div className="flex flex-col h-full bg-[var(--background,#FAF7F2)] border border-[var(--border-warm,#E8DFD5)] rounded-t-[28px] sm:rounded-3xl shadow-[0_-12px_40px_-8px_rgba(51,41,36,0.22)] sm:shadow-[0_25px_60px_-10px_rgba(51,41,36,0.22)] overflow-hidden">
      {/* Mobile Drag Handle */}
      <div className="sm:hidden flex justify-center pt-2 pb-1 bg-[var(--surface-pure,#FFFFFF)]">
        <span className="w-10 h-1 rounded-full bg-[#D8CFC6]" />
      </div>

      {/* Chat Window Header */}
      <div className="px-4 py-3 sm:p-4 sm:px-5 border-b border-[var(--border-warm,#E8DFD5)] bg-[var(--surface-pure,#FFFFFF)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[var(--surface-peach,#FAECE4)] border border-[#F0CFC0] flex items-center justify-center text-[var(--accent-coral,#C96A50)]">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[var(--ink-primary,#332924)] tracking-tight font-display">
                Imdad&apos;s Assistant
              </h3>
              <span className="w-2 h-2 rounded-full bg-[var(--accent-coral,#C96A50)] animate-pulse" />
            </div>
            <p className="text-[10px] font-mono text-[var(--ink-muted,#8A7C75)]">
              AI Sales &amp; Project Scoping
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {hasUserMessages && (
            <button
              type="button"
              onClick={onClearChat}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--ink-muted,#8A7C75)] hover:text-[var(--ink-primary,#332924)] hover:bg-[var(--background,#FAF7F2)] transition-colors focus-ring cursor-pointer"
              title="Reset conversation"
              aria-label="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-[var(--ink-muted,#8A7C75)] hover:text-[var(--ink-primary,#332924)] hover:bg-[var(--background,#FAF7F2)] transition-colors focus-ring cursor-pointer"
            aria-label="Close chat window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2 scrollbar-thin overscroll-contain">
        {messages.map((message) => (
          <React.Fragment key={message.id}>
            <ChatMessage message={message} />
            {message.projectSummary && (
              <ProjectSummaryCard
                summary={message.projectSummary}
                onSendInquiry={onSendInquiry}
              />
            )}
            {message.videoOrderSummary && (
              <VideoOrderSummaryCard
                summary={message.videoOrderSummary}
              />
            )}
          </React.Fragment>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-[var(--ink-body,#5F534D)] py-2 px-3 rounded-xl bg-[var(--surface-pure,#FFFFFF)] border border-[var(--border-warm,#E8DFD5)] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-coral,#C96A50)] animate-bounce" />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent-coral,#C96A50)] animate-bounce"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-1.5 h-1.5 rounded-full bg-[var(--accent-coral,#C96A50)] animate-bounce"
              style={{ animationDelay: "0.3s" }}
            />
            <span className="ml-1 text-[11px] font-mono text-[var(--ink-primary,#332924)]">
              Analyzing project scope...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Chips (always available for easy topic jumping) */}
      <QuickActions onSelect={onSendMessage} disabled={loading} />

      {/* Direct Quick Contact Toolbar */}
      <div className="py-2 px-3 bg-[var(--surface-pure,#FFFFFF)] border-t border-[var(--border-warm,#E8DFD5)] flex items-center justify-between text-[11px] text-[var(--ink-body,#5F534D)]">
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-coral,#C96A50)] transition-colors flex items-center gap-1 focus-ring rounded shrink-0 font-semibold"
          >
            <MessageSquare className="w-3 h-3 text-[var(--accent-coral,#C96A50)]" />
            <span>WhatsApp</span>
          </a>
          <span className="text-[var(--border-warm,#E8DFD5)]">•</span>
          <a
            href={siteConfig.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-coral,#C96A50)] transition-colors flex items-center gap-1 focus-ring rounded shrink-0 font-semibold"
          >
            <Instagram className="w-3 h-3 text-[var(--accent-coral,#C96A50)]" />
            <span>Instagram</span>
          </a>
          <span className="text-[var(--border-warm,#E8DFD5)]">•</span>
          <a
            href={siteConfig.easyxo?.website || "https://easyxo.in"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--accent-coral,#C96A50)] transition-colors flex items-center gap-1 focus-ring rounded shrink-0 font-semibold"
          >
            <ShoppingBag className="w-3 h-3 text-[var(--accent-coral,#C96A50)]" />
            <span>EasyXo ↗</span>
          </a>
        </div>

        <a
          href="/contact"
          onClick={onClose}
          className="hover:text-[var(--accent-coral,#C96A50)] text-[10px] uppercase font-mono tracking-wider flex items-center gap-0.5 focus-ring rounded shrink-0 ml-2 font-bold text-[var(--ink-primary,#332924)]"
        >
          Form <Send className="w-2.5 h-2.5 ml-0.5" />
        </a>
      </div>

      {/* Chat Input Field */}
      <ChatInput onSend={onSendMessage} disabled={loading} />
    </div>
  );
}
