import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PostgresCustomerPlanRepository } from '../../../../../infra/repositories/PostgresCustomerPlanRepository';

const repo = new PostgresCustomerPlanRepository();

export async function GET() {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const alerts = await repo.findAtRiskSubscriptions(tenantId);
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
