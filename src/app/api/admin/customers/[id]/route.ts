import { NextRequest, NextResponse } from 'next/server';
import { PostgresCustomerRepository } from '../../../../../infra/repositories/PostgresCustomerRepository';
import { PostgresPetRepository } from '../../../../../infra/repositories/PostgresPetRepository';
import { PostgresCustomerPlanRepository } from '../../../../../infra/repositories/PostgresCustomerPlanRepository';
import { verifyJwt } from '../../../../../infra/auth/jwt';

const customerRepo = new PostgresCustomerRepository();
const petRepo = new PostgresPetRepository();
const planRepo = new PostgresCustomerPlanRepository();

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const customer = await customerRepo.findById(tenantId, resolvedParams.id);
    if (!customer) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const pets = await petRepo.findByCustomerId(tenantId, customer.id);
    const plans = await planRepo.findByCustomerId(tenantId, customer.id);

    return NextResponse.json({ ...customer, pets, plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
