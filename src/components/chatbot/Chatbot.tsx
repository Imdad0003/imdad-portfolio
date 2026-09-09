"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWindow } from "./ChatWindow";
import { Message } from "./ChatMessage";
import { Sparkles } from "lucide-react";

interface ProjectSummaryData {
  service: string;
  requirement: string;
  scope: string;
  pricingNote: string;
}

const initialMessages: Message[] = [
  {
    id: "welcome-1",
    role: "assistant",
    content: "Hi, I'm Imdad's project assistant.\n\nWhat are you looking to build?",
    timestamp: "Just now",
  },
];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesRef = useRef<Message[]>(initialMessages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: "Just now",
    };

    const newMessages = [...messagesRef.current, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat response failed");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I'm here to help. Could you tell me more about your requirements?",
        timestamp: "Just now",
        projectSummary: data.projectSummary || null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "Looks like the assistant is temporarily unavailable. You can still contact Imdad directly via WhatsApp, Instagram (@imdad.builds), email (imdad.builds@gmail.com), or the inquiry form below.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      setHasUnread(false);
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };

    window.addEventListener("imdad:open-chat", handleOpenChat);
    return () => window.removeEventListener("imdad:open-chat", handleOpenChat);
  }, []);

  const handleClearChat = () => {
    setMessages(initialMessages);
  };

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleSendInquiry = (summary: ProjectSummaryData) => {
    setIsOpen(false);
    // Dispatch custom event to prefill the contact section
    window.dispatchEvent(
      new CustomEvent("imdad:prefill-inquiry", {
        detail: {
          service: summary.service,
          details: `Project Summary from AI Assistant:\n• Requirement: ${summary.requirement}\n• Estimated Scope: ${summary.scope}\n• Pricing Context: ${summary.pricingNote}`,
        },
      })
    );

    const contactEl = document.getElementById("contact");
    if (contactEl) {
      contactEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[100]">
      {/* Floating Trigger Button with Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center justify-end group"
          >
            {/* Tooltip on Desktop */}
            <div className="hidden sm:flex items-center gap-2 mr-3 px-3.5 py-1.5 rounded-full bg-white/95 border border-[#502D55]/15 text-xs font-bold text-[#180D1D] backdrop-blur-xl shadow-md pointer-events-none group-hover:scale-105 transition-transform">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d97746] animate-pulse" />
              <span>Ask about a project</span>
            </div>

            {/* Circular Glass Button */}
            <button
              type="button"
              onClick={handleOpen}
              className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#2B1435] via-[#1E0D26] to-[#180D1D] border-2 border-[#F6DBC0]/50 text-[#F6DBC0] flex items-center justify-center shadow-[0_10px_30px_rgba(43,20,53,0.35),0_0_20px_rgba(246,219,192,0.3)] backdrop-blur-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer focus-ring"
              aria-label="Open AI Project Assistant"
            >
              <div className="relative">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#F6DBC0]" />
              </div>

              {/* Unread Pill indicator */}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#935073] border-2 border-white flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F6DBC0] animate-ping" />
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Chat Panel (Desktop & Mobile) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed inset-x-3 bottom-3 top-16 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[410px] sm:h-[620px] z-[100] flex flex-col"
          >
            <ChatWindow
              messages={messages}
              loading={loading}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onClose={() => setIsOpen(false)}
              onSendInquiry={handleSendInquiry}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
