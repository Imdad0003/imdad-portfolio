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
    <div className="my-3 p-4 rounded-2xl bg-[var(--surface-pure,#FFFFFF)] border border-[#F0CFC0] shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border-warm,#E8DFD5)]">
        <CheckCircle2 className="w-4 h-4 text-[var(--accent-coral,#C96A50)]" />
        <span className="text-xs font-mono uppercase tracking-wider text-[var(--ink-primary,#332924)] font-bold">
          Project Summary Draft
        </span>
      </div>

      <div className="space-y-1.5 text-xs text-[var(--ink-body,#5F534D)] mb-4">
        <div>
          <span className="text-[var(--ink-muted,#8A7C75)] font-semibold">Service: </span>
          <span className="text-[var(--ink-primary,#332924)] font-bold">{summary.service}</span>
        </div>
        <div>
          <span className="text-[var(--ink-muted,#8A7C75)] font-semibold">Requirement: </span>
          <span className="text-[var(--ink-primary,#332924)]">{summary.requirement}</span>
        </div>
        <div>
          <span className="text-[var(--ink-muted,#8A7C75)] font-semibold">Scope: </span>
          <span className="text-[var(--accent-coral-hover,#B4583F)] font-mono">{summary.scope}</span>
        </div>
        <div className="text-[11px] text-[var(--ink-muted,#8A7C75)] pt-1">
          {summary.pricingNote}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-warm,#E8DFD5)]">
        <button
          type="button"
          onClick={() => onSendInquiry(summary)}
          className="w-full min-h-[42px] py-2 px-3 rounded-xl bg-[var(--accent-coral,#C96A50)] hover:bg-[var(--accent-coral-hover,#B4583F)] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer focus-ring"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send Project Inquiry</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] py-2 px-2.5 rounded-xl bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-primary,#332924)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-ring"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
            <span>WhatsApp</span>
          </a>

          <a
            href={siteConfig.contact.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[40px] py-2 px-2.5 rounded-xl bg-[var(--background,#FAF7F2)] hover:bg-[var(--surface-peach,#FAECE4)] border border-[var(--border-warm,#E8DFD5)] text-[var(--ink-primary,#332924)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-ring"
          >
            <Instagram className="w-3.5 h-3.5 text-[var(--accent-coral,#C96A50)]" />
            <span>Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
