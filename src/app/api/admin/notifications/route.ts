import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import pool from '../../../../infra/database/pool';

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (!body.customerId || !body.subscriptionId || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO notifications_queue (tenant_id, customer_id, subscription_id, type, message_payload)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, body.customerId, body.subscriptionId, body.type, body.messagePayload || {}]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
