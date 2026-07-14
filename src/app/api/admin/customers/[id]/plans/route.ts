import { NextRequest, NextResponse } from 'next/server';
import { PostgresCustomerPlanRepository } from '../../../../../../infra/repositories/PostgresCustomerPlanRepository';
import { verifyJwt } from '../../../../../../infra/auth/jwt';

const planRepo = new PostgresCustomerPlanRepository();

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const customerId = resolvedParams.id;
    const body = await req.json();
    
    // Default valid until 30 days from now
    const validUntil = body.validUntil ? new Date(body.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const plan = await planRepo.create(tenantId, {
      customerId,
      petId: body.petId || null,
      catalogPlanId: body.catalogPlanId || null,
      planName: body.planName,
      validUntil,
      status: 'active',
      cycleStartDate: new Date(),
      cycleEndDate: validUntil,
      totalQuota: body.totalQuota || 0,
      usesConsumed: 0,
    });

    return NextResponse.json(plan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
