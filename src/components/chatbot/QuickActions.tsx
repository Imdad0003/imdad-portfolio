import React from "react";

interface QuickActionsProps {
  onSelect: (action: string) => void;
  disabled?: boolean;
}

const quickOptions = [
  { label: "⚡ Order Video Edit", prompt: "I would like to place an order for video editing." },
  { label: "🛒 E-commerce", prompt: "I need help with marketplace listings (Amazon / Flipkart / Meesho)." },
  { label: "🎨 Product Images", prompt: "I need high-converting product listing creatives and infographics." },
  { label: "🎬 Video / UGC", prompt: "I need short-form video ads or UGC-style product reels." },
  { label: "🌐 Website", prompt: "I need an e-commerce storefront or business website built." },
  { label: "📱 Social Media", prompt: "I need social media content planning and creative strategy." },
  { label: "📈 Ads & Marketing", prompt: "I need Meta and Instagram ad creative testing and campaign strategy." },
  { label: "🤖 AI Services", prompt: "I want to explore AI product staging and generative creative workflows." },
  { label: "📋 Business Setup", prompt: "I need assistance with GST, Udyam, or marketplace seller onboarding." },
];

export function QuickActions({ onSelect, disabled }: QuickActionsProps) {
  return (
    <div className="py-2 px-3 border-t border-[var(--border-warm,#E8DFD5)] bg-[var(--background,#FAF7F2)]">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted,#8A7C75)] mb-1.5 px-1">
        Quick Topics (swipe →):
      </div>
      <div className="flex sm:flex-wrap items-center gap-1.5 overflow-x-auto sm:overflow-y-auto sm:max-h-28 scrollbar-none pb-1">
        {quickOptions.map((opt) => (
          <button
            key={opt.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.prompt)}
            className="px-3 min-h-[36px] py-1.5 rounded-full text-xs font-medium bg-[var(--surface-pure,#FFFFFF)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] hover:border-[#D8A999] text-[var(--ink-primary,#332924)] transition-colors cursor-pointer focus-ring shrink-0 whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
