import React from "react";

interface QuickActionsProps {
  onSelect: (action: string) => void;
  disabled?: boolean;
}

const quickOptions = [
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
    <div className="py-2.5 px-3 border-t border-[#F6DBC0]/10 bg-[rgba(24,10,30,0.6)]">
      <div className="text-[10px] font-mono uppercase tracking-wider text-[#bba89d] mb-2 px-1">
        Quick Topics:
      </div>
      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto scrollbar-none pb-1">
        {quickOptions.map((opt) => (
          <button
            key={opt.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(opt.prompt)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[rgba(56,24,66,0.6)] hover:bg-[rgba(80,45,85,0.8)] border border-[#F6DBC0]/15 hover:border-[#F6DBC0]/35 text-[#d8cfc4] hover:text-[#F8F4E9] transition-all cursor-pointer focus-ring disabled:opacity-50 disabled:pointer-events-none"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
