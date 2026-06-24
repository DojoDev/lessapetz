import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { signJwt } from '../../../../../infra/auth/jwt';
import { PostgresCustomerRepository } from '../../../../../infra/repositories/PostgresCustomerRepository';
import { PostgresTenantRepository } from '../../../../../infra/repositories/PostgresTenantRepository';

const customerRepo = new PostgresCustomerRepository();
const tenantRepo = new PostgresTenantRepository();

export async function POST(request: Request) {
  try {
    const { email, password, tenantSlug } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Resolve tenant
    const slug = tenantSlug || 'lessapetz';
    const tenant = await tenantRepo.findBySlug(slug);
    if (!tenant) {
      return NextResponse.json({ error: 'Invalid business' }, { status: 400 });
    }

    const customer = await customerRepo.findByEmail(tenant.id, email);
    if (!customer || !customer.passwordHash) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signJwt({
      sub: customer.id,
      email: customer.email!,
      tenantId: tenant.id,
      role: 'customer',
    });

    const response = NextResponse.json({ success: true });

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
