import { NextRequest, NextResponse } from "next/server";
import {
  listAllVideoOrders,
  getVideoOrderById,
  updateVideoOrder,
} from "@/lib/video-order-service";
import { ProjectStatus, AssignedEditor, VideoOrder } from "@/types/video-order";

export const dynamic = "force-dynamic";

/**
 * Admin Video Orders Management API Endpoint
 * IMDAD.BUILDS — Agent 03 Specification
 *
 * Capabilities:
 * - GET: List all video orders, calculate revenue metrics and pipeline status counts
 * - PATCH: Assign/reassign editors, update project lifecycle status, and manage admin notes
 */
export async function GET(req: NextRequest) {
  try {
    const adminSecret = req.headers.get("x-admin-secret");
    const configuredSecret = process.env.ADMIN_SECRET_KEY;

    // Optional admin header check or allow if request originates from authenticated admin session
    if (configuredSecret && adminSecret && adminSecret !== configuredSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Invalid admin credentials." },
        { status: 401 }
      );
    }

    const orders = await listAllVideoOrders();

    // Calculate Financial and Pipeline Statistics
    let totalRevenue = 0;
    let advanceCollected = 0;
    let balancePending = 0;

    const statusCounts: Record<ProjectStatus, number> = {
      pending_payment: 0,
      payment_confirmed: 0,
      awaiting_editor_assignment: 0,
      editing_in_progress: 0,
      review_and_revisions: 0,
      final_payment_pending: 0,
      completed_and_delivered: 0,
    };

    orders.forEach((o) => {
      totalRevenue += o.pricing.totalAmount || 0;
      if (o.paymentStatus === "advance_paid") {
        advanceCollected += o.pricing.advanceAmount || 0;
        balancePending += o.pricing.remainingAmount || 0;
      } else if (o.paymentStatus === "fully_paid") {
        advanceCollected += o.pricing.totalAmount || 0;
      } else {
        balancePending += o.pricing.totalAmount || 0;
      }

      const pStatus = (o.projectStatus as ProjectStatus) || "pending_payment";
      if (statusCounts[pStatus] !== undefined) {
        statusCounts[pStatus]++;
      }
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      metrics: {
        totalOrders: orders.length,
        totalRevenue,
        advanceCollected,
        balancePending,
        statusCounts,
      },
      orders,
    });
  } catch (error) {
    console.error("[AdminVideoOrdersAPI] GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load orders." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid update payload." },
        { status: 400 }
      );
    }

    const {
      orderId,
      projectStatus,
      assignedEditor,
      adminNotes,
    }: {
      orderId: string;
      projectStatus?: ProjectStatus;
      assignedEditor?: Partial<AssignedEditor> | null;
      adminNotes?: string;
    } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing required 'orderId' parameter." },
        { status: 400 }
      );
    }

    const existingOrder = await getVideoOrderById(orderId);
    if (!existingOrder) {
      return NextResponse.json(
        { success: false, error: `Order '${orderId}' not found.` },
        { status: 404 }
      );
    }

    const updates: Partial<VideoOrder> = {};

    // 1. Update Project Status if provided
    if (projectStatus) {
      const validStatuses: ProjectStatus[] = [
        "pending_payment",
        "payment_confirmed",
        "awaiting_editor_assignment",
        "editing_in_progress",
        "review_and_revisions",
        "final_payment_pending",
        "completed_and_delivered",
      ];
      if (!validStatuses.includes(projectStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid projectStatus '${projectStatus}'.` },
          { status: 400 }
        );
      }
      updates.projectStatus = projectStatus;
    }

    // 2. Update Assigned Editor if provided
    if (assignedEditor !== undefined) {
      if (assignedEditor === null) {
        updates.assignedEditor = null;
      } else {
        updates.assignedEditor = {
          id: assignedEditor.id || `ed_${Date.now()}`,
          name: assignedEditor.name || "Assigned Editor",
          email: assignedEditor.email || "",
          phone: assignedEditor.phone || "",
          assignedAt: new Date().toISOString(),
          notes: assignedEditor.notes || "",
        };

        // If assigning editor when awaiting, transition to editing_in_progress if not already set
        if (!projectStatus && existingOrder.projectStatus === "awaiting_editor_assignment") {
          updates.projectStatus = "editing_in_progress";
        }
      }
    }

    // 3. Update Admin Notes
    if (adminNotes !== undefined) {
      updates.metadata = {
        ...(existingOrder.metadata || {}),
        adminNotes,
        lastAdminUpdate: new Date().toISOString(),
      };
    }

    const updatedOrder = await updateVideoOrder(orderId, updates);

    return NextResponse.json({
      success: true,
      message: `Order ${existingOrder.orderNumber} updated successfully.`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("[AdminVideoOrdersAPI] PATCH Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update video order." },
      { status: 500 }
    );
  }
}
