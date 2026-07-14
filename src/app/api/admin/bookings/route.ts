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
    let customerPlanId = null;

    if (body.usePlan) {
      // Validate that a plan covering this specific service exists
      const matchingPlans = await planRepo.findActiveByPetIdAndService(tenantId, body.petId, body.serviceId);
      const targetPlan = body.customerPlanId 
        ? matchingPlans.find(p => p.id === body.customerPlanId) 
        : matchingPlans[0];

      if (!targetPlan) {
        return NextResponse.json({ error: 'Nenhum plano ativo cobre este serviço, ou quota já esgotada' }, { status: 400 });
      }

      // Race-safe quota consumption
      const consumed = await planRepo.consumeQuota(targetPlan.id);
      if (!consumed) {
        return NextResponse.json({ error: 'Quota do plano já esgotada (tentativa concorrente)' }, { status: 409 });
      }

      paymentStatus = 'covered_by_plan';
      totalPrice = 0;
      customerPlanId = targetPlan.id;
    }

    const booking = await bookingRepo.create(tenantId, {
      customerId: body.customerId,
      petId: body.petId,
      serviceId: body.serviceId,
      customerPlanId: customerPlanId,
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
