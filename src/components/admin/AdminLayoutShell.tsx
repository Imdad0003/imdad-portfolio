"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  LayoutDashboard,
  LayoutTemplate,
  FolderKanban,
  Briefcase,
  Package,
  MessageSquareHeart,
  Film,
  ShoppingBag,
  Image as ImageIcon,
  Smartphone,
  Sparkles,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export type AdminNavigationTab =
  | "dashboard"
  | "homepage-builder"
  | "projects"
  | "services"
  | "packages"
  | "reviews"
  | "video-orders"
  | "amazon-portfolio"
  | "media-library"
  | "app-releases"
  | "wishmusic-visuals"
  | "settings";

interface NavItem {
  id: AdminNavigationTab;
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeCount?: number;
  group: "site" | "catalog" | "operations" | "system";
}

interface AdminLayoutShellProps {
  activeTab: AdminNavigationTab;
  onSelectTab: (tab: AdminNavigationTab) => void;
  currentUser: User;
  onSignOut: () => void;
  syncStatus?: string | null;
  projectsCount?: number;
  servicesCount?: number;
  packagesCount?: number;
  reviewsCount?: number;
  ordersCount?: number;
  appsCount?: number;
  children: React.ReactNode;
}

export function AdminLayoutShell({
  activeTab,
  onSelectTab,
  currentUser,
  onSignOut,
  syncStatus,
  projectsCount = 0,
  servicesCount = 0,
  packagesCount = 0,
  reviewsCount = 0,
  ordersCount = 0,
  appsCount = 0,
  children,
}: AdminLayoutShellProps) {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  const navItems: NavItem[] = [
    {
      id: "dashboard",
      label: "Studio Overview",
      hint: "Health, quick links & stats",
      icon: LayoutDashboard,
      group: "site",
    },
    {
      id: "homepage-builder",
      label: "Layout & Theme Builder",
      hint: "Edit sections, order, colors & fonts",
      icon: LayoutTemplate,
      group: "site",
    },
    {
      id: "services",
      label: "Services",
      hint: "Manage offerings & pricing tiers",
      icon: Briefcase,
      badgeCount: servicesCount,
      group: "catalog",
    },
    {
      id: "projects",
      label: "Projects & Case Studies",
      hint: "Add or edit showcase work",
      icon: FolderKanban,
      badgeCount: projectsCount,
      group: "catalog",
    },
    {
      id: "packages",
      label: "Packages & Plans",
      hint: "Edit transparent pricing plans",
      icon: Package,
      badgeCount: packagesCount,
      group: "catalog",
    },
    {
      id: "reviews",
      label: "Client Reviews",
      hint: "Approve or remove testimonials",
      icon: MessageSquareHeart,
      badgeCount: reviewsCount,
      group: "catalog",
    },
    {
      id: "video-orders",
      label: "Video Orders",
      hint: "Track client video projects",
      icon: Film,
      badgeCount: ordersCount,
      group: "operations",
    },
    {
      id: "amazon-portfolio",
      label: "Amazon Portfolio",
      hint: "A+ & listing creative samples",
      icon: ShoppingBag,
      group: "operations",
    },
    {
      id: "media-library",
      label: "Media Library",
      hint: "Upload & clean up images",
      icon: ImageIcon,
      group: "operations",
    },
    {
      id: "app-releases",
      label: "Apps & APK Releases",
      hint: "Apps directory & builds",
      icon: Smartphone,
      badgeCount: appsCount,
      group: "operations",
    },
    {
      id: "wishmusic-visuals",
      label: "WishMusic Visuals",
      hint: "App screenshots & renders",
      icon: Sparkles,
      group: "operations",
    },
    {
      id: "settings",
      label: "Studio Settings",
      hint: "Logos, contact info & seed",
      icon: Settings,
      group: "system",
    },
  ];

  const activeNav = navItems.find((i) => i.id === activeTab) || navItems[0];
  const isErrorSync = syncStatus?.toLowerCase().includes("error") || syncStatus?.startsWith("⚠");

  const groups: Array<{ id: NavItem["group"]; label: string }> = [
    { id: "site", label: "Website & Layout" },
    { id: "catalog", label: "Content & Catalog" },
    { id: "operations", label: "Studio Operations" },
    { id: "system", label: "Preferences" },
  ];

  const renderNavList = (mobile: boolean) => (
    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
      {groups.map((grp) => {
        const items = navItems.filter((n) => n.group === grp.id);
        return (
          <div key={grp.id} className="space-y-1">
            {(!isSidebarCollapsedDesktop || mobile) && (
              <div className="px-3 pb-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#8A7C75]">
                {grp.label}
              </div>
            )}
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.label}
                  onClick={() => {
                    onSelectTab(item.id);
                    if (mobile) setIsSidebarOpenMobile(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#C96A50] text-white shadow-[0_6px_16px_-6px_rgba(201,106,80,0.45)]"
                      : "text-[#5F534D] hover:bg-[#FAF7F2] hover:text-[#332924]"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-white" : "text-[#8A7C75]"
                      }`}
                    />
                    {(!isSidebarCollapsedDesktop || mobile) && (
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{item.label}</div>
                        <div
                          className={`text-[10px] truncate ${
                            isActive ? "text-white/85" : "text-[#8A7C75]"
                          }`}
                        >
                          {item.hint}
                        </div>
                      </div>
                    )}
                  </div>
                  {(!isSidebarCollapsedDesktop || mobile) &&
                    typeof item.badgeCount === "number" && (
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-[#F3ECE4] text-[#5F534D]"
                        }`}
                      >
                        {item.badgeCount}
                      </span>
                    )}
                </button>
              );
            })}
          </div>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#332924] flex">
      {/* Mobile Sidebar Drawer */}
      {isSidebarOpenMobile && (
        <div
          className="fixed inset-0 z-50 bg-[#332924]/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsSidebarOpenMobile(false)}
        >
          <aside
            className="w-72 h-full bg-white border-r border-[#E8DFD5] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E8DFD5] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FAECE4] border border-[#EED3C5] flex items-center justify-center font-display font-black text-xs text-[#C96A50]">
                  IB
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#332924]">
                    IMDAD.BUILDS
                  </div>
                  <div className="text-[10px] font-mono text-[#8A7C75]">Studio Admin</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(false)}
                className="p-1.5 rounded-lg text-[#6E625B] hover:bg-[#FAF7F2] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {renderNavList(true)}
            <div className="p-3 border-t border-[#E8DFD5]">
              <button
                type="button"
                onClick={onSignOut}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-[#E8DFD5] sticky top-0 h-screen transition-all duration-200 ${
          isSidebarCollapsedDesktop ? "w-20" : "w-72"
        }`}
      >
        <div className="p-4 border-b border-[#E8DFD5] flex items-center justify-between">
          {!isSidebarCollapsedDesktop && (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FAECE4] border border-[#EED3C5] flex items-center justify-center font-display font-black text-xs text-[#C96A50] shrink-0">
                IB
              </div>
              <div className="min-w-0">
                <div className="font-display font-bold text-sm text-[#332924] truncate">
                  IMDAD.BUILDS
                </div>
                <div className="text-[10px] font-mono text-[#8A7C75] truncate">
                  Easy Studio Control
                </div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop)}
            className="p-1.5 rounded-lg text-[#6E625B] hover:bg-[#FAF7F2] hover:text-[#332924] transition-colors cursor-pointer mx-auto"
            title={isSidebarCollapsedDesktop ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isSidebarCollapsedDesktop ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {renderNavList(false)}

        <div className="p-3 border-t border-[#E8DFD5] space-y-2">
          {!isSidebarCollapsedDesktop && (
            <div className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[11px]">
              <div className="text-[10px] font-mono text-[#8A7C75]">Signed in as</div>
              <div className="font-semibold text-[#332924] truncate">
                {currentUser.email || "Administrator"}
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={onSignOut}
            className="w-full py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            {!isSidebarCollapsedDesktop && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DFD5] px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsSidebarOpenMobile(true)}
              className="lg:hidden p-2 rounded-xl bg-[#FAF7F2] border border-[#E8DFD5] text-[#332924] cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-display text-base sm:text-lg font-bold text-[#332924] truncate">
                {activeNav.label}
              </h1>
              <p className="text-[11px] text-[#8A7C75] truncate hidden sm:block">
                {activeNav.hint}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {syncStatus && (
              <div
                className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  isErrorSync
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {isErrorSync ? (
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{syncStatus}</span>
              </div>
            )}

            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#FAECE4] border border-[#E8DFD5] text-xs font-semibold text-[#332924] transition-colors"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C96A50]" />
            </Link>
          </div>
        </header>

        {/* Mobile Sync Status Toast */}
        {syncStatus && (
          <div className="md:hidden px-4 pt-3">
            <div
              className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                isErrorSync
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              {isErrorSync ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>{syncStatus}</span>
            </div>
          </div>
        )}

        {/* Active View Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
