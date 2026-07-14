import { NextRequest, NextResponse } from 'next/server';
import { PostgresServiceRepository } from '../../../../infra/repositories/PostgresServiceRepository';

import { verifyJwt } from '../../../../infra/auth/jwt';

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}


const serviceRepo = new PostgresServiceRepository();

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [services, categories] = await Promise.all([
      serviceRepo.findAll(tenantId),
      serviceRepo.findAllCategories(tenantId),
    ]);

    // Enrich services with category name
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    const enriched = services.map(s => ({
      ...s,
      categoryName: s.categoryId ? categoryMap.get(s.categoryId) ?? null : null,
    }));

    return NextResponse.json(enriched);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    // Validation
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
    }
    if (body.basePrice === undefined || isNaN(Number(body.basePrice)) || Number(body.basePrice) < 0) {
      return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
    }
    if (body.baseDurationMin === undefined || isNaN(Number(body.baseDurationMin)) || Number(body.baseDurationMin) < 0) {
      return NextResponse.json({ error: 'Duração inválida' }, { status: 400 });
    }

    const service = await serviceRepo.create(tenantId, {
      categoryId: body.categoryId || null,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      baseDurationMin: Number(body.baseDurationMin),
      basePrice: Number(body.basePrice),
      imageUrl: body.imageUrl || null,
      isStartingPrice: body.isStartingPrice ?? false,
      petSizeApplicability: body.petSizeApplicability || 'all',
      displayOrder: body.displayOrder ?? 0,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
