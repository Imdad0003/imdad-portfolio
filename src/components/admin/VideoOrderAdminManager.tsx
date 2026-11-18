"use client";

import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  VideoOrder,
  ProjectStatus,
  AssignedEditor,
  OrderPaymentRecord,
  OrderNotificationRecord,
} from "@/types/video-order";
import { getWhatsAppUrl } from "@/data/config";
import {
  Film,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  UserCheck,
  CreditCard,
  ExternalLink,
  MessageSquare,
  FileCheck2,
  Calendar,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Mail,
  Phone,
  Edit2,
  Send,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const PROJECT_STATUS_LABELS: Record<ProjectStatus, { label: string; color: string; desc: string }> = {
  pending_payment: {
    label: "Pending Advance",
    color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    desc: "Order registered, awaiting 50% advance payment.",
  },
  payment_confirmed: {
    label: "Payment Confirmed",
    color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    desc: "50% advance received, payment verified on server.",
  },
  awaiting_editor_assignment: {
    label: "Awaiting Editor",
    color: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    desc: "Verified order waiting for an editor to be allocated.",
  },
  editing_in_progress: {
    label: "Editing In Progress",
    color: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    desc: "Assigned editor is cutting and color grading timeline.",
  },
  review_and_revisions: {
    label: "Review & Revisions",
    color: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
    desc: "Draft cut delivered to client for feedback and revisions.",
  },
  final_payment_pending: {
    label: "Final Balance Due",
    color: "bg-orange-500/15 text-orange-300 border-orange-500/30",
    desc: "Revisions completed. 50% remaining balance pending before watermark-free delivery.",
  },
  completed_and_delivered: {
    label: "Delivered & Closed",
    color: "bg-emerald-600/20 text-emerald-400 border-emerald-500/40",
    desc: "Fully paid, final high-resolution assets handed over.",
  },
};

interface VideoOrderAdminManagerProps {
  currentUser?: User | null;
}

export function VideoOrderAdminManager({ currentUser }: VideoOrderAdminManagerProps = {}) {
  const [orders, setOrders] = useState<VideoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectStatus, setSelectedProjectStatus] = useState<string>("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("all");

  // Selected Order for Drawer
  const [selectedOrder, setSelectedOrder] = useState<VideoOrder | null>(null);

  // Editor Assignment Form State
  const [isEditingEditor, setIsEditingEditor] = useState(false);
  const [editorName, setEditorName] = useState("");
  const [editorEmail, setEditorEmail] = useState("");
  const [editorPhone, setEditorPhone] = useState("");
  const [editorNotes, setEditorNotes] = useState("");
  const [savingEditor, setSavingEditor] = useState(false);

  // Project Status Update State
  const [targetStatus, setTargetStatus] = useState<ProjectStatus>("pending_payment");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState<string | null>(null);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const user = currentUser || auth?.currentUser;
    if (!user) return { "Content-Type": "application/json" };
    try {
      const token = await user.getIdToken();
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    } catch {
      return { "Content-Type": "application/json" };
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/orders/video", { headers });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to load orders.");
      }
      setOrders(data.orders || []);
      // Refresh selected order if open
      if (selectedOrder) {
        const refreshed = (data.orders || []).find((o: VideoOrder) => o.id === selectedOrder.id);
        if (refreshed) setSelectedOrder(refreshed);
      }
    } catch (err) {
      console.error("Fetch orders error:", err);
      setError(err instanceof Error ? err.message : "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  // Sync drawer fields when selected order changes
  useEffect(() => {
    if (selectedOrder) {
      setTargetStatus(selectedOrder.projectStatus || "pending_payment");
      if (selectedOrder.assignedEditor) {
        setEditorName(selectedOrder.assignedEditor.name);
        setEditorEmail(selectedOrder.assignedEditor.email);
        setEditorPhone(selectedOrder.assignedEditor.phone || "");
        setEditorNotes(selectedOrder.assignedEditor.notes || "");
      } else {
        setEditorName("");
        setEditorEmail("");
        setEditorPhone("");
        setEditorNotes("");
      }
      setIsEditingEditor(false);
      setStatusSuccessMsg(null);
    }
  }, [selectedOrder]);

  // Handle Save Editor
  const handleSaveEditor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSavingEditor(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/orders/video", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          orderId: selectedOrder.id,
          assignedEditor: {
            name: editorName.trim(),
            email: editorEmail.trim(),
            phone: editorPhone.trim(),
            notes: editorNotes.trim(),
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to assign editor.");
      }

      setIsEditingEditor(false);
      await fetchOrders();
      if (data.order) setSelectedOrder(data.order);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save editor");
    } finally {
      setSavingEditor(false);
    }
  };

  // Handle Update Status
  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setSavingStatus(true);
    setStatusSuccessMsg(null);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/orders/video", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          orderId: selectedOrder.id,
          projectStatus: targetStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update project status.");
      }

      setStatusSuccessMsg("Status updated successfully.");
      await fetchOrders();
      if (data.order) setSelectedOrder(data.order);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setSavingStatus(false);
    }
  };

  // Filter Orders
  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(query) ||
      o.customer.fullName.toLowerCase().includes(query) ||
      o.customer.email.toLowerCase().includes(query) ||
      o.customer.mobileNumber.toLowerCase().includes(query) ||
      o.project.serviceName.toLowerCase().includes(query);

    const matchesProject =
      selectedProjectStatus === "all" || o.projectStatus === selectedProjectStatus;

    const matchesPayment =
      selectedPaymentStatus === "all" || o.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesProject && matchesPayment;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.pricing.totalAmount || 0), 0);
  const advanceCollected = orders.reduce(
    (acc, o) =>
      o.paymentStatus === "advance_paid"
        ? acc + (o.pricing.advanceAmount || 0)
        : o.paymentStatus === "fully_paid"
        ? acc + (o.pricing.totalAmount || 0)
        : acc,
    0
  );
  const pendingBalance = orders.reduce(
    (acc, o) =>
      o.paymentStatus === "advance_paid"
        ? acc + (o.pricing.remainingAmount || 0)
        : o.paymentStatus === "unpaid"
        ? acc + (o.pricing.totalAmount || 0)
        : acc,
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white/05 border border-white/10 backdrop-blur-xl">
          <div className="flex items-center justify-between text-[#bba89d] text-xs font-mono mb-1">
            <span>Total Orders</span>
            <Film className="w-4 h-4 text-[#F6DBC0]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F8F4E9]">{orders.length}</div>
          <div className="text-[11px] text-[#bba89d] mt-1">Video editing pipeline</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-mono mb-1">
            <span>50% Advance Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₹{advanceCollected.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-emerald-200/70 mt-1">Verified Razorpay receipts</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-amber-300 text-xs font-mono mb-1">
            <span>Pending Balance</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            ₹{pendingBalance.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-amber-200/70 mt-1">Due upon delivery</div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/20 backdrop-blur-xl">
          <div className="flex items-center justify-between text-purple-300 text-xs font-mono mb-1">
            <span>Pipeline Value</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#F6DBC0]">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-[11px] text-purple-200/70 mt-1">Total contract value</div>
        </div>
      </div>

      {/* Action Bar: Search, Filters & Refresh */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between p-4 rounded-2xl bg-white/05 border border-white/10">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-[#bba89d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order number, client name, mobile or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F8F4E9] placeholder-[#bba89d] focus:outline-none focus:border-[#F6DBC0]"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Project Status Filter */}
          <select
            value={selectedProjectStatus}
            onChange={(e) => setSelectedProjectStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F8F4E9] focus:outline-none focus:border-[#F6DBC0]"
          >
            <option value="all">All Project Statuses</option>
            <option value="pending_payment">Pending Advance</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="awaiting_editor_assignment">Awaiting Editor</option>
            <option value="editing_in_progress">Editing In Progress</option>
            <option value="review_and_revisions">Review & Revisions</option>
            <option value="final_payment_pending">Final Balance Due</option>
            <option value="completed_and_delivered">Delivered & Closed</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F8F4E9] focus:outline-none focus:border-[#F6DBC0]"
          >
            <option value="all">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="advance_paid">50% Advance Paid</option>
            <option value="fully_paid">Fully Paid</option>
            <option value="failed">Failed</option>
          </select>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#F8F4E9] border border-white/15 transition-all cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Orders Table / Cards View */}
      {loading && orders.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#bba89d]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#F6DBC0] mb-2" />
          <span>Loading video editing orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#bba89d] rounded-2xl bg-white/05 border border-white/10">
          <span>No video orders match your search criteria.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredOrders.map((order) => {
            const pStatus = (order.projectStatus as ProjectStatus) || "pending_payment";
            const statusConfig = PROJECT_STATUS_LABELS[pStatus] || PROJECT_STATUS_LABELS.pending_payment;

            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`p-4 rounded-2xl bg-white/05 hover:bg-white/10 border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  selectedOrder?.id === order.id
                    ? "border-[#F6DBC0] shadow-[0_0_20px_rgba(246,219,192,0.15)]"
                    : "border-white/10"
                }`}
              >
                {/* Left: Order Identifier & Customer */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#F8F4E9] bg-white/10 px-2 py-0.5 rounded border border-white/15">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${statusConfig.color}`}
                    >
                      {statusConfig.label}
                    </span>
                    {order.paymentStatus === "unpaid" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>UNPAID</span>
                      </span>
                    )}
                    {order.paymentStatus === "advance_paid" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        50% Advance Paid
                      </span>
                    )}
                    {order.paymentStatus === "fully_paid" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 font-bold">
                        Fully Paid
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-[#F8F4E9]">
                    {order.customer.fullName} •{" "}
                    <span className="text-[#bba89d] font-normal">{order.customer.mobileNumber}</span>
                  </div>

                  <div className="text-[11px] text-[#d8cfc4]">
                    {order.project.serviceName} ({order.project.aspectRatio} • {order.project.approxDuration})
                  </div>
                </div>

                {/* Middle: Assigned Editor & Files */}
                <div className="text-xs text-[#bba89d] space-y-1">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-[#F6DBC0]" />
                    <span>
                      Editor:{" "}
                      <strong className="text-[#F8F4E9]">
                        {order.assignedEditor ? order.assignedEditor.name : "Unassigned"}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <FileCheck2 className="w-3 h-3 text-[#bba89d]" />
                    <span>{order.project.uploadedFiles?.length || 0} file(s) attached</span>
                  </div>
                </div>

                {/* Right: Financials & Action */}
                <div className="flex items-center gap-4 self-end md:self-center">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-[#F8F4E9]">
                      ₹{order.pricing.totalAmount.toLocaleString("en-IN")}
                    </div>
                    <div className="text-[10px] text-[#bba89d] font-mono">
                      Adv: ₹{order.pricing.advanceAmount} | Rem: ₹{order.pricing.remainingAmount}
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#F6DBC0]">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ORDER DETAILS & MANAGEMENT DRAWER/MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[90] flex items-center justify-end p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl h-[95vh] rounded-3xl bg-[#1b0a21] border border-[#F6DBC0]/30 shadow-2xl overflow-y-auto p-6 space-y-6 text-[#F8F4E9]">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-[#F8F4E9]">
                    Order {selectedOrder.orderNumber}
                  </h3>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      PROJECT_STATUS_LABELS[selectedOrder.projectStatus || "pending_payment"].color
                    }`}
                  >
                    {PROJECT_STATUS_LABELS[selectedOrder.projectStatus || "pending_payment"].label}
                  </span>
                  {selectedOrder.paymentStatus === "unpaid" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>UNPAID</span>
                    </span>
                  )}
                  {selectedOrder.paymentStatus === "advance_paid" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      50% ADVANCE PAID
                    </span>
                  )}
                  {selectedOrder.paymentStatus === "fully_paid" && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 font-bold">
                      FULLY PAID
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#bba89d] mt-1">
                  Created {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Unpaid Order Security Banner */}
            {selectedOrder.paymentStatus === "unpaid" && (
              <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs flex items-start gap-2.5 shadow-md">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5">
                    <span>Payment Required (50% Advance Pending)</span>
                  </div>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    This order is logged as unpaid. Advance payment of ₹{selectedOrder.pricing.advanceAmount.toLocaleString("en-IN")} must be verified before editor assignment or advancing into active production.
                  </p>
                </div>
              </div>
            )}

            {/* Customer Contact Quick-Actions */}
            <div className="p-4 rounded-2xl bg-white/05 border border-white/10 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                Customer Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#bba89d] block text-[10px]">Full Name</span>
                  <span className="font-semibold">{selectedOrder.customer.fullName}</span>
                </div>
                <div>
                  <span className="text-[#bba89d] block text-[10px]">Mobile Phone / WhatsApp</span>
                  <span className="font-mono">{selectedOrder.customer.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-[#bba89d] block text-[10px]">Email Address</span>
                  <span className="font-mono">{selectedOrder.customer.email}</span>
                </div>
                <div>
                  <span className="text-[#bba89d] block text-[10px]">Target Delivery Date</span>
                  <span className="font-mono">{selectedOrder.project.deliveryDate}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href={`https://wa.me/${selectedOrder.customer.mobileNumber.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
                <a
                  href={`mailto:${selectedOrder.customer.email}?subject=Regarding Order ${selectedOrder.orderNumber}`}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Client</span>
                </a>
              </div>
            </div>

            {/* Project Specifications */}
            <div className="p-4 rounded-2xl bg-white/05 border border-white/10 space-y-2 text-xs">
              <div className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                Creative Requirements
              </div>
              <div>
                <span className="text-[#bba89d] block text-[10px]">Service & Format</span>
                <span className="font-semibold">
                  {selectedOrder.project.serviceName} • {selectedOrder.project.videoFormat.toUpperCase()} (
                  {selectedOrder.project.aspectRatio}) • ~{selectedOrder.project.approxDuration}
                </span>
              </div>
              <div>
                <span className="text-[#bba89d] block text-[10px]">Instructions</span>
                <p className="bg-black/30 p-2.5 rounded-xl border border-white/10 text-xs leading-relaxed text-[#d8cfc4]">
                  {selectedOrder.project.requirements}
                </p>
              </div>
              {selectedOrder.project.referenceVideoUrl && (
                <div>
                  <span className="text-[#bba89d] block text-[10px]">Reference Link</span>
                  <a
                    href={selectedOrder.project.referenceVideoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#F6DBC0] hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>{selectedOrder.project.referenceVideoUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Uploaded Files */}
              {selectedOrder.project.uploadedFiles && selectedOrder.project.uploadedFiles.length > 0 && (
                <div className="pt-2">
                  <span className="text-[#bba89d] block text-[10px] mb-1">Uploaded Assets</span>
                  <div className="space-y-1">
                    {selectedOrder.project.uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="p-2 rounded-lg bg-black/40 border border-white/10 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="truncate max-w-[300px]">{file.name}</span>
                        <span className="text-[10px] text-[#bba89d]">
                          {(file.size / (1024 * 1024)).toFixed(1)} MB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Lifecycle Status Management (All 7 Statuses) */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 to-black/60 border border-purple-500/30 space-y-3">
              <div className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold flex items-center justify-between">
                <span>Project Lifecycle Pipeline</span>
                <span className="text-[10px] text-[#bba89d]">7-Stage SLA Tracking</span>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] text-[#d8cfc4] block">Update Status:</label>
                {selectedOrder.paymentStatus === "unpaid" && (
                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Pipeline advancement is locked. Verified 50% advance payment is required before advancing project stage.</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value as ProjectStatus)}
                    disabled={selectedOrder.paymentStatus === "unpaid"}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/50 border border-white/20 text-xs text-[#F8F4E9] focus:outline-none focus:border-[#F6DBC0] disabled:opacity-40"
                  >
                    <option value="pending_payment">1. Pending Advance</option>
                    <option value="payment_confirmed" disabled={selectedOrder.paymentStatus === "unpaid"}>
                      2. Payment Confirmed {selectedOrder.paymentStatus === "unpaid" ? "(Locked — Advance Required)" : ""}
                    </option>
                    <option value="awaiting_editor_assignment" disabled={selectedOrder.paymentStatus === "unpaid"}>
                      3. Awaiting Editor Assignment {selectedOrder.paymentStatus === "unpaid" ? "(Locked)" : ""}
                    </option>
                    <option value="editing_in_progress" disabled={selectedOrder.paymentStatus === "unpaid"}>
                      4. Editing In Progress {selectedOrder.paymentStatus === "unpaid" ? "(Locked)" : ""}
                    </option>
                    <option value="review_and_revisions" disabled={selectedOrder.paymentStatus === "unpaid"}>
                      5. Review & Revisions {selectedOrder.paymentStatus === "unpaid" ? "(Locked)" : ""}
                    </option>
                    <option value="final_payment_pending" disabled={selectedOrder.paymentStatus === "unpaid"}>
                      6. Final Balance Due {selectedOrder.paymentStatus === "unpaid" ? "(Locked)" : ""}
                    </option>
                    <option value="completed_and_delivered" disabled={selectedOrder.paymentStatus !== "fully_paid"}>
                      7. Completed & Delivered {selectedOrder.paymentStatus !== "fully_paid" ? "(Locked — 100% Full Payment Required)" : ""}
                    </option>
                  </select>

                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    disabled={
                      savingStatus ||
                      targetStatus === selectedOrder.projectStatus ||
                      (selectedOrder.paymentStatus === "unpaid" && targetStatus !== "pending_payment") ||
                      (targetStatus === "completed_and_delivered" && selectedOrder.paymentStatus !== "fully_paid")
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F8F4E9] to-[#F6DBC0] text-[#180D1D] font-bold text-xs shadow-md disabled:opacity-40 cursor-pointer"
                  >
                    {savingStatus ? "Saving..." : "Update Stage"}
                  </button>
                </div>

                {statusSuccessMsg && (
                  <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{statusSuccessMsg}</span>
                  </p>
                )}

                <p className="text-[11px] text-[#bba89d] italic">
                  {PROJECT_STATUS_LABELS[targetStatus]?.desc}
                </p>
              </div>
            </div>

            {/* Assigned Editor Management */}
            <div className="p-4 rounded-2xl bg-white/05 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                  Assigned Editor
                </span>
                {selectedOrder.paymentStatus !== "unpaid" && (
                  <button
                    type="button"
                    onClick={() => setIsEditingEditor(!isEditingEditor)}
                    className="text-xs text-[#F6DBC0] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>{isEditingEditor ? "Cancel" : "Assign / Reassign"}</span>
                  </button>
                )}
              </div>

              {selectedOrder.paymentStatus === "unpaid" ? (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Editor assignment is locked until 50% advance payment is received and verified.</span>
                </div>
              ) : isEditingEditor ? (
                <form onSubmit={handleSaveEditor} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#bba89d] block mb-1">Editor Name</label>
                      <input
                        type="text"
                        value={editorName}
                        onChange={(e) => setEditorName(e.target.value)}
                        required
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#bba89d] block mb-1">Editor Email</label>
                      <input
                        type="email"
                        value={editorEmail}
                        onChange={(e) => setEditorEmail(e.target.value)}
                        placeholder="editor@imdad.builds"
                        className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#bba89d] block mb-1">Editor Notes / Directives</label>
                    <textarea
                      value={editorNotes}
                      onChange={(e) => setEditorNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Focus on fast pacing and UGC style cuts."
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={savingEditor}
                    className="py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
                  >
                    {savingEditor ? "Assigning..." : "Save Editor Assignment"}
                  </button>
                </form>
              ) : selectedOrder.assignedEditor ? (
                <div className="p-3 rounded-xl bg-black/30 border border-white/10 space-y-1 text-xs">
                  <div className="font-semibold text-[#F8F4E9]">
                    {selectedOrder.assignedEditor.name}
                  </div>
                  {selectedOrder.assignedEditor.email && (
                    <div className="text-[11px] text-[#bba89d] font-mono">
                      {selectedOrder.assignedEditor.email}
                    </div>
                  )}
                  {selectedOrder.assignedEditor.notes && (
                    <div className="text-[11px] text-[#d8cfc4] italic pt-1">
                      Notes: {selectedOrder.assignedEditor.notes}
                    </div>
                  )}
                  <div className="text-[10px] text-[#bba89d] pt-1 font-mono">
                    Assigned: {new Date(selectedOrder.assignedEditor.assignedAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#bba89d] italic">
                  No editor assigned yet. Click "Assign / Reassign" above to allocate this order.
                </p>
              )}
            </div>

            {/* Remaining Balance Collection Action Card */}
            {selectedOrder.paymentStatus === "advance_paid" && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-purple-950/40 to-black/60 border border-amber-500/40 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-[#F8F4E9]">
                      Remaining Balance Pending (50% Completion)
                    </span>
                  </div>
                  <span className="font-mono text-base font-black text-amber-300">
                    ₹{selectedOrder.pricing.remainingAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                <p className="text-[11px] text-[#d8cfc4]">
                  Advance payment received. When the final cut is approved, collect the remaining balance before releasing watermark-free master files.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent("imdad:initiate-video-payment", {
                          detail: {
                            order: selectedOrder,
                            paymentType: "remaining",
                          },
                        })
                      );
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay Remaining ₹{selectedOrder.pricing.remainingAmount.toLocaleString("en-IN")} (Razorpay)</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(
                      `Hi ${selectedOrder.customer.fullName}! Your video project for ${selectedOrder.project.serviceName} (${selectedOrder.orderNumber}) is approved and ready for final watermark-free delivery.\n` +
                        `• Remaining Balance: ₹${selectedOrder.pricing.remainingAmount}\n` +
                        `Please let us know once you are ready to complete the final payment!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Balance Notice</span>
                  </a>
                </div>
              </div>
            )}

            {/* Payment History Audit Table */}
            <div className="p-4 rounded-2xl bg-white/05 border border-white/10 space-y-3 text-xs">
              <div className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold flex items-center justify-between">
                <span>Payment History Audit</span>
                <span className="text-[10px] text-[#bba89d]">
                  Status: {selectedOrder.paymentStatus.toUpperCase()}
                </span>
              </div>

              {selectedOrder.payments && selectedOrder.payments.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.payments.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1 font-mono text-[11px]"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#F8F4E9] uppercase">
                          {p.paymentType} Payment: ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                        <span className="text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                          {p.status}
                        </span>
                      </div>
                      <div className="text-[#bba89d] text-[10px]">
                        Payment ID: {p.razorpayPaymentId}
                      </div>
                      <div className="text-[#bba89d] text-[10px]">
                        Order ID: {p.razorpayOrderId}
                      </div>
                      <div className="text-[#bba89d] text-[10px]">
                        Captured: {new Date(p.capturedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#bba89d] italic text-xs">No payments recorded yet.</p>
              )}
            </div>

            {/* Notification Logs */}
            <div className="p-4 rounded-2xl bg-white/05 border border-white/10 space-y-3 text-xs">
              <div className="text-xs font-mono uppercase tracking-wider text-[#F6DBC0] font-bold">
                Notification History
              </div>
              {selectedOrder.notifications && selectedOrder.notifications.length > 0 ? (
                <div className="space-y-1.5 font-mono text-[10px]">
                  {selectedOrder.notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2 rounded-lg bg-black/30 border border-white/05 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[#F8F4E9] font-bold uppercase">{n.type}</span> •{" "}
                        <span className="text-[#bba89d]">{n.recipient}</span>
                      </div>
                      <span className="text-[#F6DBC0]">{n.status}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#bba89d] italic text-xs">No notification logs recorded.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
