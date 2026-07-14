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

    const categories = await serviceRepo.findAllCategories(tenantId);
    return NextResponse.json(categories);
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

    const category = await serviceRepo.createCategory(
      tenantId,
      body.name.trim(),
      body.displayOrder ?? 0
    );
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
