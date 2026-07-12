import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { signJwt } from '../../../../../infra/auth/jwt';
import { PostgresCustomerRepository } from '../../../../../infra/repositories/PostgresCustomerRepository';
import { PostgresTenantRepository } from '../../../../../infra/repositories/PostgresTenantRepository';

const customerRepo = new PostgresCustomerRepository();
const tenantRepo = new PostgresTenantRepository();

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, address, tenantSlug } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    // Resolve tenant
    const slug = tenantSlug || 'lessapetz';
    const tenant = await tenantRepo.findBySlug(slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Invalid business' }, { status: 400 });
    }

    // Check if customer already exists
    const existing = await customerRepo.findByEmail(tenant.id, email);
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create customer
    const customer = await customerRepo.create(tenant.id, {
      fullName,
      cpf: null,
      phone: phone || null,
      email,
      address: address || null,
      zipCode: null,
      street: null,
      number: null,
      neighborhood: null,
      city: null,
      passwordHash,
    });

    // Sign JWT
    const token = await signJwt({
      sub: customer.id,
      email: customer.email!,
      tenantId: tenant.id,
      role: 'customer',
    });

    const response = NextResponse.json({ success: true, customerId: customer.id });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction ? '__Host-customer_session' : 'customer_session';

    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
