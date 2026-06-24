import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './infra/auth/jwt';

export async function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const adminCookie = isProduction ? '__Host-admin_session' : 'admin_session';
  const customerCookie = isProduction ? '__Host-customer_session' : 'customer_session';

  const { pathname } = request.nextUrl;

  // ── Admin route protection ────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get(adminCookie)?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    const payload = await verifyJwt(token);
    if (!payload || (payload.role !== 'root' && payload.role !== 'admin')) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete(adminCookie);
      return response;
    }

    // Inject tenant context via request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', payload.tenantId);
    requestHeaders.set('x-admin-id', payload.sub!);
    requestHeaders.set('x-admin-role', payload.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // ── Redirect /admin/login to /admin if already logged in ──
  if (pathname === '/admin/login') {
    const token = request.cookies.get(adminCookie)?.value;
    if (token) {
      const payload = await verifyJwt(token);
      if (payload) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  // ── Customer booking route protection ─────────────────────
  // Protected customer routes (everything except register/login)
  const protectedBookingPaths = ['/booking/pets', '/booking/services', '/booking/schedule', '/booking/confirm', '/booking/my-appointments'];
  const isProtectedBooking = protectedBookingPaths.some(p => pathname.startsWith(p));

  if (isProtectedBooking) {
    const token = request.cookies.get(customerCookie)?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/booking/login', request.url));
    }

    const payload = await verifyJwt(token);
    if (!payload || payload.role !== 'customer') {
      const response = NextResponse.redirect(new URL('/booking/login', request.url));
      response.cookies.delete(customerCookie);
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-id', payload.tenantId);
    requestHeaders.set('x-customer-id', payload.sub!);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/booking/:path*'],
};
