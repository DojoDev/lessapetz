import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PostgresServiceRepository } from '../../../../infra/repositories/PostgresServiceRepository';

const serviceRepo = new PostgresServiceRepository();

export async function GET() {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const categories = await serviceRepo.findAllCategories(tenantId);
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
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
