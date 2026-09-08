import React from "react";
import { siteConfig, getWhatsAppUrl } from "@/data/config";
import { Send, MessageSquare, CheckCircle2 } from "lucide-react";
import { Instagram } from "@/components/ui/InstagramIcon";

interface ProjectSummaryData {
  service: string;
  requirement: string;
  scope: string;
  pricingNote: string;
}

interface ProjectSummaryCardProps {
  summary: ProjectSummaryData;
  onSendInquiry: (summary: ProjectSummaryData) => void;
}

export function ProjectSummaryCard({
  summary,
  onSendInquiry,
}: ProjectSummaryCardProps) {
  const whatsappText = `Hi Imdad, I generated a project summary via your AI assistant:\n\nService: ${summary.service}\nRequirement: ${summary.requirement}\nScope: ${summary.scope}\n\nI'd like to discuss the next steps!`;
  const whatsappUrl = getWhatsAppUrl(whatsappText);

  return (
    <div className="my-3 p-4 rounded-2xl bg-gradient-to-br from-[rgba(65,28,77,0.8)] to-[rgba(43,20,53,0.9)] border border-[#F6DBC0]/30 shadow-lg backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#F6DBC0]/15">
        <CheckCircle2 className="w-4 h-4 text-[#F6DBC0]" />
        <span className="text-xs font-mono uppercase tracking-wider text-[#F8F4E9] font-bold">
          Project Summary Draft
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-[#d8cfc4] mb-4">
        <div>
          <span className="text-[#bba89d] font-semibold">Service: </span>
          <span className="text-[#F8F4E9] font-bold">{summary.service}</span>
        </div>
        <div>
          <span className="text-[#bba89d] font-semibold">Requirement: </span>
          <span className="text-[#F8F4E9]">{summary.requirement}</span>
        </div>
        <div>
          <span className="text-[#bba89d] font-semibold">Scope: </span>
          <span className="text-[#F6DBC0] font-mono">{summary.scope}</span>
        </div>
        <div className="text-[11px] text-[#bba89d] pt-1">
          {summary.pricingNote}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-[#F6DBC0]/15">
        <button
          type="button"
          onClick={() => onSendInquiry(summary)}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#220d29] text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(246,219,192,0.3)] hover:shadow-[0_0_25px_rgba(246,219,192,0.5)] transition-all cursor-pointer focus-ring"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Project Inquiry</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-[rgba(56,24,66,0.6)] hover:bg-[rgba(80,45,85,0.8)] border border-[#F6DBC0]/20 text-[#F8F4E9] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-ring"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#F6DBC0]" />
            <span>WhatsApp</span>
          </a>

          <a
            href={siteConfig.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-2.5 rounded-xl bg-[rgba(56,24,66,0.6)] hover:bg-[rgba(80,45,85,0.8)] border border-[#F6DBC0]/20 text-[#F8F4E9] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-ring"
          >
            <Instagram className="w-3.5 h-3.5 text-[#d68fad]" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
