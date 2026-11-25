"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChatWindow } from "./ChatWindow";
import { Message } from "./ChatMessage";
import { Sparkles } from "lucide-react";
import { RazorpayCheckoutModal } from "@/components/payments/RazorpayCheckoutModal";
import { ExtractedVideoOrderState } from "@/lib/video-order-extractor";

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
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [orderState, setOrderState] = useState<ExtractedVideoOrderState | null>(null);
  const messagesRef = useRef<Message[]>(initialMessages);
  const orderStateRef = useRef<ExtractedVideoOrderState | null>(null);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    orderStateRef.current = orderState;
  }, [orderState]);

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
          orderState: orderStateRef.current,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat response failed");
      }

      const data = await response.json();
      if (data.videoOrderState) {
        setOrderState(data.videoOrderState);
        orderStateRef.current = data.videoOrderState;
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I'm here to help. Could you tell me more about your requirements?",
        timestamp: "Just now",
        projectSummary: data.projectSummary || null,
        videoOrderSummary: data.videoOrderSummary || null,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content:
          "Looks like the assistant is temporarily unavailable. You can still contact Imdad directly via WhatsApp (+91 7352608269), Instagram (@imdad.builds), email (imdad.builds@gmail.com), or the inquiry form below.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{
        prompt?: string;
        serviceId?: string;
        serviceName?: string;
        packagePrice?: number;
        duration?: string;
        aspectRatio?: string;
      }>;
      setIsOpen(true);
      setHasUnread(false);
      if (customEvent.detail?.serviceId) {
        const initialOrder: ExtractedVideoOrderState = {
          serviceId: customEvent.detail.serviceId,
          serviceName: customEvent.detail.serviceName,
          packagePrice: customEvent.detail.packagePrice,
          approxDuration: customEvent.detail.duration,
          aspectRatio:
            customEvent.detail.aspectRatio ||
            (customEvent.detail.serviceId === "youtube-longform" ? "16:9" : "9:16"),
        };
        setOrderState(initialOrder);
        orderStateRef.current = initialOrder;
      }
      if (customEvent.detail?.prompt) {
        handleSendMessage(customEvent.detail.prompt);
      }
    };

    window.addEventListener("imdad:open-chat", handleOpenChat);
    window.addEventListener("open-chat", handleOpenChat);
    return () => {
      window.removeEventListener("imdad:open-chat", handleOpenChat);
      window.removeEventListener("open-chat", handleOpenChat);
    };
  }, []);

  const handleClearChat = () => {
    setMessages(initialMessages);
    setOrderState(null);
    orderStateRef.current = null;
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

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] right-3.5 md:bottom-6 md:right-6 z-[100]">
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
            {/* Tooltip on Desktop (Frosted M3 Pill) */}
            <div className="hidden sm:flex items-center gap-2 mr-3 px-4 py-2 rounded-full m3-surface-2 text-xs font-semibold text-[#332924] pointer-events-none group-hover:scale-105 group-hover:-translate-x-0.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C96A50] opacity-65" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C96A50]" />
              </span>
              <span>Ask about a project</span>
            </div>

            {/* Expressive Floating Action Button */}
            <button
              type="button"
              onClick={handleOpen}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-[22px] sm:hover:rounded-full active:scale-95 bg-gradient-to-b from-[#D5775C] to-[#BE5D43] hover:from-[#C96A50] hover:to-[#AF5138] border border-white/75 text-white flex items-center justify-center shadow-[0_10px_24px_-4px_rgba(201,106,80,0.48),0_4px_10px_-2px_rgba(51,41,36,0.16)] transition-all duration-300 cursor-pointer focus-ring"
              aria-label="Open AI Project Assistant"
            >
              <div className="relative">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>

              {/* Unread Pill indicator */}
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#FAECE4] border-2 border-[#C96A50] shadow-xs" />
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Sheet / Desktop Floating Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed inset-x-0 bottom-0 top-12 sm:inset-auto sm:right-6 sm:bottom-6 sm:w-[410px] sm:h-[620px] z-[100] flex flex-col"
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

      {/* Global Razorpay Payment Modal */}
      <RazorpayCheckoutModal />
    </div>
  );
}
