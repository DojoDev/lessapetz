import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PostgresCatalogPlanRepository } from '../../../../infra/repositories/PostgresCatalogPlanRepository';

import { verifyJwt } from '../../../../infra/auth/jwt';

const planRepo = new PostgresCatalogPlanRepository();

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const plans = await planRepo.findAll(tenantId);
    return NextResponse.json(plans);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (body.monthlyPrice === undefined || isNaN(Number(body.monthlyPrice)) || Number(body.monthlyPrice) < 0) {
      return NextResponse.json({ error: 'Preço mensal inválido' }, { status: 400 });
    }

    const plan = await planRepo.create(tenantId, {
      name: body.name.trim(),
      description: body.description?.trim() || null,
      monthlyPrice: Number(body.monthlyPrice),
      imageUrl: body.imageUrl || null,
      isActive: body.isActive ?? true,
      displayOrder: body.displayOrder ?? 0,
      quota: Number(body.quota) || 0,
      cycleLengthDays: Number(body.cycleLengthDays) || 30,
    });

    // Set included services if provided
    if (Array.isArray(body.includedServiceIds) && body.includedServiceIds.length > 0) {
      await planRepo.setIncludedServices(plan.id, body.includedServiceIds);
      plan.includedServiceIds = body.includedServiceIds;
    }

    return NextResponse.json(plan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
