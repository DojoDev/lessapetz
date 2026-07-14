import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '../../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../../infra/repositories/PostgresAdminRepository';
import { PostgresProductRepository } from '../../../../../infra/repositories/PostgresProductRepository';

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
    const product = await productRepo.findById(adminData.tenantId, id);
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('GET /api/admin/products/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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
    const productRepo = new PostgresProductRepository();
    
    const updatedProduct = await productRepo.update(adminData.tenantId, id, {
      name: body.name,
      sku: body.sku,
      category: body.category,
      brand: body.brand,
      unitOfMeasure: body.unitOfMeasure,
      costPrice: body.costPrice !== undefined ? Number(body.costPrice) : undefined,
      salePrice: body.salePrice !== undefined ? Number(body.salePrice) : undefined,
      description: body.description,
      imageUrl: body.imageUrl,
      isRetail: body.isRetail,
      isInternal: body.isInternal,
      minStockThreshold: body.minStockThreshold !== undefined ? Number(body.minStockThreshold) : undefined,
      isActive: body.isActive,
    });

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    console.error('PUT /api/admin/products/[id] error:', error);
    if (error.code === '23505') {
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
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
    const success = await productRepo.delete(adminData.tenantId, id);

    if (!success) {
      return NextResponse.json({ error: 'Product not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('DELETE /api/admin/products/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
