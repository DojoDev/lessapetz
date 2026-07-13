import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PostgresServiceRepository } from '../../../../../infra/repositories/PostgresServiceRepository';

const serviceRepo = new PostgresServiceRepository();

export async function PUT(request: NextRequest) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
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
