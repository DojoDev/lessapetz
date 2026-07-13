import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { PostgresServiceRepository } from '../../../../../infra/repositories/PostgresServiceRepository';

const serviceRepo = new PostgresServiceRepository();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.displayOrder !== undefined) updateData.displayOrder = body.displayOrder;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    const category = await serviceRepo.updateCategory(tenantId, id, updateData);
    if (!category) return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Categoria já existe' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const headersList = await headers();
    const tenantId = headersList.get('x-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const deleted = await serviceRepo.deleteCategory(tenantId, id);
    if (!deleted) return NextResponse.json({ error: 'Categoria não encontrada' }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
