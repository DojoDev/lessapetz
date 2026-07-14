import { NextRequest, NextResponse } from 'next/server';
import { PostgresCatalogPlanRepository } from '../../../../../infra/repositories/PostgresCatalogPlanRepository';
import pool from '../../../../../infra/database/pool';

import { verifyJwt } from '../../../../../infra/auth/jwt';

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}


const planRepo = new PostgresCatalogPlanRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const plan = await planRepo.findById(tenantId, id);
    if (!plan) return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }
    if (body.monthlyPrice !== undefined && (isNaN(Number(body.monthlyPrice)) || Number(body.monthlyPrice) < 0)) {
      return NextResponse.json({ error: 'Preço mensal inválido' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.monthlyPrice !== undefined) updateData.monthlyPrice = Number(body.monthlyPrice);
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.quota !== undefined) updateData.quota = Number(body.quota) || 0;
    if (body.cycleLengthDays !== undefined) updateData.cycleLengthDays = Number(body.cycleLengthDays) || 30;

    const plan = await planRepo.update(tenantId, id, updateData);
    if (!plan) return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });

    // Update included services if provided
    if (Array.isArray(body.includedServiceIds)) {
      await planRepo.setIncludedServices(plan.id, body.includedServiceIds);
      plan.includedServiceIds = body.includedServiceIds;
    }

    return NextResponse.json(plan);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    // Check for active customer subscriptions referencing this plan
    const activeSubsRes = await pool.query(
      `SELECT COUNT(*)::int AS count FROM customer_plans 
       WHERE catalog_plan_id = $1 AND status = 'active'`,
      [id]
    );
    if (activeSubsRes.rows[0].count > 0) {
      return NextResponse.json(
        { error: `Não é possível excluir: ${activeSubsRes.rows[0].count} assinatura(s) ativa(s) referencia(m) este plano.` },
        { status: 409 }
      );
    }

    const deleted = await planRepo.delete(tenantId, id);
    if (!deleted) return NextResponse.json({ error: 'Plano não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
