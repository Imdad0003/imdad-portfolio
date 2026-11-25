"use client";

import React from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import type { AdminNavigationTab } from "./AdminLayoutShell";
import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  ReviewDocument,
  SiteContentDocument,
  SettingsDocument,
} from "@/types/cms";
import {
  LayoutTemplate,
  FolderKanban,
  Briefcase,
  Package,
  MessageSquareHeart,
  Image as ImageIcon,
  Film,
  Settings,
  RefreshCw,
  ArrowRight,
  Palette,
  Plus,
  ExternalLink,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface SaaSDashboardOverviewProps {
  currentUser: User;
  onNavigateTab: (tab: AdminNavigationTab) => void;
  apps: AppDocument[];
  projects: ProjectDocument[];
  services: ServiceDocument[];
  packages: WebsitePackageDocument[];
  reviews: ReviewDocument[];
  siteContent: SiteContentDocument | null;
  settings: SettingsDocument | null;
  onRefreshAll: () => Promise<void>;
  loadingData: boolean;
}

export function SaaSDashboardOverview({
  currentUser,
  onNavigateTab,
  apps,
  projects,
  services,
  packages,
  reviews,
  siteContent,
  settings,
  onRefreshAll,
  loadingData,
}: SaaSDashboardOverviewProps) {
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const visibleSectionsCount = Object.values(
    siteContent?.metadata?.sectionVisibility || {}
  ).filter(Boolean).length;

  const quickActions: Array<{
    title: string;
    description: string;
    tab: AdminNavigationTab;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }> = [
    {
      title: "Customize Homepage & Layout",
      description: "Change text, reorder blocks, add custom sections, colors & fonts.",
      tab: "homepage-builder",
      icon: LayoutTemplate,
      badge: "Visual Builder",
    },
    {
      title: "Manage Services",
      description: "Edit descriptions, deliverables, pricing tiers, steps & FAQs.",
      tab: "services",
      icon: Briefcase,
      badge: `${services.length} items`,
    },
    {
      title: "Projects & Case Studies",
      description: "Add new portfolio case studies or remove old ones.",
      tab: "projects",
      icon: FolderKanban,
      badge: `${projects.length} items`,
    },
    {
      title: "Pricing Packages",
      description: "Adjust package rates, turnaround times & feature lists.",
      tab: "packages",
      icon: Package,
      badge: `${packages.length} plans`,
    },
    {
      title: "Media & Images",
      description: "Upload photos, logos & clean up unused assets safely.",
      tab: "media-library",
      icon: ImageIcon,
    },
    {
      title: "Video Orders Pipeline",
      description: "Assign editors, update order stages or clean up test orders.",
      tab: "video-orders",
      icon: Film,
    },
    {
      title: "Reviews & Testimonials",
      description: "Approve, verify, add or delete customer reviews.",
      tab: "reviews",
      icon: MessageSquareHeart,
      badge: pendingReviews > 0 ? `${pendingReviews} pending` : `${reviews.length} total`,
    },
    {
      title: "Brand & Studio Settings",
      description: "Update email, WhatsApp, logos, AI tools & sync starter templates.",
      tab: "settings",
      icon: Settings,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-white border border-[#E8DFD5] p-6 sm:p-8 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAECE4] text-[#B4583F] border border-[#EED3C5] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Admin Workspace</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#332924]">
            Welcome back, {currentUser.displayName || currentUser.email?.split("@")[0] || "Imdad"}
          </h2>
          <p className="text-sm text-[#5F534D] leading-relaxed">
            Everything on your website is editable here — from homepage section order, colors, fonts, and team members to projects, packages, media, and video orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => void onRefreshAll()}
            disabled={loadingData}
            className="px-4 py-2.5 rounded-full bg-[#FAF7F2] hover:bg-[#F3ECE4] border border-[#E8DFD5] text-xs font-bold text-[#332924] inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
            <span>Refresh Data</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("homepage-builder")}
            className="px-5 py-2.5 rounded-full bg-[#C96A50] hover:bg-[#B4583F] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Open Layout &amp; Theme Builder</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs">
          <div className="text-xs font-mono text-[#8A7C75] mb-1">Active Sections</div>
          <div className="text-2xl font-display font-bold text-[#332924]">
            {visibleSectionsCount || 8}
          </div>
          <div className="text-[11px] text-[#5F534D] mt-1">
            {siteContent?.customSections?.length || 0} custom blocks built
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs">
          <div className="text-xs font-mono text-[#8A7C75] mb-1">Services &amp; Plans</div>
          <div className="text-2xl font-display font-bold text-[#332924]">
            {services.length} <span className="text-sm font-normal text-[#8A7C75]">/ {packages.length} pkg</span>
          </div>
          <div className="text-[11px] text-[#5F534D] mt-1">Synced with public pages</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs">
          <div className="text-xs font-mono text-[#8A7C75] mb-1">Portfolio &amp; Apps</div>
          <div className="text-2xl font-display font-bold text-[#332924]">
            {projects.length} <span className="text-sm font-normal text-[#8A7C75]">/ {apps.length} apps</span>
          </div>
          <div className="text-[11px] text-[#5F534D] mt-1">Ready to feature on homepage</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E8DFD5] shadow-2xs">
          <div className="text-xs font-mono text-[#8A7C75] mb-1">Studio Status</div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 mt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{settings?.maintenanceMode ? "Maintenance Mode" : "Live & Public"}</span>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1 text-[11px] text-[#C96A50] hover:underline mt-2 font-semibold"
          >
            <span>Open Public Homepage</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Easy Customization Tiles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-[#332924]">
            What would you like to customize?
          </h3>
          <button
            type="button"
            onClick={() => onNavigateTab("projects")}
            className="text-xs font-semibold text-[#C96A50] hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Add Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.tab}
                type="button"
                onClick={() => onNavigateTab(act.tab)}
                className="group p-5 rounded-2xl bg-white border border-[#E8DFD5] hover:border-[#C96A50] text-left transition-all shadow-2xs hover:shadow-md flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-[#FAECE4] text-[#C96A50] flex items-center justify-center group-hover:bg-[#C96A50] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    {act.badge && (
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E8DFD5] text-[#5F534D]">
                        {act.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-display font-bold text-sm text-[#332924]">
                      {act.title}
                    </div>
                    <p className="text-xs text-[#6E625B] mt-1 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>
                <div className="text-xs font-semibold text-[#C96A50] inline-flex items-center gap-1">
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
