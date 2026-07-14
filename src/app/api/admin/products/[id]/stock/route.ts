import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '../../../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../../../infra/repositories/PostgresAdminRepository';
import { PostgresProductRepository } from '../../../../../../infra/repositories/PostgresProductRepository';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await Promise.resolve(params);
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminRepo = new PostgresAdminRepository();
    const adminData = await adminRepo.findById(payload.sub);
    if (!adminData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const productRepo = new PostgresProductRepository();
    const movements = await productRepo.getStockMovements(adminData.tenantId, id);
    
    return NextResponse.json(movements);
  } catch (error) {
    console.error('GET /api/admin/products/[id]/stock error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await Promise.resolve(params);
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminRepo = new PostgresAdminRepository();
    const adminData = await adminRepo.findById(payload.sub);
    if (!adminData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    if (!body.type || !body.quantity) {
      return NextResponse.json({ error: 'Type and quantity are required' }, { status: 400 });
    }

    const productRepo = new PostgresProductRepository();
    
    const newMovement = await productRepo.addStockMovement(adminData.tenantId, {
      productId: id,
      type: body.type,
      quantity: Number(body.quantity), // Should be positive for entry, negative for exits/sales/losses
      userId: payload.sub,
      notes: body.notes || null,
    });

    // TODO: Low Stock Alert Check (can hook into NotificationQueue here if we want real-time, 
    // or we can run a cron job or just check it on the dashboard).

    return NextResponse.json(newMovement, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/products/[id]/stock error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
