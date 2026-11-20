"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  LayoutDashboard,
  Sparkles,
  Globe,
  Layers,
  Package,
  MessageSquare,
  Film,
  ShoppingBag,
  Image as ImageIcon,
  Smartphone,
  Palette,
  SlidersHorizontal,
  LogOut,
  ExternalLink,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Search,
  CheckCircle2,
  ChevronDown,
  Database,
  User as UserIcon,
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
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: "blue" | "emerald" | "amber" | "slate";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface AdminLayoutShellProps {
  activeTab: AdminNavigationTab;
  onSelectTab: (tab: AdminNavigationTab) => void;
  currentUser: User | null;
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
  projectsCount,
  servicesCount,
  packagesCount,
  reviewsCount,
  ordersCount,
  children,
}: AdminLayoutShellProps) {
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  // Close mobile drawer on route/tab change or escape key
  useEffect(() => {
    setIsSidebarOpenMobile(false);
  }, [activeTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSidebarOpenMobile(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navGroups: NavGroup[] = [
    {
      title: "Overview",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Website Management",
      items: [
        {
          id: "homepage-builder",
          label: "Homepage CMS",
          icon: Sparkles,
          badge: "Live CMS",
          badgeVariant: "blue",
        },
        {
          id: "projects",
          label: "Projects & Work",
          icon: Globe,
          badge: projectsCount,
        },
        {
          id: "services",
          label: "Services",
          icon: Layers,
          badge: servicesCount,
        },
        {
          id: "packages",
          label: "Website Packages",
          icon: Package,
          badge: packagesCount,
        },
        {
          id: "reviews",
          label: "Customer Reviews",
          icon: MessageSquare,
          badge: reviewsCount,
          badgeVariant: "amber",
        },
      ],
    },
    {
      title: "Business Management",
      items: [
        {
          id: "video-orders",
          label: "Video Orders & Payments",
          icon: Film,
          badge: ordersCount,
          badgeVariant: "emerald",
        },
        {
          id: "amazon-portfolio",
          label: "Amazon & A+ Portfolio",
          icon: ShoppingBag,
        },
      ],
    },
    {
      title: "Content & Releases",
      items: [
        {
          id: "media-library",
          label: "Media Library",
          icon: ImageIcon,
        },
        {
          id: "app-releases",
          label: "APK Releases",
          icon: Smartphone,
        },
        {
          id: "wishmusic-visuals",
          label: "WishMusic Visuals",
          icon: Palette,
        },
      ],
    },
    {
      title: "System",
      items: [
        {
          id: "settings",
          label: "Studio Settings",
          icon: SlidersHorizontal,
        },
      ],
    },
  ];

  // Helper to determine breadcrumb title
  const currentTabItem = navGroups
    .flatMap((g) => g.items)
    .find((item) => item.id === activeTab);

  const currentTabGroup = navGroups.find((g) =>
    g.items.some((item) => item.id === activeTab)
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A192F] flex flex-col font-sans antialiased selection:bg-[#E0F2FE] selection:text-[#0284C7]">
      {/* ===================================================================== */}
      {/* MOBILE BACKDROP & DRAWER                                              */}
      {/* ===================================================================== */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsSidebarOpenMobile(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl flex flex-col z-50 animate-slide-in">
            {/* Drawer Header */}
            <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-[#0066FF]/20">
                  IB
                </div>
                <div>
                  <div className="text-xs font-bold text-[#0A192F] tracking-tight">
                    IMDAD.BUILDS
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    SaaS Control Center
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-1">
                  <div className="px-3 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-600 mb-1.5">
                    {group.title}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(item.id);
                          setIsSidebarOpenMobile(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#0066FF] text-white shadow-sm shadow-[#0066FF]/20"
                            : "text-[#1E293B] hover:bg-[#F0F7FF] hover:text-[#0066FF]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              isActive
                                ? "bg-white/20 text-white"
                                : item.badgeVariant === "emerald"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : item.badgeVariant === "amber"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Mobile Footer Admin Info */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-[#0A192F] flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {currentUser?.email?.charAt(0) || "A"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0A192F] truncate">
                      {currentUser?.email || "Admin User"}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Super Admin
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-200/60 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* DESKTOP SAAS LAYOUT (SIDEBAR + MAIN CONTENT)                          */}
      {/* ===================================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 z-20 shrink-0 ${
            isSidebarCollapsedDesktop ? "w-20" : "w-64"
          }`}
        >
          {/* Sidebar Brand Header */}
          <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
            {!isSidebarCollapsedDesktop ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-[#0066FF]/20 shrink-0">
                  IB
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-[#0A192F] tracking-tight truncate">
                    IMDAD.BUILDS
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider truncate">
                    SaaS Admin Center
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-lg bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-[#0066FF]/20">
                  IB
                </div>
              </div>
            )}

            {/* Desktop collapse toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsedDesktop(!isSidebarCollapsedDesktop)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title={isSidebarCollapsedDesktop ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

          {/* Sidebar Nav Links */}
          <div className="flex-1 overflow-y-auto p-3 space-y-5">
            {navGroups.map((group) => (
              <div key={group.title} className="space-y-1">
                {!isSidebarCollapsedDesktop ? (
                  <div className="px-3 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-600 mb-1">
                    {group.title}
                  </div>
                ) : (
                  <div className="w-full h-px bg-slate-100 my-2" />
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      title={isSidebarCollapsedDesktop ? item.label : undefined}
                      className={`w-full flex items-center ${
                        isSidebarCollapsedDesktop ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2"
                      } rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#0066FF] text-white shadow-sm shadow-[#0066FF]/25 font-bold"
                          : "text-[#1E293B] hover:bg-[#F0F7FF] hover:text-[#0066FF]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                        {!isSidebarCollapsedDesktop && <span>{item.label}</span>}
                      </div>

                      {!isSidebarCollapsedDesktop && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : item.badgeVariant === "emerald"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.badgeVariant === "amber"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Desktop Sidebar Footer */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/60">
            {!isSidebarCollapsedDesktop ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-[#0066FF] flex items-center justify-center font-bold text-xs uppercase shrink-0 border border-slate-200">
                    {currentUser?.email?.charAt(0) || "A"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-bold text-[#0A192F] truncate">
                      {currentUser?.email?.split("@")[0] || "Admin"}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Super Admin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-1">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-[#0066FF] hover:bg-white border border-slate-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Site</span>
                  </Link>
                  <button
                    type="button"
                    onClick={onSignOut}
                    title="Sign Out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  title="View Site"
                  className="p-2 rounded-lg text-slate-500 hover:text-[#0066FF] hover:bg-white border border-slate-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={onSignOut}
                  title="Sign Out"
                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* ===================================================================== */}
        {/* RIGHT MAIN PANEL (HEADER + WORKSPACE VIEWPORT)                        */}
        {/* ===================================================================== */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* SAAS TOP HEADER */}
          <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4 shadow-2xs">
            {/* Left: Mobile Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(true)}
                className="p-2 rounded-lg text-slate-600 hover:text-[#0A192F] hover:bg-slate-100 lg:hidden cursor-pointer"
                aria-label="Open sidebar navigation"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Breadcrumb Path */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-600 font-mono hidden sm:inline">Admin</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:inline" />
                <span className="text-slate-600 hidden md:inline truncate">
                  {currentTabGroup?.title || "Overview"}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden md:inline" />
                <span className="font-bold text-[#0A192F] truncate">
                  {currentTabItem?.label || "Dashboard"}
                </span>
              </nav>
            </div>

            {/* Right: Status Pill, View Site, User Quick Menu */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Cloud Firestore Live Sync Pill */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Firestore Live: imdadbuilds-ead39</span>
              </div>

              {/* External Live Site Link */}
              <Link
                href="/"
                target="_blank"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100/80 hover:bg-slate-100 text-[#0A192F] border border-slate-200 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>Live Site</span>
              </Link>

              {/* Admin Profile Chip */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-7 h-7 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-xs uppercase border border-[#0284C7]/20 shadow-2xs">
                  {currentUser?.email?.charAt(0) || "A"}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-[#0A192F] leading-tight truncate max-w-[150px]">
                    {currentUser?.email || "Admin"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono leading-tight">
                    Authorized
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Dynamic Sync Toast */}
          {syncStatus && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 rounded-xl bg-[#0A192F] text-white text-xs font-mono flex items-center justify-between shadow-md animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            </div>
          )}

          {/* MAIN PAGE VIEWPORT */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
