import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-customer_session' : 'customer_session';

  response.cookies.set({
    name: cookieName,
    value: '',
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
