"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface FAQItem {
  id: string;
  question: string;
  category: string;
  answer: string | React.ReactNode;
}

const faqs: FAQItem[] = [
  {
    id: "services",
    category: "Services & Scope",
    question: "What services do you offer?",
    answer:
      "I specialize in end-to-end digital solutions across 8 core disciplines: E-Commerce & Marketplace Optimization (Amazon, Flipkart, Shopify), Brand Identity & Graphic Design, Custom Modern Web Development (Next.js, React, Tailwind, full-stack systems), AI Automations & LLM Workflows, Creative Media & Video Editing, Performance Marketing & SEO, Digital Consulting, and All-in-One Growth Packages.",
  },
  {
    id: "pricing",
    category: "Pricing & Quotes",
    question: "How does your pricing work?",
    answer:
      "All services have transparent starting rates published directly on the website—from ₹799 for individual marketplace listing optimizations to ₹24,999+ for full eCommerce brand ecosystems. Quotes are strictly scope-based so you only pay for what your business actually needs, with zero agency overhead or hidden fees.",
  },
  {
    id: "custom-packages",
    category: "Services & Scope",
    question: "Can I get a custom package tailored to my business?",
    answer:
      "Yes. Most businesses have unique combinations of needs—such as needing an Amazon storefront refresh paired with custom ad creatives and a landing page. You can use the Interactive Package Calculator on the Pricing page or send a direct inquiry to get a customized, bundled proposal.",
  },
  {
    id: "timeline",
    category: "Timelines & Delivery",
    question: "How long does a project typically take?",
    answer:
      "Timelines depend on complexity and scope: Marketplace listing designs and ad creatives typically take 24–48 hours; brand identity kits and standalone landing pages take 3–7 business days; and full custom web applications or AI automation systems take 1–3 weeks with regular milestone check-ins.",
  },
  {
    id: "small-businesses",
    category: "Working Together",
    question: "Do you work with small businesses and early-stage founders?",
    answer:
      "Absolutely. The studio was built specifically to empower indie founders, D2C brands, marketplace sellers, and local businesses that need tier-1 quality without paying inflated 6-figure agency retainers. You work directly with me—the operator and developer—from day one.",
  },
  {
    id: "how-to-start",
    category: "Working Together",
    question: "How do we get started?",
    answer:
      "Getting started is simple and friction-free: (1) Submit a brief message through the Contact page or consult the live AI assistant. (2) I review your objectives and reply within 12–24 hours with an actionable scope and fixed quote. (3) Upon agreement, we kick off immediately with direct WhatsApp/Slack communication.",
  },
  {
    id: "revisions",
    category: "Quality & Process",
    question: "What is your revision and review process?",
    answer:
      "Every project includes dedicated revision rounds (typically 2–3 rounds of detailed refinements) to ensure the final output strictly exceeds your standards. We establish clear design criteria and wireframes before production, minimizing guesswork and ensuring alignment at each milestone.",
  },
  {
    id: "payment",
    category: "Billing & Security",
    question: "How does payment work?",
    answer: (
      <div className="space-y-3">
        <p>
          Projects are handled with structured milestone billing—typically a 50%
          deposit to begin work and 50% upon final delivery and sign-off. Payments
          are securely coordinated via direct bank transfer and UPI.
        </p>
        <div className="p-3 rounded-xl bg-[#FAF2EA] border border-[#F6DBC0] text-xs text-[#7A3F26] font-mono">
          Note: Online payment options will be added as the payment system is
          finalized.
        </div>
      </div>
    ),
  },
];

export default function FAQPage() {
  const [openId, setOpenId] = useState<string | null>("services");

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF2EA] border border-[#F6DBC0] text-[#7A3F26] text-xs uppercase tracking-widest font-mono mb-4 font-semibold shadow-2xs">
          <HelpCircle className="w-3.5 h-3.5 text-[#d97746]" />
          <span>Clarity &amp; Process</span>
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#180D1D] tracking-tight mb-4">
          Frequently Asked <br />
          <span className="text-gradient-dusk">
            Questions.
          </span>
        </h1>
        <p className="text-[#56475C] text-base sm:text-lg lg:text-xl font-normal leading-relaxed">
          Everything you need to know about working together, pricing models,
          timelines, and our collaborative delivery process.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-4 mb-16">
        {faqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? "bg-white/95 border-[#935073]/30 shadow-[0_10px_30px_-5px_rgba(80,45,85,0.06)]"
                  : "bg-white/70 border-[#502D55]/08 hover:border-[#935073]/25 hover:bg-white/90 shadow-2xs"
              }`}
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[#FAF2EA] border border-[#F6DBC0] text-[#7A3F26] font-semibold">
                    0{index + 1}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-[#180D1D]">
                    {faq.question}
                  </span>
                </div>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-transform duration-300 ${
                    isOpen
                      ? "bg-[#180D1D] border-[#180D1D] rotate-180 text-[#F8F4E9]"
                      : "bg-[#FAF2EA] border-[#F6DBC0] text-[#7A3F26]"
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#502D55]/08">
                      <div className="text-sm sm:text-base text-[#56475C] leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Bottom Conversion Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-white/80 border border-[#502D55]/10 backdrop-blur-xl text-center shadow-sm">
        <h3 className="text-2xl font-bold text-[#180D1D] mb-3">
          Still Have Questions About Your Specific Project?
        </h3>
        <p className="text-[#56475C] max-w-xl mx-auto text-sm sm:text-base mb-6 leading-relaxed">
          Every business has unique parameters. Send me a quick overview of what
          you’re looking to accomplish and I’ll provide tailored answers.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm inline-flex items-center justify-center gap-2 transition-all bg-[#180D1D] hover:bg-[#2B1435] text-[#F8F4E9] shadow-sm"
          >
            <span>Start a Project Inquiry</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all bg-white text-[#180D1D] border border-[#502D55]/15 hover:border-[#935073]/40 shadow-2xs"
          >
            <span>View All Pricing</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
