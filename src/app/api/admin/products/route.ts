import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';
import { PostgresProductRepository } from '../../../../infra/repositories/PostgresProductRepository';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminRepo = new PostgresAdminRepository();
    const adminData = await adminRepo.findById(payload.sub);
    if (!adminData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const productRepo = new PostgresProductRepository();
    
    // Parse query params (e.g. ?category=hygiene)
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let products;
    if (category) {
      products = await productRepo.findByCategory(adminData.tenantId, category);
    } else {
      products = await productRepo.findAll(adminData.tenantId);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error('GET /api/admin/products error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.NODE_ENV === 'production' ? '__Host-admin_session' : 'admin_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJwt(token);
    if (!payload || !payload.sub) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminRepo = new PostgresAdminRepository();
    const adminData = await adminRepo.findById(payload.sub);
    if (!adminData) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const productRepo = new PostgresProductRepository();
    
    const newProduct = await productRepo.create(adminData.tenantId, {
      name: body.name,
      sku: body.sku || null,
      category: body.category || null,
      brand: body.brand || null,
      unitOfMeasure: body.unitOfMeasure || null,
      costPrice: Number(body.costPrice) || 0,
      salePrice: Number(body.salePrice) || 0,
      description: body.description || null,
      imageUrl: body.imageUrl || null,
      isRetail: body.isRetail !== undefined ? body.isRetail : true,
      isInternal: body.isInternal !== undefined ? body.isInternal : false,
      minStockThreshold: Number(body.minStockThreshold) || 0,
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/admin/products error:', error);
    if (error.code === '23505') { // Unique constraint violation (e.g. SKU)
      return NextResponse.json({ error: 'SKU already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
