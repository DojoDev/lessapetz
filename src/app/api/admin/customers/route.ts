import { NextRequest, NextResponse } from 'next/server';
import { PostgresCustomerRepository } from '../../../../infra/repositories/PostgresCustomerRepository';
import { PostgresPetRepository } from '../../../../infra/repositories/PostgresPetRepository';
import { PostgresCustomerPlanRepository } from '../../../../infra/repositories/PostgresCustomerPlanRepository';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { Customer } from '../../../../domain/entities/Customer';

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

export async function GET(req: NextRequest) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const customers = await customerRepo.findAll(tenantId);
    
    // Fetch pets and plans for each customer to return a rich list
    const enrichedCustomers = await Promise.all(
      customers.map(async (c: Customer) => {
        const pets = await petRepo.findByCustomerId(tenantId, c.id);
        const plans = await planRepo.findByCustomerId(tenantId, c.id);
        return { ...c, pets, plans };
      })
    );

    return NextResponse.json(enrichedCustomers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const customer = await customerRepo.create(tenantId, {
      fullName: body.fullName,
      cpf: body.cpf || null,
      phone: body.phone,
      email: body.email || null,
      address: body.address || null,
      zipCode: body.zipCode || null,
      street: body.street || null,
      number: body.number || null,
      neighborhood: body.neighborhood || null,
      city: body.city || null,
      passwordHash: null,
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
