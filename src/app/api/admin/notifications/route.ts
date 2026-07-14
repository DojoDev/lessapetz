import { NextRequest, NextResponse } from 'next/server';
import { verifyJwt } from '../../../../infra/auth/jwt';
import pool from '../../../../infra/database/pool';

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId(request);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    if (!body.customerId || !body.subscriptionId || !body.type) {
      return NextResponse.json({ error: 'Missing required fields: customerId, subscriptionId, type' }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO notifications_queue (tenant_id, customer_id, subscription_id, type, message_payload)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [tenantId, body.customerId, body.subscriptionId, body.type, JSON.stringify(body.messagePayload || {})]
    );

    return NextResponse.json(res.rows[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
