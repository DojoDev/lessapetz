import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { signJwt } from '../../../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../../../infra/repositories/PostgresAdminRepository';

const adminRepo = new PostgresAdminRepository();

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const admin = await adminRepo.findByEmail(email);

    if (!admin) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signJwt({
      sub: admin.id,
      email: admin.email,
      tenantId: admin.tenantId,
      role: admin.role as 'root' | 'admin',
    });

    const response = NextResponse.json({ success: true });

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';

    response.cookies.set({
      name: cookieName,
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
