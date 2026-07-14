import { NextRequest, NextResponse } from 'next/server';
import { PostgresBookingRepository } from '../../../../../infra/repositories/PostgresBookingRepository';
import { PostgresCustomerPlanRepository } from '../../../../../infra/repositories/PostgresCustomerPlanRepository';
import { verifyJwt } from '../../../../../infra/auth/jwt';

const bookingRepo = new PostgresBookingRepository();
const planRepo = new PostgresCustomerPlanRepository();

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const booking = await bookingRepo.findById(tenantId, id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    // If cancelling, refund quota on the linked plan
    if (body.status === 'cancelled') {
      const existing = await bookingRepo.findById(tenantId, id);
      if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

      if (existing.customerPlanId && existing.status !== 'cancelled') {
        await planRepo.refundQuota(existing.customerPlanId);
      }
    }

    const booking = await bookingRepo.updateStatus(tenantId, id, body.status);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Refund quota before cancelling
    const existing = await bookingRepo.findById(tenantId, id);
    if (!existing) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    if (existing.customerPlanId && existing.status !== 'cancelled') {
      await planRepo.refundQuota(existing.customerPlanId);
    }

    const booking = await bookingRepo.cancel(tenantId, id);
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 });

    return NextResponse.json(booking);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
