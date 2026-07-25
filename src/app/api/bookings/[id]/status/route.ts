import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/infra/auth/jwt";
import { PostgresBookingRepository } from "@/infra/repositories/PostgresBookingRepository";
import { BookingStatusService } from "@/domain/services/BookingStatusService";
import { BookingStatus } from "@/domain/entities/Booking";
import { AppointmentReadyForPickupEvent } from "@/domain/events/AppointmentReadyForPickupEvent";
import { cookies } from "next/headers";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Auth & Tenant validation
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
    const token = cookieStore.get(cookieName)?.value;
    
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const payload = await verifyJwt(token);
    if (!payload || !payload.sub || !payload.tenantId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    
    const tenantId = payload.tenantId;
    const userId = payload.sub;

    const { status, adminOverride, notes } = body;
    if (!status) {
      return NextResponse.json({ success: false, error: "Status is required" }, { status: 400 });
    }

    const bookingRepo = new PostgresBookingRepository();
    const booking = await bookingRepo.findById(tenantId, id);
    
    if (!booking) {
      return NextResponse.json({ success: false, error: "Booking not found" }, { status: 404 });
    }

    const currentStatus = booking.status as BookingStatus;
    const nextStatus = status as BookingStatus;

    if (!BookingStatusService.canTransition(currentStatus, nextStatus, adminOverride)) {
      return NextResponse.json(
        { success: false, error: `Invalid transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 }
      );
    }

    // Update with history in transaction
    const updatedBooking = await bookingRepo.updateStatusWithHistory(
      tenantId,
      id,
      nextStatus,
      currentStatus,
      userId,
      adminOverride || false,
      notes || null
    );

    if (!updatedBooking) {
      return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
    }

    // Dispatch event if ready for pickup
    if (nextStatus === 'READY_FOR_PICKUP') {
      AppointmentReadyForPickupEvent.dispatch({
        appointmentId: id,
        organizationId: tenantId,
        customerId: updatedBooking.customerId,
        petId: updatedBooking.petId,
        changedAt: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error("Error updating booking status:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
