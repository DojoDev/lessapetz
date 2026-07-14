import type { Metadata } from 'next';

import { cookies } from 'next/headers';
import { verifyJwt } from '../../infra/auth/jwt';
import { PostgresAdminRepository } from '../../infra/repositories/PostgresAdminRepository';
import Sidebar from './components/layout/Sidebar';
import TopHeader from './components/layout/TopHeader';

export const metadata: Metadata = {
  title: 'Admin - PetFlow',
  description: 'Admin Dashboard',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieName = isProduction ? '__Host-admin_session' : 'admin_session';
  const token = cookieStore.get(cookieName)?.value;

  let email = '';
  let role = '';

  if (token) {
    const payload = await verifyJwt(token);
    if (payload && payload.sub) {
      const adminRepo = new PostgresAdminRepository();
      const adminData = await adminRepo.findById(payload.sub);
      if (adminData) {
        email = adminData.email;
        role = adminData.role;
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-teal-500/30 selection:text-teal-200">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <TopHeader email={email} role={role} />
        {children}
      </div>
    </div>
  );
}
