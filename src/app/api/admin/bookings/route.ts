import { NextRequest, NextResponse } from 'next/server';
import { PostgresBookingRepository } from '../../../../infra/repositories/PostgresBookingRepository';
import { PostgresCustomerPlanRepository } from '../../../../infra/repositories/PostgresCustomerPlanRepository';
import { verifyJwt } from '../../../../infra/auth/jwt';

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

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    
    // Check if covered by plan
    let paymentStatus = body.paymentStatus || 'pending';
    let totalPrice = body.totalPrice || 0;

    if (body.usePlan) {
      const activePlans = await planRepo.findActiveByPetId(tenantId, body.petId);
      if (activePlans.length > 0) {
        paymentStatus = 'covered_by_plan';
        totalPrice = 0;
      }
    }

    const booking = await bookingRepo.create(tenantId, {
      customerId: body.customerId,
      petId: body.petId,
      serviceId: body.serviceId,
      employeeId: null, // Could be assigned later
      startAt: new Date(body.startAt),
      endAt: new Date(new Date(body.startAt).getTime() + (body.durationMin || 60) * 60000),
      durationMin: body.durationMin || 60,
      totalPrice: totalPrice,
      status: 'confirmed',
      notes: body.notes || null,
      paymentMethod: body.paymentMethod || null,
      paymentStatus: paymentStatus,
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
