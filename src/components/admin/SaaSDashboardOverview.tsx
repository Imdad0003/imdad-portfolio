"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  Sparkles,
  Layers,
  Globe,
  Film,
  Smartphone,
  ShoppingBag,
  Image as ImageIcon,
  MessageSquare,
  Package,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import type {
  AppDocument,
  ProjectDocument,
  ServiceDocument,
  WebsitePackageDocument,
  ReviewDocument,
  SiteContentDocument,
  SettingsDocument,
} from "@/types/cms";
import type { AdminNavigationTab } from "./AdminLayoutShell";
import { VideoOrder, ProjectStatus } from "@/types/video-order";
import { isFirebaseConfigured } from "@/lib/firebase";

interface SaaSDashboardOverviewProps {
  currentUser: User | null;
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

interface OrderMetrics {
  totalOrders: number;
  totalRevenue: number;
  advanceCollected: number;
  balancePending: number;
  orders: VideoOrder[];
}

const PROJECT_STATUS_BADGES: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  pending_payment: {
    label: "Pending Advance",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  payment_confirmed: {
    label: "Advance Paid",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  awaiting_editor_assignment: {
    label: "Awaiting Assignment",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  editing_in_progress: {
    label: "In Production",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  review_and_revisions: {
    label: "Review Stage",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  final_payment_pending: {
    label: "Final Payment Due",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  completed_and_delivered: {
    label: "Delivered",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-300",
  },
};

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
  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics>({
    totalOrders: 0,
    totalRevenue: 0,
    advanceCollected: 0,
    balancePending: 0,
    orders: [],
  });
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Fetch live video orders summary for real-time pipeline reporting
  useEffect(() => {
    let isMounted = true;
    const fetchVideoOrders = async () => {
      if (!currentUser) return;
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const token = await currentUser.getIdToken();
        const res = await fetch("/api/admin/orders/video", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setOrderMetrics({
              totalOrders: data.metrics?.totalOrders || (data.orders?.length ?? 0),
              totalRevenue: data.metrics?.totalRevenue || 0,
              advanceCollected: data.metrics?.advanceCollected || 0,
              balancePending: data.metrics?.balancePending || 0,
              orders: data.orders || [],
            });
          }
        } else if (isMounted) {
          setOrdersError("Order metrics could not be loaded. Refresh to try again.");
        }
      } catch (err) {
        console.warn("Could not load video order metrics for dashboard:", err);
        if (isMounted) setOrdersError("Order metrics could not be loaded. Refresh to try again.");
      } finally {
        if (isMounted) setLoadingOrders(false);
      }
    };

    void fetchVideoOrders();
    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  // Derived statistics
  const publishedProjectsCount = projects.filter((p) => p.published).length;
  const publishedServicesCount = services.filter((s) => s.published).length;
  const activePackagesCount = packages.filter((p) => p.active !== false).length;
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length
        ).toFixed(1)
      : "5.0";

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome & Command Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
            <span className="text-xs text-slate-400 font-mono">
              v2.4 &bull; Production
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0A192F] tracking-tight">
            Studio Operations Desk
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Realtime administrative oversight for IMDAD.BUILDS portfolio, client
            orders, APK releases, and marketing publishing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void onRefreshAll()}
            disabled={loadingData}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-[#0A192F] transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${
                loadingData ? "animate-spin text-[#0284C7]" : ""
              }`}
            />
            <span>{loadingData ? "Syncing..." : "Sync Firestore"}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab("homepage-builder")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-linear-to-r from-[#0066FF] to-[#0284C7] hover:from-[#0052cc] hover:to-[#0369a1] shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch CMS Builder</span>
          </button>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            <span>Live Site</span>
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Video Orders & Advance */}
        <div
          onClick={() => onNavigateTab("video-orders")}
          className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-[#0284C7]/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Video Editing Pipeline
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-100/80 text-[#0284C7] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              {orderMetrics.totalOrders} Orders
            </div>
            {ordersError && (
              <p role="alert" className="mt-2 text-xs font-medium text-rose-700">
                {ordersError}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="inline-flex items-center text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                ₹{orderMetrics.advanceCollected.toLocaleString("en-IN")} Advance
              </span>
              <span className="text-slate-400">
                ₹{orderMetrics.balancePending.toLocaleString("en-IN")} Pending
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Projects & Case Studies */}
        <div
          onClick={() => onNavigateTab("projects")}
          className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-[#0284C7]/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Case Studies & Portfolio
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              {projects.length} Projects
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="font-bold text-[#0A192F]">
                {publishedProjectsCount} Published
              </span>
              <span>&bull;</span>
              <span>{projects.length - publishedProjectsCount} Drafts</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Services & Commercial Packages */}
        <div
          onClick={() => onNavigateTab("packages")}
          className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-[#0284C7]/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Offerings & Packages
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-100/80 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              {packages.length} Packages
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="font-bold text-emerald-600">
                {activePackagesCount} Active
              </span>
              <span>&bull;</span>
              <span>{services.length} Disciplines</span>
            </div>
          </div>
        </div>

        {/* Metric 4: App Releases & Client Rating */}
        <div
          onClick={() => onNavigateTab("app-releases")}
          className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-xs hover:border-[#0284C7]/50 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110" />
          <div className="flex items-center justify-between relative mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Releases & Social Proof
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="relative">
            <div className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
              {apps.length} Apps Active
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span className="font-bold text-[#0A192F]">
                ★ {averageRating} / 5.0
              </span>
              <span>&bull;</span>
              <span>{reviews.length} Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Launchpad & Direct Workflows */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[#0A192F]">
              Quick Action Command Center
            </h2>
            <p className="text-xs text-slate-500">
              Jump straight to key management suites and publishing tools.
            </p>
          </div>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400 bg-slate-50 border border-slate-200 px-2 py-1 rounded-md">
            Click to activate
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            type="button"
            onClick={() => onNavigateTab("homepage-builder")}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/90 hover:border-[#0284C7]/40 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#0284C7] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
              Homepage CMS
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Live visual editor
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("video-orders")}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/90 hover:border-[#0284C7]/40 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Film className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
              Video Orders
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Advance & editors
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("projects")}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/90 hover:border-[#0284C7]/40 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Globe className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
              Projects Manager
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Case studies & work
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("app-releases")}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/90 hover:border-[#0284C7]/40 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
              APK Releases
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Upload & rollback
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("wishmusic-visuals")}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/90 hover:border-[#0284C7]/40 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
              WishMusic Assets
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              Wallpapers & shots
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("media-library")}
            className="p-3.5 rounded-xl bg-slate-50 hover:bg-sky-50/80 border border-slate-200/90 hover:border-[#0284C7]/40 transition-all text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-[#0A192F] group-hover:text-[#0284C7] transition-colors">
              Media Library
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
              CDN asset storage
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders + Platform Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Video Orders Feed (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0A192F] flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#0284C7]" />
                  <span>Recent Video Orders</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Latest customer requests collected by the AI concierge.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab("video-orders")}
                className="text-xs font-bold text-[#0284C7] hover:text-[#0052cc] flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({orderMetrics.totalOrders})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loadingOrders ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#0284C7]" />
                <span className="text-xs font-mono">Fetching latest orders...</span>
              </div>
            ) : orderMetrics.orders.length === 0 ? (
              <div className="py-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                <Film className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700">
                  No video orders recorded yet
                </div>
                <div className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  When clients configure video editing orders through the AI agent,
                  they will appear here with live Razorpay payment tracking.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3 font-medium">Order / Client</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Advance Status</th>
                      <th className="pb-3 font-medium">Project Stage</th>
                      <th className="pb-3 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {orderMetrics.orders.slice(0, 5).map((order) => {
                      const badge =
                        (order.projectStatus && PROJECT_STATUS_BADGES[order.projectStatus]) ||
                        PROJECT_STATUS_BADGES.pending_payment;
                      const isAdvancePaid =
                        order.paymentStatus === "advance_paid" ||
                        order.paymentStatus === "fully_paid";

                      return (
                        <tr
                          key={order.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          <td className="py-3 pr-3">
                            <div className="font-bold text-[#0A192F]">
                              {order.customer?.fullName || "Client"}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              #{order.orderNumber || order.id.slice(0, 8)}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-slate-600">
                            <span className="capitalize">
                              {order.project?.videoType?.replace("_", " ") || "Video"}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            {isAdvancePaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Paid (₹{(order.pricing?.advanceAmount || 0).toLocaleString("en-IN")})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                <Clock className="w-3 h-3" />
                                Awaiting ₹{(order.pricing?.advanceAmount || 0).toLocaleString("en-IN")}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              type="button"
                              onClick={() => onNavigateTab("video-orders")}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#0284C7] hover:bg-sky-50 transition-colors cursor-pointer"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Total Revenue Potential:{" "}
              <strong className="text-[#0A192F]">
                ₹{orderMetrics.totalRevenue.toLocaleString("en-IN")}
              </strong>
            </span>
            <span className="text-emerald-600 font-bold">
              ₹{orderMetrics.advanceCollected.toLocaleString("en-IN")} Captured
            </span>
          </div>
        </div>

        {/* Right Column: Platform & Infrastructure Health (1 col) */}
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-[#0284C7]" />
              <h3 className="text-base font-bold text-[#0A192F]">
                Infrastructure & Health
              </h3>
            </div>

            <div className="space-y-3.5">
              {/* Firestore */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0A192F]">
                      Google Cloud Firestore
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {isFirebaseConfigured ? "imdadbuilds-ead39" : "Local Mock"}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Online
                </span>
              </div>

              {/* Razorpay Gateway */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0A192F]">
                      Razorpay Payments
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Standard Checkout & Webhooks
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Verified
                </span>
              </div>

              {/* Vercel Edge & Cloudinary */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0A192F]">
                      Cloudinary Media CDN
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Optimized Asset Delivery
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Ready
                </span>
              </div>

              {/* GitHub Releases */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-[#0A192F]">
                      GitHub Release Binaries
                    </div>
                    <div className="text-[11px] text-slate-400">
                      APK Storage & Distribution
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Linked
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Admin Auth: Active</span>
            <span className="font-mono text-slate-600 truncate max-w-[140px]">
              {currentUser?.email}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
