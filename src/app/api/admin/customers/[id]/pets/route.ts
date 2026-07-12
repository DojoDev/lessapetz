import { NextRequest, NextResponse } from 'next/server';
import { PostgresPetRepository } from '../../../../../../infra/repositories/PostgresPetRepository';
import { verifyJwt } from '../../../../../../infra/auth/jwt';

const petRepo = new PostgresPetRepository();

async function getTenantId(req: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = req.cookies.get(cookieName)?.value;
  if (!token) return null;
  const payload = await verifyJwt(token);
  return payload?.tenantId || null;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const tenantId = await getTenantId(req);
    if (!tenantId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const resolvedParams = await params;
    const customerId = resolvedParams.id;
    const body = await req.json();
    
    const pet = await petRepo.create(tenantId, {
      customerId,
      name: body.name,
      species: body.species || 'dog',
      breed: body.breed || null,
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      weight: body.weight ? parseFloat(body.weight) : null,
      sizeCategory: body.sizeCategory || 'small',
      coatType: body.coatType || null,
      behavior: body.behavior || null,
      healthNotes: body.healthNotes || null,
      photoUrl: body.photoUrl || null,
    });

    return NextResponse.json(pet, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
