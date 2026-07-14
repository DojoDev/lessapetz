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

export async function PUT(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!Array.isArray(body.orderedIds) || body.orderedIds.length === 0) {
      return NextResponse.json({ error: 'orderedIds deve ser um array não vazio' }, { status: 400 });
    }

    await serviceRepo.reorder(tenantId, body.orderedIds);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
