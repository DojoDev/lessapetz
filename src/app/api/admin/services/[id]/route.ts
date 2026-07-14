import { NextRequest, NextResponse } from 'next/server';
import { PostgresServiceRepository } from '../../../../../infra/repositories/PostgresServiceRepository';

import { verifyJwt } from '../../../../../infra/auth/jwt';

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}


const serviceRepo = new PostgresServiceRepository();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const service = await serviceRepo.findById(tenantId, id);
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });

    return NextResponse.json(service);
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

    // Validation
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      return NextResponse.json({ error: 'Nome inválido' }, { status: 400 });
    }
    if (body.basePrice !== undefined && (isNaN(Number(body.basePrice)) || Number(body.basePrice) < 0)) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId || null;
    if (body.baseDurationMin !== undefined) updateData.baseDurationMin = Number(body.baseDurationMin);
    if (body.basePrice !== undefined) updateData.basePrice = Number(body.basePrice);
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl || null;
    if (body.isStartingPrice !== undefined) updateData.isStartingPrice = body.isStartingPrice;
    if (body.petSizeApplicability !== undefined) updateData.petSizeApplicability = body.petSizeApplicability;
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const service = await serviceRepo.update(tenantId, id, updateData);
    if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });

    return NextResponse.json(service);
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
    const deleted = await serviceRepo.delete(tenantId, id);
    if (!deleted) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
